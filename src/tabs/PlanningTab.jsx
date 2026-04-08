import { useState, useRef } from 'react';
import { SignOffBar, Card, SectionHeader, Button, EmptyState, Modal, Field, Badge } from '../components/UI';
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
    { label: 'Terms of Reference - all 6 fields must be completed',            passed: torDone },
    { label: 'Inherent Risk Assessment - rationale required for all 10 factors', passed: iraDone },
    { label: 'Scope Determination - at least one key process must be added',   passed: scopeDone },
    { label: 'RACM - at least one risk with at least one control',             passed: racmDone },
  ];
}

// ── Planning Query Log ─────────────────────────────────────────────────────────
function PlanningQueryLog({ queries = [], users = [], currentUser, auditId, onCreateQuery, onUpdateQuery, onPromoteToIssue }) {
  const [showModal, setShowModal]         = useState(false);
  const [showResolveId, setShowResolveId] = useState(null);
  const [expandedId, setExpandedId]       = useState(null);
  const [title, setTitle]                 = useState('');
  const [detail, setDetail]               = useState('');
  const [directedTo, setDirectedTo]       = useState('');
  const [rationale, setRationale]         = useState('');

  const planningQueries = queries.filter(q => q.phase === 'Planning');
  const openCount = planningQueries.filter(q => q.status === 'Open').length;

  function getUserName(id) { return users.find(u => u.id === id)?.full_name || '-'; }

  function handleRaise() {
    if (!title.trim() || !detail.trim()) return;
    onCreateQuery({ audit_id: auditId, title: title.trim(), description: detail.trim(),
      directed_to: directedTo.trim(), control_ref: null, phase: 'Planning' });
    setTitle(''); setDetail(''); setDirectedTo(''); setShowModal(false);
  }

  function handleResolve() {
    if (!rationale.trim()) return;
    onUpdateQuery(showResolveId, { status: 'Resolved', resolved_rationale: rationale.trim() });
    setRationale(''); setShowResolveId(null);
  }

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Query Log"
        subtitle={`${planningQueries.length} quer${planningQueries.length !== 1 ? 'ies' : 'y'}${openCount > 0 ? ` - ${openCount} open` : ''}`}
        action={<Button variant="secondary" size="sm" onClick={() => setShowModal(true)}>+ Raise Query</Button>}
      />

      {planningQueries.length === 0 ? (
        <EmptyState icon="?" title="No planning queries yet" description="Raise queries to request information during the planning phase." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {planningQueries.map(q => {
            const isExp = expandedId === q.id;
            return (
              <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div onClick={() => setExpandedId(isExp ? null : q.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', background: 'var(--surface-0)' }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)', flexShrink: 0 }}>{q.query_ref}</span>
                  <p style={{ flex: 1, fontSize: 13, fontWeight: 500, margin: 0 }}>{q.title}</p>
                  <Badge label={q.status} />
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{isExp ? '-' : '+'}</span>
                </div>
                {isExp && (
                  <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{q.description}</p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Raised by <strong>{getUserName(q.raised_by)}</strong>
                      {q.directed_to && <> - Directed to <strong>{q.directed_to}</strong></>}
                    </div>
                    {q.response && (
                      <div style={{ background: 'var(--status-green-bg)', border: '1px solid var(--status-green-border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', marginBottom: 8, fontSize: 12 }}>
                        <strong>Response:</strong> {q.response}
                      </div>
                    )}
                    {q.resolved_rationale && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <strong>Resolution:</strong> {q.resolved_rationale}
                      </div>
                    )}
                    {q.status === 'Open' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <Button variant="secondary" size="sm" onClick={() => setShowResolveId(q.id)}>Resolve</Button>
                        <Button variant="secondary" size="sm" onClick={() => onPromoteToIssue && onPromoteToIssue(q)}>Promote to Issue</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Raise Query" onClose={() => setShowModal(false)} width={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Query Title *" value={title} onChange={setTitle} />
            <Field label="Query Detail *" value={detail} onChange={setDetail} multiline rows={4} hint="Be specific about what information is being requested." />
            <Field label="Directed To" value={directedTo} onChange={setDirectedTo} hint="Auditee contact name (optional)" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" disabled={!title.trim() || !detail.trim()} onClick={handleRaise}>Raise Query</Button>
            </div>
          </div>
        </Modal>
      )}

      {showResolveId && (
        <Modal title="Resolve Query" onClose={() => setShowResolveId(null)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Resolution Rationale *" value={rationale} onChange={setRationale} multiline rows={4} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Button variant="ghost" onClick={() => setShowResolveId(null)}>Cancel</Button>
              <Button variant="primary" disabled={!rationale.trim()} onClick={handleResolve}>Mark Resolved</Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PlanningTab({
  openCommentCount,
  progressData = { planning: 0, fieldwork: 0, reporting: 0 },
  onTabChange,
  initialSubTab,
  audit, auditData, onUpdateAuditData, onUpdateAudit,
  reviewComments = [],
  currentUser, users = [],
  openDrawer,
  signOffs = [], onSignOff, onRevokeSignOff,
  onCreateQuery, onUpdateQuery, onPromoteToIssue,
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
    { id: 'queries',   label: 'Query Log'           },
    { id: 'signoff',   label: 'Sign-off'            },
  ];

  const subProps = { audit, auditData, onUpdateAuditData, onUpdateAudit, reviewComments, currentUser, users, openDrawer };
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
      {activeSection === 'details'   && <PlanningAuditDetails   key={dataKey} {...subProps} />}
      {activeSection === 'risk'      && <PlanningInherentRisk   key={dataKey} {...subProps} />}
      {activeSection === 'assurance' && <PlanningCombinedAssurance key={dataKey} {...subProps} />}
      {activeSection === 'scope'     && <PlanningScope          key={dataKey} {...subProps} />}
      {activeSection === 'tor'       && <PlanningToR            key={dataKey} {...subProps} />}
      {activeSection === 'racm'      && <PlanningRACM           {...subProps} onTabChange={onTabChange} />}

      {activeSection === 'queries' && (
        <PlanningQueryLog
          queries={auditData?.queries || []}
          users={users}
          currentUser={currentUser}
          auditId={audit?.id}
          onCreateQuery={onCreateQuery}
          onUpdateQuery={onUpdateQuery}
          onPromoteToIssue={onPromoteToIssue}
        />
      )}

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
