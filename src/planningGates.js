// ── Planning sign-off gate checker ────────────────────────────────────────────
// Shared between PlanningTab (render-time gate display) and App.jsx
// (post-update auto-revoke logic). Single source of truth.

export function computePlanningGates(auditData) {
  const tor       = auditData?.tor || {};
  const ira       = auditData?.inherentRisk || auditData?.inherent_risk || {};
  const scope     = auditData?.scopeItems   || auditData?.scope_items   || {};
  const racmRisks = auditData?.racmRisks    || auditData?.racm_risks    || [];

  const torFields = ['objectives', 'scope', 'out_of_scope', 'methodology', 'reporting_lines', 'key_contacts'];
  const torDone   = torFields.every(k => tor[k]?.trim()?.length >= 10);

  const irFactors = ira?.factors || [];
  const iraDone   = irFactors.length > 0 && irFactors.every(f => f.rationale?.trim()?.length > 0);

  const processes = scope?.key_processes || [];
  const scopeDone = processes.length > 0;

  const racmDone  = racmRisks.length > 0 && racmRisks.some(r => r.controls.length > 0);

  return [
    { label: 'Terms of Reference - all 6 fields must be completed',             passed: torDone  },
    { label: 'Inherent Risk Assessment - rationale required for all 10 factors', passed: iraDone  },
    { label: 'Scope Determination - at least one key process must be added',    passed: scopeDone },
    { label: 'RACM - at least one risk with at least one control',              passed: racmDone  },
  ];
}

// Keys whose changes can affect planning gates
export const PLANNING_GATE_KEYS = new Set(['tor', 'inherentRisk', 'scopeItems', 'racmRisks']);
