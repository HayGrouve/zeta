export type FieldType = 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio'

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'isEmpty'
  | 'isNotEmpty'

export interface VisibilityCondition {
  /**
   * Dot-path field id to watch (single source of truth).
   * Example: "account.type", "address.zip"
   */
  dependsOn: string
  operator: ConditionOperator
  /**
   * Optional value to compare against (not used for isEmpty/isNotEmpty).
   */
  value?: string | boolean
}

export interface ValidationRule {
  /**
   * Regex string (compiled later by the renderer).
   */
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  required?: boolean
  message: string
}

export interface DynamicValidation {
  /**
   * Optional condition; if omitted, the rules always apply.
   */
  when?: {
    /**
     * Dot-path field id to check.
     */
    field: string
    /**
     * Value that activates this rule block.
     */
    equals: string
  }
  rules: ValidationRule
}

export interface ApiIntegration {
  id: string
  /**
   * Mock endpoint identifier (e.g., "fetchAddressFromZip").
   */
  endpoint: string
  /**
   * Dot-path field ids used as inputs to the API call.
   */
  triggerFields: string[]
  /**
   * Dot-path field ids to be filled from the API response.
   */
  targetFields: string[]
}

export interface FormField {
  /**
   * Dot-path field id (single source of truth).
   */
  id: string
  type: FieldType
  label: string
  placeholder?: string
  /**
   * Default value for rendering; final defaults are generated later.
   */
  defaultValue?: string | boolean
  /**
   * Options for dropdown/radio.
   */
  options?: Array<{ label: string; value: string }>
  validation?: DynamicValidation[]
  visibility?: VisibilityCondition
  /**
   * References `apiIntegrations[].id`.
   */
  autoFillFrom?: string
  disabled?: boolean
}

export interface FormGroup {
  /**
   * Dot-path group id (used for uniqueness + output grouping if needed later).
   */
  id: string
  title?: string
  description?: string
  fields?: FormField[]
  groups?: FormGroup[]
  visibility?: VisibilityCondition
}

export interface FormSchema {
  id: string
  title: string
  description?: string
  groups: FormGroup[]
  apiIntegrations?: ApiIntegration[]
}

/**
 * Output values are schema-driven; we keep this flexible for now.
 * The renderer will later build a nested object from dot-path ids.
 */
export type FormValues = Record<string, string | boolean | undefined>

