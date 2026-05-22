import { describe, expect, it } from "vitest";

import {
  type AsyncState,
  failure,
  fromPromise,
  isFailure,
  isLoading,
  isSuccess,
  isWaiting,
  loading,
  success,
  toError,
  waiting,
} from "./index.js";

describe("async-state", () => {
  describe("constructors", () => {
    it("creates waiting state", () => {
      expect(waiting).toEqual({ status: "waiting" });
    });

    it("creates loading state", () => {
      expect(loading).toEqual({ status: "loading" });
    });

    it("creates success state with value", () => {
      expect(success(42)).toEqual({ status: "success", value: 42 });
    });

    it("creates failure state with error", () => {
      const err = new Error("boom");
      expect(failure(err)).toEqual({ status: "failure", error: err });
    });

    it("creates failure state with custom error type", () => {
      expect(failure("string error")).toEqual({ status: "failure", error: "string error" });
    });
  });

  describe("type guards", () => {
    const states: AsyncState<number>[] = [waiting, loading, success(1), failure(new Error("e"))];

    it("isWaiting narrows correctly", () => {
      expect(states.filter(isWaiting)).toEqual([waiting]);
    });

    it("isLoading narrows correctly", () => {
      expect(states.filter(isLoading)).toEqual([loading]);
    });

    it("isSuccess narrows correctly", () => {
      const successes = states.filter(isSuccess);
      expect(successes).toHaveLength(1);
      expect(successes[0]!.value).toBe(1);
    });

    it("isFailure narrows correctly", () => {
      const failures = states.filter(isFailure);
      expect(failures).toHaveLength(1);
      expect(failures[0]!.error.message).toBe("e");
    });
  });

  describe("toError", () => {
    it("returns Error instances unchanged", () => {
      const err = new Error("boom");
      expect(toError(err)).toBe(err);
    });

    it("returns Error subclasses unchanged", () => {
      const err = new TypeError("bad");
      expect(toError(err)).toBe(err);
    });

    it("wraps strings in an Error", () => {
      const err = toError("oops");
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("oops");
    });

    it("wraps other types via String()", () => {
      expect(toError(42).message).toBe("42");
      expect(toError(null).message).toBe("null");
    });
  });

  describe("fromPromise", () => {
    it("transitions through loading then success", async () => {
      const states: AsyncState<number>[] = [];
      const result = await fromPromise(
        () => Promise.resolve(42),
        (s) => states.push(s),
      );

      expect(states).toHaveLength(2);
      expect(states[0]).toEqual(loading);
      expect(states[1]).toEqual(success(42));
      expect(result).toEqual(success(42));
    });

    it("transitions through loading then failure on rejection", async () => {
      const states: AsyncState<number>[] = [];
      const err = new Error("oops");
      const result = await fromPromise(
        () => Promise.reject(err),
        (s) => states.push(s),
      );

      expect(states).toHaveLength(2);
      expect(states[0]).toEqual(loading);
      expect(states[1]).toEqual(failure(err));
      expect(result).toEqual(failure(err));
    });

    it("wraps non-Error thrown values", async () => {
      const states: AsyncState<number>[] = [];
      await fromPromise(
        () => Promise.reject("string error"),
        (s) => states.push(s),
      );

      expect(isFailure(states[1]!)).toBe(true);
      if (isFailure(states[1]!)) {
        expect(states[1].error).toBeInstanceOf(Error);
        expect(states[1].error.message).toBe("string error");
      }
    });

    it("maps rejection values with a custom mapper", async () => {
      const states: AsyncState<number, string>[] = [];
      const result = await fromPromise<number, string>(
        () => Promise.reject({ message: "nope" }),
        (s) => states.push(s),
        { mapError: (error) => (error as { message: string }).message },
      );

      expect(states[1]).toEqual(failure("nope"));
      expect(result).toEqual(failure("nope"));
    });

    it("calls onState with the same reference returned", async () => {
      let captured: AsyncState<number> | undefined;
      const result = await fromPromise(
        () => Promise.resolve(1),
        (s) => {
          captured = s;
        },
      );

      expect(captured).toBe(result);
    });

    it("awaits the fn before calling onState with success", async () => {
      const order: string[] = [];
      await fromPromise(
        async () => {
          order.push("fn");
          return 1;
        },
        (s) => order.push(s.status),
      );

      expect(order).toEqual(["loading", "fn", "success"]);
    });

    it("never calls onState synchronously", () => {
      let called = false;
      fromPromise(
        () => Promise.resolve(1),
        () => {
          called = true;
        },
      );

      expect(called).toBe(false);
    });
  });
});
