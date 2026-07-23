"""Call mcp-sight's see_image tool on a local image and print the description.

Usage: python mcp_sight_see.py <image_path> [detail_level] [prompt...]

Reuses the server config + JSON-RPC helpers from mcp_sight_probe (same folder),
so the vision API key is read from ~/.claude.json, never hard-coded.
"""
import json
import sys

from mcp_sight_probe import load_server, rpc_session


def see_image(image_path, detail_level="detailed", prompt=None, context=None):
    srv = load_server()
    args = {"image_path": image_path, "detail_level": detail_level}
    if prompt:
        args["prompt"] = prompt
    if context:
        args["context"] = context
    msgs = [
        {"jsonrpc": "2.0", "id": 1, "method": "initialize",
         "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                    "clientInfo": {"name": "see", "version": "1"}}},
        {"jsonrpc": "2.0", "method": "notifications/initialized"},
        {"jsonrpc": "2.0", "id": 2, "method": "tools/call",
         "params": {"name": "see_image", "arguments": args}},
    ]
    out = rpc_session(srv, msgs, timeout=180)
    for line in out.splitlines():
        try:
            obj = json.loads(line)
        except ValueError:
            continue
        if obj.get("id") == 2:
            if "error" in obj:
                print("ERROR:", json.dumps(obj["error"]))
                return
            for block in obj["result"].get("content", []):
                if block.get("type") == "text":
                    print(block["text"])


if __name__ == "__main__":
    path = sys.argv[1]
    detail = sys.argv[2] if len(sys.argv) > 2 else "detailed"
    text = " ".join(sys.argv[3:]) or None
    see_image(path, detail_level=detail, prompt=text)
