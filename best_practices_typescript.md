# TypeScript Best Practices

## DOM acquisition

- Use a `requireElement<T extends HTMLElement>(id: string): T` helper that throws on missing element.
- Acquire all required elements at function entry — zero `if (el)` guards scattered through the body.
- Never put `HTMLElement | null` in render function parameter types; guarantee non-null at the call site.

## Error handling

- Do NOT use a single wrapping try/catch as a catch-all. Each failure mode gets its own typed boundary.
- For HTTP errors: throw a typed subclass of Error (e.g. `class ApiError extends Error { status: number }`).
- For network failure: `fetch` throws `TypeError` — catch it specifically.
- Avoid `err instanceof Error ? err.message : 'Unknown'` — this signals an under-specified error boundary.
- Isolate fallible side-effects (localStorage, IndexedDB) in a dedicated utility outside the main flow — no nested try/catch.
- `finally` is for resource cleanup only (timers, loading state) — never for error display.

## State & types

- Encapsulate module-level mutable state in a factory function or class — no bare `let` / mutable `const` at module scope.
- Never use `any`. Prefer unknown at boundaries and narrow with type guards.
- Don't use unknow type, use ctear typing

## Variable

- Use clear variable names, no v, r,a,b,c..etc
