---
title: Knowns Quick Start
createdAt: '2026-02-01T17:38:49.417Z'
updatedAt: '2026-02-01T17:38:51.348Z'
description: Quick reference for using Knowns in this project
tags:
  - guide
  - knowns
---
# Knowns Quick Start - DFW Viet Biz

## 🎯 What is Knowns?
CLI-first knowledge layer that gives AI persistent memory of your project.

## 📚 Key Documents
- `@doc/technical/project-architecture` - Tech stack, features, patterns
- `@doc/technical/supabase-setup` - Database config
- `@doc/operations/vercel-deployment` - Deployment guide
- `@doc/patterns/form-validation-patterns` - Reusable patterns

## 🚀 Daily Commands

### View Tasks
```bash
knowns task list --status in-progress --plain
knowns task list --assignee @me --plain
```

### Work on Task
```bash
knowns time start <task-id>
# ... do work ...
knowns task edit <task-id> --check-ac 1
knowns time stop
knowns task edit <task-id> --status done
```

### Search
```bash
knowns search "supabase" --plain
knowns search "form" --type doc --plain
```

### Read Docs
```bash
knowns doc "technical/project-architecture" --plain --smart
```

## 🤖 AI Integration
When working with AI:
1. AI reads `@doc/...` references automatically
2. AI follows `@task-xxx` links for context
3. No need to re-explain architecture every session

## 📖 Full Guidelines
See `CLAUDE.md` for complete MCP integration guide.
