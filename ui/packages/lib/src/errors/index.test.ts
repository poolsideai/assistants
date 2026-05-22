import { describe, expect, it } from "vitest";
import { CodedError, formatError, getErrorMessage, toError } from "./index.js";

describe("errors", () => {
  describe("toError", () => {
    it("returns Error instances unchanged", () => {
      const error = new Error("boom");
      expect(toError(error)).toBe(error);
    });

    it("rehydrates coded transport errors", () => {
      const error = toError({ code: -32603, message: "boom", data: { traceId: "123" } });

      expect(error).toBeInstanceOf(CodedError);
      expect(error).toMatchObject({
        name: "CodedError",
        message: "boom",
        code: -32603,
        data: { traceId: "123" },
      });
    });

    it("rehydrates plain message errors", () => {
      const error = toError({ name: "DOMException", message: "Not allowed" });

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("DOMException");
      expect(error.message).toBe("Not allowed");
    });

    it("wraps primitive values", () => {
      expect(toError("oops").message).toBe("oops");
      expect(toError(42).message).toBe("42");
    });

    it("extracts object-shaped error messages", () => {
      expect(toError({ error: { message: "Helper failed" } }).message).toBe("Helper failed");
      expect(toError({ data: { detail: "Project is missing" } }).message).toBe(
        "Project is missing",
      );
    });

    it("stringifies unknown objects instead of object tags", () => {
      expect(toError({ status: 500, code: "internal" }).message).toBe(
        '{"status":500,"code":"internal"}',
      );
    });
  });

  describe("getErrorMessage", () => {
    it("prefers request-style body errors", () => {
      const error = new Error("RequestError: ignored") as Error & {
        body: { errors: Array<{ message: string }> };
      };
      error.body = { errors: [{ message: "Invalid MCP server configuration" }] };

      expect(getErrorMessage(error)).toBe("Invalid MCP server configuration");
    });

    it("falls back to request-style body detail", () => {
      const error = new Error("RequestError: ignored") as Error & {
        body: { detail: string };
      };
      error.body = { detail: "Missing tenant" };

      expect(getErrorMessage(error)).toBe("Missing tenant");
    });

    it("terminates on cyclic error cause chains", () => {
      const a = new Error("") as Error & { cause?: unknown };
      const b = new Error("") as Error & { cause?: unknown };
      a.cause = b;
      b.cause = a;
      // Must not overflow the stack; both messages are empty so it bottoms out.
      expect(getErrorMessage(a)).toBe("Unknown error");
    });
  });

  describe("formatError", () => {
    it("adds an optional prefix", () => {
      expect(formatError(new Error("boom"), { prefix: "Failed to save" })).toBe(
        "Failed to save: boom",
      );
    });

    it("truncates long messages", () => {
      expect(formatError(new Error("abcdefghij"), { truncateLength: 8 })).toBe("abcdefg…");
    });

    it("truncates long messages", () => {
      expect(formatError(new Error("abcdefghij"), { truncateLength: 8, prefix: "aa" })).toBe(
        "aa: abcde…",
      );
    });

    it("uses prefix only if too long", () => {
      expect(formatError(new Error("zzz"), { truncateLength: 4, prefix: "abcdef" })).toBe("abc…");
    });

    it("formats serialized RPC errors with unusable object messages", () => {
      expect(
        formatError(
          { code: -32603, message: "[object Object]", data: { message: "Could not reorder" } },
          { prefix: "Failed to reorder projects" },
        ),
      ).toBe("Failed to reorder projects: Could not reorder");
    });
  });
});
