import { createMockTabGroups, createTextDocument, createVSCodeMock } from "jest-mock-vscode";
import * as vscode from "vscode";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { isOpenInTab } from "./tabs";

vi.mock("vscode", () => createVSCodeMock(vi));

class MockTabInputText {
  constructor(public uri: vscode.Uri) {}
}

describe("tabs", () => {
  beforeEach(() => {
    //@ts-ignore
    vscode.TabInputText = MockTabInputText;
  });

  describe(".isOpenInTab()", () => {
    const rootUri = Uri.file(__dirname);
    let doc: TextDocument;

    beforeEach(() => {
      doc = createTextDocument(Uri.joinPath(rootUri, "test1.js"), "");

      const group = {
        isActive: true,
        viewColumn: 1,
        activeTab: undefined,
        tabs: [] as vscode.Tab[],
      };

      group.tabs = [
        {
          label: doc.fileName,
          group,
          input: new MockTabInputText(doc.uri),
          isActive: false,
          isDirty: false,
          isPinned: false,
          isPreview: false,
        },
      ];

      vi.mocked(vscode.window).tabGroups = createMockTabGroups(vi, [group]);
    });

    it("is true when the document is open", () => {
      expect(isOpenInTab(doc)).toBe(true);
    });

    it("is false when the document is not open", () => {
      expect(isOpenInTab(createTextDocument(Uri.joinPath(rootUri, "test2.js"), ""))).toBe(false);
    });
  });
});
