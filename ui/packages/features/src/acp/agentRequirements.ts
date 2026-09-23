import type { ACPRegistryAgent } from "./agentRegistry";

const AGENT_REQUIREMENTS: Record<string, readonly string[]> = {
  "agoragentic-acp": ["network access; an API key is optional"],
  "amp-acp": ["Amp CLI", "Amp account or API key"],
  auggie: ["Augment account"],
  autohand: ["Autohand CLI", "configured model provider"],
  "claude-acp": ["Claude account or Anthropic API credentials"],
  cline: ["Cline account or model provider"],
  "codebuddy-code": ["CodeBuddy account or API key"],
  "codex-acp": ["ChatGPT account or OpenAI API key"],
  "cortex-code": ["Snowflake account with Cortex Code access"],
  "corust-agent": ["Corust account or API key"],
  "crow-cli": ["OpenAI-compatible model endpoint and API key"],
  cursor: ["Cursor account or API key"],
  deepagents: ["Anthropic provider package and API key"],
  devin: ["Devin account for enterprise authentication"],
  dimcode: ["Dim account or model provider"],
  dirac: ["Dirac account or model provider"],
  "factory-droid": ["Factory account or API key"],
  "fast-agent": ["configured model provider and API key"],
  gemini: ["Google account, Gemini API key, or Vertex AI"],
  "github-copilot-cli": ["GitHub account with Copilot access"],
  "glm-acp-agent": ["Z.AI Coding Plan API key"],
  goose: ["model provider account/API key or local model"],
  "grok-build": ["xAI account or API key"],
  harn: [".harn agent pipeline", "model provider credentials or local model"],
  junie: ["JetBrains/Junie account or model provider"],
  kilo: ["Kilo account/credits or model provider"],
  kimi: ["Kimi account or Moonshot API key"],
  "minion-code": ["configured model provider and API key"],
  "mistral-vibe": ["Mistral API key"],
  nova: ["Nova setup", "model provider credentials"],
  opencode: ["model provider account/API key or local model"],
  "pi-acp": ["pi coding agent CLI", "configured model provider"],
  poolside: ["Poolside account, OpenRouter, or local model endpoint"],
  qoder: ["Qoder account or access token"],
  "qwen-code": ["Qwen account/API key or another model provider"],
  sigit: ["1–2 GB model download", "supported local hardware"],
  stakpak: ["Stakpak or model-provider API key"],
  vtcode: ["model provider API key or local model", "ripgrep and ast-grep recommended"],
};

export function registryAgentRequirements(
  agent: Pick<ACPRegistryAgent, "id" | "distribution">,
): string[] {
  const requirements: string[] = [];
  if (agent.distribution.npx) {
    requirements.push("Node.js and npx");
  } else if (agent.distribution.uvx) {
    requirements.push("uv and uvx");
  }

  requirements.push(
    ...(AGENT_REQUIREMENTS[agent.id] ?? ["publisher-specific authentication or setup"]),
  );
  return requirements;
}

// registryAgentRuntimeWarning warns when the runtime an agent's distribution
// launches through is known to be missing. `npxAvailable` is null while the
// helper check has not answered — no warning is better than a wrong one.
export function registryAgentRuntimeWarning(
  agent: Pick<ACPRegistryAgent, "distribution">,
  npxAvailable: boolean | null,
): string | null {
  if (npxAvailable !== false || !agent.distribution.npx) return null;
  return "npx was not found on this machine. Install Node.js to use this agent.";
}
