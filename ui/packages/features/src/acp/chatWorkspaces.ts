import { poolsideAcpNavCreateChat } from "@poolsideai/helperapi";

export async function createACPChatWorkingDirectory(sessionId: string): Promise<string> {
  const result = await poolsideAcpNavCreateChat({ sessionId });
  return result.path;
}
