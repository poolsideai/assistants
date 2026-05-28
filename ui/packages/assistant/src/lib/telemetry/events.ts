type EmptyData = Record<string, never>;

// Please use noun_verb format for event names

export interface TelemetryClickEventSchema {
  // File & diff
  line_revert: { line_number: number; line_type: "addition" | "deletion" };
  line_reapply: { line_number: number; line_type: "addition" | "deletion" };
  chunk_revert: EmptyData;
  chunk_reapply: EmptyData;
  file_diff_toggle: { additions: number; deletions: number };
  file_open: EmptyData;
  tool_group_expand: { tool_count: number };
  file_chunk_expand: EmptyData;

  // Clipboard
  clipboard_copy_code: EmptyData;
  clipboard_copy: EmptyData;

  // Navigation
  conversation_switch: EmptyData;
  context_view_toggle: EmptyData;

  // Prompt
  agent_mode_toggle: { was_enabled: boolean };

  // Response
  response_rate_bad: EmptyData;
  response_rate_good: EmptyData;
  response_regenerate: EmptyData;
}

export interface TelemetryActionEventSchema {
  // File
  file_link_open: EmptyData;

  // Prompt
  prompt_interrupt: { submitting: boolean; streaming: boolean };

  // Commands
  menu_command: { command: string };

  // Home screen selections
  agent_select: { agent_id: string; agent_name: string };
  execution_environment_select: { type: "local" | "sandbox"; sandbox_id?: string };

  // Conversation
  conversation_create: EmptyData;
  conversation_open: EmptyData;
  conversation_delete: { was_current: boolean };

  // Approvals
  tool_approval_allow_once: { tool_id: string; type: string };
  tool_approval_always_allow: { tool_id: string; type: string };
  tool_approval_deny: { tool_id: string; type: string };
  tool_approval_select: { tool_id: string; type: string; option_id: string };

  // Plan Mode
  plan_mode_activate: { plan_file: string };
  plan_mode_deactivate: EmptyData;
}

export type TelemetryEventSchema = TelemetryClickEventSchema & TelemetryActionEventSchema;

export type TelemetryClickEventTarget = keyof TelemetryClickEventSchema;
export type TelemetryEventTarget = keyof TelemetryEventSchema;

export type TelemetryEventData<T extends TelemetryEventTarget> = TelemetryEventSchema[T];
