---
title: Vercel Deployment
createdAt: '2026-02-01T17:32:43.805Z'
updatedAt: '2026-02-01T17:33:06.183Z'
description: Production deployment guide and verification
tags:
  - deployment
  - vercel
---
# Vercel Deployment Guide

## Production URL
https://dfw-viet-biz.vercel.app

## Environment Setup
1. Link Vercel project: `vercel link`
2. Add env vars in Vercel Dashboard:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Deploy: `vercel --prod`

## Post-Deploy Verification
- [ ] Homepage loads with business listings
- [ ] Category filters work (Food, Services, Shopping, Community)
- [ ] Business detail pages render correctly
- [ ] Phone numbers format to (xxx) xxx-xxxx
- [ ] Website links work (https:// and www. prefixes)
- [ ] Google Maps links functional
- [ ] Bilingual content displays (EN/VI)

## Rollback Procedure
```bash
vercel rollback [deployment-url]
```

## Performance Targets
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
