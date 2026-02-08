---
title: Supabase Setup
createdAt: '2026-02-01T17:32:42.381Z'
updatedAt: '2026-02-01T17:33:05.026Z'
description: Supabase configuration and environment setup
tags:
  - database
  - supabase
---
# Supabase Configuration

## Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]
```

## Database Schema
Table: `businesses`
- id (uuid, primary key)
- name (text)
- category (text)
- address (text)
- phone (text)
- website (text)
- description_en (text)
- description_vi (text)
- created_at (timestamp)

## RLS Policies
- Public read access for `businesses` table
- Admin-only write access

## Migration History
- **Phase 27:** Migrated from static seed.json to Supabase
- **2026-01-28:** 312 businesses imported successfully
- **Verified:** All data accessible via API
