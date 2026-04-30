import { compact } from "./compact.js";

it("removes entries with a nullish value", () => {
  expect(compact([null, undefined, "", [], {}, 0])).toEqual(["", [], {}, 0]);
});
