#!/usr/bin/env python3
from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src/acp/components/ui/streaming-sequence-loader-sprite.webp"

FRAME_SIZE = 48
SUPERSAMPLE = 4
GRID = 5
VIEWBOX = 56
STEP = 11
ORIGIN = 6
MID = (GRID - 1) / 2
DOT_RADIUS = 3.8
STATUS_BLUE = (55, 148, 255)
FADE_MS = 700
CYCLES = 2
FPS = 15


@dataclass(frozen=True)
class Motion:
    name: str
    duration_ms: int
    base: float


SEQUENCE = [
    Motion("check", 1500, 0.18),
    Motion("twin", 2200, 0.20),
    Motion("diag", 1700, 0.20),
    Motion("pin", 2200, 0.16),
    Motion("star", 1500, 0.16),
    Motion("wave", 1600, 0.22),
]

TOTAL_MS = sum(motion.duration_ms * CYCLES for motion in SEQUENCE)
UNIQUE_FRAMES = round(TOTAL_MS / 1000 * FPS)


def pseudo_random(i: int) -> float:
    x = math.sin(i * 12.9898) * 43758.5453
    return x - math.floor(x)


DOTS = []
for idx in range(GRID * GRID):
    row = idx // GRID
    col = idx % GRID
    DOTS.append(
        {
            "row": row,
            "col": col,
            "cx": ORIGIN + col * STEP,
            "cy": ORIGIN + row * STEP,
            "manhattan": abs(row - MID) + abs(col - MID),
            "diagonal": row + col,
            "parity": (row + col) % 2,
            "angle": math.atan2(row - MID, col - MID) / (2 * math.pi) + 0.5,
            "is_center": row == MID and col == MID,
            "rand": pseudo_random(idx + 1),
        }
    )


def smoothstep(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def interpolate_keyframes(
    progress: float,
    frames: list[tuple[float, float, float]],
    ease: Callable[[float], float] = smoothstep,
) -> tuple[float, float]:
    for i, (offset, opacity, scale) in enumerate(frames):
        if progress <= offset:
            if i == 0:
                return opacity, scale
            prev_offset, prev_opacity, prev_scale = frames[i - 1]
            span = offset - prev_offset
            t = 0 if span == 0 else ease((progress - prev_offset) / span)
            return lerp(prev_opacity, opacity, t), lerp(prev_scale, scale, t)
    _, opacity, scale = frames[-1]
    return opacity, scale


def local_progress(time_ms: float, duration_ms: int, delay_ms: float) -> float:
    if time_ms < delay_ms:
        return 0.0
    return ((time_ms - delay_ms) % duration_ms) / duration_ms


def dot_state(motion: Motion, dot: dict[str, float], time_ms: float) -> tuple[float, float]:
    base = motion.base
    if motion.name == "check":
        progress = local_progress(time_ms, motion.duration_ms, dot["parity"] * -750)
        return interpolate_keyframes(
            progress,
            [
                (0.0, 0.85, 1.05),
                (0.4, 0.85, 1.02),
                (0.5, base, 1.0),
                (0.9, base, 1.0),
                (1.0, 0.85, 1.05),
            ],
        )
    if motion.name == "twin":
        progress = local_progress(time_ms, motion.duration_ms, dot["manhattan"] * 120)
        return interpolate_keyframes(
            progress,
            [
                (0.0, base, 1.0),
                (0.09, 0.85, 1.08),
                (0.26, base, 1.0),
                (0.5, base, 1.0),
                (0.59, 0.85, 1.08),
                (0.76, base, 1.0),
                (1.0, base, 1.0),
            ],
        )
    if motion.name == "diag":
        progress = local_progress(time_ms, motion.duration_ms, dot["diagonal"] * 95)
        return interpolate_keyframes(
            progress,
            [
                (0.0, base, 1.0),
                (0.12, 0.85, 1.07),
                (0.4, 0.85, 1.04),
                (0.68, base, 1.0),
                (1.0, base, 1.0),
            ],
        )
    if motion.name == "pin":
        if dot["is_center"]:
            return 1.0, 1.0
        progress = local_progress(time_ms, motion.duration_ms, -dot["angle"] * motion.duration_ms)
        return interpolate_keyframes(
            progress,
            [
                (0.0, 0.85, 1.08),
                (0.16, 0.85, 1.03),
                (0.3, base, 1.0),
                (1.0, base, 1.0),
            ],
            ease=lambda t: t,
        )
    if motion.name == "star":
        progress = local_progress(time_ms, motion.duration_ms, dot["rand"] * -motion.duration_ms)
        return interpolate_keyframes(
            progress,
            [
                (0.0, base, 1.0),
                (0.2, 0.85, 1.08),
                (0.45, base, 1.0),
                (1.0, base, 1.0),
            ],
        )

    progress = local_progress(time_ms, motion.duration_ms, dot["col"] * 180)
    return interpolate_keyframes(
        progress,
        [
            (0.0, base, 1.0),
            (0.5, 0.85, 1.06),
            (1.0, base, 1.0),
        ],
    )


def active_layers(time_ms: float) -> list[tuple[Motion, float, float]]:
    starts = []
    elapsed = 0
    for motion in SEQUENCE:
        starts.append(elapsed)
        elapsed += motion.duration_ms * CYCLES

    time_ms = time_ms % TOTAL_MS
    active_index = 0
    for i, start in enumerate(starts):
        if time_ms >= start:
            active_index = i

    active_motion = SEQUENCE[active_index]
    active_start = starts[active_index]
    active_local = time_ms - active_start
    layers: list[tuple[Motion, float, float]] = []

    if active_local < FADE_MS:
        fade = active_local / FADE_MS
        previous_index = (active_index - 1) % len(SEQUENCE)
        previous_motion = SEQUENCE[previous_index]
        previous_start = starts[previous_index]
        if previous_index > active_index:
            previous_start -= TOTAL_MS
        previous_local = time_ms - previous_start
        layers.append((previous_motion, previous_local, 1 - fade))
        layers.append((active_motion, active_local, fade))
    else:
        layers.append((active_motion, active_local, 1.0))

    return layers


def draw_frame(time_ms: float) -> Image.Image:
    scale = FRAME_SIZE / VIEWBOX * SUPERSAMPLE
    image = Image.new("RGBA", (FRAME_SIZE * SUPERSAMPLE, FRAME_SIZE * SUPERSAMPLE), (0, 0, 0, 0))

    for motion, motion_time, layer_opacity in active_layers(time_ms):
        layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        for dot in DOTS:
            opacity, dot_scale = dot_state(motion, dot, motion_time)
            alpha = round(255 * opacity * layer_opacity)
            radius = DOT_RADIUS * dot_scale * scale
            cx = dot["cx"] * scale
            cy = dot["cy"] * scale
            draw.ellipse(
                (cx - radius, cy - radius, cx + radius, cy + radius),
                fill=(*STATUS_BLUE, alpha),
            )
        image = Image.alpha_composite(image, layer)

    return image.resize((FRAME_SIZE, FRAME_SIZE), Image.Resampling.LANCZOS)


def main() -> None:
    frames = [draw_frame(frame / UNIQUE_FRAMES * TOTAL_MS) for frame in range(UNIQUE_FRAMES)]
    frames.append(frames[0].copy())

    sprite = Image.new("RGBA", (FRAME_SIZE * len(frames), FRAME_SIZE), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        sprite.paste(frame, (index * FRAME_SIZE, 0))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    sprite.save(OUTPUT, lossless=True, method=6)
    print(
        f"wrote {OUTPUT.relative_to(ROOT)} "
        f"({len(frames)} frames, {sprite.width}x{sprite.height}, {TOTAL_MS}ms)"
    )


if __name__ == "__main__":
    main()
