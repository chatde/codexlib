# codexlib CLI

Command-line tool for [CodexLib](https://codexlib.io) — compressed knowledge packs for AI prompts.

## Install

```bash
# From the cli/ directory
npm link

# Or run directly
npx codexlib <command>
```

## Usage

```bash
# Pull a specific pack to clipboard
codexlib pull ai-ml-llm-fundamentals

# Pull a random pack from a domain
codexlib pull cybersecurity

# Search packs by keyword
codexlib search quantum

# List all domains
codexlib list

# List packs in a domain
codexlib list ai-ml
```

## Commands

| Command | Description |
|---------|-------------|
| `pull <pack-slug>` | Download a specific pack and copy to clipboard |
| `pull <domain>` | Download a random pack from that domain to clipboard |
| `search <query>` | Search packs by keyword (matches slug and title) |
| `list` | List all available domains |
| `list <domain>` | List all packs in a domain |
| `help` | Show help |

## Output Format

The `pull` command copies the pack content to your clipboard in this format:

```
[DECODE] abbr=expansion|abbr2=expansion2|...

# Pack Content (compressed)
...
```

The rosetta header tells the AI how to decode the compressed abbreviations.

## Requirements

- Node.js 18+ (uses native `fetch`)
- macOS (`pbcopy`) or Linux (`xclip`) for clipboard support
- Falls back to stdout if no clipboard tool is available

## API

All data is fetched from `https://codexlib.io/api/v1/`.
