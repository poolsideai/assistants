import { diffLines } from "./diffLines.js";

it("handles identical strings", () => {
  const str = "hello";
  expect(diffLines(str, str)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "newNumber": 1,
          "oldNumber": 1,
          "type": "equal",
          "value": "hello",
        },
      ],
      "stats": {
        "additions": 0,
        "deletions": 0,
      },
    }
  `);
});

it("handles addition at the end", () => {
  const original = "a\nb";
  const modified = "a\nb\nc";
  expect(diffLines(original, modified)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "newNumber": 1,
          "oldNumber": 1,
          "type": "equal",
          "value": "a
    ",
        },
        {
          "changes": [
            {
              "range": {
                "from": 0,
                "to": 1,
              },
              "type": "equal",
              "value": "b",
            },
            {
              "range": {
                "from": 1,
                "to": 3,
              },
              "type": "insert",
              "value": "
    c",
            },
          ],
          "newNumber": 2,
          "newValue": "b
    c",
          "oldNumber": 2,
          "oldValue": "b",
          "type": "replace",
        },
      ],
      "stats": {
        "additions": 2,
        "deletions": 1,
      },
    }
  `);
});

it("handles trailing newline addition", () => {
  const original = "Hello world";
  const modified = "Hello world\n";
  expect(diffLines(original, modified)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "changes": [
            {
              "range": {
                "from": 0,
                "to": 11,
              },
              "type": "equal",
              "value": "Hello world",
            },
            {
              "range": {
                "from": 11,
                "to": 12,
              },
              "type": "insert",
              "value": "
    ",
            },
          ],
          "newNumber": 1,
          "newValue": "Hello world
    ",
          "oldNumber": 1,
          "oldValue": "Hello world",
          "type": "replace",
        },
      ],
      "stats": {
        "additions": 1,
        "deletions": 1,
      },
    }
  `);
});

it("handles removal in the middle", () => {
  const original = "one\ntwo\nthree";
  const modified = "one\nthree";
  expect(diffLines(original, modified)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "newNumber": 1,
          "oldNumber": 1,
          "type": "equal",
          "value": "one
    ",
        },
        {
          "number": 2,
          "type": "delete",
          "value": "two
    ",
        },
        {
          "newNumber": 2,
          "oldNumber": 3,
          "type": "equal",
          "value": "three",
        },
      ],
      "stats": {
        "additions": 0,
        "deletions": 1,
      },
    }
  `);
});

it("handles replacement", () => {
  const original = "x\ny\nz";
  const modified = "x\nyY\nz";
  expect(diffLines(original, modified)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "newNumber": 1,
          "oldNumber": 1,
          "type": "equal",
          "value": "x
    ",
        },
        {
          "changes": [
            {
              "range": {
                "from": 0,
                "to": 1,
              },
              "type": "equal",
              "value": "y",
            },
            {
              "range": {
                "from": 1,
                "to": 2,
              },
              "type": "insert",
              "value": "Y",
            },
            {
              "newRange": {
                "from": 2,
                "to": 3,
              },
              "oldRange": {
                "from": 1,
                "to": 2,
              },
              "type": "range",
              "value": "
    ",
            },
          ],
          "newNumber": 2,
          "newValue": "yY
    ",
          "oldNumber": 2,
          "oldValue": "y
    ",
          "type": "replace",
        },
        {
          "newNumber": 3,
          "oldNumber": 3,
          "type": "equal",
          "value": "z",
        },
      ],
      "stats": {
        "additions": 1,
        "deletions": 1,
      },
    }
  `);
});

it("handles trailing blank line", () => {
  const original = "a\nb\n";
  const modified = "a\nb\nc\n";
  expect(diffLines(original, modified)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "newNumber": 1,
          "oldNumber": 1,
          "type": "equal",
          "value": "a
    b
    ",
        },
        {
          "number": 3,
          "type": "insert",
          "value": "c
    ",
        },
      ],
      "stats": {
        "additions": 1,
        "deletions": 0,
      },
    }
  `);
});

it("handles single character change", () => {
  const original = "The quick brown fox";
  const modified = "The quick brown box";
  expect(diffLines(original, modified)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "changes": [
            {
              "range": {
                "from": 0,
                "to": 16,
              },
              "type": "equal",
              "value": "The quick brown ",
            },
            {
              "newRange": {
                "from": 16,
                "to": 17,
              },
              "newValue": "b",
              "oldRange": {
                "from": 16,
                "to": 17,
              },
              "oldValue": "f",
              "type": "replace",
            },
            {
              "range": {
                "from": 17,
                "to": 19,
              },
              "type": "equal",
              "value": "ox",
            },
          ],
          "newNumber": 1,
          "newValue": "The quick brown box",
          "oldNumber": 1,
          "oldValue": "The quick brown fox",
          "type": "replace",
        },
      ],
      "stats": {
        "additions": 1,
        "deletions": 1,
      },
    }
  `);
});

it("handles non-ASCII single-line replacement as separate operations", () => {
  const original = "manha";
  const modified = "manhã";
  expect(diffLines(original, modified)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "changes": [
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
          ],
          "newNumber": 1,
          "newValue": "manhã",
          "oldNumber": 1,
          "oldValue": "manha",
          "type": "replace",
        },
      ],
      "stats": {
        "additions": 1,
        "deletions": 1,
      },
    }
  `);
});

it("handles multi-line change block as separate operations", () => {
  const original = "a\nb\nc";
  const modified = "a\nX\nY\nc";
  expect(diffLines(original, modified)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "newNumber": 1,
          "oldNumber": 1,
          "type": "equal",
          "value": "a
    ",
        },
        {
          "changes": [
            {
              "newRange": {
                "from": 0,
                "to": 4,
              },
              "newValue": "X
    Y
    ",
              "oldRange": {
                "from": 0,
                "to": 2,
              },
              "oldValue": "b
    ",
              "type": "replace",
            },
          ],
          "newNumber": 2,
          "newValue": "X
    Y
    ",
          "oldNumber": 2,
          "oldValue": "b
    ",
          "type": "replace",
        },
        {
          "newNumber": 4,
          "oldNumber": 3,
          "type": "equal",
          "value": "c",
        },
      ],
      "stats": {
        "additions": 2,
        "deletions": 1,
      },
    }
  `);
});

it("handles adjacent edits as separate operations", () => {
  const original = "ab";
  const modified = "cabd";
  expect(diffLines(original, modified)).toMatchInlineSnapshot(`
    {
      "changes": [
        {
          "changes": [
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
          ],
          "newNumber": 1,
          "newValue": "cabd",
          "oldNumber": 1,
          "oldValue": "ab",
          "type": "replace",
        },
      ],
      "stats": {
        "additions": 1,
        "deletions": 1,
      },
    }
  `);
});
