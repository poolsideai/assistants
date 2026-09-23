export interface ReconcileMarkdownDomOptions {
  beforeRemove?: (node: Node) => void;
}

/** Patch a live Markdown subtree while preserving compatible DOM identities. */
export function reconcileMarkdownDom(
  currentRoot: Element,
  nextRoot: Element,
  options: ReconcileMarkdownDomOptions = {},
): void {
  reconcileChildren(currentRoot, nextRoot, options);
}

function reconcileChildren(
  currentParent: Node,
  nextParent: Node,
  options: ReconcileMarkdownDomOptions,
): void {
  let current = currentParent.firstChild;
  let next = nextParent.firstChild;

  while (current || next) {
    const followingCurrent = current?.nextSibling ?? null;
    const followingNext = next?.nextSibling ?? null;

    if (!current && next) {
      currentParent.appendChild(next);
    } else if (current && !next) {
      options.beforeRemove?.(current);
      current.remove();
    } else if (current && next) {
      if (canReconcile(current, next)) {
        reconcileNode(current, next, options);
      } else {
        options.beforeRemove?.(current);
        current.replaceWith(next);
      }
    }

    current = followingCurrent;
    next = followingNext;
  }
}

function canReconcile(current: Node, next: Node): boolean {
  if (current.nodeType !== next.nodeType) return false;
  if (current instanceof Element && next instanceof Element) {
    return current.localName === next.localName && current.namespaceURI === next.namespaceURI;
  }
  return true;
}

function reconcileNode(current: Node, next: Node, options: ReconcileMarkdownDomOptions): void {
  if (current instanceof Text && next instanceof Text) {
    if (current.data !== next.data) current.data = next.data;
    return;
  }

  if (current instanceof Comment && next instanceof Comment) {
    if (current.data !== next.data) current.data = next.data;
    return;
  }

  if (current instanceof Element && next instanceof Element) {
    reconcileAttributes(current, next);
    reconcileChildren(current, next, options);
  }
}

function reconcileAttributes(current: Element, next: Element): void {
  for (const name of current.getAttributeNames()) {
    if (!next.hasAttribute(name)) current.removeAttribute(name);
  }
  for (const name of next.getAttributeNames()) {
    const value = next.getAttribute(name);
    if (value !== null && current.getAttribute(name) !== value) current.setAttribute(name, value);
  }
}
