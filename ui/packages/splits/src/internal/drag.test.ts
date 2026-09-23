import { describe, expect, it } from "vitest";
import { SplitsController } from "../controller.js";
import { canDropTabOnTarget, type TabTransferData } from "./drag.js";

describe("tab drag target validation", () => {
  it("rejects pane-content drops back onto the same single-tab pane", () => {
    const controller = new SplitsController();
    const paneId = controller.focusedPaneId!;
    const transfer: TabTransferData = {
      tabId: controller.allTabIds[0]!,
      sourcePaneId: paneId,
      sourceController: controller,
    };

    expect(canDropTabOnTarget(transfer, controller, paneId, "tab-bar")).toBe(true);
    expect(canDropTabOnTarget(transfer, controller, paneId, "center")).toBe(false);
    expect(canDropTabOnTarget(transfer, controller, paneId, "left")).toBe(false);
  });

  it("allows splitting a tab out of its source pane when another tab remains", () => {
    const controller = new SplitsController();
    const paneId = controller.focusedPaneId!;
    const tabId = controller.allTabIds[0]!;
    controller.createTab("Second");

    const transfer: TabTransferData = {
      tabId,
      sourcePaneId: paneId,
      sourceController: controller,
    };

    expect(canDropTabOnTarget(transfer, controller, paneId, "left")).toBe(true);
    expect(canDropTabOnTarget(transfer, controller, paneId, "center")).toBe(false);
  });

  it("allows cross-pane center and split drops", () => {
    const controller = new SplitsController();
    const sourcePaneId = controller.focusedPaneId!;
    const targetPaneId = controller.splitPane({
      paneId: sourcePaneId,
      orientation: "horizontal",
    })!;
    const transfer: TabTransferData = {
      tabId: controller.tabs(sourcePaneId)[0]!.id,
      sourcePaneId,
      sourceController: controller,
    };

    expect(canDropTabOnTarget(transfer, controller, targetPaneId, "center")).toBe(true);
    expect(canDropTabOnTarget(transfer, controller, targetPaneId, "left")).toBe(true);
  });
});
