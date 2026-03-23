import { useState } from 'react';
import { Card, SectionHeader, Field, Button, Badge, SignOffBar, EmptyState, Select } from '../components/UI';
import {
  SAMPLE_AUDIT, TERMS_OF_REFERENCE, AUDIT_PROGRAMME, RACM_RISKS, SIGN_OFFS, USERS,
} from '../data/mockData';

// ── Audit Details ────────────────────────────────────────────────────────────
function AuditDetails({ audit }) {
  const lead = USERS.find(u => u.id === audit.lead_auditor_id);
  const team = audit.team_members.map(id => USERS.find(u => u.id === id)?.full_name).filter(Boolean).join(', ');

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader title="Audit Details" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <Field label="Audit Title" value={audit.title} />
        <Field label="Entity / Business Unit" value={audit.entity} />
        <Field label="Audit Type" value={audit.audit_type} />
        <Field label="Period Under Review" value={audit.period_under_review} />
        <Field label="Planned Start" value={new Date(audit.planned_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
        <Field label="Planned End" value={new Date(audit.planned_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
        <Field label="Lead Auditor" value={lead?.full_name || '-'} />
        <Field label="Team Members" value={team} />
      </div>
    </Card>
  );
}

// ── Terms of Reference ────────────────────────────────────────────────────────
function TermsOfReference({ tor }) {
  const [data, setData] = useState(tor);

  const fields = [
    { key: 'objectives', label: 'Audit Objectives', rows: 4 },
    { key: 'scope', label: 'Scope', rows: 4 },
    { key: 'out_of_scope', label: 'Out of Scope', rows: 3 },
    { key: 'methodology', label: 'Methodology', rows: 4 },
    { key: 'reporting_lines', label: 'Reporting Lines', rows: 2 },
    { key: 'key_contacts', label: 'Key Contacts', rows: 3 },
  ];

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader title="Terms of Reference" subtitle="Defines the objectives, scope, and approach for this audit" />
      {fields.map(f => (
        <Field key={f.key} label={f.label} value={data[f.key]} multiline rows={f.rows}
          onChange={val => setData(prev => ({ ...prev, [f.key]: val }))} />
      ))}
    </Card>
  );
}

// ── Audit Programme ───────────────────────────────────────────────────────────
function AuditProgramme({ steps }) {
  const [items, setItems] = useState(steps);
  const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Complete'];

  const counts = { 'Not Started': 0, 'In Progress': 0, 'Complete': 0 };
  items.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
  const totalHours = items.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Audit Programme"
        subtitle={`${items.length} steps · ${totalHours}h estimated`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(counts).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Badge label={status} size="sm" />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        }
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--surface-0)' }}>
            {['#', 'Description', 'Assigned To', 'Est. Hours', 'Status'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((step, i) => {
            const assignee = USERS.find(u => u.id === step.assigned_to);
            return (
              <tr key={step.id} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '10px 10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, width: 32 }}>
                  {step.step_number}
                </td>
                <td style={{ padding: '10px 10px', lineHeight: 1.5 }}>{step.description}</td>
                <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                  {assignee?.full_name || '-'}
                </td>
                <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {step.estimated_hours}h
                </td>
                <td style={{ padding: '10px 10px' }}>
                  <select
                    value={step.status}
                    onChange={e => setItems(prev => prev.map(s => s.id === step.id ? { ...s, status: e.target.value } : s))}
                    style={{
                      fontSize: 12, padding: '3px 6px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)', background: 'var(--surface-0)',
                      color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', cursor: 'pointer',
                    }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

// ── RACM ──────────────────────────────────────────────────────────────────────
const RISK_MATRIX_COLOUR = (l, i) => {
  const score = l * i;
  if (score >= 12) return { label: 'Very High', color: 'var(--risk-very-high)' };
  if (score >= 6)  return { label: 'High',      color: 'var(--risk-high)' };
  if (score >= 3)  return { label: 'Moderate',  color: 'var(--risk-medium)' };
  return                  { label: 'Low',       color: 'var(--risk-low)' };
};

function RACMSection({ risks }) {
  const [items, setItems] = useState(risks);
  const [expanded, setExpanded] = useState(items[0]?.id);

  const updateControl = (riskId, ctrlId, field, value) => {
    setItems(prev => prev.map(r => r.id !== riskId ? r : {
      ...r,
      controls: r.controls.map(c => c.id !== ctrlId ? c : { ...c, [field]: value }),
    }));
  };

  const TESTING_OPTIONS = ['Not Tested', 'In Progress', 'Tested - Effective', 'Tested - Ineffective'];
  const DE_OPTIONS = ['Not Tested', 'Effective', 'Ineffective'];

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader title="Risk & Control Matrix (RACM)" subtitle="Resolver references shown for manual cross-referencing. Live integration deferred to Phase 2." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(risk => {
          const derived = RISK_MATRIX_COLOUR(risk.likelihood, risk.impact);
          const isExpanded = expanded === risk.id;
          return (
            <div key={risk.id} style={{
              border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}>
              {/* Risk header */}
              <div
                onClick={() => setExpanded(isExpanded ? null : risk.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  background: 'var(--surface-0)',
                  cursor: 'pointer',
                  borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{
                  width: 4, height: 36, borderRadius: 2,
                  background: derived.color, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {risk.risk_ref}
                    </span>
                    <Badge label={risk.category} size="sm" />
                    <Badge label={derived.label} type="risk" size="sm" />
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.4 }}>{risk.risk_description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    L{risk.likelihood} x I{risk.impact}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {risk.controls.length} control{risk.controls.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <span style={{ fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {isExpanded ? '−' : '+'}
                </span>
              </div>

              {/* Controls */}
              {isExpanded && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Risk Owner
                      </label>
                      <span style={{ fontSize: 13 }}>{risk.risk_owner}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Residual Risk
                      </label>
                      <Badge label={risk.residual_risk_level} type="risk" />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                      Controls ({risk.controls.length})
                    </p>
                    {risk.controls.map(ctrl => (
                      <div key={ctrl.id} style={{
                        background: 'var(--surface-0)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 10,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {ctrl.control_ref}
                          </span>
                          <Badge label={ctrl.control_type} size="sm" />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ctrl.frequency}</span>
                        </div>
                        <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{ctrl.control_description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                              Design
                            </label>
                            <select value={ctrl.design_conclusion}
                              onChange={e => updateControl(risk.id, ctrl.id, 'design_conclusion', e.target.value)}
                              style={{ fontSize: 12, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', fontFamily: 'var(--font-sans)', width: '100%' }}>
                              {DE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                              Operating
                            </label>
                            <select value={ctrl.operating_effectiveness}
                              onChange={e => updateControl(risk.id, ctrl.id, 'operating_effectiveness', e.target.value)}
                              style={{ fontSize: 12, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', fontFamily: 'var(--font-sans)', width: '100%' }}>
                              {DE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                              Testing Status
                            </label>
                            <select value={ctrl.testing_status}
                              onChange={e => updateControl(risk.id, ctrl.id, 'testing_status', e.target.value)}
                              style={{ fontSize: 12, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', fontFamily: 'var(--font-sans)', width: '100%' }}>
                              {TESTING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sample size: </span>
                          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)' }}>
                            n={ctrl.sample_size}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(per NI sampling guidelines)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Planning Tab ───────────────────────────────────────────────────────────────
export default function PlanningTab({ openCommentCount }) {
  const [activeSection, setActiveSection] = useState('details');
  const signOff = SIGN_OFFS.find(s => s.tab === 'Planning');

  const sections = [
    { id: 'details', label: 'Audit Details' },
    { id: 'tor', label: 'Terms of Reference' },
    { id: 'programme', label: 'Audit Programme' },
    { id: 'racm', label: 'RACM' },
    { id: 'signoff', label: 'Sign-off' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
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
      {activeSection === 'details'   && <AuditDetails audit={SAMPLE_AUDIT} />}
      {activeSection === 'tor'       && <TermsOfReference tor={TERMS_OF_REFERENCE} />}
      {activeSection === 'programme' && <AuditProgramme steps={AUDIT_PROGRAMME} />}
      {activeSection === 'racm'      && <RACMSection risks={RACM_RISKS} />}
      {activeSection === 'signoff'   && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 16px', background: 'var(--status-amber-bg)', border: '1px solid var(--status-amber-border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--status-amber)' }}>
            Planning is signed off at Reviewer level. HIA sign-off is pending.
          </div>
          <SignOffBar signOff={signOff} />
        </div>
      )}
    </div>
  );
}
