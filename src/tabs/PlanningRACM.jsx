import { useState, useRef } from 'react';
import { Card, SectionHeader, Badge, Button, EmptyState, CommentButton, Modal, Field } from '../components/UI';

const SECTION_REF = 'RACM';

const RISK_MATRIX = (l, i) => {
  const score = l * i;
  if (score >= 12) return { label: 'Very High', color: 'var(--risk-very-high)' };
  if (score >= 6)  return { label: 'High',      color: 'var(--risk-high)' };
  if (score >= 3)  return { label: 'Moderate',  color: 'var(--risk-medium)' };
  return                  { label: 'Low',        color: 'var(--risk-low)' };
};

const DESIGN_OPTIONS   = ['Not Assessed', 'Adequate', 'Inadequate', 'Missing'];
const CTRL_TYPE_OPTIONS = ['Preventive', 'Detective', 'Corrective'];
const FREQ_OPTIONS     = ['Per event', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'];
const L_LABELS         = { 1: 'Rare', 2: 'Unlikely', 3: 'Possible', 4: 'Likely' };
const I_LABELS         = { 1: 'Minor', 2: 'Moderate', 3: 'Major', 4: 'Severe' };

// ── CSV template ──────────────────────────────────────────────────────────────
const CSV_TEMPLATE = `risk_description,category,likelihood,impact,risk_owner,resolver_ref
"Investment data ingested from source systems contains errors",Data Integrity,2,4,Head of Data Operations,R-2024-001
"Unauthorised access to sensitive data",Access & Authorisation,2,3,Data Governance Lead,R-2024-002`;

function downloadCSVTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'RACM_import_template.csv'; a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const lines  = text.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line, idx) => {
    // Simple CSV parse — handles quoted fields
    const vals = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; }
      else if (line[i] === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else { cur += line[i]; }
    }
    vals.push(cur.trim());
    const row = {};
    header.forEach((h, i) => { row[h] = vals[i] || ''; });
    const likelihood = Math.min(4, Math.max(1, parseInt(row.likelihood) || 2));
    const impact     = Math.min(4, Math.max(1, parseInt(row.impact)     || 2));
    const derived    = RISK_MATRIX(likelihood, impact);
    return {
      id:                 `risk-${Date.now()}-${idx}`,
      risk_ref:           row.resolver_ref || `R-${Date.now().toString().slice(-4)}-${idx}`,
      risk_description:   row.risk_description || '',
      category:           row.category || 'General',
      likelihood,
      impact,
      inherent_risk_level: derived.label,
      residual_risk_level: derived.label,
      risk_owner:          row.risk_owner || '',
      in_scope:            true,
      controls:            [],
    };
  }).filter(r => r.risk_description.trim());
}

// ── Add Risk form ─────────────────────────────────────────────────────────────
function AddRiskForm({ onAdd, onCancel }) {
  const [riskDesc, setRiskDesc]     = useState('');
  const [category, setCategory]     = useState('');
  const [likelihood, setLikelihood] = useState(2);
  const [impact, setImpact]         = useState(2);
  const [riskOwner, setRiskOwner]   = useState('');
  const [resolverRef, setResolverRef] = useState('');
  const derived = RISK_MATRIX(likelihood, impact);

  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 };

  function handleAdd() {
    if (!riskDesc.trim()) return;
    onAdd({
      id:                 `risk-${Date.now()}`,
      risk_ref:           resolverRef.trim() || `R-${Date.now().toString().slice(-6)}`,
      risk_description:   riskDesc.trim(),
      category:           category.trim() || 'General',
      likelihood:         Number(likelihood),
      impact:             Number(impact),
      inherent_risk_level: derived.label,
      residual_risk_level: derived.label,
      risk_owner:         riskOwner.trim(),
      in_scope:           true,
      controls:           [],
    });
  }

  return (
    <div style={{ background: 'var(--surface-0)', border: '1px solid var(--ni-teal)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ni-teal)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Risk</p>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Risk Description *</label>
        <textarea value={riskDesc} onChange={e => setRiskDesc(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe the risk..." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Category</label>
          <input style={inputStyle} value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Data Integrity" />
        </div>
        <div>
          <label style={labelStyle}>Risk Owner</label>
          <input style={inputStyle} value={riskOwner} onChange={e => setRiskOwner(e.target.value)} placeholder="Name" />
        </div>
        <div>
          <label style={labelStyle}>Resolver Ref (RCSA)</label>
          <input style={inputStyle} value={resolverRef} onChange={e => setResolverRef(e.target.value)} placeholder="R-2024-001" />
        </div>
        <div>
          <label style={labelStyle}>Derived Level</label>
          <div style={{ padding: '8px 10px', border: `1px solid ${derived.color}`, borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, color: derived.color }}>
            {derived.label}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Likelihood (1-4)</label>
          <select style={inputStyle} value={likelihood} onChange={e => setLikelihood(Number(e.target.value))}>
            {[1,2,3,4].map(n => <option key={n} value={n}>{n} - {L_LABELS[n]}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Impact (1-4)</label>
          <select style={inputStyle} value={impact} onChange={e => setImpact(Number(e.target.value))}>
            {[1,2,3,4].map(n => <option key={n} value={n}>{n} - {I_LABELS[n]}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" disabled={!riskDesc.trim()} onClick={handleAdd}>Add Risk</Button>
      </div>
    </div>
  );
}

// ── Add Control Modal ─────────────────────────────────────────────────────────
function AddControlModal({ riskRef, onAdd, onClose }) {
  const [form, setForm] = useState({
    control_description: '',
    control_ref:         '',
    control_type:        'Preventive',
    frequency:           'Per event',
    test_objective:      '',
    test_approach:       '',
    sample_size:         25,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 };

  function handleAdd() {
    if (!form.control_description.trim()) return;
    onAdd({
      id:                   `ctrl-${Date.now()}`,
      control_ref:          form.control_ref.trim() || `CTRL-${Date.now().toString().slice(-6)}`,
      control_description:  form.control_description.trim(),
      control_type:         form.control_type,
      frequency:            form.frequency,
      test_objective:       form.test_objective.trim(),
      test_approach:        form.test_approach.trim(),
      sample_size:          Number(form.sample_size) || 25,
      sample_override:      false,
      design_conclusion:    'Not Assessed',
      operating_effectiveness: 'Not Tested',
      testing_status_fw:    'Not Started',
    });
    onClose();
  }

  return (
    <Modal title={`Add Control — ${riskRef}`} onClose={onClose} width={580}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Control Description *</label>
          <textarea value={form.control_description} onChange={e => set('control_description', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe the control..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Control Ref (Resolver)</label>
            <input style={inputStyle} value={form.control_ref} onChange={e => set('control_ref', e.target.value)} placeholder="CTRL-2024-001" />
          </div>
          <div>
            <label style={labelStyle}>Control Type</label>
            <select style={inputStyle} value={form.control_type} onChange={e => set('control_type', e.target.value)}>
              {CTRL_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Frequency</label>
            <select style={inputStyle} value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              {FREQ_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sample Size</label>
            <input style={inputStyle} type="number" min="1" value={form.sample_size} onChange={e => set('sample_size', e.target.value)} />
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ni-teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Testing Strategy</p>
          <div>
            <label style={labelStyle}>Test Objective</label>
            <input style={inputStyle} value={form.test_objective} onChange={e => set('test_objective', e.target.value)} placeholder="What are we testing for?" />
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={labelStyle}>Test Approach</label>
            <textarea value={form.test_approach} onChange={e => set('test_approach', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe how the test will be performed, what evidence will be obtained..." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!form.control_description.trim()} onClick={handleAdd}>Add Control</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main RACM component ───────────────────────────────────────────────────────
export default function PlanningRACM({ auditData, onUpdateAuditData, reviewComments = [], openDrawer, onTabChange }) {
  const items = auditData?.racmRisks || auditData?.racm_risks || [];
  const [expanded, setExpanded]       = useState(null);
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [addCtrlFor, setAddCtrlFor]   = useState(null); // riskId
  const [csvError, setCsvError]       = useState('');
  const fileInputRef = useRef(null);

  function updateItems(updated) {
    onUpdateAuditData?.('racmRisks', updated);
  }

  function addRisk(risk) {
    updateItems([...items, risk]);
    setShowAddRisk(false);
    setExpanded(risk.id);
  }

  function addControl(riskId, ctrl) {
    updateItems(items.map(r => r.id !== riskId ? r : { ...r, controls: [...r.controls, ctrl] }));
  }

  function updateControl(riskId, ctrlId, field, value) {
    updateItems(items.map(r => r.id !== riskId ? r : {
      ...r,
      controls: r.controls.map(c => c.id !== ctrlId ? c : { ...c, [field]: value }),
    }));
  }

  function removeRisk(riskId) {
    updateItems(items.filter(r => r.id !== riskId));
    if (expanded === riskId) setExpanded(null);
  }

  function handleCSVImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (parsed.length === 0) { setCsvError('No valid rows found in CSV.'); return; }
        updateItems([...items, ...parsed]);
        setCsvError('');
      } catch (err) {
        setCsvError('CSV parse error. Please check the format matches the template.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <>
      <Card style={{ padding: 20 }}>
        <SectionHeader
          title="Risk & Control Matrix (RACM)"
          subtitle={items.length > 0
            ? `${items.length} risk${items.length !== 1 ? 's' : ''} - ${items.reduce((s, r) => s + r.controls.length, 0)} controls`
            : 'No risks added yet'}
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {openDrawer && (
                <CommentButton sectionRef={SECTION_REF} rowRef={null} comments={reviewComments}
                  onClick={() => openDrawer({ sectionRef: SECTION_REF, rowRef: null, title: 'RACM', contextLabel: 'Planning - RACM' })} />
              )}
              <Button variant="secondary" size="sm" onClick={downloadCSVTemplate}>CSV Template</Button>
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Import from RCSA</Button>
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} />
              <Button variant="secondary" size="sm" onClick={() => setShowAddRisk(s => !s)}>
                {showAddRisk ? 'Cancel' : '+ Add Risk'}
              </Button>
            </div>
          }
        />

        {csvError && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--status-red-bg)', border: '1px solid var(--status-red-border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--status-red)' }}>
            {csvError}
          </div>
        )}

        {showAddRisk && <AddRiskForm onAdd={addRisk} onCancel={() => setShowAddRisk(false)} />}

        {items.length === 0 && !showAddRisk && (
          <EmptyState icon="o" title="No risks in RACM yet" description="Add risks manually or import from RCSA using the CSV template." />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(risk => {
            const derived   = RISK_MATRIX(risk.likelihood, risk.impact);
            const isExpanded = expanded === risk.id;

            return (
              <div key={risk.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

                {/* Risk header */}
                <div onClick={() => setExpanded(isExpanded ? null : risk.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-0)', cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--border)' : 'none' }}>
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
                      <CommentButton sectionRef={SECTION_REF} rowRef={risk.id} comments={reviewComments}
                        onClick={() => openDrawer({ sectionRef: SECTION_REF, rowRef: risk.id, title: `${risk.risk_ref} - ${risk.category}`, contextLabel: `RACM - ${risk.risk_ref}` })} />
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>L{risk.likelihood} x I{risk.impact}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{risk.controls.length} control{risk.controls.length !== 1 ? 's' : ''}</span>
                    <button onClick={e => { e.stopPropagation(); removeRisk(risk.id); }}
                      style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>x</button>
                    <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{isExpanded ? '-' : '+'}</span>
                  </div>
                </div>

                {/* Expanded risk body */}
                {isExpanded && (
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Risk Owner</label>
                        <span style={{ fontSize: 13 }}>{risk.risk_owner || '-'}</span>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Residual Risk</label>
                        <Badge label={risk.residual_risk_level} type="risk" />
                      </div>
                      {risk.risk_ref && (
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Resolver Ref</label>
                          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ni-teal)' }}>{risk.risk_ref}</span>
                        </div>
                      )}
                    </div>

                    {/* Controls header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        Controls ({risk.controls.length})
                      </p>
                      <Button variant="secondary" size="sm" onClick={e => { e.stopPropagation(); setAddCtrlFor(risk.id); }}>+ Add Control</Button>
                    </div>

                    {risk.controls.length === 0 && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>No controls added yet. Use + Add Control to document controls and testing strategy.</p>
                    )}

                    {risk.controls.map(ctrl => (
                      <div key={ctrl.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 10 }}>

                        {/* Control header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{ctrl.control_ref}</span>
                          <Badge label={ctrl.control_type} size="sm" />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ctrl.frequency}</span>
                        </div>
                        <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{ctrl.control_description}</p>

                        {/* Testing Strategy */}
                        {(ctrl.test_objective || ctrl.test_approach) && (
                          <div style={{ background: 'var(--ni-teal-dim)', border: '1px solid rgba(0,167,157,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 12 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ni-teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Testing Strategy</p>
                            {ctrl.test_objective && (
                              <div style={{ marginBottom: 6 }}>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Objective: </span>
                                <span style={{ fontSize: 12 }}>{ctrl.test_objective}</span>
                              </div>
                            )}
                            {ctrl.test_approach && (
                              <div>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Approach: </span>
                                <span style={{ fontSize: 12 }}>{ctrl.test_approach}</span>
                              </div>
                            )}
                            <div style={{ marginTop: 6 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sample size: </span>
                              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)' }}>n={ctrl.sample_size}</span>
                              {onTabChange && (
                                <button
                                  onClick={() => onTabChange('fieldwork')}
                                  style={{ marginLeft: 12, fontSize: 11, color: 'var(--ni-teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                  Go to Fieldwork
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Conclusions: Design editable here; O/E and Testing Status owned by Fieldwork */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Design</label>
                            <select
                              value={ctrl.design_conclusion || 'Not Assessed'}
                              onChange={e => updateControl(risk.id, ctrl.id, 'design_conclusion', e.target.value)}
                              style={{ fontSize: 12, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', fontFamily: 'var(--font-sans)', width: '100%', color: 'var(--text-primary)' }}
                            >
                              {DESIGN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Operating (O/E)</label>
                            <div style={{ fontSize: 12, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-0)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {ctrl.operating_effectiveness || 'Not Tested'} (set in Fieldwork)
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Testing Status</label>
                            <div style={{ fontSize: 12, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-0)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {ctrl.testing_status_fw || 'Not Started'} (set in Fieldwork)
                            </div>
                          </div>
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

      {addCtrlFor && (
        <AddControlModal
          riskRef={items.find(r => r.id === addCtrlFor)?.risk_ref || addCtrlFor}
          onAdd={ctrl => addControl(addCtrlFor, ctrl)}
          onClose={() => setAddCtrlFor(null)}
        />
      )}
    </>
  );
}
