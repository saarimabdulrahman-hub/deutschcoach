"""Generate synthwave hero images via the Gemini image models.

Reads the Google AI key from ~/.claude.json (mcp-sight VISION_API_KEY — never
hard-coded). Writes PNGs to scripts/gen/. Tries a list of image-capable models
until one succeeds.

Usage: python gen_hero.py            # generates the full candidate set
       python gen_hero.py test       # generates a single test image
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request

CFG = os.path.expanduser("~/.claude.json")
KEY = json.load(open(CFG))["projects"]["C:/Users/saari"]["mcpServers"]["mcp-sight"]["env"]["VISION_API_KEY"]
MODELS = ["gemini-3-flash-image", "gemini-2.5-flash-image", "nano-banana-pro-preview", "gemini-3-pro-image"]
OUT = "scripts/gen"

BASE = (
    "Ultra-wide cinematic hero banner illustration, synthwave / cyberpunk neon aesthetic, "
    "premium 3D render look with volumetric lighting and atmospheric depth. "
    "{subject} rendered as a glowing silhouette positioned on the RIGHT side of the frame, "
    "backlit by an EXPLOSIVE brilliant burst of light (white-hot pink fading to lavender) "
    "with dramatic volumetric god rays, glowing magenta and violet nebula clouds, a thin "
    "neon-pink circular ring arching over it, a bright lens-flare starburst, and a starry night sky. "
    "Color palette: deep near-black indigo #030212 base, electric magenta #d946ef, hot pink #ec4899, "
    "violet #8b5cf6, warm pink-white glow. Extremely vibrant, saturated, high-contrast. "
    "The LEFT THIRD of the image must be dark, empty negative space (reserved for text overlay). "
    "Absolutely NO text, NO words, NO letters, NO logos anywhere in the image."
)

PROMPTS = [
    ("castle", BASE.format(subject="A majestic Neuschwanstein fairy-tale castle with many tall pointed towers on a dramatic cliff")),
    ("gate", BASE.format(subject="The Brandenburg Gate (Brandenburger Tor) front-facing with its columns and the Quadriga on top, brilliant light blazing through the central archway")),
    ("castle2", BASE.format(subject="A grand fairy-tale castle on a mountain crag with a huge glowing moon behind it")),
    ("gate2", BASE.format(subject="The Brandenburg Gate with the Berlin TV Tower beside it, a giant glowing portal ring of light behind the gate")),
]


def gen(model, prompt, outpath):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={KEY}"
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}}
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                headers={"Content-Type": "application/json"})
    try:
        obj = json.load(urllib.request.urlopen(req, timeout=180))
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}: {e.read().decode()[:300]}"
    except Exception as e:
        return f"ERR {e}"
    for cand in obj.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inl = part.get("inlineData") or part.get("inline_data")
            if inl and inl.get("data"):
                open(outpath, "wb").write(base64.b64decode(inl["data"]))
                return f"OK -> {outpath}"
    return "no-image: " + json.dumps(obj)[:300]


def pick_model():
    os.makedirs(OUT, exist_ok=True)
    for m in MODELS:
        r = gen(m, "A glowing neon pink circle on a black background", f"{OUT}/_probe.png")
        print(f"[{m}] {r}")
        if r.startswith("OK"):
            return m
    return None


if __name__ == "__main__":
    model = pick_model()
    if not model:
        print("No working image model."); sys.exit(1)
    print("Using model:", model)
    items = PROMPTS[:1] if (len(sys.argv) > 1 and sys.argv[1] == "test") else PROMPTS
    for name, prompt in items:
        print(f"[{name}] {gen(model, prompt, f'{OUT}/hero_{name}.png')}")
