# Context7 MCP Setup Guide

## What is Context7?
Context7 provides up-to-date library documentation and API references directly to your AI agent. 
When you say "use Context7", Qwen Code will fetch real-time documentation for any library/framework.

## Setup Steps

### 1. Get Your Free API Key
1. Visit: https://context7.com/dashboard
2. Sign up (free tier available)
3. Copy your API key from the dashboard

### 2. Add API Key to Environment Variables

**Option A: Add to `.env.local` (Recommended)**
```bash
# Add this line to your .env.local file
CONTEXT7_API_KEY=your_api_key_here
```

**Option B: Add to shell profile**
```bash
# Add to ~/.bashrc or ~/.zshrc
export CONTEXT7_API_KEY=your_api_key_here
```

### 3. Restart Qwen Code
After adding the API key, restart your terminal/Qwen Code session.

## Usage Examples

Once configured, you can ask me:
- "Use Context7 to get Next.js 16 caching documentation"
- "Use Context7 to check Convex vector search best practices"
- "Use Context7 for Clerk Next.js v6 setup guide"
- "Use Context7 to find React 19 new features"

## Configuration

The MCP server is configured in `.qwen/settings.json`:

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "$CONTEXT7_API_KEY"
      },
      "timeout": 30000
    }
  }
}
```

## Available Context7 Tools

1. **resolve-library-id** - Find the correct library ID for documentation queries
2. **query-docs** - Get up-to-date, version-specific documentation

## Troubleshooting

**Context7 not responding?**
- Check that `CONTEXT7_API_KEY` is set in your environment
- Verify the API key is valid at https://context7.com/dashboard
- Check network connectivity to `mcp.context7.com`

**Rate limits?**
- Free tier has rate limits
- Upgrade at context7.com/dashboard for higher limits
