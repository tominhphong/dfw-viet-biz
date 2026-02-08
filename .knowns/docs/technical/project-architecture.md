---
title: Project Architecture
createdAt: '2026-02-01T17:31:39.530Z'
updatedAt: '2026-02-01T17:32:41.197Z'
description: DFW Vietnamese Business Directory - Technical Overview
tags:
  - architecture
  - nextjs
---
# DFW Vietnamese Business Directory

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel
- **Data:** 312+ verified Vietnamese businesses

## Key Features
1. Bilingual support (EN/VI)
2. Category filtering (Food, Services, Shopping, Community)
3. Google Maps integration
4. Phone/Website auto-formatting
5. PWA-ready architecture

## Database Schema
- Table: `businesses`
- Key fields: name, category, address, phone, website, description_en, description_vi

## Critical Patterns
- SSG for detail pages with Supabase fallback
- Dynamic routing: `/business/[id]`
- Real-time admin via Supabase Dashboard

## References
- Production: https://dfw-viet-biz.vercel.app
- Supabase: @doc/technical/supabase-setup
- Deployment: @doc/operations/vercel-deployment
