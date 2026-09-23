import { describe, expect, it } from "vitest";
import {
  COMMIT_SUBJECT_CHARACTER_LIMIT,
  commitSubjectCharactersRemaining,
} from "./desktopCommitMessage";

describe("commitSubjectCharactersRemaining", () => {
  it("counts down from the subject-line limit", () => {
    expect(commitSubjectCharactersRemaining("")).toBe(COMMIT_SUBJECT_CHARACTER_LIMIT);
    expect(commitSubjectCharactersRemaining("a")).toBe(49);
    expect(commitSubjectCharactersRemaining("a".repeat(50))).toBe(0);
    expect(commitSubjectCharactersRemaining("a".repeat(51))).toBe(-1);
  });

  it("ignores everything after the first line break", () => {
    expect(commitSubjectCharactersRemaining("subject\nbody text".repeat(20))).toBe(43);
    expect(commitSubjectCharactersRemaining("subject\r\nbody text".repeat(20))).toBe(43);
    expect(commitSubjectCharactersRemaining("\nbody text")).toBe(50);
  });

  it("counts Unicode code points as characters", () => {
    expect(commitSubjectCharactersRemaining("🚀")).toBe(49);
  });
});
