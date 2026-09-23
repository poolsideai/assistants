import type { ContentBlock, EmbeddedResourceResource } from "@agentclientprotocol/sdk";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export function buildACPPromptContent(
  value: string,
  pastedAttachments: ContentBlock[],
__POOL_SYNTHETIC_IMPORT_BASELINE__
  options: PromptContentOptions,
): ContentBlock[] {
  return [
    { type: "text", text: value },
    ...promptAttachmentBlocks(pastedAttachments, options),
__POOL_SYNTHETIC_IMPORT_BASELINE__
  ];
}

function promptAttachmentBlocks(
  attachments: ContentBlock[],
  options: PromptContentOptions,
): ContentBlock[] {
  return attachments.flatMap((attachment) => {
    if (attachment.type === "image") {
      return options.supportsImages ? [attachment] : [];
    }
    if (attachment.type !== "resource" || options.supportsEmbeddedContext) {
      return [attachment];
    }
    return [resourceToLink(attachment.resource)];
  });
}

function resourceToLink(resource: EmbeddedResourceResource): ContentBlock {
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

function resourceLink(
  name: string,
  uri: string,
  title?: string,
  mimeType?: string | null,
): ContentBlock {
  return {
    type: "resource_link",
    name,
    title,
    uri,
    ...(mimeType ? { mimeType } : {}),
  };
}
