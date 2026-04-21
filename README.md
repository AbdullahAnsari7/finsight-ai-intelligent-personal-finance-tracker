# AI Chat

[cloudflarebutton]

A full-stack AI chat application built with **Cloudflare Workers**, **Convex** (serverless backend), and **React**. Users can create persistent chat threads, customize AI system prompts, and converse with powerful models via **OpenRouter** integration. Features secure authentication, real-time messaging, and a modern responsive UI.

## Features

- **User Authentication**: Email/password with OTP verification, password reset, and anonymous sign-in
- **Persistent Chat Threads**: Create, edit, delete threads with custom titles and system prompts
- **AI Integration**: Chat with models like Google Gemini Flash via OpenRouter API
- **Real-time Updates**: Powered by Convex reactive queries and mutations
- **Responsive Design**: Tailwind CSS + shadcn/ui with dark mode support
- **File Management**: Secure file uploads with metadata storage (schema-ready)
- **Edge Deployment**: Zero-cold-start performance on Cloudflare's global network
- **TypeScript Everywhere**: End-to-end type safety

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query
- **Backend**: Convex (functions, schema, auth), Cloudflare Workers, Hono routing
- **Database**: Convex (document store with indexes)
- **AI**: OpenRouter API (Gemini, Anthropic, OpenAI-compatible)
- **Auth**: Convex Auth with custom SMTP OTP emails
- **Deployment**: Cloudflare Workers, Wrangler CLI
- **Other**: Bun (package manager), Immer, Lucide icons, Sonner toasts

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`bunx wrangler@latest login`)
- [Convex CLI](https://www.convex.dev/cli) (`bunx convex@latest dev`)
- Cloudflare account (free tier sufficient)
- OpenRouter account and API key for AI chat (free tier available)
- SMTP service for email auth (e.g., setup ANDROMO_SMTP_URL/API_KEY)

### Installation

1. Clone or download the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Deploy Convex backend (creates tables, auth):
   ```bash
   bun run backend:deploy
   ```
   - Copy the generated `VITE_CONVEX_URL` from the output
4. Create `.env` or set in Cloudflare dashboard:
   ```
   VITE_CONVEX_URL=your_convex_url_here
   ANDROMO_AI_API_KEY=your_openrouter_api_key
   ANDROMO_SMTP_URL=your_smtp_service_url
   ANDROMO_SMTP_API_KEY=your_smtp_api_key
   CONVEX_SITE_URL=https://your-domain.workers.dev
   ```

### Development

1. Start dev server (frontend + backend proxy):
   ```bash
   bun run dev
   ```
   - App runs at `http://localhost:3000`
   - Convex dev server handles backend
2. Edit code in `src/`, `convex/`, `worker/`
3. Type generation: `bun run cf-typegen`
4. Lint: `bun run lint`

**Hot reload**: Frontend auto-reloads. Backend requires `bun run backend:deploy` for Convex changes.

### Usage Examples

1. **Sign Up/Login**: Email + password (OTP verification sent)
2. **Create Chat**: Click "New Chat", set title/system prompt, save
3. **Chat**: Select thread, type message (Enter to send), AI responds automatically
4. **Customize**: Edit thread settings for model/prompt
5. **Anonymous Mode**: Quick start without account

UI includes sidebar navigation, auto-scroll, message history, delete threads.

## Deployment

Deploy to Cloudflare Workers in one command:

```bash
bun run deploy
```

Or step-by-step:

1. Build assets: `bun run build`
2. Deploy backend: `bun run backend:deploy` (update VITE_CONVEX_URL if new Convex project)
3. Deploy worker: `wrangler deploy`

[cloudflarebutton]

**Custom Domain**: Edit `wrangler.jsonc`, run `wrangler deploy`.

**Production Config**:
- Set env vars in Cloudflare dashboard (Wrangler secrets: `wrangler secret put ANDROMO_AI_API_KEY`)
- Convex production deploy: `npx convex deploy`
- Assets served via Cloudflare (SPA fallback)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Convex project URL (from `convex deploy`) |
| `ANDROMO_AI_API_KEY` | Yes (for AI) | OpenRouter API key |
| `ANDROMO_SMTP_URL` | Yes (for email auth) | SMTP service endpoint |
| `ANDROMO_SMTP_API_KEY` | Yes (for email auth) | SMTP API key |
| `CONVEX_SITE_URL` | Recommended | Base URL for Convex auth callbacks |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Development server |
| `bun run build` | Build + deploy backend |
| `bun run deploy` | Full production deploy |
| `bun run preview` | Preview production build |
| `bun run lint` | Lint code |

## Project Structure

```
├── convex/          # Convex backend (schema, auth, AI functions)
├── src/             # React frontend
├── worker/          # Cloudflare Worker routing
├── shared/          # Shared TypeScript utils
└── package.json     # Bun dependencies
```

## Contributing

1. Fork and clone
2. Install deps: `bun install`
3. Create feature branch
4. Submit PR with tests/docs

Issues/PRs welcome!

## License

MIT License - see [LICENSE](LICENSE) for details.

---

⭐ **Built with Cloudflare Workers + Convex**