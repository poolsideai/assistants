import type { TelemetryEventInputEventType, TelemetryEventInputMetadata } from "@poolsideai/rpc";
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
  system: System,
  event: TelemetryEventInputEventType,
  data: TelemetryEventInputMetadata = {},
) {
  system.telemetry.reportUsage(event, data);
}
