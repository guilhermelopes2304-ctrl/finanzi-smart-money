from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1] / "src"
TARGETS = [
    ROOT / "routes" / "index.tsx",
    ROOT / "routes" / "auth.tsx",
    ROOT / "routes" / "redefinir-senha.tsx",
    ROOT / "routes" / "oferta.tsx",
    ROOT / "routes" / "_authenticated" / "boas-vindas.tsx",
]
pattern = re.compile(r'(bg-\[#19C96B\][^"`]*?)text-\[#FCFCF8\]')
pattern_lower = re.compile(r'(bg-\[#19c96b\][^"`]*?)text-\[#fcfcf8\]')
for path in TARGETS:
    text = path.read_text()
    updated = pattern.sub(r'\1text-[#111827]', text)
    updated = pattern_lower.sub(r'\1text-[#111827]', updated)
    if updated != text:
        path.write_text(updated)
        print(path)
