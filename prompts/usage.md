# Usage

## Overview
Cloudflare Workers + React with Andromo Convex Backend for real-time data, authentication, and prebuilt AI chat.
- Frontend: React Router 6 + TypeScript + ShadCN UI + Tailwind + Lucide Icons
- Backend: Convex (real-time queries, mutations, actions, auth)
- Hosting: Cloudflare Workers
- AI: OpenRouter-powered AI chat with Convex thread/message storage
- Tooling: Vite, ESLint

## IMPORTANT: Starter Content
**The existing pages are starter template content meant to be customized.**
- `src/pages/HomePage.tsx` is the landing page and auth-aware redirect into the AI chat flow
- `src/pages/AiChatPage.tsx` is the authenticated AI chat route
- `src/components/AiChat.tsx` is the shipped chat UI you can extend or replace
- `convex/aiChat.ts` contains the prebuilt thread/message backend
- Add your own tables to `convex/schema.ts` and new Convex functions in `convex/`
- Add custom worker API routes in `worker/userRoutes.ts` when needed

## Code Organization

### Frontend Structure
- `src/main.tsx` - Router setup with a shared layout route and child pages
- `src/components/layout/AppLayout.tsx` - Shared sidebar layout rendered by the root route
- `src/components/app-sidebar.tsx` - Sidebar navigation; add links for new child routes here
- `src/pages/HomePage.tsx` - Landing page and authenticated redirect into `/ai-chat`
- `src/pages/AiChatPage.tsx` - Route component for the AI chat experience
- `src/components/AiChat.tsx` - Prebuilt chat interface with thread management
- `src/components/ui/*` - ShadCN components (use them directly, do not rewrite them)
- `src/components/SignInForm.tsx` - Auth form (functional, keep)
- `src/components/SignOutButton.tsx` - Sign out control (functional, keep)
- `src/lib/convex.ts` - Convex client (do not modify)

### Backend Structure (Convex)
- `convex/schema.ts` - Define your tables here; auth tables, AI chat tables, and the bundled file metadata table are already configured
- `convex/auth.ts` - Auth setup with password, email verification/reset, and anonymous access (pre-configured, do not modify)
- `convex/files.ts` - File upload URL and storage metadata helpers
- `convex/aiChat.ts` - Prebuilt AI chat queries, mutations, and actions
- `convex/*.ts` - Add your own queries, mutations, and actions here
- `convex/_generated/*` - Auto-generated (never edit or create manually)

### Worker Structure
- `worker/index.ts` - Entry point (**DO NOT MODIFY**)
- `worker/userRoutes.ts` - Add custom API routes here
- `worker/core-utils.ts` - Core utilities (**DO NOT MODIFY**)

## Development Restrictions
- **Tailwind Colors**: Define custom colors in `tailwind.config.js`, not in `index.css`
- **Components**: Use existing ShadCN components from `@/components/ui/*` instead of rewriting common controls
- **Icons**: Import from `lucide-react` directly
- **Error Handling**: Error boundaries are already implemented
- **Worker Files**: Do not modify `worker/index.ts` or `worker/core-utils.ts`
- **Convex Auth**: Authentication is pre-configured; do not modify `convex/auth.ts`
- **Generated Files**: Never edit `convex/_generated/*`

## Styling
- Responsive, accessible
- Prefer ShadCN components and Tailwind utilities for custom UI
- Icons from `lucide-react`
- Error boundaries are already implemented

## Animation
- Use `framer-motion` for small interactions when needed

## Components
- Import from `@/components/ui/*` (ShadCN). Avoid reinventing base components.

## Routing (CRITICAL)

Uses `createBrowserRouter` with a **shared layout route**. Do NOT switch to `BrowserRouter`/`HashRouter`.

If you switch routers, `RouteErrorBoundary`/`useRouteError()` will not work correctly.

### Shared Layout Route

The app uses a root layout route. `AppLayout` renders the sidebar and an `<Outlet />` where child pages render:

```tsx
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { AiChatPage } from '@/pages/AiChatPage'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/ai-chat", element: <AiChatPage /> },
    ],
  },
]);
```

### Adding New Pages

1. Create the page component in `src/pages/MyPage.tsx`
2. Import it in `src/main.tsx`
3. Add a child route entry:
   ```tsx
   { path: "/my-page", element: <MyPage /> },
   ```
4. Add a navigation link in `src/components/app-sidebar.tsx`

### Adding Sidebar Links

Keep sidebar links in the `navItems` array and render them with `SidebarMenuButton isActive`:

```tsx
const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "AI Chat", path: "/ai-chat", icon: MessageSquare },
  { label: "My Page", path: "/my-page", icon: PanelLeft },
];
```

### Navigation Components

Use `Link` for declarative navigation and `useNavigate` for event-driven navigation:

```tsx
import { Link, useNavigate } from "react-router-dom";

<Link to="/ai-chat">Open chat</Link>

const navigate = useNavigate();
const handleDone = () => {
  navigate("/my-page");
};
```

### Active Link Styling

Use `useLocation()` to highlight the active page in navigation:

```tsx
import { Link, useLocation } from "react-router-dom";

function NavItem({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link to={to} className={isActive ? "text-primary font-medium" : "text-muted-foreground"}>
      {label}
    </Link>
  );
}
```

### Dynamic Routes

Use route params for detail pages:

```tsx
// In main.tsx child routes:
{ path: "/thread/:threadId", element: <ThreadPage /> },

// In ThreadPage.tsx:
import { useParams } from "react-router-dom";

export function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  return <div>Thread {threadId}</div>;
}
```

### Routing Mistakes (DO NOT)

- Do NOT use `<a href="...">` for internal navigation; use `<Link to="...">`
- Do NOT use `window.location.href`; use `useNavigate()`
- Do NOT switch to `BrowserRouter`, `HashRouter`, or `MemoryRouter`
- Do NOT remove `errorElement` from the root layout route
- Do NOT add a new page without also adding a route in `src/main.tsx`
- Do NOT use `useRouteError()` in regular page components
- Do NOT nest additional routers inside the app

## Authentication
Convex Auth is pre-configured with Password and Anonymous providers.

- Password auth already includes OTP email verification and password reset flows.
- `src/components/SignInForm.tsx` already handles sign up, sign in, email verification, forgot password, reset password, and anonymous sign-in.
- Email flows require `ANDROMO_SMTP_URL` and `ANDROMO_SMTP_API_KEY` in the Convex backend environment.

```tsx
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { SignInForm } from "@/components/SignInForm";

export function MyComponent() {
  const user = useQuery(api.auth.loggedInUser);

  return (
    <>
      <Authenticated>
        <p>Welcome, {user?.name}</p>
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}
```

Components available: `<SignInForm />`, `<SignOutButton />`

## React backend usage
- Import from `@convex` to load the generated Convex API. Example:
```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from "@convex/_generated/api";

export function Page() {
  const data = useQuery(api.table.getData, { Id }) ?? [];
  const addDataMutation = useMutation(api.table.addData);
}
```

## UI Components
All ShadCN components are in `./src/components/ui/*`. Import and use them directly:
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```
**Do not rewrite these components.**

## Example
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function Example() {
  return (
    <Card className="max-w-sm">
      <CardContent className="p-4 flex gap-2">
        <Button>Click</Button>
      </CardContent>
    </Card>
  )
}
```

## Convex Backend
- You can use all the Convex functionality in `convex`. Follow the existing patterns carefully to avoid breakage.
- Convex is preconfigured with all needed env variables.
- Logs from the backend are included for the `get_runtime_errors` tool.

## AI Integration (OpenRouter)

This template includes pre-built AI chat functionality. When you customize or extend it, keep the existing architecture and follow these rules:

1. **API Key**: The project has access to `ANDROMO_AI_API_KEY` environment variable in Convex backend. This key is an OpenRouter API key automatically provisioned when AI integration is set up via the `add_ai_tool`.

2. **OpenRouter API**: Always call OpenRouter API directly for AI requests. OpenRouter provides an OpenAI-compatible API:
   - Endpoint: `https://openrouter.ai/api/v1/chat/completions`
   - This is a direct API call, not through a gateway

3. **Default Model**: **Always use Gemini Flash Lite (`google/gemini-2.5-flash-lite`) as the default model** unless specifically instructed otherwise. This is a cost-effective, fast model suitable for most use cases.
   - **Only these exact model strings are allowed**: `google/gemini-2.5-flash-lite`, `google/gemini-2.5-flash`, `x-ai/grok-4.1-fast`, `openai/gpt-5.4-nano`
   - **Never use** model IDs that include `preview`, `exp`, `experimental`, or version suffixes such as `-02.05` or `-2.0`
   - **Important**: OpenRouter uses format `google/gemini-...`, not `google-ai-studio/gemini-...`
   - When in doubt, use exactly `google/gemini-2.5-flash-lite`

4. **Usage in Convex Actions**:
   ```typescript
   const apiKey = process.env.ANDROMO_AI_API_KEY;
   if (!apiKey) {
     throw new Error(
       "AI integration is not configured. Please set up AI integration using the 'add_ai_tool' or contact support to provision an API key."
     );
   }

   const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "Authorization": `Bearer ${apiKey}`,
       "HTTP-Referer": process.env.CONVEX_SITE_URL || "",
       "X-Title": "Andromo AI Chat",
       "User-Agent": "Andromo/1.0",
     },
     body: JSON.stringify({
       model: "google/gemini-2.5-flash-lite",
       messages: [
         { role: "system", content: "Your system prompt" },
         { role: "user", content: "User message" }
       ],
       max_tokens: 1000,
       temperature: 0.7,
     }),
   });

   if (!response.ok) {
     const errorText = await response.text();
     throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
   }

   const data = await response.json();
   const assistantContent = data.choices?.[0]?.message?.content || "No response from AI";
   ```

5. **Error Handling**:
   - **In Convex Actions**: If `ANDROMO_AI_API_KEY` is not available, throw a clear error message that guides users to set up AI integration using `add_ai_tool` or contact support.
   - **In UI Components**: Consider graceful degradation and show a helpful message instead of crashing the app.
   - Always provide actionable guidance about what to do next.
   - If chat requires authentication, catch unauthenticated failures and show sign-in UI instead of exposing raw errors.

6. **Model Selection**: Only use a different model if explicitly requested. Otherwise, always default to Gemini Flash Lite (`google/gemini-2.5-flash-lite`).
   - Use only the exact allowed model strings listed above
   - Do not guess model IDs or use provider/model formats outside that allowed list

7. **Frontend/Backend Split**:
   - Keep all AI API calls in the Convex backend
   - Frontend components should use Convex hooks such as `useQuery`, `useAction`, and `useMutation`
   - Do not call OpenAI/OpenRouter directly from frontend code
   - Do not create frontend AI service files or Zustand stores that make AI API calls

8. **Chat Rendering and System Prompt**:
   - Render AI responses as plain text
   - Do not add markdown rendering packages such as `react-markdown`
   - Use `whitespace-pre-wrap` and semantic text colors so responses remain readable
   - You may instruct the chat model via the system prompt to reply in plain text only
   - Adapt the chat system prompt and context to the app's domain, but keep the same backend and UI architecture

9. **Authentication and Access**:
   - The AI chat route requires authentication
   - Do not call chat APIs such as `getOrCreateUserThread`, `listThreads`, or `sendMessage` for anonymous users
   - Show a sign-in prompt or CTA instead of triggering Convex auth errors

10. **Chat Access UI**:
   - Keep AI chat on its dedicated `/ai-chat` route
   - If you customize navigation, keep a visible and prominent way to open chat
   - Do not hide chat access only inside an optional or hard-to-find menu

11. **Cost Controls**: Always set `max_tokens` to prevent runaway costs.

12. **Rate Limiting**: Implement rate limiting in your application to prevent abuse.

13. **Prompt Buttons**:
   - If you add prefilled prompt buttons, they must actually send the prompt to chat
   - Do not add decorative buttons with missing or no-op click handlers

## Pre-built AI Chat Features

This template includes:
- **AI Chat Component** (`src/components/AiChat.tsx`): Full-featured chat interface with thread management and Convex-backed message flow
- **AI Chat Page** (`src/pages/AiChatPage.tsx`): Dedicated authenticated chat route at `/ai-chat`
- **Convex Backend** (`convex/aiChat.ts`): Complete backend API for chat threads and messages
- **Database Schema**: Pre-configured `chatThreads` and `chatMessages` tables

The AI chat is accessible at `/ai-chat` and requires authentication. When customizing the experience, preserve that route-based entry point and keep a visible chat link or button in the UI.

# Convex Important
 - Run `bun run backend:deploy` each time you update backend code
 - Do not create or edit `convex/_generated/*`; those files are generated automatically
 - You are always working with a single persistent backend

# Convex guidelines
## Function guidelines
### New function syntax
- ALWAYS use the new function syntax for Convex functions. For example:
    ```typescript
    import { query } from "./_generated/server";
    import { v } from "convex/values";
    export const f = query({
        args: {},
        returns: v.null(),
        handler: async (ctx, args) => {
        // Function body
        },
    });
    ```

### Http endpoint syntax
- HTTP endpoints are defined in `convex/http.ts` and require an `httpAction` decorator. For example:
    ```typescript
    import { httpRouter } from "convex/server";
    import { httpAction } from "./_generated/server";
    const http = httpRouter();
    http.route({
        path: "/echo",
        method: "POST",
        handler: httpAction(async (ctx, req) => {
        const body = await req.bytes();
        return new Response(body, { status: 200 });
        }),
    });
    ```
- HTTP endpoints are always registered at the exact path you specify in the `path` field. For example, if you specify `/api/someRoute`, the endpoint will be registered at `/api/someRoute`.

### Validators
- Below is an example of an array validator:
    ```typescript
    import { mutation } from "./_generated/server";
    import { v } from "convex/values";

    export default mutation({
    args: {
        simpleArray: v.array(v.union(v.string(), v.number())),
    },
    handler: async (ctx, args) => {
        //...
    },
    });
    ```
- Below is an example of a schema with validators that codify a discriminated union type:
    ```typescript
    import { defineSchema, defineTable } from "convex/server";
    import { v } from "convex/values";

    export default defineSchema({
        results: defineTable(
            v.union(
                v.object({
                    kind: v.literal("error"),
                    errorMessage: v.string(),
                }),
                v.object({
                    kind: v.literal("success"),
                    value: v.number(),
                }),
            ),
        )
    });
    ```
- Always use the `v.null()` validator when returning a null value. Below is an example query that returns a null value:
      ```typescript
      import { query } from "./_generated/server";
      import { v } from "convex/values";

      export const exampleQuery = query({
        args: {},
        returns: v.null(),
        handler: async (ctx, args) => {
            console.log("This query returns a null value");
            return null;
        },
      });
      ```
- Here are the valid Convex types along with their respective validators:
 Convex Type  | TS/JS type  |  Example Usage         | Validator for argument validation and schemas  | Notes                                                                                                                                                                                                 |
| ----------- | ------------| -----------------------| -----------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Id          | string      | `doc._id`              | `v.id(tableName)`                              |                                                                                                                                                                                                       |
| Null        | null        | `null`                 | `v.null()`                                     | JavaScript's `undefined` is not a valid Convex value. Functions the return `undefined` or do not return will return `null` when called from a client. Use `null` instead.                             |
| Int64       | bigint      | `3n`                   | `v.int64()`                                    | Int64s only support BigInts between -2^63 and 2^63-1. Convex supports `bigint`s in most modern browsers.                                                                                              |
| Float64     | number      | `3.1`                  | `v.number()`                                   | Convex supports all IEEE-754 double-precision floating point numbers (such as NaNs). Inf and NaN are JSON serialized as strings.                                                                      |
| Boolean     | boolean     | `true`                 | `v.boolean()`                                  |
| String      | string      | `"abc"`                | `v.string()`                                   | Strings are stored as UTF-8 and must be valid Unicode sequences. Strings must be smaller than the 1MB total size limit when encoded as UTF-8.                                                         |
| Bytes       | ArrayBuffer | `new ArrayBuffer(8)`   | `v.bytes()`                                    | Convex supports first class bytestrings, passed in as `ArrayBuffer`s. Bytestrings must be smaller than the 1MB total size limit for Convex types.                                                     |
| Array       | Array]      | `[1, 3.2, "abc"]`      | `v.array(values)`                              | Arrays can have at most 8192 values.                                                                                                                                                                  |
| Object      | Object      | `{a: "abc"}`           | `v.object({property: value})`                  | Convex only supports "plain old JavaScript objects" (objects that do not have a custom prototype). Objects can have at most 1024 entries. Field names must be nonempty and not start with "$" or "_". |
| Record      | Record      | `{"a": "1", "b": "2"}` | `v.record(keys, values)`                       | Records are objects at runtime, but can have dynamic keys. Keys must be only ASCII characters, nonempty, and not start with "$" or "_".                                                               |

### Function calling
- Use `ctx.runQuery` to call a query from a query, mutation, or action.
- Use `ctx.runMutation` to call a mutation from a mutation or action.
- Use `ctx.runAction` to call an action from an action.
- ONLY call an action from another action if you need to cross runtimes (e.g. from V8 to Node). Otherwise, pull out the shared code into a helper async function and call that directly instead.
- Try to use as few calls from actions to queries and mutations as possible. Queries and mutations are transactions, so splitting logic up into multiple calls introduces the risk of race conditions.
- All of these calls take in a `FunctionReference`. Do NOT try to pass the callee function directly into one of these calls.
- When using `ctx.runQuery`, `ctx.runMutation`, or `ctx.runAction` to call a function in the same file, specify a type annotation on the return value to work around TypeScript circularity limitations. For example,
                            ```
                            export const f = query({
                              args: { name: v.string() },
                              returns: v.string(),
                              handler: async (ctx, args) => {
                                return "Hello " + args.name;
                              },
                            });

                            export const g = query({
                              args: {},
                              returns: v.null(),
                              handler: async (ctx, args) => {
                                const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });
                                return null;
                              },
                            });
                            ```

### Function references

- Function references are pointers to registered Convex functions.
- ALWAYS use the `api` object defined by the framework in `convex/_generated/api.ts` to call public functions registered with `query`, `mutation`, or `action`. You must import the `api` object in the same file when using it and it looks like:

```ts
import { api } from "./_generated/api";
```

- ALWAYS use the `internal` object defined by the framework in `convex/_generated/api.ts` to call internal (or private) functions registered with `internalQuery`, `internalMutation`, or `internalAction`. You must import the `internal` object in the same file when using it and it looks like:

```ts
import { internal } from "./_generated/api";
```

- Convex uses file-based routing, so a public function defined in `convex/example.ts` named `f` has a function reference of `api.example.f`.
- A private function defined in `convex/example.ts` named `g` has a function reference of `internal.example.g`.
- Functions can also registered within directories nested within the `convex/` folder. For example, a public function `h` defined in `convex/messages/access.ts` has a function reference of `api.messages.access.h`.


### Api design
- Convex uses file-based routing, so thoughtfully organize files with public query, mutation, or action functions within the `convex/` directory.
- Use `query`, `mutation`, and `action` to define public functions.
- Use `internalQuery`, `internalMutation`, and `internalAction` to define private, internal functions.

## Schema guidelines
- Always define your schema in `convex/schema.ts`.
- Always import the schema definition functions from `convex/server`:
- System fields are automatically added to all documents and are prefixed with an underscore. The two system fields that are automatically added to all documents are `_creationTime` which has the validator `v.number()` and `_id` which has the validator `v.id(tableName)`.
- Always include all index fields in the index name. For example, if an index is defined as `["field1", "field2"]`, the index name should be "by_field1_and_field2".
- Index fields must be queried in the same order they are defined. If you want to be able to query by "field1" then "field2" and by "field2" then "field1", you must create separate indexes.
- Do not store unbounded lists as an array field inside a document. Create a separate table for child items with a foreign key back to the parent.
- Separate high-churn operational data (e.g. heartbeats, online status, typing indicators) from stable profile data into dedicated tables.

## Typescript guidelines
- You can use the helper typescript type `Id` imported from './_generated/dataModel' to get the type of the id for a given table. For example if there is a table called 'users' you can use `Id<'users'>` to get the type of the id for that table.
- If you need to define a `Record` make sure that you correctly provide the type of the key and value in the type. For example a validator `v.record(v.id('users'), v.string())` would have the type `Record<Id<'users'>, string>`. Below is an example of using `Record` with an `Id` type in a query:
                    ```ts
                    import { query } from "./_generated/server";
                    import { Doc, Id } from "./_generated/dataModel";

                    export const exampleQuery = query({
                        args: { userIds: v.array(v.id("users")) },
                        returns: v.record(v.id("users"), v.string()),
                        handler: async (ctx, args) => {
                            const idToUsername: Record<Id<"users">, string> = {};
                            for (const userId of args.userIds) {
                                const user = await ctx.db.get(userId);
                                if (user) {
                                    users[user._id] = user.username;
                                }
                            }

                            return idToUsername;
                        },
                    });
                    ```
- Be strict with types, particularly around id's of documents. For example, if a function takes in an id for a document in the 'users' table, take in `Id<'users'>` rather than `string`.
- Always use `as const` for string literals in discriminated union types.
- When using the `Array` type, make sure to always define your arrays as `const array: Array<T> = [...];`
- When using the `Record` type, make sure to always define your records as `const record: Record<KeyType, ValueType> = {...};`
- Always add `@types/node` to your `package.json` when using any Node.js built-in modules.
- Use `Doc<"tableName">` from `./_generated/dataModel` for full document types.
- Use `QueryCtx`, `MutationCtx`, `ActionCtx` from `./_generated/server` for typing function contexts. NEVER use `any` for ctx parameters.

## Full text search guidelines
- A query for "10 messages in channel '#general' that best match the query 'hello hi' in their body" would look like:

const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general"),
  )
  .take(10);

## Function registration
- Use `internalQuery`, `internalMutation`, and `internalAction` to register internal functions. These are private and not part of the public API.
- Use `query`, `mutation`, and `action` for public functions. Do NOT use them for sensitive internal logic.
- You CANNOT register a function through the `api` or `internal` objects.
- ALWAYS include argument validators for all Convex functions.

## Pagination guidelines
- Use `paginationOptsValidator` from `"convex/server"` for paginated queries:
    ```typescript
    import { paginationOptsValidator } from "convex/server";
    export const listWithPagination = query({
        args: { paginationOpts: paginationOptsValidator },
        handler: async (ctx, args) => {
            return await ctx.db.query("items").order("desc").paginate(args.paginationOpts);
        },
    });
    ```
- Return shape: `{ page, isDone, continueCursor }`.

## Query guidelines
- Do NOT use `filter` in queries. Define an index in the schema and use `withIndex` instead.
- Default to bounded collections: use `.take()` or paginate instead of `.collect()` unless you are sure the table is small.
- Never use `.collect().length` to count rows. Maintain a denormalized counter in a separate document.
- Convex queries do NOT support `.delete()`. Use `.take(n)` to read batches, iterate with `ctx.db.delete(row._id)`.
- Use `.unique()` to get a single document from a query (throws if multiple matches).
- Default ordering is ascending `_creationTime`. Use `.order('asc')` or `.order('desc')` to change.
- Mutations are transactions with limits. If a mutation needs to process more documents than fit in a single transaction, process a batch with `.take(n)` and schedule continuation with `ctx.scheduler.runAfter(0, api.myModule.myMutation, args)`.
- When using async iteration, use `for await (const row of query)` syntax instead of `.collect()` or `.take(n)`.

## Mutation guidelines
- Use `ctx.db.replace` to fully replace an existing document (throws if not found).
- Use `ctx.db.patch` for shallow merge updates (throws if not found).

## Action guidelines
- Always add `"use node";` to the top of files containing actions that use Node.js built-in modules.
- Never add `"use node";` to a file that also exports queries or mutations. Put the action in a separate file.
- `fetch()` is available in the default Convex runtime. No `"use node";` needed for fetch.
- Never use `ctx.db` inside an action. Actions do not have database access.

## Scheduling guidelines
- Only use `crons.interval` or `crons.cron` methods (NOT `crons.hourly`, `crons.daily`, `crons.weekly`).
- Both methods take a FunctionReference. Do NOT pass the function directly.
- Define crons by declaring a top-level `crons` object, calling methods, and exporting as default:
    ```typescript
    import { cronJobs } from "convex/server";
    import { internal } from "./_generated/api";
    const crons = cronJobs();
    crons.interval("cleanup", { hours: 2 }, internal.crons.cleanup, {});
    export default crons;
    ```
- You can register functions within `crons.ts` like any other file.
- Always import `internal` from `_generated/api` even for functions in the same file.

## File storage guidelines
- `ctx.storage.getUrl()` returns a signed URL for a given file. Returns `null` if the file does not exist.
- Do NOT use the deprecated `ctx.storage.getMetadata`. Instead query the `_storage` system table:
    ```typescript
    const metadata = await ctx.db.system.get(args.fileId);
    ```
- Convex storage stores items as `Blob` objects. Convert to/from Blob when using storage.
- For file uploads, use `ctx.storage.generateUploadUrl()` in a mutation, POST the file from the client, then save the returned storageId to your database via another mutation.
- To get file metadata, query the `_storage` system table with `ctx.db.system.get`:
    ```typescript
    type FileMetadata = {
        _id: Id<"_storage">;
        _creationTime: number;
        contentType?: string;
        sha256: string;
        size: number;
    }
    const metadata: FileMetadata | null = await ctx.db.system.get(args.fileId);
    ```

## If user asks to add data, create and run seed.ts file 
- Create seed.ts file with all needed data and mutation queries
- Execute it with "bun run convex/seed.ts"
