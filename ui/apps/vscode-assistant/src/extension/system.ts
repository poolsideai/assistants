import * as vscode from "vscode";
import { DecorationProvider } from "./DecorationProvider";
import { TelemetryLogger } from "./telemetry/TelemetryLogger";
import { AcpChatPanels } from "./views/acpChatPanels";
import { Assistant } from "./views/assistant";

export enum ApiProposalStatus {
  unknown,
  enabled,
  disabled,
  pendingRestart,
}

export class System {
  assistant: Assistant;
  acpChatPanels: AcpChatPanels;
  apiProposalStatus: ApiProposalStatus;

  constructor(
    readonly context: vscode.ExtensionContext,
    readonly telemetry: TelemetryLogger,
    readonly decorationProvider: DecorationProvider,
  ) {
    this.apiProposalStatus = ApiProposalStatus.unknown;
    this.assistant = Assistant.create(this);
    this.acpChatPanels = new AcpChatPanels(this);
  }

  setApiProposalStatus(status: ApiProposalStatus) {
    this.apiProposalStatus = status;
  }

  isApiProposalsEnabled() {
    return this.apiProposalStatus === ApiProposalStatus.enabled;
  }

  async deactivate() {
    this.acpChatPanels.disposeAll();
    this.telemetry.deactivate();
  }
}
