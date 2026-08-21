from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1] / "src"
TARGETS = [ROOT / "routes" / "index.tsx", ROOT / "routes" / "oferta.tsx"]
TARGETS += sorted((ROOT / "routes").rglob("*.tsx"))
TARGETS += sorted((ROOT / "components" / "finanzzi").glob("*.tsx"))

for path in TARGETS:
    text = path.read_text()
    original = text

    # Direct brand/background migrations.
    text = text.replace("#071a12", "#0A0F1D")
    text = text.replace("#062117", "#0A0F1D")
    text = text.replace("#0d2d20", "#1E293B")
    text = text.replace("#0b4a31", "#1E293B")
    text = text.replace("#b7ff52", "#39FF14")
    text = text.replace("#c6f45d", "#39FF14")
    text = text.replace("#d5f77a", "#39FF14")
    text = text.replace("#e9dfd1", "#1E293B")
    text = text.replace("#f7f3ec", "#0A0F1D")
    text = text.replace("#537b15", "#39FF14")
    text = text.replace("#032013", "#0A0F1D")
    text = text.replace("#06251a", "#0A0F1D")
    text = text.replace("#d8ff79", "#39FF14")
    text = text.replace("#ead7c1", "#1E293B")
    text = text.replace("#0d4b32", "#1E293B")
    text = text.replace("#16a34a", "#39FF14")
    text = text.replace("#1f7a4d", "#0A0F1D")
    text = text.replace("#17201c", "#1E293B")
    text = text.replace("bg-red-400 text-white", "bg-[#1E293B] text-[#FFFFFF]")

    # Context-aware treatment of the former dark ink token.
    text = re.sub(r"bg-\[#17201c\](/[^\s\"']+)?", lambda m: f"bg-[#0A0F1D]{m.group(1) or ''}", text)
    text = re.sub(r"border-\[#17201c\](/[^\s\"']+)?", lambda m: f"border-[#1E293B]{m.group(1) or ''}", text)
    text = re.sub(r"text-\[#17201c\]/(\d+)", r"text-[#94A3B8]/\1", text)
    text = text.replace("text-[#17201c]", "text-[#FFFFFF]")

    # Replace direct legacy Tailwind colors in branded surfaces.
    text = re.sub(r"text-(?:emerald|lime)-\d+(?:/(\d+))?", lambda m: f"text-[#39FF14]/{m.group(1)}" if m.group(1) else "text-[#39FF14]", text)
    text = re.sub(r"bg-(?:emerald|lime)-\d+(?:/(\d+))?", lambda m: f"bg-[#39FF14]/{m.group(1)}" if m.group(1) else "bg-[#39FF14]", text)
    text = re.sub(r"border-(?:emerald|lime)-\d+(?:/(\d+))?", lambda m: f"border-[#1E293B]/{m.group(1)}" if m.group(1) else "border-[#1E293B]", text)
    text = re.sub(r"text-white/(\d+)", r"text-[#94A3B8]/\1", text)
    text = re.sub(r"bg-white/(\d+)", r"bg-[#1E293B]/\1", text)
    text = re.sub(r"border-white/(\d+)", r"border-[#1E293B]/\1", text)

    if text != original:
        path.write_text(text)
        print(path)
