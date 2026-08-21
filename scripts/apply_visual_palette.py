from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"
TARGETS = [ROOT / "routes" / "index.tsx", ROOT / "routes" / "oferta.tsx"]
TARGETS += sorted((ROOT / "routes" / "_authenticated").rglob("*.tsx"))
TARGETS += sorted((ROOT / "components" / "finanzzi").glob("*.tsx"))

REPLACEMENTS = {
    "#0A0F1D": "#151827",
    "#0a0f1d": "#151827",
    "#39FF14": "#5B5CE2",
    "#39ff14": "#5b5ce2",
    "#1E293B": "#3F4658",
    "#1e293b": "#3f4658",
    "#94A3B8": "#F4F5F8",
    "#94a3b8": "#f4f5f8",
    "#FFFFFF": "#FCFBF7",
    "#ffffff": "#fcfbf7",
    "rgba(57,255,20,.18)": "rgba(91,92,226,.18)",
    "rgba(57,255,20,.12)": "rgba(91,92,226,.12)",
    "rgba(57,255,20,.10)": "rgba(91,92,226,.10)",
}

for path in TARGETS:
    text = path.read_text()
    original = text
    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)
    if text != original:
        path.write_text(text)
        print(path)
