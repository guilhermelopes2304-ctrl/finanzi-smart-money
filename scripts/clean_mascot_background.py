from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public"

for path in sorted(ROOT.glob("fin-mascote-*-clean.png")):
    image = Image.open(path).convert("RGBA")
    pixels = np.array(image)
    rgb = pixels[:, :, :3].astype(np.int16)
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    brightness = rgb.mean(axis=2)
    # The baked checkerboard is neutral grayscale and touches the image border.
    background = (spread <= 14) & (brightness >= 145)
    height, width = background.shape
    visited = np.zeros_like(background, dtype=bool)
    queue = deque()

    for x in range(width):
        queue.extend(((0, x), (height - 1, x)))
    for y in range(height):
        queue.extend(((y, 0), (y, width - 1)))

    while queue:
        y, x = queue.popleft()
        if y < 0 or y >= height or x < 0 or x >= width or visited[y, x]:
            continue
        visited[y, x] = True
        if not background[y, x]:
            continue
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)):
            queue.append((y + dy, x + dx))

    pixels[visited, 3] = 0
    cleaned = Image.fromarray(pixels, mode="RGBA")
    cleaned.thumbnail((512, 512), Image.Resampling.LANCZOS)
    cleaned.save(path, format="PNG", optimize=True)
    corner_alpha = Image.open(path).convert("RGBA").getpixel((0, 0))[3]
    print(f"cleaned {path.name}: {cleaned.size[0]}x{cleaned.size[1]}, corner_alpha={corner_alpha}")
