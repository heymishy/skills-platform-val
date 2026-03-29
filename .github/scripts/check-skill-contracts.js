#!/usr/bin/env node
/**
 * check-skill-contracts.js
 *
 * Structural contract linting for SKILL.md files.
 *
 * Each skill declares a set of required strings that MUST appear in its file.
 * If any string is missing the check fails and the commit is blocked.
 *
 * This catches:
 *   - Required sections accidentally deleted during edits
 *   - Output format strings changed (e.g. FINDINGS → SCORE → VERDICT)
 *   - Mandatory steps or behaviour markers removed
 *
 * Run:  node .github/scripts/check-skill-contracts.js
 * Used: .git/hooks/pre-commit
 *
 * Zero external dependencies — plain Node.js fs only.
 * Adding a new skill: append an entry to CONTRACTS below.
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');

// ── contracts ─────────────────────────────────────────────────────────────────
//
// Each entry defines the required structural markers for one file.
// Add an entry here whenever a new skill adds a structural invariant.
//
const CONTRACTS = [
  {
    skill: 'review',
    file:  '.github/skills/review/SKILL.md',
    required: [
      // evaluator stance
      'sceptical',
      // scoring scale must be present
      '1\u20135',
      // output order enforced
      'FINDINGS \u2192 SCORE \u2192 VERDICT',
      // per-criterion score fields
      'Traceability score',
      'Scope integrity score',
      'AC quality score',
      'Completeness score',
      // summary table
      'Overall score',
    ],
  },
  {
    skill: 'definition-of-ready',
    file:  '.github/skills/definition-of-ready/SKILL.md',
    required: [
      // contract proposal step must precede hard blocks
      'Step 2 \u2014 Contract proposal',
      'Step 3 \u2014 Contract review',
      // output format updated
      'CONTRACT PROPOSAL \u2192 CONTRACT REVIEW \u2192 CHECKLIST \u2192 READY/BLOCKED',
      // contract artefact output
      'dor-contract.md',
      // hard blocks must still be present
      'Hard blocks',
    ],
  },
  {
    skill: 'clarify',
    file:  '.github/skills/clarify/SKILL.md',
    required: [
      // updated category structure
      '### SCOPE',
      '### INTEGRATION',
      '### CONSTRAINTS',
      '### USER JOURNEY',
      // BLOCKED output on unresolved questions
      'BLOCKED \u2014',
      // clarification log written to discovery.md
      'Clarification log',
      // completion message format
      'questions resolved',
    ],
  },
  {
    skill: 'workflow',
    file:  '.github/skills/workflow/SKILL.md',
    required: [
      // pipeline health note
      'Pipeline health note',
      // short-track confirmation gate
      'Confirm this is genuinely short-track',
    ],
  },
  {
    skill: 'copilot-instructions',
    file:  '.github/copilot-instructions.md',
    required: [
      // context handoff protocol section
      '## Context handoff protocol',
      // coding agent resume instruction
      'Coding agent resuming a feature',
      // contract artefact referenced in canonical file list
      'dor-contract.md',
    ],
  },
];

// ── invariants applied to every SKILL.md ──────────────────────────────────────
const SKILL_INVARIANTS = [
  { marker: '## State update', label: '## State update — mandatory final step' },
];

// ── runner ────────────────────────────────────────────────────────────────────
let failed = false;
const results = [];

for (const contract of CONTRACTS) {
  const filePath = path.join(root, contract.file);

  if (!fs.existsSync(filePath)) {
    process.stderr.write(`[skill-contracts] MISSING FILE: ${contract.file}\n`);
    failed = true;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const missing  = contract.required.filter(r => !content.includes(r));

  // Universal invariant: every SKILL.md must have a State update section
  const invariantMissing = contract.file.endsWith('SKILL.md')
    ? SKILL_INVARIANTS.filter(inv => !content.includes(inv.marker))
    : [];

  const allMissing = missing.concat(invariantMissing.map(i => i.label));

  if (allMissing.length > 0) {
    process.stderr.write(`\n[skill-contracts] FAIL \u2014 ${contract.skill}\n`);
    for (const m of allMissing) {
      process.stderr.write(`  \u2717 Required text not found: "${m}"\n`);
    }
    failed = true;
  } else {
    results.push(`  \u2713 ${contract.skill} (${contract.required.length} contract(s))`);
  }
}

if (failed) {
  process.stderr.write(
    '\n[skill-contracts] One or more skill contracts failed.\n' +
    'A required structural marker is missing from a skill file.\n' +
    'Fix the issues above, or update the contract in .github/scripts/check-skill-contracts.js\n' +
    'if the change was intentional.\n\n'
  );
  process.exit(1);
}

const totalContracts = CONTRACTS.reduce((n, c) => n + c.required.length, 0);
process.stdout.write(
  `[skill-contracts] ${CONTRACTS.length} skill(s), ${totalContracts} contract(s) OK \u2713\n`
);
process.exit(0);
