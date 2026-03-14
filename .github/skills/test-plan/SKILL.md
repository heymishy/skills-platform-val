---
name: test-plan
description: >
  Writes a failing test plan for a story that has passed /review. Produces TWO outputs:
  (1) a technical test plan for the coding agent and CI; (2) a plain-language AC
  verification script for human review before coding and smoke testing after merge.
  Includes a test data strategy section â€” critical for payments and regulated systems.
  Use when someone says "write tests for", "create the test plan", "what tests do we
  need", or moves past a passed review. Requires a story artefact and passed review.
  Tests are written to fail â€” TDD discipline enforced.
triggers:
  - "write tests for"
  - "create the test plan"
  - "what tests do we need"
  - "test plan for"
  - "TDD"
  - "write failing tests"
  - "verification script"
---

# Test Plan Skill

## Entry condition check

Before asking anything, verify:

1. Story artefact exists at `.github/artefacts/[feature]/stories/[story-slug].md`
2. Review report exists showing PASS (no unresolved HIGH findings)
3. Story has at least 3 ACs in Given/When/Then format

If any condition is not met:

> âŒ **Entry condition not met**
> [Specific issue â€” e.g. "Review report not found. Run /review first."]
>
> Run /workflow to see the current pipeline state.

---

## Step 1 â€” Confirm the story

State what was found before asking anything:

> **Story loaded:** [story title]
> **ACs found:** [n]
> **Review status:** PASS (run [N], [date])
>
> Ready to write the test plan for this story?
> Reply: yes â€” or name a different story

---

## Step 2 â€” Confirm test context

> **What environment and framework applies?**
>
> 1. Use what's specified in copilot-instructions.md (standard â€” no need to ask)
> 2. Different stack for this story â€” I'll specify
>
> Reply: 1 or 2

If 2 â€” ask:

> **Specify the test framework and environment:**
> (e.g. Jest + React Testing Library, pytest + FastAPI TestClient, JUnit + Mockito)
>
> Reply: describe the stack

---

## Step 3 â€” Test data strategy

Ask this before writing any tests. Test data strategy shapes what tests are
possible â€” and surfaces PCI/sensitivity constraints early.

> **Where will test data come from for this story?**
>
> 1. Synthetic â€” generated in test setup, no real data involved
> 2. Fixtures â€” static files committed to the test repo
> 3. De-identified production data â€” scrubbed extract from real data
> 4. Seeded database â€” test environment with known state
> 5. Mocked external services â€” no real downstream calls
> 6. Mixed â€” I'll describe which ACs need what
>
> Reply: 1, 2, 3, 4, 5, or 6

After answer, ask one follow-up if relevant:

**If 3 (de-identified production data):**
> **Is this data in PCI scope, or does it contain other sensitive fields?**
> (e.g. PANs, CVVs, account numbers, NHI numbers, IRD numbers)
>
> 1. Yes â€” PCI or sensitivity constraints apply
> 2. No â€” standard test data handling is fine
>
> Reply: 1 or 2

**If 1 is selected:**
> **Who is responsible for providing the test data?**
> 1. Self-contained â€” tests generate their own data in setup/teardown
> 2. Platform team owns a shared test data set
> 3. I need to create this â€” not yet available
>
> Reply: 1, 2, or 3

Record the test data strategy in the plan. If test data is not yet available (3),
flag it:

> âš ï¸ **TEST DATA GAP:** Test data for [AC or test] is not yet available.
> This is a dependency before the coding agent can run the tests.
> Add to /decisions as RISK-ACCEPT or resolve before running /definition-of-ready.

---

## Step 3a — E2E / browser-layout detection

Before writing any tests, scan every AC for language that signals behaviour that **cannot be reliably tested in Jest/jsdom**. jsdom does not compute CSS layout, render stacking contexts, or resolve which DOM element sits at given screen coordinates.

**Trigger patterns — flag any AC that mentions:**
- Drag-and-drop (which element is the drop target depends on CSS layout)
- Pointer or click coordinates relative to a rendered element
- `getBoundingClientRect`, `offsetTop`, `scrollTop`, or any layout-derived value
- CSS-positioned elements where the test verifies on-screen position (not just DOM presence)
- `e.target` identity in synthetic events where target depends on CSS stacking
- Visual rendering — font size appearance, colour, border weight, z-index stacking

**For each triggered AC, present:**

> ⚠️ **AC[n] is browser-layout-dependent.**
> This cannot be reliably tested in Jest/jsdom.
>
> Required action — choose one:
> 1. **E2E browser test** — add a Playwright (or equivalent) test that exercises
>    this AC in a real browser. Preferred for any behaviour where correctness
>    depends on CSS layout or rendered position.
> 2. **Manual verification only** — accepted if E2E tooling is not configured.
>    The verification script scenario must be written to the higher standard below.
> 3. **Rewrite the AC** — restructure so it can be tested at a lower level.
>
> Reply: 1, 2, or 3

**If option 1 is chosen but no E2E tooling is configured:**

> ⚠️ **E2E TOOLING GAP: No E2E framework is configured for this repo.**
> Playwright (or equivalent) must be set up before this test can be written.
> Add to /decisions as DEPENDENCY and block /definition-of-ready until resolved.

**If no E2E tooling exists and any AC is layout-dependent, surface this once (not per-AC):**

> **E2E tooling recommendation:**
> This story has [n] AC(s) that depend on CSS layout or rendered position.
>
> Options:
> 1. Add Playwright now — before implementing this story (correct approach)
> 2. Accept manual-only for this story, add Playwright in a follow-up —
>    record as tech-debt in /decisions; manual scenarios written to higher standard
> 3. Accept manual-only permanently — only for low-change, low-risk internal tools.
>    Record as explicit RISK-ACCEPT in /decisions.
>
> Reply: 1, 2, or 3

**Higher quality bar for manual scenarios on layout-dependent ACs:**

When handling is manual-only for a CSS-layout-dependent AC, the verification
scenario in the script must:
- Name the **exact UI element** to interact with — not "the canvas", but
  "the grey grid area between the quadrant labels, not the label text itself"
- State the **exact observable outcome at position level** — not "the card moves",
  but "the card stays at the position you dropped it and does not jump to a
  quadrant corner"
- Include a **negative check** — describe what broken behaviour looks like
- Be marked **🔴** in the verification script header so it is never skipped at
  smoke test time

Record each AC's handling decision in the gap table (see Output 1 below).

---

## Step 4 — AC coverage confirmation

Display the AC list before writing tests. Confirm coverage expectations:

> **ACs to cover:**
> - AC1: [Given/When/Then summary]
> - AC2: [Given/When/Then summary]
> - AC3: [Given/When/Then summary]
> [+ any additional ACs]
>
> Any ACs you want to flag as potentially untestable before I start?
> Reply: none â€” or flag specific ACs

If an untestable AC is flagged:

> **AC[n] flagged as potentially untestable.**
>
> How do you want to handle it?
> 1. Manual step in the verification script only
> 2. Rewrite the AC to be testable (return to the story artefact)
> 3. Accept the gap and log in /decisions as RISK-ACCEPT
>
> Reply: 1, 2, or 3

---

## Two outputs, two audiences

This skill always produces two files:

| Output | Audience | Purpose |
|--------|----------|---------|
| Technical test plan | Coding agent, CI, developers | Agent implements against it; CI runs it |
| AC verification script | BA, QA, PM, domain expert | Pre-code sign-off; post-merge smoke test; demo |

Both cover the same ACs. The technical plan specifies *how* to test.
The verification script describes *what to check* in plain language.

Produce the technical plan first, then derive the verification script from it.

---

## Output 1: Technical test plan

Conforms to `.github/templates/test-plan.md`.
Save to `.github/artefacts/[feature]/test-plans/[story-slug]-test-plan.md`.

### TDD discipline

Tests are written before implementation. Every test must fail right now.
A test that would pass before implementation is testing the wrong thing â€”
note it explicitly if found.

### Test data section (include in every plan)

The Test Data Strategy section is defined in `.github/templates/test-plan.md`.
Populate it with the answers from Step 3 before writing the individual test entries.

### AC coverage table

| AC | Description | Unit | Integration | E2E | Manual | Gap type | Risk |
|----|-------------|------|-------------|-----|--------|----------|------|
| AC1 | [summary] | [n] | [n] | — | — | — | 🟢 |

> ⚠️ **Test plan error:** A drag-drop, `getBoundingClientRect`, CSS-position, or
> pointer-coordinate AC listed as covered by Unit or Integration is flagged as
> incorrectly categorised. jsdom cannot verify this class of behaviour.

Every AC must have at least one test. Untestable ACs must have a manual scenario
in the verification script.

### Unit tests

For each test: name (verb + what + condition), which AC it covers, precondition,
action, expected result, edge case flag.

### Integration tests

Identify seams â€” where one component or layer hands off to another.
Write integration tests for those handoffs specifically.

### NFR tests

One test per NFR from the story. If NFRs says "None â€” confirmed", write no
NFR tests and state this explicitly.

### Gap table

| Gap | AC | Gap type | Reason untestable in Jest | Handling |
|-----|----|----------|--------------------------|----------|
| [description] | ACn | CSS-layout-dependent | [why] | Manual-only — RISK-ACCEPT: [justification] |

**Gap types:**
- `CSS-layout-dependent` — default: E2E required. Manual-only handling requires explicit risk-accept justification in the table.
- `render-only` — default: manual + screenshot evidence
- `external-service` — default: mock + manual smoke
- `other` — describe specifically

---

## Output 2: AC verification script

Conforms to `.github/templates/ac-verification-script.md`.
Save to `.github/artefacts/[feature]/verification-scripts/[story-slug]-verification.md`.

### Translation rules

**From technical:** `expect(getExportFilename('csv')).toBe('canvas-export-2026-03-10.csv')`
**To human:** "Click Export CSV. A file should download. Check the filename â€” it should
be `canvas-export-` followed by today's date, ending in `.csv`."

- Use "click", "type", "press" â€” not "navigate to" or "interact with"
- Name UI elements exactly as they appear on screen
- Quote expected messages verbatim
- Describe file contents concretely â€” not "the file should be correct"
- One scenario per AC, plus one for each acknowledged test gap
- Each scenario completable in under 2 minutes
- Reset instructions between scenarios if they share state

### The script serves three moments

Write it so it works equally well for all three without modification:

1. **Pre-code sign-off** â€” domain expert confirms the described behaviour is correct
   before the coding agent implements. Reviewing the *specification*, not the code.
2. **Post-merge smoke test** â€” confirms shipped behaviour matches the script.
   Reviewing the *implementation* against the specification.
3. **Sprint demo** â€” structured walkthrough for stakeholders.

---

## Completion output

> **Test plan complete for [story title] âœ…**
>
> Technical test plan: `.github/artefacts/[feature]/test-plans/[story-slug]-test-plan.md`
> [n] unit | [n] integration | [n] NFR tests | [n] ACs covered
> [If gaps:] âš ï¸ [n] gap(s) â€” represented as manual scenarios
>
> Verification script: `.github/artefacts/[feature]/verification-scripts/[story-slug]-verification.md`
> [n] scenarios | [n] edge cases | [n] manual gap scenarios
>
> Test data: [Synthetic / ready / âš ï¸ gap â€” see plan]
>
> **Recommended next step:**
> Share the verification script with a domain expert to confirm the described
> behaviour is correct â€” this is the human gate before coding begins.
>
> Ready to run /definition-of-ready for this story?
> Reply: yes â€” or review the plan first

---

## Quality checks before outputting

**Technical test plan:**
- Every AC has at least one test
- Every test has a specific expected result — not "works correctly"
- Test data strategy section is populated — not blank
- PCI/sensitivity constraints stated if applicable
- Test data gaps flagged with owner and action
- NFR tests exist for every NFR (or "None — confirmed" stated)
- Gap table populated or states "No gaps"
- No drag-drop, `getBoundingClientRect`, CSS-position, or pointer-coordinate AC is listed as covered by Unit or Integration
- All CSS-layout-dependent gaps have gap type `CSS-layout-dependent` in the gap table
- Any `CSS-layout-dependent` gap handled as manual-only has explicit risk-accept justification in the gap table

**Verification script:**
- Every AC has a scenario
- Every test gap has a manual scenario
- Plain language throughout â€” no technical terms
- Expected outcomes quote exact messages and describe exact contents
- Reset instructions present if scenarios share state
- Setup section clear enough for someone unfamiliar with the system

---

## What this skill does NOT do

- Does not implement tests â€” writes specifications for the coding agent
- Does not run tests â€” implementation does not exist yet
- Does not source test data â€” identifies what is needed and flags gaps
- Does not replace a full QA test strategy
- Does not configure E2E tooling — but detects when E2E tests are required and blocks /definition-of-ready if E2E tooling is absent and the gap cannot be accepted with a strong manual scenario

---

## State update — mandatory final step

> **Mandatory.** Do not close this skill or produce a closing summary without writing these fields. Confirm the write in your closing message: "Pipeline state updated ✅."

When the test plan is saved, for each story update `.github/pipeline-state.json` in the **project repository**:

- Set `stage: "test-plan"`, `updatedAt: [now]`
- Set `testPlan: { status: "written", totalTests: [count], passing: 0 }`
- Set `acTotal: [count of ACs in the story]`, `acVerified: 0`
- Set `health: "green"`
- Set `hasLayoutDependentGaps: true` if any AC was classified `CSS-layout-dependent`; `false` otherwise
- Set `e2eToolingRequired: true` if any layout-dependent AC was assigned option 1 (E2E test); `false` otherwise
