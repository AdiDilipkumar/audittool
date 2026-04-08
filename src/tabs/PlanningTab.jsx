import { useState, useRef } from 'react';
import { SignOffBar } from '../components/UI';
import PlanningAuditDetails      from './PlanningAuditDetails';
import PlanningInherentRisk      from './PlanningInherentRisk';
import PlanningCombinedAssurance from './PlanningCombinedAssurance';
import PlanningScope             from './PlanningScope';
import PlanningToR               from './PlanningToR';
import PlanningRACM              from './PlanningRACM';

// ── Progress circles ───────────────────────────────────────────────────────────
function TabProgressCircle({ pct, label, tabId, activeTabId, onClick, size = 44 }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;
  const isActiveTab = tabId === activeTabId;
  let fillColor;
  if (pct === 0)       fillColor = 'var(--border)';
  else if (pct === 33) fillColor = 'var(--status-amber)';
  else if (pct === 67) fillColor = 'var(--ni-teal)';
  else                 fillColor = 'var(--status-green)';
  const tierLabel = pct === 0 ? 'None' : pct === 33 ? 'Lead' : pct === 67 ? 'Reviewer' : 'HIA';

  return (
    <button onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: isActiveTab ? 'var(--ni-teal-dim)' : 'transparent', border: `1px solid ${isActiveTab ? 'rgba(0,167,157,0.3)' : 'transparent'}`, borderRadius: 'var(--radius-md)', padding: '8px 12px', cursor: 'pointer', transition: 'background 0.15s' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth={3} />
        {pct > 0 && <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={fillColor} strokeWidth={3} strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round" />}
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}
          fontSize={pct === 100 ? 9 : 10} fontWeight={600} fill={pct === 0 ? 'var(--text-muted)' : fillColor}>
          {pct === 0 ? '-' : `${pct}%`}
        </text>
      </svg>
      <span style={{ fontSize: 11, fontWeight: isActiveTab ? 600 : 500, color: isActiveTab ? 'var(--ni-teal)' : 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 10, color: pct === 0 ? 'var(--text-muted)' : fillColor, fontWeight: 500 }}>{tierLabel}</span>
    </button>
  );
}

// ── Planning sign-off gate checker ─────────────────────────────────────────────
function computePlanningGates(auditData) {
  const tor        = auditData?.tor || {};
  const ira        = auditData?.inherentRisk || auditData?.inherent_risk || {};
  const scope      = auditData?.scopeItems || auditData?.scope_items || {};
  const racmRisks  = auditData?.racmRisks  || auditData?.racm_risks  || [];

  const torFields  = ['objectives', 'scope', 'out_of_scope', 'methodology', 'reporting_lines', 'key_contacts'];
  const torDone    = torFields.every(k => tor[k]?.trim()?.length >= 10);

  const irFactors  = ira?.factors || [];
  const iraDone    = irFactors.length > 0 && irFactors.every(f => f.rationale?.trim()?.length > 0);

  const processes  = scope?.key_processes || [];
  const scopeDone  = processes.length > 0;

  const racmDone   = racmRisks.length > 0 && racmRisks.some(r => r.controls.length > 0);

  return [
    { label: 'Terms of Reference — all 6 fields must be completed',            passed: torDone },
    { label: 'Inherent Risk Assessment — rationale required for all 10 factors', passed: iraDone },
    { label: 'Scope Determination — at least one key process must be added',   passed: scopeDone },
    { label: 'RACM — at least one risk with at least one control',             passed: racmDone },
  ];
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PlanningTab({
  openCommentCount,
  progressData = { planning: 0, fieldwork: 0, reporting: 0 },
  onTabChange,
  initialSubTab,
  audit, auditData, onUpdateAuditData,
  reviewComments = [],
  currentUser, users = [],
  openDrawer,
  signOffs = [], onSignOff, onRevokeSignOff,
}) {
  const [activeSection, setActiveSection] = useState(initialSubTab || 'details');
  const topRef = useRef(null);

  const signOff = signOffs.find(s => s.tab === 'Planning') || null;
  const planningGates = computePlanningGates(auditData);

  function handleProgressClick(tabId) {
    if (tabId === 'planning') topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (onTabChange) onTabChange(tabId);
  }

  // Audit Programme removed — RACM testing strategy is the programme
  const sections = [
    { id: 'details',   label: 'Audit Details'      },
    { id: 'risk',      label: 'Inherent Risk'       },
    { id: 'assurance', label: 'Combined Assurance'  },
    { id: 'scope',     label: 'Scope Determination' },
    { id: 'tor',       label: 'Terms of Reference'  },
    { id: 'racm',      label: 'RACM'                },
    { id: 'signoff',   label: 'Sign-off'            },
  ];

  const subProps = { audit, auditData, onUpdateAuditData, reviewComments, currentUser, users, openDrawer };
  // Bug 1 fix: force remount of each planning sub-component once auditData arrives from Supabase.
  // If the component mounts while auditData is still null (async not yet complete), useState
  // initialises blank and never re-inits. Changing the key causes React to unmount+remount,
  // running useState fresh with the real data.
  const dataKey = auditData ? (audit?.id ?? 'loaded') : 'loading';

  return (
    <div ref={topRef} style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Progress circles strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20, padding: '12px 16px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 8 }}>Sign-off</span>
        <TabProgressCircle pct={progressData.planning}  label="Planning"  tabId="planning"  activeTabId="planning" onClick={() => handleProgressClick('planning')} />
        <div style={{ width: 24, height: 1, background: 'var(--border)', margin: '0 2px', alignSelf: 'center', marginBottom: 22 }} />
        <TabProgressCircle pct={progressData.fieldwork} label="Fieldwork" tabId="fieldwork" activeTabId="planning" onClick={() => handleProgressClick('fieldwork')} />
        <div style={{ width: 24, height: 1, background: 'var(--border)', margin: '0 2px', alignSelf: 'center', marginBottom: 22 }} />
        <TabProgressCircle pct={progressData.reporting} label="Reporting" tabId="reporting" activeTabId="planning" onClick={() => handleProgressClick('reporting')} />
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.5 }}>
          <div>33% = Audit Lead &nbsp;&bull;&nbsp; 67% = Reviewer &nbsp;&bull;&nbsp; 100% = HIA</div>
          <div style={{ marginTop: 2 }}>Click a circle to jump to that tab</div>
        </div>
      </div>

      {/* Section sub-nav */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto' }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-md)',
            fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400,
            color: activeSection === s.id ? 'var(--ni-teal)' : 'var(--text-secondary)',
            background: activeSection === s.id ? 'var(--ni-teal-dim)' : 'transparent',
            border: `1px solid ${activeSection === s.id ? 'rgba(0,167,157,0.3)' : 'transparent'}`,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === 'details'   && <PlanningAuditDetails   {...subProps} />}
      {activeSection === 'risk'      && <PlanningInherentRisk   key={dataKey} {...subProps} />}
      {activeSection === 'assurance' && <PlanningCombinedAssurance key={dataKey} {...subProps} />}
      {activeSection === 'scope'     && <PlanningScope          key={dataKey} {...subProps} />}
      {activeSection === 'tor'       && <PlanningToR            key={dataKey} {...subProps} />}
      {activeSection === 'racm'      && <PlanningRACM           key={dataKey} {...subProps} onTabChange={onTabChange} />}

      {activeSection === 'signoff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Gate status summary */}
          <div style={{ padding: '14px 16px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Sign-off Prerequisites</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {planningGates.map(g => (
                <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, color: g.passed ? 'var(--status-green)' : 'var(--status-amber)', flexShrink: 0 }}>
                    {g.passed ? 'v' : 'o'}
                  </span>
                  <span style={{ fontSize: 12, color: g.passed ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: g.passed ? 400 : 500 }}>
                    {g.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {signOff ? (
            <SignOffBar
              signOff={signOff}
              currentUser={currentUser}
              gates={planningGates}
              onSign={(role) => onSignOff && onSignOff(signOff.id, role)}
              onRevoke={(role) => onRevokeSignOff && onRevokeSignOff(signOff.id, role)}
            />
          ) : (
            <div style={{ padding: '12px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-muted)' }}>
              Sign-off record not found for this engagement.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
