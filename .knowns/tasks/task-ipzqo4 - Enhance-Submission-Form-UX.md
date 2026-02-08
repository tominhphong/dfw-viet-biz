---
id: ipzqo4
title: Enhance Submission Form UX
status: done
priority: high
labels:
  - enhancement
  - ux
createdAt: '2026-02-01T17:34:00.916Z'
updatedAt: '2026-02-01T17:34:53.334Z'
timeSpent: 0
---
# Enhance Submission Form UX

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Improve business submission form with auto-formatting and validation. See conversation 2f91c8e6-accb-46fe-85b6-79e802fda27d for context.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Phone numbers auto-format to (xxx) xxx-xxxx
- [ ] #2 Website accepts both https://www. and www. prefixes
- [ ] #3 Street addresses auto-link to Google Maps
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

**Files Modified:**
- `app/submit/page.tsx` - Added formatPhone() helper, flexible website validation, Google Maps URL generation

**Key Decisions:**
- Phone formatting: `value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '() -')`
- Website validation accepts optional protocol
- Maps link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

**Pattern Documented:** @doc/patterns/form-validation-patterns
**Verified:** 2026-01-28
**Conversation:** 2f91c8e6-accb-46fe-85b6-79e802fda27d
<!-- SECTION:NOTES:END -->

