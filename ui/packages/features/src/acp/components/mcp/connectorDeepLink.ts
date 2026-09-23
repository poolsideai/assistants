export type ConnectorCatalogDeepLinkId = string;

let pendingCatalogConnectorId: ConnectorCatalogDeepLinkId | null = null;
const listeners = new Set<(id: ConnectorCatalogDeepLinkId) => void>();

export function requestConnectorCatalogAdd(id: ConnectorCatalogDeepLinkId): void {
  pendingCatalogConnectorId = id;
  for (const listener of listeners) {
    listener(id);
  }
}

export function consumePendingConnectorCatalogAdd(): ConnectorCatalogDeepLinkId | null {
  const id = pendingCatalogConnectorId;
  pendingCatalogConnectorId = null;
  return id;
}

export function onConnectorCatalogAddRequest(
  listener: (id: ConnectorCatalogDeepLinkId) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
