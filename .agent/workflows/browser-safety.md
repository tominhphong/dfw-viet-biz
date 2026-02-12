---
description: Mandatory safety rules for browser subagent on admin/destructive pages
---

# Browser Safety Workflow

> **CRITICAL**: These rules are MANDATORY when browser subagent interacts with admin pages or performs any destructive action.

## Forbidden Actions

1. ❌ **NEVER** override `window.confirm`, `window.alert`, or `window.prompt`
   - These native dialogs exist as safety barriers
   - Overriding them bypasses user confirmation
2. ❌ **NEVER** click buttons by CSS index (e.g., `button[19]`, `button:nth-child(3)`)
   - Button positions change dynamically with data
   - This causes misclicks on wrong elements

## Required Practices

1. ✅ **Identify elements by text content, aria-label, or data-testid**
   - Use `[data-action="delete"]`, `[data-business-name="..."]`, `[data-testid="..."]`
   - Combine selectors: `button[data-action="delete"][data-business-name="Exact Name"]`
2. ✅ **One destructive action at a time**
   - Perform ONE delete/reject per browser session
   - Take screenshot after action for verification
   - Wait for user confirmation before proceeding to next action
3. ✅ **Verify target before acting**
   - Read and confirm the business name visible on screen
   - Match against the intended target before clicking
4. ✅ **Handle custom confirm modals**
   - The admin uses React-based confirmation modals (not `window.confirm`)
   - For delete: must type the exact business name in the input field
   - For approve/reject: click the confirm button in the modal
   - Use `[data-testid="confirm-delete-input"]` for the delete input
   - Use `[data-testid="confirm-action-btn"]` for the confirm button
   - Use `[data-testid="confirm-cancel-btn"]` to cancel

## Example: Safe Delete Flow

```
1. Find button: [data-action="delete"][data-business-name="Target Name"]
2. Click the delete button
3. Modal appears → type exact business name in [data-testid="confirm-delete-input"]
4. Click [data-testid="confirm-action-btn"]
5. Screenshot to verify success message
6. STOP — do not proceed to next action without user approval
```
