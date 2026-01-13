# Dynamic Form Builder (Zeta Assignment)

A JSON-driven dynamic form builder built with **TanStack Start** + **TanStack React Form**, styled using **Tailwind v4** + **shadcn/ui**.

The main page (`/`) lets you:
- Paste/edit a JSON schema in a textarea
- Generate a form with nested groups and multiple field types
- See **live output** and **last submit output**
- Use **auto-save** (schema + values) via `localStorage`
- Load example schemas (Registration / KYC / Loan / Showcase)
- Fetch mocked external data via an explicit **Fetch Data** button (when `apiIntegrations` exist)
- Inspect a field/group in the preview and highlight its JSON config in the editor (magnifier icon)

## Getting started

```bash
pnpm install
pnpm dev
```

App runs on `http://localhost:3000`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm lint
pnpm format
```

## Using the builder

- **Route**: `/` (see `src/routes/index.tsx`)
- **JSON input**: left panel textarea
- **Validation UX**: debounced JSON/schema validation (1s after you stop typing)
- **Output**: bottom panel shows:
  - **Live Values** (updates as you type)
  - **Last Submitted** (captures values on submit)
- **Auto-save**:
  - Saves `{ schemaText, values }` to `localStorage` under key `zeta.formBuilder.v1` (debounced 500ms)
  - Shows a **Restore** banner when a saved session is found (does not auto-restore)
  - **Restore** loads the previous schema + values
  - **Dismiss** hides the banner for the current visit
  - **Clear saved** deletes the saved session from `localStorage`
- **Example schemas**: use “Preset Library” (Custom / Registration / KYC / Loan / Showcase)
- **Submit behavior**:
  - Required field errors appear on first submit attempt
  - If submit fails due to visible errors, the page scrolls to the top

## Schema overview

Schema types + validators:
- `src/types/form-schema.ts`
- `src/types/form-schema.validators.ts` (lenient Zod validation)

More details: `docs/form-schema.md`

Key conventions:
- **Field IDs** can be **dot-paths** (e.g. `address.zip`) and will produce nested output JSON.
- Supported `type` values: `text | textarea | dropdown | checkbox | radio | number`

Minimal schema example:

```json
{
  "id": "example",
  "title": "Example",
  "groups": [
    {
      "id": "account",
      "title": "Account",
      "fields": [
        {
          "id": "account.type",
          "type": "dropdown",
          "label": "Account Type",
          "options": [
            { "label": "Individual", "value": "INDIVIDUAL" },
            { "label": "Business", "value": "BUSINESS" }
          ]
        }
      ]
    }
  ]
}
```

## Example schemas

Examples live in `src/data/example-schemas.ts`:
- **Registration (Visibility)**: includes `visibility` metadata for conditional sections
- **KYC (Dynamic Validation)**: includes `validation` metadata tied to another field
- **Loan (API Auto-Fill + Nested)**: includes `apiIntegrations` metadata and nested groups
- **Showcase (All Features)**: demonstrates all field types, nested groups, API integrations, and visibility rules

Mock API demo inputs:
- ZIP: try `10001`, `94105`, `60601`
- Company registration: try `REG-0001` or `REG-0002` (unknown values like `REG-0003` show an error)

## Tests

Unit tests are in `src/__tests__/`:
- `form-rendering.test.tsx`
- `page-flow.test.tsx`
- `form-submission.test.tsx`
- `auto-save.test.tsx`

Run:

```bash
pnpm test
```

## shadcn/ui

Add new components using the latest shadcn CLI:

```bash
pnpm dlx shadcn@latest add button
```

