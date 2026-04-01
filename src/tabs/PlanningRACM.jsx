import { useState } from 'react';
import { Card, SectionHeader, Badge, Button, EmptyState, CommentButton } from '../components/UI';

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
const LIKELIHOOD_LABELS = { 1: 'Rare', 2: 'Unlikely', 3: 'Possible', 4: 'Likely' };
const IMPACT_LABELS     = { 1: 'Minor', 2: 'Moderate', 3: 'Major', 4: 'Severe' };

export default function PlanningRACM({ auditData, onUpdateAuditData, reviewComments = [], openDrawer }) {
  const items = auditData?.racmRisks || [];
  const [expanded, setExpanded] = useState(null);
  const [showAddRisk, setShowAddRisk] = useState(false);

  // New risk form state
  const [riskDesc, setRiskDesc]       = useState('');
  const [riskCategory, setRiskCategory] = useState('');
  const [likelihood, setLikelihood]   = useState(2);
  const [impact, setImpact]           = useState(2);
  const [riskOwner, setRiskOwner]     = useState('');

  function updateItems(updated) {
    onUpdateAuditData?.('racmRisks', updated);
  }

  function updateControl(riskId, ctrlId, field, value) {
    updateItems(items.map(r => r.id !== riskId ? r : {
      ...r,
      controls: r.controls.map(c => c.id !== ctrlId ? c : { ...c, [field]: value }),
    }));
  }

  function handleAddRisk() {
    if (!riskDesc.trim()) return;
    const derived = RISK_MATRIX(likelihood, impact);
    const newRisk = {
      id: `risk-${Date.now()}`,
      risk_ref: `R-${Date.now().toString().slice(-6)}`,
      risk_description: riskDesc.trim(),
      category: riskCategory.trim() || 'General',
      likelihood: Number(likelihood),
      impact: Number(impact),
      inherent_risk_level: derived.label,
      residual_risk_level: derived.label,
      risk_owner: riskOwner.trim(),
      in_scope: true,
      controls: [],
    };
    updateItems([...items, newRisk]);
    setRiskDesc(''); setRiskCategory(''); setLikelihood(2); setImpact(2); setRiskOwner('');
    setShowAddRisk(false);
  }

  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', color: 'var(--text-primary)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 };

  const previewDerived = RISK_MATRIX(likelihood, impact);

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Risk & Control Matrix (RACM)"
        subtitle={items.length > 0 ? `${items.length} risk${items.length !== 1 ? 's' : ''} - ${items.reduce((s, r) => s + r.controls.length, 0)} controls` : 'No risks added yet'}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {openDrawer && (
              <CommentButton
                sectionRef={SECTION_REF}
                rowRef={null}
                comments={reviewComments}
                onClick={() => openDrawer({ sectionRef: SECTION_REF, rowRef: null, title: 'RACM', contextLabel: 'Planning - RACM' })}
              />
            )}
            <Button variant="secondary" size="sm" onClick={() => setShowAddRisk(s => !s)}>
              {showAddRisk ? 'Cancel' : '+ Add Risk'}
            </Button>
          </div>
        }
      />

      {/* Add Risk form */}
      {showAddRisk && (
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--ni-teal)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ni-teal)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Risk</p>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Risk Description *</label>
            <textarea value={riskDesc} onChange={e => setRiskDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe the risk..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <input style={inputStyle} value={riskCategory} onChange={e => setRiskCategory(e.target.value)} placeholder="e.g. Data Integrity" />
            </div>
            <div>
              <label style={labelStyle}>Risk Owner</label>
              <input style={inputStyle} value={riskOwner} onChange={e => setRiskOwner(e.target.value)} placeholder="Name" />
            </div>
            <div>
              <label style={labelStyle}>Derived Level</label>
              <div style={{ padding: '8px 10px', border: `1px solid ${previewDerived.color}`, borderRadius: 'var(--radius-md)', background: 'var(--surface-1)', fontSize: 13, fontWeight: 600, color: previewDerived.color }}>
                {previewDerived.label}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Likelihood (1-4)</label>
              <select style={inputStyle} value={likelihood} onChange={e => setLikelihood(Number(e.target.value))}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n} - {LIKELIHOOD_LABELS[n]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Impact (1-4)</label>
              <select style={inputStyle} value={impact} onChange={e => setImpact(Number(e.target.value))}>
                {[1,2,3,4].map(n => <option key={n} value={n}>{n} - {IMPACT_LABELS[n]}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => setShowAddRisk(false)}>Cancel</Button>
            <Button variant="primary" size="sm" disabled={!riskDesc.trim()} onClick={handleAddRisk}>Add Risk</Button>
          </div>
        </div>
      )}

      {items.length === 0 && !showAddRisk && (
        <EmptyState icon="o" title="No risks in RACM yet" description="Add risks to build your Risk and Control Matrix for this engagement." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(risk => {
          const derived = RISK_MATRIX(risk.likelihood, risk.impact);
          const isExpanded = expanded === risk.id;

          return (
            <div key={risk.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div
                onClick={() => setExpanded(isExpanded ? null : risk.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-0)', cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--border)' : 'none' }}
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
                  {openDrawer && (
                    <CommentButton
                      sectionRef={SECTION_REF}
                      rowRef={risk.id}
                      comments={reviewComments}
                      onClick={() => openDrawer({ sectionRef: SECTION_REF, rowRef: risk.id, title: `${risk.risk_ref} - ${risk.category}`, contextLabel: `RACM - ${risk.risk_ref}` })}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>L{risk.likelihood} x I{risk.impact}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{risk.controls.length} control{risk.controls.length !== 1 ? 's' : ''}</span>
                  </div>
                  <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{isExpanded ? '-' : '+'}</span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Risk Owner</label>
                      <span style={{ fontSize: 13 }}>{risk.risk_owner || '-'}</span>
                    </div>
                    <div>
                      <label style={labelStyle}>Residual Risk</label>
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
                    <div key={ctrl.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{ctrl.control_ref}</span>
                        <Badge label={ctrl.control_type} size="sm" />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ctrl.frequency}</span>
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{ctrl.control_description}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {[
                          { label: 'Design',         field: 'design_conclusion',      opts: DE_OPTIONS },
                          { label: 'Operating',      field: 'operating_effectiveness', opts: DE_OPTIONS },
                          { label: 'Testing Status', field: 'testing_status',          opts: TESTING_OPTIONS },
                        ].map(col => (
                          <div key={col.field}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{col.label}</label>
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
