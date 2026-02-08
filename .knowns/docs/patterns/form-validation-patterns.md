---
title: Form Validation Patterns
createdAt: '2026-02-01T17:34:01.883Z'
updatedAt: '2026-02-01T17:34:50.561Z'
description: Reusable form validation and formatting patterns
tags:
  - pattern
  - validation
---
# Form Validation Patterns

## Phone Number Formatting
```typescript
const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '() -');
};
```

## Website URL Validation
```typescript
// Accepts: https://www.example.com, www.example.com, example.com
const websiteRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;
```

## Google Maps Link Generation
```typescript
const generateMapsLink = (address: string) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};
```

## Usage Example
See implementation in: `app/submit/page.tsx`
Related task: @task-ipzqo4
