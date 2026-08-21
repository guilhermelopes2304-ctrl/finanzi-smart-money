from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source_dir = Path("/home/ubuntu/upload/search_images")
output_dir = ROOT / "public/images/photography"
output_dir.mkdir(parents=True, exist_ok=True)

assets = {
    "8JyP1EDIyPwB.jpg": ("finanzi-phone-payment.webp", (1600, 1067)),
    "flxJ9KOwUIf7.jpeg": ("finanzi-planning.webp", (900, 1350)),
}

for source_name, (target_name, max_size) in assets.items():
    source = source_dir / source_name
    target = output_dir / target_name
    image = Image.open(source).convert("RGB")
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    image.save(target, "WEBP", quality=82, method=6)
    print(target, image.size)
