# START HERE — First message to Claude Code

Copy-paste this message into Claude Code as your first prompt:

---

```
You are about to build Crido — an Algerian BNPL (Buy-Now-Pay-Later) fintech platform.

Before you do ANYTHING:

1. Run `pwd` and confirm you're in /Users/macbook/Desktop/Crido

2. Read these files in EXACTLY this order:
   - CLAUDE.md (master context)
   - docs/PROJECT_OVERVIEW.md (business model)
   - docs/BUSINESS_RULES.md (money math + state machines)
   - docs/ALGERIA_CONTEXT.md (banks, payments, KYC, wilayas)
   - docs/DESIGN_SYSTEM.md (brand + components)
   - docs/DATABASE_SCHEMA.md (full SQL schema)
   - docs/API_DESIGN.md (all REST endpoints)
   - docs/ROADMAP.md (sprint plan)
   - backend/CLAUDE.md
   - dashboard/CLAUDE.md
   - dashboard/admin/CLAUDE.md
   - dashboard/vendor/CLAUDE.md
   - app/CLAUDE.md

3. After reading everything, summarize back to me in 5–10 bullets:
   - What is Crido
   - The two-path merchant model
   - Tech stack across all 4 projects
   - The build order
   - Any ambiguities or open questions

4. Wait for my approval before writing any code.

5. Once I approve, start with Sprint 0 from docs/ROADMAP.md:
   - First, create the `backend/` folder (it doesn't exist yet)
   - Bootstrap the Laravel 13 project per backend/CLAUDE.md
   - Then bootstrap each of the React apps (admin, vendor)
   - Then bootstrap the Flutter app
   - Stop after Sprint 0 and show me what you built.

Important rules:
- Don't skip reading any of the docs
- Don't introduce libraries not listed in the CLAUDE.md files without asking
- Arabic is the primary user-facing language
- All money in DZD with DECIMAL columns
- MVP is Adrar-only — enforce this everywhere
- No interest, only margin (Murabaha structure)
- Two merchant paths everywhere: partner + ad-hoc
- Ask before doing anything destructive
```

---

## Tips while working with Claude Code

### Daily kickoff
At the start of each work session:
```
Where are we in docs/ROADMAP.md? What sprint are we on? Show me the current sprint's checklist and tell me what's done and what's next.
```

### When something feels off
```
Re-read the relevant CLAUDE.md and the docs/ section for this feature. Then propose a fix and wait for my approval.
```

### Before merging anything significant
```
Show me a diff summary of what you changed. Then run the tests. Then summarize the impact in 3 bullets.
```

### When you want to add a new package
**Insist that Claude Code asks first.** Example response if it adds one without asking:
```
I see you added <package>. Was that listed in the CLAUDE.md tech stack? If not, please remove it and propose it to me with reasoning first.
```

### When debugging
```
Read the related model + action + controller + test. Identify the root cause, don't just patch symptoms. Show me your reasoning before changing anything.
```

### When something is unclear in a doc
```
Update docs/<file>.md to clarify this, then continue. Include a 1-line changelog at the bottom.
```

---

## What good Claude Code output looks like

- Reads docs **first**, asks questions **before** coding
- Commits in small, focused changes (Conventional Commits format)
- Adds tests for every new business-logic Action
- Updates docs when reality diverges from plan
- Doesn't skip "boring" parts (i18n, RTL handling, error states, empty states)
- Stops at end of each sprint and waits for review

## What bad Claude Code output looks like (push back)

- Generates 2000 lines of code in one shot without commits
- Adds packages without asking
- Skips i18n (uses English strings)
- Hard-codes business values instead of using settings
- Creates "TODO" comments instead of implementing
- Skips RTL handling
- Confuses the two merchant paths
- Builds the mobile app before the backend is ready
- Doesn't write tests

---

You are now ready. Open Claude Code in the Crido folder and paste the message above. 🚀
