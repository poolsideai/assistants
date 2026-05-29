import { isArray, isNil, isNumber, isString } from "lodash";
import {
  isEnumField,
  type ArrayField,
  type EnumField,
  type FieldModel,
  type FormField,
  type NumberField,
  type StringField,
} from "./types";

/**
 * Failure for a required field that has not been answered yet. It keeps the
 * field invalid — so the submit button stays disabled — but is not shown to
 * the user: an untouched form would otherwise greet them with a column of
 * errors for work they have not done, and the label's `*` already says which
 * fields are needed. Renderers filter it out; see FieldErrors.
 */
export const REQUIRED_ERROR = "Required";

/**
 * Whether anything in the form would fail validation as it stands. The submit
 * button reads this directly instead of waiting for the form library's
 * `canSubmit`, which stays true until some field has been edited — long enough
 * for the user to click a button that can only fail.
 *
 * Every failure counts, not just the unanswered-required one: a schema's own
 * defaults can be invalid (there is no "empty" number, so a required integer
 * starts at 0 and a `minimum` above zero is already breached) and that button
 * can only fail too.
 */
export function hasValidationFailure(
  fields: readonly FormField[],
  values: Record<string, unknown>,
): boolean {
  return fields.some(
    (entry) => validate(entry.field, values[entry.name], entry.required) !== undefined,
  );
}

/**
 * Validate a form-field value against its schema. Returns the error message
 * to surface, or `undefined` if the value is acceptable.
 */
export function validate(field: FieldModel, value: unknown, required: boolean): string | undefined {
  if (isEnumField(field)) return validateEnum(field, value, required);
  switch (field.type) {
    case "number":
    case "integer":
      return validateNumber(field, value, required);
    case "boolean":
      // Unchecked boolean is a valid `false`; `required` has no extra
      // meaning here.
      return undefined;
    case "array":
      return validateArray(field, value, required);
    case "string":
      return validateString(field, value, required);
  }
}

function validateString(field: StringField, value: unknown, required: boolean): string | undefined {
  if (isMissing(value)) return required ? REQUIRED_ERROR : undefined;
  if (!isString(value)) return "Expected text";
  if (field.minLength !== undefined && value.length < field.minLength) {
    return `Must be at least ${field.minLength} characters`;
  }
  if (field.maxLength !== undefined && value.length > field.maxLength) {
    return `Must be at most ${field.maxLength} characters`;
  }
  if (field.pattern !== undefined) {
    try {
      if (!new RegExp(field.pattern).test(value)) return "Does not match expected format";
    } catch {
      // invalid pattern – don't block submit on a bad schema
    }
  }
  return undefined;
}

function validateEnum(field: EnumField, value: unknown, required: boolean): string | undefined {
  if (isMissing(value)) return required ? REQUIRED_ERROR : undefined;
  if (!isString(value)) return "Expected text";
  const allowed = enumValues(field);
  if (allowed && !allowed.includes(value)) {
    // Free-text escape hatch: anyOf with a {type:"string"} branch accepts
    // any string, so don't reject for membership.
    if (!field.anyOf?.some((b) => "type" in b && b.type === "string")) return "Invalid selection";
  }
  return undefined;
}

function validateNumber(field: NumberField, value: unknown, required: boolean): string | undefined {
  if (isMissing(value)) return required ? REQUIRED_ERROR : undefined;
  const n = isNumber(value) ? value : Number(value);
  if (!Number.isFinite(n)) return "Must be a number";
  if (field.type === "integer" && !Number.isInteger(n)) return "Must be a whole number";
  if (field.minimum !== undefined && n < field.minimum) return `Must be ≥ ${field.minimum}`;
  if (field.maximum !== undefined && n > field.maximum) return `Must be ≤ ${field.maximum}`;
  return undefined;
}

function validateArray(field: ArrayField, value: unknown, required: boolean): string | undefined {
  if (!isArray(value)) return required ? REQUIRED_ERROR : undefined;
  if (required && value.length === 0) return REQUIRED_ERROR;
  if (field.minItems !== undefined && value.length < field.minItems) {
    return `Select at least ${field.minItems}`;
  }
  if (field.maxItems !== undefined && value.length > field.maxItems) {
    return `Select at most ${field.maxItems}`;
  }
  const allowed = itemsEnumValues(field);
  if (allowed) {
    const set = new Set(allowed);
    if (value.some((v) => !isString(v) || !set.has(v))) return "Invalid selection";
  }
  return undefined;
}

function enumValues(field: EnumField): string[] | undefined {
  if (field.enum) return [...field.enum];
  if (field.oneOf) return field.oneOf.map((o) => o.const);
  if (field.anyOf) {
    // Flatten flat options + nested {oneOf:[…]} branches; ignore the
    // {type:"string"} free-text branch.
    const consts = field.anyOf.flatMap<string>((b) =>
      "oneOf" in b ? b.oneOf.map((o) => o.const) : "const" in b ? [b.const] : [],
    );
    return consts.length > 0 ? consts : undefined;
  }
  return undefined;
}

function itemsEnumValues(field: ArrayField): string[] | undefined {
  if (field.items.enum) return [...field.items.enum];
  if (field.items.anyOf) return field.items.anyOf.map((o) => o.const);
  return undefined;
}

function isMissing(value: unknown): boolean {
  return isNil(value) || value === "";
}
