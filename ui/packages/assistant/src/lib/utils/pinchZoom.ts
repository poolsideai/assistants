export function installPinchZoomBlocker(target: Window = window): () => void {
  const preventPinchWheelZoom = (event: WheelEvent) => {
    if (!event.ctrlKey) return;

    event.preventDefault();
  };

  const preventGestureZoom: EventListener = (event) => {
    event.preventDefault();
  };

  target.addEventListener("wheel", preventPinchWheelZoom, { capture: true, passive: false });
  target.addEventListener("gesturestart", preventGestureZoom, { capture: true, passive: false });
  target.addEventListener("gesturechange", preventGestureZoom, { capture: true, passive: false });

  return () => {
    target.removeEventListener("wheel", preventPinchWheelZoom, { capture: true });
    target.removeEventListener("gesturestart", preventGestureZoom, { capture: true });
    target.removeEventListener("gesturechange", preventGestureZoom, { capture: true });
  };
}
