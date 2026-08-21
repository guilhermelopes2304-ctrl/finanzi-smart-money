from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"
TARGETS = [ROOT / "routes" / "index.tsx", ROOT / "routes" / "oferta.tsx"]
TARGETS += [ROOT / "routes" / "auth.tsx", ROOT / "routes" / "redefinir-senha.tsx"]
TARGETS += sorted((ROOT / "routes" / "_authenticated").rglob("*.tsx"))
TARGETS += sorted((ROOT / "components" / "finanzzi").glob("*.tsx"))

REPLACEMENTS = {
    "#5B5CE2": "#19C96B",
    "#5b5ce2": "#19c96b",
    "#4546C8": "#0F9F52",
    "#4546c8": "#0f9f52",
    "#EEF0FF": "#EAF9F0",
    "#eef0ff": "#eaf9f0",
    "#FCFBF7": "#FCFCF8",
    "#fcfbf7": "#fcfcf8",
    "#151827": "#111827",
    "#151827": "#111827",
    "#3F4658": "#556070",
    "#3f4658": "#556070",
    "#667085": "#556070",
    "#667085": "#556070",
    "#E4E7EF": "#E1E7E3",
    "#e4e7ef": "#e1e7e3",
    "#0A0F1D": "#111827",
    "#0a0f1d": "#111827",
    "#39FF14": "#19C96B",
    "#39ff14": "#19c96b",
    "#1E293B": "#556070",
    "#1e293b": "#556070",
    "#94A3B8": "#E1E7E3",
    "#94a3b8": "#e1e7e3",
    "#FFFFFF": "#FFFFFF",
    "#ffffff": "#FFFFFF",
    "rgba(91,92,226,.18)": "rgba(25,201,107,.18)",
    "rgba(91,92,226,.12)": "rgba(25,201,107,.12)",
    "rgba(91,92,226,.10)": "rgba(25,201,107,.10)",
    "rgba(57,255,20,.18)": "rgba(25,201,107,.18)",
    "rgba(57,255,20,.12)": "rgba(25,201,107,.12)",
    "rgba(57,255,20,.10)": "rgba(25,201,107,.10)",
}

for path in TARGETS:
    text = path.read_text()
    original = text
    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)
    if text != original:
        path.write_text(text)
        print(path)
