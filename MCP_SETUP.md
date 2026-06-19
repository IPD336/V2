# Model Context Protocol (MCP) Setup Guide

This guide describes how to configure and run Model Context Protocol (MCP) servers for **SkillSwap**, enabling external AI models (e.g. Claude Desktop or other MCP-compatible clients) to securely interact with external resources and session memory.

---

## 1. Setup GitHub MCP Server (MCP Server #1)

The GitHub MCP server allows your AI agent to fetch public or private repositories, read files, commit code, and search issues directly on GitHub.

### Prerequisites
* A GitHub account.
* A GitHub **Personal Access Token (Classic)** with the `repo` scope (for reading private repos) or just public read permissions.
  * Create one under **GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)**.

### Configuration
1. Open the [mcp-config.json](file:///c:/Users/ipd33/INDRAJEETSINH/CODE/DE/skillswap/mcp-config.json) file in this repository.
2. Replace `YOUR_GITHUB_PERSONAL_ACCESS_TOKEN` with your newly generated token.
3. To configure this for Claude Desktop:
   * Copy the content of the `mcp-config.json` file.
   * Paste it into your Claude Desktop configuration file:
     * **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
     * **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

---

## 2. Setup Memory MCP Server (MCP Server #4)

The Memory MCP server provides semantic memory storage. It allows the AI assistant to remember details about the current user's profile, ongoing skill swaps, and key discussion points across different sessions.

### Configuration
The Memory MCP configuration is already included in your `mcp-config.json` file:
```json
"memory": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-memory"
  ]
}
```

No additional configuration or API keys are required for the Memory server. It runs locally and stores a JSON file containing semantic memory items.

---

## 3. How to Use the MCP Config in IDEs and Clients

### Claude Desktop
If you configure Claude Desktop using the instructions above, when you start Claude:
* You will see a small plug icon showing that the `github` and `memory` servers are connected.
* You can ask Claude to:
  * *"Read the files in repository 'my-username/my-repo' and tell me what technologies I used."* (using GitHub MCP)
  * *"Remember that my target skill is to learn Next.js."* (using Memory MCP)

### Cursor / VS Code
If you are using Cursor, you can add these servers in **Cursor Settings → Models → MCP**:
* **Name**: `github`
* **Type**: `command`
* **Command**: `npx -y @modelcontextprotocol/server-github`
* **Env Variable**: `GITHUB_PERSONAL_ACCESS_TOKEN=your_token`
