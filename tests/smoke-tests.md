# Skill Smoke Tests — Tier 2

These prompts are used to manually verify that each skill behaves correctly
after significant changes to its instructions. They are not run automatically.

## When to run

Run a smoke test when you:
- Change the core logic or output format of a skill (not just wording)
- Add a new step or category to a skill
- Want to verify a new structural contract before adding it to check-skill-contracts.js

## How to run

1. Open a new Copilot chat
2. Paste the fixture content + prompt below
3. Verify the output contains the required assertions listed under each test
4. Cost estimate: ~300–600 tokens per test using a small model

## Minimal fixture files

- `tests/fixtures/minimal-discovery.md` — minimal discovery artefact (~20 lines)
- `tests/fixtures/minimal-story.md` — minimal story artefact (~30 lines)

---

## T1 — /review smoke test

**Fixture:** paste `minimal-story.md`

**Prompt:**
```
Run /review on this story artefact. Treat it as a real review — apply your full skill.

[paste minimal-story.md here]
```

**Required assertions (check manually):**
- [ ] Output opens with findings, not praise
- [ ] Each of the 4 criteria (Traceability, Scope integrity, AC quality, Completeness) has a score in the range 1–5
- [ ] FINDINGS section appears before SCORE section, which appears before VERDICT
- [ ] VERDICT is either PASS or FAIL with a one-sentence justification
- [ ] If any criterion score < 3: specific line-level issues are listed for that criterion

---

## T2 — /definition-of-ready smoke test

**Fixture:** paste `minimal-story.md` and tell the skill a test plan exists

**Prompt:**
```
Run /definition-of-ready on this story. Assume a test plan and review report (PASS) exist.

[paste minimal-story.md here]
```

**Required assertions (check manually):**
- [ ] Contract Proposal appears before the H1–H13 checklist
- [ ] Contract Proposal includes: "What will be built", "What will NOT be built", per-AC test approach table, Assumptions, Estimated touch points
- [ ] Contract Review step appears after Contract Proposal
- [ ] Output format label "CONTRACT PROPOSAL → CONTRACT REVIEW → CHECKLIST → READY/BLOCKED" is referenced or followed
- [ ] dor-contract.md is mentioned as an output artefact

---

## T3 — /clarify smoke test

**Fixture:** paste `minimal-discovery.md`

**Prompt:**
```
Run /clarify on this discovery artefact.

[paste minimal-discovery.md here]
```

**Required assertions (check manually):**
- [ ] Gap assessment uses categories SCOPE, INTEGRATION, CONSTRAINTS, USER JOURNEY
- [ ] First question includes: the question, why it's blocking (downstream step named), 2–3 answer options
- [ ] If a question is not answered: output includes BLOCKED — [specific question]
- [ ] If questions are resolved: completion output says "N questions resolved. discovery.md updated. Ready for /benefit-metric."

---

## T4 — /workflow smoke test

**No fixture required**

**Prompt:**
```
Run /workflow. I have a small bug fix: the CSV export button is not visible on mobile screens. Single file change expected.
```

**Required assertions (check manually):**
- [ ] Short-track confirmation gate appears before routing (asks to confirm this is genuinely short-track)
- [ ] Prompt includes: "Is the change bounded?", "Are all ACs well understood?", "No risk of unintended downstream impact?"
- [ ] Pipeline health note appears in the routing section

---

## Adding new tests

When a new skill structural contract is added to `check-skill-contracts.js`,
add a corresponding smoke test entry here with:
- Which fixture to use (or note "no fixture required")
- The exact prompt
- The required assertions to check manually
