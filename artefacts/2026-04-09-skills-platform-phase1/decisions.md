# Decision Log: 2026-04-09-skills-platform-phase1

**Feature:** Skills Platform — Phase 1 Foundation
**Discovery reference:** artefacts/2026-04-09-skills-platform-phase1/discovery.md
**Last updated:** 2026-04-09

---

## Decision categories

| Code | Meaning |
|------|---------|
| `SCOPE` | MVP scope added, removed, or deferred |
| `SLICE` | Decomposition and sequencing choices |
| `ARCH` | Architecture or significant technical design (full ADR if complex) |
| `DESIGN` | UX, product, or lightweight technical design choices |
| `ASSUMPTION` | Assumption validated, invalidated, or overridden |
| `RISK-ACCEPT` | Known gap or finding accepted rather than resolved |

---

## Log entries

---
**2026-04-09 | ASSUMPTION | discovery/clarify**
**Decision:** Adopt the `standards/index.yml` schema illustrated in `ref-skills-platform-standards-model.md` (`disciplines:` → `core:`, `policy-floor:`, `surface-variants:`) as the Phase 1 starting point, treated as provisional.
**Alternatives considered:** (A) Treat as final — foreclosed Phase 2 extensibility. (B) Design new schema from scratch as a task within P1.7 — slower, no upside over using the reference example as a starting point.
**Rationale:** The reference example is well-formed and covers the Phase 1 disciplines. Treating it as provisional with an explicit extensibility constraint is cheaper than a design task and honest about its status. The constraint — Phase 2 must be addable without a breaking schema change — is what matters, not whether the initial schema is "final".
**Made by:** Hamish, 2026-04-09
**Revisit trigger:** If Phase 2 discipline requirements (8 additional disciplines + domain-tier entries) cannot be accommodated without a breaking change to the Phase 1 schema. Revisit during P2.4 story decomposition.
---

---
**2026-04-09 | RISK-ACCEPT | discovery**
**Decision:** Accept the open S4 unit test compilation failure in the prototype (`assurance-validator.ts` does not export `computeEntryHash` or `detectEntryTampering`; the S4 unit test suite fails to compile against the current implementation). Phase 1 proceeds without fixing this first.
**Alternatives considered:** Fix before proceeding — adds scope and delay before Phase 1 planning is complete; the failure is in the test layer, not the runtime governance logic, which still operates correctly.
**Rationale:** The failure is a test/implementation sync gap introduced during S4 evolution, not a runtime fault in the assurance loop itself. The three-agent loop and hash verification operate correctly. The risk is limited to test coverage of `computeEntryHash` — not to the governance output. Phase 1 (P1.3 assurance CI gate) will need to resolve this before the assurance agent stories can be marked DoD-complete.
**Made by:** Hamish, 2026-04-09
**Revisit trigger:** Must be resolved before any Phase 1 story that builds on `assurance-validator.ts` passes DoR. Non-negotiable blocker at that point — not a permanent acceptance.
---

---
**2026-04-09 | RISK-ACCEPT | discovery**
**Decision:** Accept the open S2 integration test AC5 failure (`dev-agent-trace` integration test — dev agent exits with code 2 instead of 0 on a failing-criterion run; task expected to stay in inbox but exit code check fails).
**Alternatives considered:** Fix before proceeding — same as above; the failure does not affect the discovery or planning work.
**Rationale:** AC5 tests the failure path of the dev agent (task stays in inbox when criterion fails). The happy-path behaviour is confirmed passing. The AC5 failure is an exit-code contract mismatch, likely introduced during S7 changes. It does not affect the governance trace output or the assurance loop verdict. Must be resolved before P1.3 CI gate work reaches DoR.
**Made by:** Hamish, 2026-04-09
**Revisit trigger:** Must be resolved before P1.3 stories pass DoR. Non-negotiable blocker at that point.
---

---
**2026-04-09 | ARCH | benefit-metric**
**Decision:** The `standardsInjected` array in the delivery trace is populated by the assurance agent at gate time, not by the dev agent at execution time.
**Alternatives considered:** (A) Dev agent self-reports: records which standards governed its execution at runtime. Rejected — the dev agent is the governed party; it cannot be the verifier of its own governance context. Self-reporting erodes the independence property the assurance loop exists to provide. (B) Assurance agent populates at gate time: the independent verifier records what standards were in effect at the commit SHA of the PR. Consistent with the assurance agent's role.
**Rationale:** The assurance agent is the independent verifier. Having it record what standards were in effect — at gate time, at the PR's commit SHA — is consistent with its role and preserves the independence property. In a single-PR inner loop the hashes will be identical either way, but the design principle matters for the trace schema and for Phase 2 when sessions may span commits.
**Made by:** Hamish, 2026-04-09
**Revisit trigger:** If the assurance agent cannot access the standards files at gate time in a given CI environment (e.g. a shallow clone). Revisit at P1.3 story decomposition.
---
