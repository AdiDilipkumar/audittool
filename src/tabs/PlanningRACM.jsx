import { useState } from 'react';
import { Card, SectionHeader, Badge, CommentButton } from '../components/UI';
import { RACM_RISKS } from '../data/mockData';

const SECTION_REF = 'RACM';

const RISK_MATRIX = (l, i) => {
  const score = l * i;
  if (score >= 12) return { label: 'Very High', color: 'var(--risk-very-high)' };
  if (score >= 6)  return { label: 'High',      color: 'var(--risk-high)' };
  if (score >= 3)  return { label: 'Moderate',  color: 'var(--risk-medium)' };
  return                  { label: 'Low',        color: 'var(--risk-low)' };
};

const TESTING_OPTIONS = ['Not Tested', 'In Progress', 'Tested - Effective', 'Tested - Ineffective'];
const DE_OPTIONS      = ['Not Tested', 'Effective', 'Ineffective'];

export default function PlanningRACM({ auditData, onUpdateAuditData, reviewComments = [], openDrawer }) {
  // Use per-audit RACM if available, fall back to default mock data for audit-001
  const initialRisks = auditData?.racmRisks ?? RACM_RISKS;
  const [items, setItems] = useState(initialRisks);
  const [expanded, setExpanded] = useState(items[0]?.id ?? null);

  const updateItems = (updated) => {
    setItems(updated);
    onUpdateAuditData?.('racmRisks', updated);
  };

  function updateControl(riskId, ctrlId, field, value) {
    updateItems(items.map(r => r.id !== riskId ? r : {
      ...r,
      controls: r.controls.map(c => c.id !== ctrlId ? c : { ...c, [field]: value }),
    }));
  }

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Risk & Control Matrix (RACM)"
        subtitle="Resolver references shown for manual cross-referencing. Live integration deferred to Phase 2."
        action={
          openDrawer ? (
            <CommentButton
              sectionRef={SECTION_REF}
              rowRef={null}
              comments={reviewComments}
              onClick={() => openDrawer({
                sectionRef: SECTION_REF,
                rowRef: null,
                title: 'RACM',
                contextLabel: 'Planning — RACM',
              })}
            />
          ) : null
        }
      />

      {items.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
          No risks added yet. Use + Add Risk to get started.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(risk => {
          const derived = RISK_MATRIX(risk.likelihood, risk.impact);
          const isExpanded = expanded === risk.id;

          return (
            <div key={risk.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

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
                <div style={{ width: 4, height: 36, borderRadius: 2, background: derived.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{risk.risk_ref}</span>
                    <Badge label={risk.category} size="sm" />
                    <Badge label={derived.label} type="risk" size="sm" />
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.4, margin: 0 }}>{risk.risk_description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {/* Row-level comment button */}
                  {openDrawer && (
                    <CommentButton
                      sectionRef={SECTION_REF}
                      rowRef={risk.id}
                      comments={reviewComments}
                      onClick={() => openDrawer({
                        sectionRef: SECTION_REF,
                        rowRef: risk.id,
                        title: `${risk.risk_ref} — ${risk.category}`,
                        contextLabel: `RACM · ${risk.risk_ref}`,
                      })}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>L{risk.likelihood} × I{risk.impact}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{risk.controls.length} control{risk.controls.length !== 1 ? 's' : ''}</span>
                  </div>
                  <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{isExpanded ? '−' : '+'}</span>
                </div>
              </div>

              {/* Controls */}
              {isExpanded && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Risk Owner</label>
                      <span style={{ fontSize: 13 }}>{risk.risk_owner}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Residual Risk</label>
                      <Badge label={risk.residual_risk_level} type="risk" />
                    </div>
                  </div>

                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '4px 0 8px' }}>
                    Controls ({risk.controls.length})
                  </p>

                  {risk.controls.length === 0 && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No controls added yet.</p>
                  )}

                  {risk.controls.map(ctrl => (
                    <div key={ctrl.id} style={{
                      background: 'var(--surface-0)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 4,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{ctrl.control_ref}</span>
                        <Badge label={ctrl.control_type} size="sm" />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ctrl.frequency}</span>
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{ctrl.control_description}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {[
                          { label: 'Design',         field: 'design_conclusion',       opts: DE_OPTIONS },
                          { label: 'Operating',      field: 'operating_effectiveness',  opts: DE_OPTIONS },
                          { label: 'Testing Status', field: 'testing_status',           opts: TESTING_OPTIONS },
                        ].map(col => (
                          <div key={col.field}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                              {col.label}
                            </label>
                            <select
                              value={ctrl[col.field]}
                              onChange={e => updateControl(risk.id, ctrl.id, col.field, e.target.value)}
                              style={{ fontSize: 12, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', fontFamily: 'var(--font-sans)', width: '100%' }}
                            >
                              {col.opts.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sample size:</span>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)' }}>n={ctrl.sample_size}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(per NI sampling guidelines)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
