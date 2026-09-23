package humautil

import (
	"reflect"
	"sort"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/casing"
	"github.com/samber/lo"
)

// EnumCode is a constraint for types that can be used as enum codes.
type EnumCode interface {
	~string | ~int | ~int64
}

// EnumSchema builds a huma.Schema for enums.
// It takes a map where keys are the string representations (names) and values are the enum constants.
// The x-enumNames extension uses camelCase versions of the keys.
// Supports string, int, and int64 based enums.
func EnumSchema[T EnumCode](valueMap map[string]T) *huma.Schema {
	type entry struct {
		code any
		name string
	}

	convertValueFn, schemaType, schemaFormat := getConfig[T]()

	entries := lo.MapToSlice(valueMap, func(snake string, code T) entry {
		// Convert to underlying type for JSON validation compatibility.
		return entry{code: convertValueFn(code), name: casing.Camel(snake)}
	})

	// Sort entries by name for deterministic schema generation
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].name < entries[j].name
	})

	enums, names := lo.UnzipBy2(entries, func(e entry) (any, string) {
		return e.code, e.name
	})

	schema := &huma.Schema{
		Enum: enums,
		Extensions: map[string]any{
			"x-enumNames": names,
		},
	}

	if schemaType != "" {
		schema.Type = schemaType
	}

	if schemaFormat != "" {
		schema.Format = schemaFormat
	}

	return schema
}

// getConfig returns schema configuration for an enum type: a value converter
// function and the OpenAPI type/format. The converter extracts the underlying
// primitive value from typed enums (e.g., ProviderName → string) so huma's
// validation can compare JSON-decoded values against schema enum values.
func getConfig[T EnumCode]() (convertValueFn func(code T) any, schemaType string, schemaFormat string) {

	var zero T
	switch any(zero).(type) {
	case string:
		schemaType = huma.TypeString
		convertValueFn = func(code T) any {
			return reflect.ValueOf(code).String()
		}
	case int, int32, int64:
		schemaType = huma.TypeInteger
		schemaFormat = "int64"
		convertValueFn = func(code T) any {
__POOL_SYNTHETIC_IMPORT_BASELINE__
		}
	default:
		// For named types with underlying string/int, check the kind via reflection
		switch reflect.TypeOf(zero).Kind() {
		case reflect.String:
			schemaType = huma.TypeString
			convertValueFn = func(code T) any {
				return reflect.ValueOf(code).String()
			}
		default:
			schemaType = huma.TypeInteger
			schemaFormat = "int64"
			convertValueFn = func(code T) any {
__POOL_SYNTHETIC_IMPORT_BASELINE__
			}
		}
	}

	return convertValueFn, schemaType, schemaFormat
}
