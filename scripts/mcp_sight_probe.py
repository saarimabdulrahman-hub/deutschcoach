"""Probe mcp-sight: list its tools and print each tool's input schema.

Reads the mcp-sight server config (command/args/env, including the vision API
key) from ~/.claude.json so no secret is hard-coded here. Speaks JSON-RPC over
stdio to the server, performs the MCP initialize handshake, then requests
tools/list and prints the result.
"""
import json
import os
import subprocess

CFG = os.path.expanduser("~/.claude.json")


def load_server():
    cfg = json.load(open(CFG))
    return cfg["projects"]["C:/Users/saari"]["mcpServers"]["mcp-sight"]


def rpc_session(srv, messages, timeout=90):
    env = dict(os.environ)
    env.update(srv.get("env", {}))
    proc = subprocess.Popen(
        [srv["command"], *srv["args"]],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        env=env,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    payload = "".join(json.dumps(m) + "\n" for m in messages)
    try:
        out, _ = proc.communicate(input=payload, timeout=timeout)
    except subprocess.TimeoutExpired:
        proc.kill()
        out, _ = proc.communicate()
    return out


def main():
    srv = load_server()
    msgs = [
        {"jsonrpc": "2.0", "id": 1, "method": "initialize",
         "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                    "clientInfo": {"name": "probe", "version": "1"}}},
        {"jsonrpc": "2.0", "method": "notifications/initialized"},
        {"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
    ]
    out = rpc_session(srv, msgs)
    for line in out.splitlines():
        try:
            obj = json.loads(line)
        except ValueError:
            continue
        if obj.get("id") == 2 and "result" in obj:
            for tool in obj["result"]["tools"]:
                print("TOOL:", tool["name"])
                print("  desc:", (tool.get("description") or "")[:300])
                print("  schema:", json.dumps(tool.get("inputSchema", {})))
                print()


if __name__ == "__main__":
    main()
