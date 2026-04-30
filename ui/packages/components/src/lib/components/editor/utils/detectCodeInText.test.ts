import { detectCodeInText, hasFencePrefix } from "./detectCodeInText.js";

describe("hasFencePrefix", () => {
  it("returns false for an empty string", () => {
    expect(hasFencePrefix("")).toBe(false);
  });

  it("returns true if text starts with a code fence", () => {
    expect(hasFencePrefix("```\ncode block")).toBe(true);
  });

  it("returns false if text does not start with a code fence", () => {
    expect(hasFencePrefix("sample code")).toBe(false);
  });

  it("returns false for code fence in the middle of the text", () => {
    expect(hasFencePrefix("some text\n```\ncode block")).toBe(false);
  });

  it("returns true for a standalone code fence", () => {
    expect(hasFencePrefix("```")).toBe(true);
  });

  it("handles text with varying spaces and newlines before code fence", () => {
    expect(hasFencePrefix("   \n```code block")).toBe(true);
  });

  it("returns true if there is a code fence immediately followed by text", () => {
    expect(hasFencePrefix("```text right after")).toBe(true);
  });
});

describe("detectCodeInText", () => {
  it("detects code examples correctly", () => {
    const codeExamples = getCodeExamples();
    codeExamples.forEach((example) => {
      const result = detectCodeInText(example);
      if (!result.isCode && process.env.VERBOSE) {
        detectCodeInText(example);
      }
      assert.isTrue(result.isCode);
    });
  });

  it("detects plaintext examples correctly", () => {
    const plaintextExamples = getPlaintextExamples();
    plaintextExamples.forEach((example) => {
      const result = detectCodeInText(example);
      if (result.isCode) {
        console.log("failed result", result, example);
      }
      assert.isFalse(result.isCode);
    });
  });
});

const jsSnippet = `const array = [1, 2, 3];\narray.forEach((item) => console.log(item));`;
function getCodeExamples() {
  // Updated code examples without markdown fences
  return [
    `function test() {\n  return 42;\n}`,
    jsSnippet,
    `#include <iostream>\nint main() {\n  std::cout << "Hello";\n}`,
    `<div class="test">\n  Hello\n</div>`,
    `{ "key": "value" }`,
    `SELECT *
     FROM users
     WHERE id = 1;`,
    `import argparse

# Create the main parser
parser = argparse.ArgumentParser(description='Math Operations')

# Create sub-parsers
subparsers = parser.add_subparsers(dest='operation', help='Available operations')

# Create a sub-parser for the 'add' operation
add_parser = subparsers.add_parser('add', help='Addition')
add_parser.add_argument('numbers', nargs='+', type=int, help='Numbers to add')

# Create a sub-parser for the 'subtract' operation
subtract_parser = subparsers.add_parser('subtract', help='Subtraction')
subtract_parser.add_argument('numbers', nargs='+', type=int, help='Numbers to subtract')

# Parse the command-line arguments
args = parser.parse_args()`,
  ];
}

function getPlaintextExamples() {
  return [
    "This is a simple sentence without any code. But it has - some code like symbols (ok, examples).",
    "Please remember to submit your report by Friday. Remember the order number #123 please [1]",
    "This document explains how to set up your environment (with provisos).",
    // test that if user manually fences, we don't classify manually fenced markdown as code
    "\n\n```" + jsSnippet + "```",
  ];
}
