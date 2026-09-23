import {
  ClientSideConnection,
  type Agent,
  type Client,
  type Stream,
} from "@agentclientprotocol/sdk";

export function createACPConnection(
  toClient: (agent: Agent) => Client,
  transport: Stream,
): ClientSideConnection {
  return new ClientSideConnection(toClient, transport);
}
