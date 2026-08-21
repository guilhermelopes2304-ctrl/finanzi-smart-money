from pathlib import Path
import colorsys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public"
EXPRESSIONS = [
    "reference",
    "feliz",
    "surpreso",
    "pensando",
    "atento",
    "comemorando",
    "explicando",
    "calmo",
]


def blend(base: tuple[int, int, int], value: float, low: float = 0.35, high: float = 1.0) -> tuple[int, int, int]:
    factor = max(0.0, min(1.0, (value - low) / (high - low)))
    shadow = tuple(round(channel * 0.72) for channel in base)
    return tuple(round(shadow[index] * (1 - factor) + base[index] * factor) for index in range(3))


def recolor(path: Path, output: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, alpha = pixels[x, y]
            if alpha == 0:
                continue
            h, saturation, value = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if saturation < 0.22:
                continue
            if 0.08 <= h < 0.19 and value > 0.45:
                rgb = blend((255, 107, 107), value, 0.35, 1.0)
            elif 0.19 <= h <= 0.52:
                if value > 0.62 and saturation > 0.28:
                    rgb = blend((238, 240, 255), value, 0.62, 1.0)
                else:
                    rgb = blend((91, 92, 226), value, 0.28, 1.0)
            else:
                continue
            pixels[x, y] = (*rgb, alpha)
    image.thumbnail((512, 512), Image.Resampling.LANCZOS)
    image.save(output, "PNG", optimize=True)


for expression in EXPRESSIONS:
    source = ROOT / f"fin-mascote-{expression}-clean.png"
    output = ROOT / f"fin-mascote-{expression}-indigo.png"
    recolor(source, output)
    print(output)
