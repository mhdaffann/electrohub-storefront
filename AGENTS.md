<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application rules
- Keep a single root AuthProvider for session state and identity-transition invalidation; auth changes must not clear the independent guest cart.
- Account routes live under the client-only authenticated layout; private profile reads use the generated browser client with owner-scoped RLS.
- Share Zod schemas across account forms; Cloud Auth validates credentials on the server and database constraints validate stored profile fields.
- Payment status shown to customers is derived from the order status (src/lib/order-status.ts), not a separate column; orders are read-only for customers and only server-side payment code may create or advance them.
- Checkout orders are created only by a server function that re-reads prices and availability from the products table, then saves order + items atomically via a service-role-only database function keyed by a client idempotency key, so totals cannot be tampered with and repeat submits never duplicate.
