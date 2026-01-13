# Form Schema Reference

This project renders forms from a JSON schema (see `src/types/form-schema.ts` and `src/types/form-schema.validators.ts`).

## Top-level shape

```json
{
  "id": "string",
  "title": "string",
  "description": "string (optional)",
  "groups": ["FormGroup[]"],
  "apiIntegrations": ["ApiIntegration[] (optional)"]
}
```

## Groups (nested)

Groups can contain `fields` and/or nested `groups`. Groups can also include conditional `visibility` metadata.

```json
{
  "id": "string",
  "title": "string (optional)",
  "description": "string (optional)",
  "fields": ["FormField[] (optional)"],
  "groups": ["FormGroup[] (optional)"],
  "visibility": "VisibilityCondition (optional)"
}
```

## Fields

Supported field types:
- `text`
- `textarea`
- `number`
- `dropdown`
- `checkbox`
- `radio`

Field IDs can be **dot-paths** (e.g. `address.zip`) to produce nested output JSON.

```json
{
  "id": "string",
  "type": "text | textarea | number | dropdown | checkbox | radio",
  "label": "string",
  "placeholder": "string (optional)",
  "defaultValue": "string|number|boolean (optional)",
  "options": "Array<{label,value}> (required for dropdown/radio)",
  "disabled": "boolean (optional)",
  "visibility": "VisibilityCondition (optional)",
  "validation": "DynamicValidation[] (optional)",
  "autoFillFrom": "string (optional, references apiIntegrations[].id)"
}
```

## VisibilityCondition (metadata)

```json
{
  "dependsOn": "string",
  "operator": "equals | notEquals | contains | isEmpty | isNotEmpty",
  "value": "string|boolean (optional)"
}
```

## DynamicValidation (metadata)

```json
{
  "when": { "field": "string", "equals": "string" },
  "rules": {
    "pattern": "string (optional regex)",
    "minLength": "number (optional)",
    "maxLength": "number (optional)",
    "min": "number (optional)",
    "max": "number (optional)",
    "required": "boolean (optional)",
    "message": "string"
  }
}
```

Notes:
- `min/max` apply to `number` fields (and are ignored for text types unless explicitly handled).
- `pattern/minLength/maxLength` apply to text-like fields.

## ApiIntegration (metadata)

```json
{
  "id": "string",
  "endpoint": "string",
  "triggerFields": ["string[]"],
  "targetFields": ["string[]"]
}
```

## Examples

Examples used by the UI “Load Example” dropdown live in:
- `src/data/example-schemas.ts`

