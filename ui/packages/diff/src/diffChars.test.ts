import { diffChars } from "./diffChars.js";

test("returns equal for identical strings", () => {
  expect(diffChars("hello", "hello")).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 5,
        },
        "type": "equal",
        "value": "hello",
      },
    ]
  `);
});

test("addition at the end", () => {
  expect(diffChars("abc", "abcd")).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 3,
        },
        "type": "equal",
        "value": "abc",
      },
      {
        "range": {
          "from": 3,
          "to": 4,
        },
        "type": "insert",
        "value": "d",
      },
    ]
  `);
});

test("removal at the end", () => {
  expect(diffChars("abcd", "abc")).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 3,
        },
        "type": "equal",
        "value": "abc",
      },
      {
        "range": {
          "from": 3,
          "to": 4,
        },
        "type": "delete",
        "value": "d",
      },
    ]
  `);
});

test("replacement in the middle", () => {
  expect(diffChars("abc", "axc")).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 1,
        },
        "type": "equal",
        "value": "a",
      },
      {
        "newRange": {
          "from": 1,
          "to": 2,
        },
        "newValue": "x",
        "oldRange": {
          "from": 1,
          "to": 2,
        },
        "oldValue": "b",
        "type": "replace",
      },
      {
        "range": {
          "from": 2,
          "to": 3,
        },
        "type": "equal",
        "value": "c",
      },
    ]
  `);
});

test("all added when old is empty", () => {
  expect(diffChars("", "hi")).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 2,
        },
        "type": "insert",
        "value": "hi",
      },
    ]
  `);
});

test("all removed when new is empty", () => {
  expect(diffChars("bye", "")).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 3,
        },
        "type": "delete",
        "value": "bye",
      },
    ]
  `);
});

test("handles multiline strings (preserves newlines)", () => {
  const oldVal = "line1\nline2";
  const newVal = "line1\nline2\nline3";
  expect(diffChars(oldVal, newVal)).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 11,
        },
        "type": "equal",
        "value": "line1
    line2",
      },
      {
        "range": {
          "from": 11,
          "to": 17,
        },
        "type": "insert",
        "value": "
    line3",
      },
    ]
  `);
});

test("handles non-ASCII characters", () => {
  expect(diffChars("manha", "manhã")).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 4,
        },
        "type": "equal",
        "value": "manh",
      },
      {
        "newRange": {
          "from": 4,
          "to": 5,
        },
        "newValue": "ã",
        "oldRange": {
          "from": 4,
          "to": 5,
        },
        "oldValue": "a",
        "type": "replace",
      },
    ]
  `);
});

test("adjacent edits (ensure order is preserved)", () => {
  expect(diffChars("ab", "cabd")).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 1,
        },
        "type": "insert",
        "value": "c",
      },
      {
        "newRange": {
          "from": 1,
          "to": 3,
        },
        "oldRange": {
          "from": 0,
          "to": 2,
        },
        "type": "range",
        "value": "ab",
      },
      {
        "range": {
          "from": 3,
          "to": 4,
        },
        "type": "insert",
        "value": "d",
      },
    ]
  `);
});

test("multiple replacements", () => {
  expect(diffChars("hello", "world")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 1,
        },
        "newValue": "w",
        "oldRange": {
          "from": 0,
          "to": 4,
        },
        "oldValue": "hell",
        "type": "replace",
      },
      {
        "newRange": {
          "from": 1,
          "to": 2,
        },
        "oldRange": {
          "from": 4,
          "to": 5,
        },
        "type": "range",
        "value": "o",
      },
      {
        "range": {
          "from": 2,
          "to": 5,
        },
        "type": "insert",
        "value": "rld",
      },
    ]
  `);
});

test("replace with same lengths", () => {
  expect(diffChars("cat", "dog")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 3,
        },
        "newValue": "dog",
        "oldRange": {
          "from": 0,
          "to": 3,
        },
        "oldValue": "cat",
        "type": "replace",
      },
    ]
  `);
});

test("replace longer text with shorter", () => {
  expect(diffChars("tres", "uno")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 3,
        },
        "newValue": "uno",
        "oldRange": {
          "from": 0,
          "to": 4,
        },
        "oldValue": "tres",
        "type": "replace",
      },
    ]
  `);
});

test("replace shorter text with longer", () => {
  expect(diffChars("uno", "tres")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 4,
        },
        "newValue": "tres",
        "oldRange": {
          "from": 0,
          "to": 3,
        },
        "oldValue": "uno",
        "type": "replace",
      },
    ]
  `);
});

test("mixed operations with replace", () => {
  expect(diffChars("abcdef", "axyzef")).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 1,
        },
        "type": "equal",
        "value": "a",
      },
      {
        "newRange": {
          "from": 1,
          "to": 4,
        },
        "newValue": "xyz",
        "oldRange": {
          "from": 1,
          "to": 4,
        },
        "oldValue": "bcd",
        "type": "replace",
      },
      {
        "range": {
          "from": 4,
          "to": 6,
        },
        "type": "equal",
        "value": "ef",
      },
    ]
  `);
});

test("special characters", () => {
  expect(
    diffChars(
      `const symbols = "!@#$%^&*()";
const unicode = "café résumé naïve";`,
      `const regex = /[a-zA-Z]+/gi;
const symbols = "!@#$%^&*()_+-=";
const unicode = "café résumé naïve 中文 🚀";`,
    ),
  ).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 6,
        },
        "type": "equal",
        "value": "const ",
      },
      {
        "range": {
          "from": 6,
          "to": 32,
        },
        "type": "insert",
        "value": "regex = /[a-zA-Z]+/gi;
    con",
      },
      {
        "newRange": {
          "from": 32,
          "to": 33,
        },
        "oldRange": {
          "from": 6,
          "to": 7,
        },
        "type": "range",
        "value": "s",
      },
      {
        "range": {
          "from": 33,
          "to": 36,
        },
        "type": "insert",
        "value": "t s",
      },
      {
        "newRange": {
          "from": 36,
          "to": 56,
        },
        "oldRange": {
          "from": 7,
          "to": 27,
        },
        "type": "range",
        "value": "ymbols = "!@#$%^&*()",
      },
      {
        "range": {
          "from": 56,
          "to": 60,
        },
        "type": "insert",
        "value": "_+-=",
      },
      {
        "newRange": {
          "from": 60,
          "to": 97,
        },
        "oldRange": {
          "from": 27,
          "to": 64,
        },
        "type": "range",
        "value": "";
    const unicode = "café résumé naïve",
      },
      {
        "range": {
          "from": 97,
          "to": 103,
        },
        "type": "insert",
        "value": " 中文 🚀",
      },
      {
        "newRange": {
          "from": 103,
          "to": 105,
        },
        "oldRange": {
          "from": 64,
          "to": 66,
        },
        "type": "range",
        "value": "";",
      },
    ]
  `);
});
