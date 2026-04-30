import { diffWords } from "./diffWords.js";

test("foo", () => {
  expect(
    diffWords("No spaces\nTwo spaces\nFor spaces", "No spaces\n  Two spaces\n    Four spaces\n"),
  ).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 23,
        },
        "type": "equal",
        "value": "No spaces
      Two spaces
    ",
      },
      {
        "newRange": {
          "from": 23,
          "to": 31,
        },
        "newValue": "    Four",
        "oldRange": {
          "from": 23,
          "to": 26,
        },
        "oldValue": "For",
        "type": "replace",
      },
      {
        "newRange": {
          "from": 31,
          "to": 39,
        },
        "oldRange": {
          "from": 26,
          "to": 34,
        },
        "type": "range",
        "value": " spaces
    ",
      },
    ]
  `);
});

test("returns equal for identical strings", () => {
  expect(diffWords("hello", "hello")).toMatchInlineSnapshot(`
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
  expect(diffWords("abc", "abcd")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 4,
        },
        "newValue": "abcd",
        "oldRange": {
          "from": 0,
          "to": 3,
        },
        "oldValue": "abc",
        "type": "replace",
      },
    ]
  `);
});

test("removal at the end", () => {
  expect(diffWords("abcd", "abc")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 3,
        },
        "newValue": "abc",
        "oldRange": {
          "from": 0,
          "to": 4,
        },
        "oldValue": "abcd",
        "type": "replace",
      },
    ]
  `);
});

test("replacement in the middle", () => {
  expect(diffWords("abc", "axc")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 3,
        },
        "newValue": "axc",
        "oldRange": {
          "from": 0,
          "to": 3,
        },
        "oldValue": "abc",
        "type": "replace",
      },
    ]
  `);
});

test("all added when old is empty", () => {
  expect(diffWords("", "hi")).toMatchInlineSnapshot(`
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
  expect(diffWords("bye", "")).toMatchInlineSnapshot(`
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
  expect(diffWords(oldVal, newVal)).toMatchInlineSnapshot(`
    [
      {
        "range": {
          "from": 0,
          "to": 12,
        },
        "type": "equal",
        "value": "line1
    line2
    ",
      },
      {
        "range": {
          "from": 12,
          "to": 17,
        },
        "type": "insert",
        "value": "line3",
      },
    ]
  `);
});

test("handles non-ASCII characters", () => {
  expect(diffWords("manha", "manhã")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 5,
        },
        "newValue": "manhã",
        "oldRange": {
          "from": 0,
          "to": 5,
        },
        "oldValue": "manha",
        "type": "replace",
      },
    ]
  `);
});

test("adjacent edits (ensure order is preserved)", () => {
  expect(diffWords("ab", "cabd")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 4,
        },
        "newValue": "cabd",
        "oldRange": {
          "from": 0,
          "to": 2,
        },
        "oldValue": "ab",
        "type": "replace",
      },
    ]
  `);
});

test("multiple replacements", () => {
  expect(diffWords("hello", "world")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 5,
        },
        "newValue": "world",
        "oldRange": {
          "from": 0,
          "to": 5,
        },
        "oldValue": "hello",
        "type": "replace",
      },
    ]
  `);
});

test("replace with same lengths", () => {
  expect(diffWords("cat", "dog")).toMatchInlineSnapshot(`
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
  expect(diffWords("tres", "uno")).toMatchInlineSnapshot(`
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
  expect(diffWords("uno", "tres")).toMatchInlineSnapshot(`
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
  expect(diffWords("abcdef", "axyzef")).toMatchInlineSnapshot(`
    [
      {
        "newRange": {
          "from": 0,
          "to": 6,
        },
        "newValue": "axyzef",
        "oldRange": {
          "from": 0,
          "to": 6,
        },
        "oldValue": "abcdef",
        "type": "replace",
      },
    ]
  `);
});

test("special characters", () => {
  expect(
    diffWords(
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
          "to": 35,
        },
        "type": "insert",
        "value": "regex = /[a-zA-Z]+/gi;
    const ",
      },
      {
        "newRange": {
          "from": 35,
          "to": 56,
        },
        "oldRange": {
          "from": 6,
          "to": 27,
        },
        "type": "range",
        "value": "symbols = "!@#$%^&*()",
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
          "to": 98,
        },
        "oldRange": {
          "from": 27,
          "to": 65,
        },
        "type": "range",
        "value": "";
    const unicode = "café résumé naïve ",
      },
      {
        "range": {
          "from": 98,
          "to": 103,
        },
        "type": "insert",
        "value": "中文 🚀",
      },
      {
        "newRange": {
          "from": 103,
          "to": 105,
        },
        "oldRange": {
          "from": 65,
          "to": 67,
        },
        "type": "range",
        "value": "";",
      },
    ]
  `);
});
