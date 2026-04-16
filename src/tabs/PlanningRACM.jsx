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

const DESIGN_OPTIONS    = ['Not Assessed', 'Adequate', 'Inadequate', 'Missing'];
const CTRL_TYPE_OPTIONS = ['Preventive', 'Detective', 'Corrective'];
const FREQ_OPTIONS      = ['Per event', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'];
const L_LABELS          = { 1: 'Rare', 2: 'Unlikely', 3: 'Possible', 4: 'Likely' };
const I_LABELS          = { 1: 'Minor', 2: 'Moderate', 3: 'Major', 4: 'Severe' };
const OE_OPTIONS        = ['Not Tested', 'Effective', 'Partially Effective', 'Ineffective'];
const STATUS_OPTIONS    = ['Not Started', 'In Progress', 'Complete'];
const TEST_TYPE_OPTIONS = [
  'Inspection', 'Reperformance', 'Observation',
  'Inquiry', 'Recalculation', 'Analytical procedures',
];

const OE_COLORS = {
  'Not Tested':          { bg: 'var(--surface-1)',       border: 'var(--border)',              text: 'var(--text-muted)'   },
  'Effective':           { bg: 'var(--status-green-bg)', border: 'var(--status-green-border)', text: 'var(--status-green)' },
  'Partially Effective': { bg: 'var(--status-amber-bg)', border: 'var(--status-amber-border)', text: 'var(--status-amber)' },
  'Ineffective':         { bg: 'var(--status-red-bg)',   border: 'var(--status-red-border)',   text: 'var(--status-red)'   },
};

const STATUS_COLORS = {
  'Not Started': { bg: 'var(--surface-1)',       border: 'var(--border)',              text: 'var(--text-muted)'   },
  'In Progress': { bg: 'var(--status-amber-bg)', border: 'var(--status-amber-border)', text: 'var(--status-amber)' },
  'Complete':    { bg: 'var(--status-green-bg)', border: 'var(--status-green-border)', text: 'var(--status-green)' },
};

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
      id:                  `risk-${Date.now()}-${idx}`,
      risk_ref:            row.resolver_ref || `R-${Date.now().toString().slice(-4)}-${idx}`,
      risk_description:    row.risk_description || '',
      category:            row.category || 'General',
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

// ── Inline coloured select ────────────────────────────────────────────────────
function ColorSelect({ value, options, colors, onChange, disabled }) {
  const c = colors[value] || colors[options[0]];
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onClick={e => e.stopPropagation()}
      disabled={disabled}
      style={{
        fontSize: 11, fontWeight: 600, padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${c.border}`,
        background: c.bg, color: c.text,
        fontFamily: 'var(--font-sans)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.75 : 1,
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Test type multi-select pills ──────────────────────────────────────────────
function TestTypePills({ selected = [], onChange, readOnly }) {
  function toggle(type) {
    if (readOnly) return;
    const next = selected.includes(type)
      ? selected.filter(t => t !== type)
      : [...selected, type];
    onChange(next);
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {TEST_TYPE_OPTIONS.map(type => {
        const active = selected.includes(type);
        return (
          <button
            key={type}
            onClick={e => { e.stopPropagation(); toggle(type); }}
            disabled={readOnly}
            style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 100,
              border: `1px solid ${active ? 'var(--ni-teal)' : 'var(--border)'}`,
              background: active ? 'var(--ni-teal-dim)' : 'var(--surface-0)',
              color: active ? 'var(--ni-teal)' : 'var(--text-muted)',
              fontWeight: active ? 600 : 400,
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'all 0.1s',
            }}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}

// ── Design flag banner ────────────────────────────────────────────────────────
function DesignFlagBanner({ conclusion }) {
  if (conclusion !== 'Inadequate' && conclusion !== 'Missing') return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 12px', marginBottom: 10,
      background: 'var(--status-amber-bg)',
      border: '1px solid var(--status-amber-border)',
      borderRadius: 'var(--radius-sm)',
      fontSize: 12, color: 'var(--status-amber)',
    }}>
      <span style={{ fontWeight: 700, fontSize: 14 }}>!</span>
      Design concluded as <strong style={{ marginLeft: 2 }}>{conclusion}</strong>
      <span style={{ marginLeft: 4 }}>- confirm testing approach before commencing fieldwork.</span>
    </div>
  );
}

// ── Add Risk form ─────────────────────────────────────────────────────────────
function AddRiskForm({ onAdd, onCancel }) {
  const [riskDesc, setRiskDesc]       = useState('');
  const [category, setCategory]       = useState('');
  const [likelihood, setLikelihood]   = useState(2);
  const [impact, setImpact]           = useState(2);
  const [riskOwner, setRiskOwner]     = useState('');
  const [resolverRef, setResolverRef] = useState('');
  const derived = RISK_MATRIX(likelihood, impact);

  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 };

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
        <Button variant="primary" size="sm" disabled={!riskDesc.trim()} onClick={() => {
          if (!riskDesc.trim()) return;
          onAdd({
            id: `risk-${Date.now()}`,
            risk_ref: resolverRef.trim() || `R-${Date.now().toString().slice(-6)}`,
            risk_description: riskDesc.trim(),
            category: category.trim() || 'General',
            likelihood: Number(likelihood),
            impact: Number(impact),
            inherent_risk_level: derived.label,
            residual_risk_level: derived.label,
            risk_owner: riskOwner.trim(),
            in_scope: true,
            controls: [],
          });
        }}>Add Risk</Button>
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
    design_conclusion:   'Not Assessed',
    test_types:          [],
    sample_size:         25,
    testing_objective:   '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 };

  return (
    <Modal title={`Add Control - ${riskRef}`} onClose={onClose} width={600}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Control Description *</label>
          <textarea value={form.control_description} onChange={e => set('control_description', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe the control..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
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
        </div>

        <div>
          <label style={labelStyle}>Design Conclusion</label>
          <select style={{ ...inputStyle, width: 220 }} value={form.design_conclusion} onChange={e => set('design_conclusion', e.target.value)}>
            {DESIGN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ni-teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Testing Strategy</p>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Test Type(s)</label>
            <TestTypePills selected={form.test_types} onChange={v => set('test_types', v)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Sample Size</label>
              <input style={inputStyle} type="number" min="1" value={form.sample_size} onChange={e => set('sample_size', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Testing Objective</label>
              <input style={inputStyle} value={form.testing_objective} onChange={e => set('testing_objective', e.target.value)} placeholder="What are we testing for?" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!form.control_description.trim()} onClick={() => {
            if (!form.control_description.trim()) return;
            onAdd({
              id:                      `ctrl-${Date.now()}`,
              control_ref:             form.control_ref.trim() || `CTRL-${Date.now().toString().slice(-6)}`,
              control_description:     form.control_description.trim(),
              control_type:            form.control_type,
              frequency:               form.frequency,
              design_conclusion:       form.design_conclusion,
              test_types:              form.test_types,
              sample_size:             Number(form.sample_size) || 25,
              testing_objective:       form.testing_objective.trim(),
              sample_override:         false,
              operating_effectiveness: 'Not Tested',
              testing_status_fw:       'Not Started',
              work_done:               '',
              working_papers:          [],
            });
            onClose();
          }}>Add Control</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Control card — shared between planning and fieldwork modes ────────────────
function ControlCard({ risk, ctrl, mode, updateControl, onTabChange }) {
  const [expanded, setExpanded] = useState(false);

  const isFieldwork   = mode === 'fieldwork';
  const designWarning = ctrl.design_conclusion === 'Inadequate' || ctrl.design_conclusion === 'Missing';
  const oe            = ctrl.operating_effectiveness || 'Not Tested';
  const status        = ctrl.testing_status_fw       || 'Not Started';
  const hasStrategy   = (ctrl.test_types?.length > 0) || ctrl.testing_objective;

  return (
    <div style={{
      border: `1px solid ${designWarning ? 'var(--status-amber-border)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 10,
    }}>

      {/* Header row */}
      <div
        onClick={() => setExpanded(s => !s)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          cursor: 'pointer',
          background: designWarning && !isFieldwork ? 'var(--status-amber-bg)' : 'var(--surface-0)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)' }}>{ctrl.control_ref}</span>
            <Badge label={ctrl.control_type} size="sm" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ctrl.frequency}</span>
            {hasStrategy && (
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 100, background: 'var(--ni-teal-dim)', color: 'var(--ni-teal)', fontWeight: 600 }}>
                Strategy set
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.4, margin: 0 }}>{ctrl.control_description}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {/* Design — editable in both modes */}
          <select
            value={ctrl.design_conclusion || 'Not Assessed'}
            onChange={e => updateControl(risk.id, ctrl.id, 'design_conclusion', e.target.value)}
            style={{
              fontSize: 11, fontWeight: 600, padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${designWarning ? 'var(--status-amber-border)' : 'var(--border)'}`,
              background: designWarning ? 'var(--status-amber-bg)' : 'var(--surface-1)',
              color: designWarning ? 'var(--status-amber)' : 'var(--text-primary)',
              fontFamily: 'var(--font-sans)', cursor: 'pointer',
            }}
          >
            {DESIGN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          {/* O/E — editable in fieldwork, read-only pill in planning */}
          {isFieldwork ? (
            <ColorSelect
              value={oe} options={OE_OPTIONS} colors={OE_COLORS}
              onChange={val => updateControl(risk.id, ctrl.id, 'operating_effectiveness', val)}
            />
          ) : (
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-0)', border: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              O/E: {oe}
            </span>
          )}

          {/* Testing Status — editable in fieldwork, read-only pill in planning */}
          {isFieldwork ? (
            <ColorSelect
              value={status} options={STATUS_OPTIONS} colors={STATUS_COLORS}
              onChange={val => updateControl(risk.id, ctrl.id, 'testing_status_fw', val)}
            />
          ) : (
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-0)', border: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {status}
            </span>
          )}

          <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 4 }}>{expanded ? '-' : '+'}</span>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>

          <DesignFlagBanner conclusion={ctrl.design_conclusion} />

          {/* Testing Strategy block */}
          <div style={{ background: 'var(--ni-teal-dim)', border: '1px solid rgba(0,167,157,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ni-teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Testing Strategy
              </p>
              {isFieldwork && onTabChange && (
                <button
                  onClick={() => onTabChange('planning', 'racm')}
                  style={{ fontSize: 11, color: 'var(--ni-teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Edit in Planning
                </button>
              )}
            </div>

            {/* Test types */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Test Type(s)
              </label>
              {isFieldwork ? (
                ctrl.test_types?.length > 0
                  ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {ctrl.test_types.map(t => (
                        <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'var(--ni-teal-dim)', border: '1px solid var(--ni-teal)', color: 'var(--ni-teal)', fontWeight: 600 }}>{t}</span>
                      ))}
                    </div>
                  : <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Not set</span>
              ) : (
                <TestTypePills
                  selected={ctrl.test_types || []}
                  onChange={v => updateControl(risk.id, ctrl.id, 'test_types', v)}
                />
              )}
            </div>

            {/* Sample size + testing objective */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Sample Size
                </label>
                {isFieldwork ? (
                  <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ni-teal)' }}>n={ctrl.sample_size}</span>
                ) : (
                  <input
                    type="number" min="1"
                    value={ctrl.sample_size || 25}
                    onChange={e => updateControl(risk.id, ctrl.id, 'sample_size', Number(e.target.value))}
                    onClick={e => e.stopPropagation()}
                    style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--font-mono)', background: 'var(--surface-0)', outline: 'none' }}
                  />
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Testing Objective
                </label>
                {isFieldwork ? (
                  <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                    {ctrl.testing_objective || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not set</span>}
                  </p>
                ) : (
                  <textarea
                    value={ctrl.testing_objective || ''}
                    onChange={e => updateControl(risk.id, ctrl.id, 'testing_objective', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    rows={2}
                    placeholder="What are we testing for?"
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Fieldwork-only: Work Done */}
          {isFieldwork && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Work Done
              </label>
              <textarea
                value={ctrl.work_done || ''}
                onChange={e => updateControl(risk.id, ctrl.id, 'work_done', e.target.value)}
                rows={3}
                placeholder="Document what testing was performed, evidence obtained, observations..."
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* Fieldwork-only: O/E warning */}
          {isFieldwork && (oe === 'Ineffective' || oe === 'Partially Effective') && (
            <div style={{ padding: '8px 12px', background: 'var(--status-amber-bg)', border: '1px solid var(--status-amber-border)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--status-amber)' }}>
              O/E = {oe} - consider raising a query or promoting to an issue.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main RACM component ───────────────────────────────────────────────────────
// mode: 'planning' (default) | 'fieldwork'
export default function PlanningRACM({
  auditData, onUpdateAuditData,
  reviewComments = [], openDrawer,
  onTabChange,
  mode = 'planning',
}) {
  const items       = auditData?.racmRisks || auditData?.racm_risks || [];
  const isFieldwork = mode === 'fieldwork';

  const [expanded, setExpanded]       = useState(null);
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [addCtrlFor, setAddCtrlFor]   = useState(null);
  const [csvError, setCsvError]       = useState('');
  const fileInputRef = useRef(null);

  function updateItems(updated) { onUpdateAuditData?.('racmRisks', updated); }

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
      } catch {
        setCsvError('CSV parse error. Please check the format matches the template.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const allControls      = items.flatMap(r => r.controls);
  const totalControls    = allControls.length;
  const testedControls   = allControls.filter(c => (c.testing_status_fw || 'Not Started') !== 'Not Started').length;
  const missingStrategy  = allControls.filter(c => !c.test_types?.length).length;

  const subtitle = items.length === 0 ? 'No risks added yet'
    : isFieldwork
      ? `${items.length} risk${items.length !== 1 ? 's' : ''} - ${totalControls} controls - ${testedControls}/${totalControls} tested`
      : `${items.length} risk${items.length !== 1 ? 's' : ''} - ${totalControls} controls${missingStrategy > 0 ? ` - ${missingStrategy} missing test strategy` : ''}`;

  return (
    <>
      <Card style={{ padding: 20 }}>
        <SectionHeader
          title="Risk and Control Matrix (RACM)"
          subtitle={subtitle}
          action={
            isFieldwork ? (
              openDrawer && (
                <CommentButton sectionRef={SECTION_REF} rowRef={null} comments={reviewComments}
                  onClick={() => openDrawer({ sectionRef: SECTION_REF, rowRef: null, title: 'RACM', contextLabel: 'Fieldwork - RACM' })} />
              )
            ) : (
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
            )
          }
        />

        {/* Fieldwork context banner */}
        {isFieldwork && (
          <div style={{ marginBottom: 16, padding: '8px 14px', background: 'var(--status-blue-bg)', border: '1px solid var(--status-blue-border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--status-blue)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Testing strategy and design conclusions were set in Planning. O/E, testing status, and work done are editable here.</span>
            {onTabChange && (
              <button onClick={() => onTabChange('planning', 'racm')} style={{ fontSize: 11, color: 'var(--status-blue)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', flexShrink: 0, marginLeft: 16 }}>
                Edit strategy in Planning
              </button>
            )}
          </div>
        )}

        {csvError && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--status-red-bg)', border: '1px solid var(--status-red-border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--status-red)' }}>
            {csvError}
          </div>
        )}

        {showAddRisk && <AddRiskForm onAdd={addRisk} onCancel={() => setShowAddRisk(false)} />}

        {items.length === 0 && !showAddRisk && (
          <EmptyState
            icon="o"
            title="No risks in RACM yet"
            description={isFieldwork
              ? 'Add risks and controls in Planning - RACM before commencing fieldwork.'
              : 'Add risks manually or import from RCSA using the CSV template.'}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(risk => {
            const derived    = RISK_MATRIX(risk.likelihood, risk.impact);
            const isExpanded = expanded === risk.id;
            const riskControls = risk.controls || [];
            const riskTested   = riskControls.filter(c => (c.testing_status_fw || 'Not Started') !== 'Not Started').length;

            return (
              <div key={risk.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

                {/* Risk header */}
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
                    {openDrawer && !isFieldwork && (
                      <CommentButton sectionRef={SECTION_REF} rowRef={risk.id} comments={reviewComments}
                        onClick={e => { e.stopPropagation(); openDrawer({ sectionRef: SECTION_REF, rowRef: risk.id, title: `${risk.risk_ref} - ${risk.category}`, contextLabel: `RACM - ${risk.risk_ref}` }); }} />
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>L{risk.likelihood} x I{risk.impact}</span>
                    <span style={{ fontSize: 11, color: isFieldwork && riskTested > 0 ? 'var(--status-green)' : 'var(--text-muted)' }}>
                      {isFieldwork
                        ? `${riskTested}/${riskControls.length} tested`
                        : `${riskControls.length} control${riskControls.length !== 1 ? 's' : ''}`}
                    </span>
                    {!isFieldwork && (
                      <button
                        onClick={e => { e.stopPropagation(); removeRisk(risk.id); }}
                        style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                      >x</button>
                    )}
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
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Resolver Ref</label>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ni-teal)' }}>{risk.risk_ref}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        Controls ({riskControls.length})
                      </p>
                      {!isFieldwork && (
                        <Button variant="secondary" size="sm" onClick={e => { e.stopPropagation(); setAddCtrlFor(risk.id); }}>+ Add Control</Button>
                      )}
                    </div>

                    {riskControls.length === 0 && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        {isFieldwork ? 'No controls defined. Add controls in Planning - RACM.' : 'Use + Add Control to document controls and testing strategy.'}
                      </p>
                    )}

                    {riskControls.map(ctrl => (
                      <ControlCard
                        key={ctrl.id}
                        risk={risk}
                        ctrl={ctrl}
                        mode={mode}
                        updateControl={updateControl}
                        onTabChange={onTabChange}
                      />
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
