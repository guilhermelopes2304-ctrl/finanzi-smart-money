from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / "public"
for path in sorted(root.glob("fin-mascote-*-clean.png")):
    with Image.open(path) as image:
        image = image.convert("RGBA")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        image.save(path, format="PNG", optimize=True)
        print(f"optimized {path.name}: {image.size[0]}x{image.size[1]}")
