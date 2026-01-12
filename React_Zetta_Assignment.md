# React Zetta Assignment

## Overview

You will design a **dynamic form solution** within a **single-page React application**.  
The form builder processes a **JSON input structure** to generate an interactive form with various input types and dependencies.

---

## Mandatory Functional Requirements

### Form Generation

- **Input**
  - At the top of the page, provide an input field to accept a JSON structure defining:
    - Form layout
    - Input fields
    - Nested groups
    - Dependencies
  - If the JSON changes, the form must re-render accordingly.

- **Supported Field Types**
  - Text
  - Textarea
  - Dropdown
  - Checkbox
  - Radio Button
  - Text with custom validations

- **Output**
  - A JSON object containing the filled-in values upon form submission.

---

### Nested Group Support

- Forms may contain **nested groups**, which must be visually encapsulated.
- Groups should be **clearly distinguishable**.

---

### External API Data Integration

- Some fields or groups may be **auto-filled** using data from an external API.
- API inputs may consist of values from multiple form fields.
- Auto-fill should only execute if required values are present.
- API calls should be **mocked** for demonstration purposes.

---

### Dynamic Visibility

- Groups of fields can be **shown or hidden dynamically** based on other field values.
- **Example**:
  - A dropdown with `INDIVIDUAL` and `BUSINESS` options determines which form sections appear.

---

### Dynamic Validation Rules

- Input validations must adapt depending on other field values.
- **Example**:
  - If *Identification Type* is `PERSONAL ID` → validate numeric format.
  - If *Identification Type* is `PASSPORT` → validate alphanumeric format.

---

### Form Submission

- On submission, return a **structured JSON object** containing all filled-in values.
- Maintain field relationships and hierarchy in the output.

---

## Mandatory Technical Requirements

### React Single Page Application

- Develop a fully functional **React SPA**.
- Application must be **responsive and user-friendly**.

---

### Flexibility in Tooling

- Any libraries, UI frameworks, and form-handling tools may be used.
- Ensure **modularity** and **maintainability**.

---

### Component-Based Architecture

- Organize code with a **clear separation of concerns**.
- Use React components, directives, and services appropriately.

---

### Unit Testing

- Include unit tests to validate:
  - Form rendering
  - Dynamic behavior
  - Output generation

---

### API Mocking

- Implement **mock API calls** to simulate external data dependencies.

---

### Git Repository Management

- Maintain code in a Git repository with:
  - Clear commit history
  - Feature branches
  - Best version control practices

---

### Documentation

- Provide **clear and concise documentation**.
- Include **example input JSONs** demonstrating different form scenarios.

---

## Optional Features

### UI Enhancements

- Improve UX with animations and validations.
- Use **React MUI** or other UI libraries for a polished look.

### Auto-Save Feature

- Implement auto-save functionality to retain user progress.

---

## Best Practices

Ensure the final implementation follows **frontend best practices**.  
A detailed project structure and clear documentation are crucial for **maintainability** and **scalability**.

---

## Timeline

**Estimated Completion Time:**  
⏱️ **5–7 calendar days**
