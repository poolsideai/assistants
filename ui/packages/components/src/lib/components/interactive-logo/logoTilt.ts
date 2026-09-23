const MAX_TILT_RADIANS = 0.5;

export type LogoTiltHandler = (rotationX: number, rotationY: number) => void;

export function getLogoTilt(clientPosition: number, viewportSize: number) {
  const normalized = clamp((clientPosition / Math.max(viewportSize, 1)) * 2 - 1, -1, 1);
  return normalized * MAX_TILT_RADIANS;
}

export function attachViewportLogoTilt(
  onTilt: LogoTiltHandler,
  viewport: Window = window,
): () => void {
  const onMouseMove = (event: MouseEvent) => {
    onTilt(
      getLogoTilt(event.clientY, viewport.innerHeight),
      getLogoTilt(event.clientX, viewport.innerWidth),
    );
  };
  const onWindowBlur = () => onTilt(0, 0);

  viewport.addEventListener("mousemove", onMouseMove, { passive: true });
  viewport.addEventListener("blur", onWindowBlur);

  return () => {
    viewport.removeEventListener("mousemove", onMouseMove);
    viewport.removeEventListener("blur", onWindowBlur);
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
