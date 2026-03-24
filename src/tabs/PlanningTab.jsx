import { useState, useRef } from 'react';
import { Card, SectionHeader, Field, Button, Badge, SignOffBar, Select, Modal } from '../components/UI';
import {
  SAMPLE_AUDIT, TERMS_OF_REFERENCE, AUDIT_PROGRAMME, RACM_RISKS, SIGN_OFFS, USERS,
} from '../data/mockData';

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = n => String(n).padStart(3, '0');

const RISK_MATRIX = (l, i) => {
  const score = l * i;
  if (score >= 12) return { label: 'Very High', color: 'var(--risk-very-high)' };
  if (score >= 6)  return { label: 'High',      color: 'var(--risk-high)' };
  if (score >= 3)  return { label: 'Moderate',  color: 'var(--risk-medium)' };
  return                  { label: 'Low',       color: 'var(--risk-low)' };
};

// Sample size lookup: frequency -> suggested n (per NI sampling guidelines)
const SAMPLE_SIZE_MAP = {
  'Daily':     25,
  'Weekly':    10,
  'Monthly':   3,
  'Quarterly': 4,
  'Annual':    1,
  'Per event': 15,
};

const IMPACT_OPTIONS = [
  { value: '1', label: 'Low (1)' },
  { value: '2', label: 'Moderate (2)' },
  { value: '3', label: 'High (3)' },
  { value: '4', label: 'Very High (4)' },
];

const LIKELIHOOD_OPTIONS = [
  { value: '1', label: 'Unlikely (1)' },
  { value: '2', label: 'Possible (2)' },
  { value: '3', label: 'Likely (3)' },
  { value: '4', label: 'Almost Certain (4)' },
];

const CATEGORY_OPTIONS = [
  { value: 'Financial',        label: 'Financial' },
  { value: 'Operational',      label: 'Operational' },
  { value: 'Compliance',       label: 'Compliance' },
  { value: 'IT',               label: 'IT' },
  { value: 'Reputational',     label: 'Reputational' },
  { value: 'Data Integrity',   label: 'Data Integrity' },
  { value: 'Data Quality',     label: 'Data Quality' },
  { value: 'Access & Authorisation', label: 'Access & Authorisation' },
];

const FREQUENCY_OPTIONS = [
  { value: 'Daily',     label: 'Daily' },
  { value: 'Weekly',    label: 'Weekly' },
  { value: 'Monthly',   label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Annual',    label: 'Annual' },
  { value: 'Per event', label: 'Per event' },
];

const CONTROL_TYPE_OPTIONS = [
  { value: 'Preventive', label: 'Preventive' },
  { value: 'Detective',  label: 'Detective' },
];

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Complete'];

const OVERRIDE_LEVEL_OPTIONS = [
  { value: 'Very High', label: 'Very High' },
  { value: 'High',      label: 'High' },
  { value: 'Moderate',  label: 'Moderate' },
  { value: 'Low',       label: 'Low' },
];

// ── Validation helper ─────────────────────────────────────────────────────────
function validate(fields) {
  // fields: { [fieldKey]: value }
  // Returns object of fieldKey -> error message, empty if valid
  const errors = {};
  Object.entries(fields).forEach(([k, v]) => {
    if (!v || (typeof v === 'string' && !v.trim())) {
      errors[k] = 'Required';
    }
  });
  return errors;
}

// ── Error-aware Field wrapper ─────────────────────────────────────────────────
function FormField({ label, value, onChange, multiline, rows, hint, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        color: error ? 'var(--status-red)' : 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
      }}>
        {label}{error ? ' - Required' : ''}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows || 3}
          style={{
            width: '100%', padding: '8px 10px',
            border: `1px solid ${error ? 'var(--status-red)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)', fontSize: 13,
            color: 'var(--text-primary)', background: 'var(--surface-0)',
            resize: 'vertical', outline: 'none',
            fontFamily: 'var(--font-sans)', lineHeight: 1.5,
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '8px 10px',
            border: `1px solid ${error ? 'var(--status-red)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)', fontSize: 13,
            color: 'var(--text-primary)', background: 'var(--surface-0)',
            outline: 'none', fontFamily: 'var(--font-sans)',
          }}
        />
      )}
      {hint && !error && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{hint}</p>}
    </div>
  );
}

function FormSelect({ label, value, onChange, options, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        color: error ? 'var(--status-red)' : 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
      }}>
        {label}{error ? ' - Required' : ''}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 10px',
          border: `1px solid ${error ? 'var(--status-red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)', fontSize: 13,
          color: 'var(--text-primary)', background: 'var(--surface-0)',
          outline: 'none', fontFamily: 'var(--font-sans)',
        }}
      >
        <option value="">- Select -</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Audit Details ────────────────────────────────────────────────────────────
function AuditDetails({ audit }) {
  const lead = USERS.find(u => u.id === audit.lead_auditor_id);
  const team = audit.team_members.map(id => USERS.find(u => u.id === id)?.full_name).filter(Boolean).join(', ');

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader title="Audit Details" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <Field label="Audit Title"           value={audit.title} />
        <Field label="Entity / Business Unit" value={audit.entity} />
        <Field label="Audit Type"            value={audit.audit_type} />
        <Field label="Period Under Review"   value={audit.period_under_review} />
        <Field label="Planned Start" value={new Date(audit.planned_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
        <Field label="Planned End"   value={new Date(audit.planned_end).toLocaleDateString('en-GB',   { day: 'numeric', month: 'long', year: 'numeric' })} />
        <Field label="Lead Auditor"  value={lead?.full_name || '-'} />
        <Field label="Team Members"  value={team} />
      </div>
    </Card>
  );
}

// ── Terms of Reference ────────────────────────────────────────────────────────
function TermsOfReference({ tor }) {
  const [data, setData] = useState(tor);

  const fields = [
    { key: 'objectives',      label: 'Audit Objectives',  rows: 4 },
    { key: 'scope',           label: 'Scope',              rows: 4 },
    { key: 'out_of_scope',    label: 'Out of Scope',       rows: 3 },
    { key: 'methodology',     label: 'Methodology',        rows: 4 },
    { key: 'reporting_lines', label: 'Reporting Lines',    rows: 2 },
    { key: 'key_contacts',    label: 'Key Contacts',       rows: 3 },
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

// ── Add Step Modal ────────────────────────────────────────────────────────────
function AddStepModal({ onClose, onAdd, nextStepNumber }) {
  const [form, setForm] = useState({
    description: '',
    assigned_to: '',
    estimated_hours: '',
    status: 'Not Started',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const handleSubmit = () => {
    const required = { description: form.description, assigned_to: form.assigned_to };
    const errs = validate(required);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onAdd({
      id: `step-${Date.now()}`,
      audit_id: 'audit-001',
      step_number: nextStepNumber,
      description: form.description.trim(),
      assigned_to: form.assigned_to,
      estimated_hours: parseFloat(form.estimated_hours) || 0,
      status: form.status,
      notes: form.notes.trim(),
    });
    onClose();
  };

  const userOptions = USERS.map(u => ({ value: u.id, label: `${u.full_name} (${u.role})` }));

  return (
    <Modal title={`Add Step - S-${pad(nextStepNumber)}`} onClose={onClose} width={520}>
      <FormField
        label="Step Description"
        value={form.description}
        onChange={v => set('description', v)}
        multiline rows={3}
        error={errors.description}
        hint="Describe the audit procedure clearly enough for a reviewer to understand scope and approach."
      />
      <FormSelect
        label="Assigned To"
        value={form.assigned_to}
        onChange={v => set('assigned_to', v)}
        options={userOptions}
        error={errors.assigned_to}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField
          label="Estimated Hours"
          value={form.estimated_hours}
          onChange={v => set('estimated_hours', v)}
          hint="Optional"
        />
        <FormSelect
          label="Status"
          value={form.status}
          onChange={v => set('status', v)}
          options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
        />
      </div>
      <FormField
        label="Notes"
        value={form.notes}
        onChange={v => set('notes', v)}
        multiline rows={2}
        hint="Optional - any context, links or approach notes."
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Add Step</Button>
      </div>
    </Modal>
  );
}

// ── Audit Programme ───────────────────────────────────────────────────────────
function AuditProgramme({ steps, stepCounter, onStepCounterIncrement }) {
  const [items, setItems] = useState(steps);
  const [showModal, setShowModal] = useState(false);

  const counts = { 'Not Started': 0, 'In Progress': 0, 'Complete': 0 };
  items.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
  const totalHours = items.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);

  const handleAdd = newStep => {
    setItems(prev => [...prev, newStep]);
    onStepCounterIncrement();
  };

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Audit Programme"
        subtitle={`${items.length} steps . ${totalHours}h estimated`}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(counts).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Badge label={status} size="sm" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>+ Add Step</Button>
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
                  {step.estimated_hours ? `${step.estimated_hours}h` : '-'}
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

      {showModal && (
        <AddStepModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          nextStepNumber={stepCounter}
        />
      )}
    </Card>
  );
}

// ── Add Risk Modal ────────────────────────────────────────────────────────────
function AddRiskModal({ onClose, onAdd, nextRiskNumber }) {
  const [form, setForm] = useState({
    description: '',
    category: '',
    likelihood: '',
    impact: '',
    risk_owner: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const derivedLevel = form.likelihood && form.impact
    ? RISK_MATRIX(parseInt(form.likelihood), parseInt(form.impact))
    : null;

  const handleSubmit = () => {
    const required = {
      description: form.description,
      category: form.category,
      likelihood: form.likelihood,
      impact: form.impact,
      risk_owner: form.risk_owner,
    };
    const errs = validate(required);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onAdd({
      id: `risk-${Date.now()}`,
      audit_id: 'audit-001',
      risk_ref: `R-NEW-${pad(nextRiskNumber)}`,
      risk_description: form.description.trim(),
      category: form.category,
      likelihood: parseInt(form.likelihood),
      impact: parseInt(form.impact),
      inherent_risk_level: derivedLevel.label,
      residual_risk_level: derivedLevel.label,
      risk_level_override: false,
      override_rationale: '',
      risk_owner: form.risk_owner.trim(),
      in_scope: true,
      controls: [],
    });
    onClose();
  };

  return (
    <Modal title={`Add Risk - R-NEW-${pad(nextRiskNumber)}`} onClose={onClose} width={560}>
      <FormField
        label="Risk Description"
        value={form.description}
        onChange={v => set('description', v)}
        multiline rows={3}
        error={errors.description}
        hint="Describe what could go wrong and the consequence."
      />
      <FormSelect
        label="Category"
        value={form.category}
        onChange={v => set('category', v)}
        options={CATEGORY_OPTIONS}
        error={errors.category}
      />
      <FormField
        label="Risk Owner"
        value={form.risk_owner}
        onChange={v => set('risk_owner', v)}
        error={errors.risk_owner}
        hint="Name of the person accountable for this risk in the business."
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormSelect
          label="Likelihood"
          value={form.likelihood}
          onChange={v => set('likelihood', v)}
          options={LIKELIHOOD_OPTIONS}
          error={errors.likelihood}
        />
        <FormSelect
          label="Impact"
          value={form.impact}
          onChange={v => set('impact', v)}
          options={IMPACT_OPTIONS}
          error={errors.impact}
        />
      </div>

      {/* Derived risk level preview */}
      {derivedLevel && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: 'var(--surface-0)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Derived risk level:</span>
          <Badge label={derivedLevel.label} type="risk" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            (L{form.likelihood} x I{form.impact} = {parseInt(form.likelihood) * parseInt(form.impact)})
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Add Risk</Button>
      </div>
    </Modal>
  );
}

// ── Add Control Modal ─────────────────────────────────────────────────────────
function AddControlModal({ onClose, onAdd, riskId, riskRef, nextCtrlNumber }) {
  const [form, setForm] = useState({
    description: '',
    control_type: '',
    frequency: '',
    resolver_ref: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const suggestedSample = form.frequency ? SAMPLE_SIZE_MAP[form.frequency] : null;

  const handleSubmit = () => {
    const required = {
      description: form.description,
      control_type: form.control_type,
      frequency: form.frequency,
    };
    const errs = validate(required);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onAdd(riskId, {
      id: `ctrl-${Date.now()}`,
      risk_id: riskId,
      control_ref: `CTRL-NEW-${pad(nextCtrlNumber)}`,
      control_description: form.description.trim(),
      control_type: form.control_type,
      frequency: form.frequency,
      design_conclusion: 'Not Tested',
      operating_effectiveness: 'Not Tested',
      testing_status: 'Not Tested',
      sample_size: suggestedSample || 0,
      sample_override: false,
      sample_override_rationale: '',
      resolver_ref: form.resolver_ref.trim(),
    });
    onClose();
  };

  return (
    <Modal title={`Add Control to ${riskRef}`} onClose={onClose} width={520}>
      <FormField
        label="Control Description"
        value={form.description}
        onChange={v => set('description', v)}
        multiline rows={3}
        error={errors.description}
        hint="Describe what the control does, who performs it, and how often."
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormSelect
          label="Control Type"
          value={form.control_type}
          onChange={v => set('control_type', v)}
          options={CONTROL_TYPE_OPTIONS}
          error={errors.control_type}
        />
        <FormSelect
          label="Frequency"
          value={form.frequency}
          onChange={v => set('frequency', v)}
          options={FREQUENCY_OPTIONS}
          error={errors.frequency}
        />
      </div>

      {/* Sample size preview */}
      {suggestedSample !== null && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: 'var(--surface-0)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Suggested sample size:</span>
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ni-teal)' }}>
            n={suggestedSample}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(per NI sampling guidelines)</span>
        </div>
      )}

      <FormField
        label="Resolver Reference"
        value={form.resolver_ref}
        onChange={v => set('resolver_ref', v)}
        hint="Optional - e.g. CTRL-2024-112"
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Add Control</Button>
      </div>
    </Modal>
  );
}

// ── RACM ──────────────────────────────────────────────────────────────────────
function RACMSection({ risks, riskCounter, ctrlCounter, onRiskCounterIncrement, onCtrlCounterIncrement }) {
  const [items, setItems] = useState(risks);
  const [expanded, setExpanded] = useState(items[0]?.id);
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [showAddControl, setShowAddControl] = useState(null); // riskId | null

  const TESTING_OPTIONS = ['Not Tested', 'In Progress', 'Tested - Effective', 'Tested - Ineffective'];
  const DE_OPTIONS      = ['Not Tested', 'Effective', 'Ineffective'];

  const updateControl = (riskId, ctrlId, field, value) => {
    setItems(prev => prev.map(r => r.id !== riskId ? r : {
      ...r,
      controls: r.controls.map(c => c.id !== ctrlId ? c : { ...c, [field]: value }),
    }));
  };

  const handleAddRisk = newRisk => {
    setItems(prev => [...prev, newRisk]);
    setExpanded(newRisk.id);
    onRiskCounterIncrement();
  };

  const handleAddControl = (riskId, newCtrl) => {
    setItems(prev => prev.map(r => r.id !== riskId ? r : {
      ...r, controls: [...r.controls, newCtrl],
    }));
    onCtrlCounterIncrement();
  };

  // Override handlers
  const setOverride = (riskId, level) => {
    setItems(prev => prev.map(r => r.id !== riskId ? r : {
      ...r, risk_level_override: true, inherent_risk_level: level,
    }));
  };

  const setOverrideRationale = (riskId, text) => {
    setItems(prev => prev.map(r => r.id !== riskId ? r : {
      ...r, override_rationale: text,
    }));
  };

  const revertOverride = riskId => {
    setItems(prev => prev.map(r => {
      if (r.id !== riskId) return r;
      const derived = RISK_MATRIX(r.likelihood, r.impact).label;
      return { ...r, risk_level_override: false, inherent_risk_level: derived, override_rationale: '' };
    }));
  };

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Risk & Control Matrix (RACM)"
        subtitle="Resolver references shown for manual cross-referencing. Live integration deferred to Phase 2."
        action={<Button variant="primary" size="sm" onClick={() => setShowAddRisk(true)}>+ Add Risk</Button>}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(risk => {
          const derived  = RISK_MATRIX(risk.likelihood, risk.impact);
          const isExpanded = expanded === risk.id;
          const isOverridden = risk.risk_level_override;
          const displayLevel = isOverridden ? risk.inherent_risk_level : derived.label;

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
                <div style={{
                  width: 4, height: 36, borderRadius: 2,
                  background: RISK_MATRIX(risk.likelihood, risk.impact).color,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {risk.risk_ref}
                    </span>
                    <Badge label={risk.category} size="sm" />
                    <Badge label={displayLevel} type="risk" size="sm" />
                    {isOverridden && (
                      <span style={{ fontSize: 10, color: 'var(--status-amber)', fontWeight: 600, letterSpacing: '0.04em' }}>
                        [!] OVERRIDDEN
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.4 }}>{risk.risk_description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>L{risk.likelihood} x I{risk.impact}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{risk.controls.length} control{risk.controls.length !== 1 ? 's' : ''}</span>
                </div>
                <span style={{ fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }}>{isExpanded ? '-' : '+'}</span>
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Risk metadata row */}
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

                  {/* Risk level override block */}
                  <div style={{
                    padding: '12px 14px',
                    background: isOverridden ? 'var(--status-amber-bg)' : 'var(--surface-0)',
                    border: `1px solid ${isOverridden ? 'var(--status-amber-border)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isOverridden ? 10 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                          Calculated level:
                        </span>
                        <Badge label={derived.label} type="risk" size="sm" />
                        {isOverridden && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            overridden to <strong>{displayLevel}</strong>
                          </span>
                        )}
                      </div>
                      {isOverridden ? (
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); revertOverride(risk.id); }}>
                          Revert to calculated
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setOverride(risk.id, derived.label); }}>
                          Override
                        </Button>
                      )}
                    </div>

                    {isOverridden && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Override level selector */}
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                            Override Level
                          </label>
                          <select
                            value={risk.inherent_risk_level}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); setOverride(risk.id, e.target.value); }}
                            style={{
                              fontSize: 12, padding: '4px 8px',
                              border: '1px solid var(--status-amber-border)',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--surface-1)',
                              fontFamily: 'var(--font-sans)',
                            }}
                          >
                            {OVERRIDE_LEVEL_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Rationale - always visible when overridden */}
                        <div>
                          <label style={{
                            display: 'block', fontSize: 11, fontWeight: 600,
                            color: !risk.override_rationale ? 'var(--status-red)' : 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
                          }}>
                            Override Rationale{!risk.override_rationale ? ' - Required' : ''}
                          </label>
                          <textarea
                            value={risk.override_rationale}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); setOverrideRationale(risk.id, e.target.value); }}
                            rows={2}
                            placeholder="Explain why the calculated level does not reflect the true risk (e.g. compensating controls, business context)."
                            style={{
                              width: '100%', padding: '7px 10px',
                              border: `1px solid ${!risk.override_rationale ? 'var(--status-red)' : 'var(--status-amber-border)'}`,
                              borderRadius: 'var(--radius-md)', fontSize: 12,
                              background: 'var(--surface-1)', resize: 'vertical',
                              fontFamily: 'var(--font-sans)', lineHeight: 1.5,
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controls list */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Controls ({risk.controls.length})
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={e => { e.stopPropagation(); setShowAddControl(risk.id); }}
                      >
                        + Add Control
                      </Button>
                    </div>

                    {risk.controls.length === 0 && (
                      <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                        No controls yet. Add one using the button above.
                      </div>
                    )}

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
                          {[
                            { label: 'Design',         field: 'design_conclusion',     options: DE_OPTIONS },
                            { label: 'Operating',      field: 'operating_effectiveness', options: DE_OPTIONS },
                            { label: 'Testing Status', field: 'testing_status',         options: TESTING_OPTIONS },
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
                                {col.options.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sample size:</span>
                          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)' }}>n={ctrl.sample_size}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(per NI sampling guidelines)</span>
                          {ctrl.resolver_ref && (
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginLeft: 8 }}>
                              {ctrl.resolver_ref}
                            </span>
                          )}
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

      {/* Add Risk Modal */}
      {showAddRisk && (
        <AddRiskModal
          onClose={() => setShowAddRisk(false)}
          onAdd={handleAddRisk}
          nextRiskNumber={riskCounter}
        />
      )}

      {/* Add Control Modal */}
      {showAddControl && (() => {
        const parentRisk = items.find(r => r.id === showAddControl);
        return (
          <AddControlModal
            onClose={() => setShowAddControl(null)}
            onAdd={handleAddControl}
            riskId={showAddControl}
            riskRef={parentRisk?.risk_ref || ''}
            nextCtrlNumber={ctrlCounter}
          />
        );
      })()}
    </Card>
  );
}

// ── Planning Tab ───────────────────────────────────────────────────────────────
// ── Progress circles strip ─────────────────────────────────────────────────
// Displayed at the top of the Planning tab; circles are clickable to jump tabs.
// Clicking the Planning circle while on Planning scrolls to top of content.
function TabProgressCircle({ pct, label, tabId, activeTabId, onClick, size = 44 }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;
  const isActiveTab = tabId === activeTabId;

  let fillColor;
  if (pct === 0)        fillColor = 'var(--border)';
  else if (pct === 33)  fillColor = 'var(--status-amber)';
  else if (pct === 67)  fillColor = 'var(--ni-teal)';
  else                  fillColor = 'var(--status-green)';

  const tierLabel = pct === 0 ? 'None' : pct === 33 ? 'Auditor' : pct === 67 ? 'Reviewer' : 'HIA';

  return (
    <button
      onClick={onClick}
      title={`${label}: ${tierLabel} signed (${pct}%)`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        background: isActiveTab ? 'var(--ni-teal-dim)' : 'transparent',
        border: `1px solid ${isActiveTab ? 'rgba(0,167,157,0.3)' : 'transparent'}`,
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--border)" strokeWidth={3}
        />
        {pct > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={fillColor} strokeWidth={3}
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
          />
        )}
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
          fontSize={pct === 100 ? 9 : 10}
          fontWeight={600}
          fill={pct === 0 ? 'var(--text-muted)' : fillColor}
        >
          {pct === 0 ? '-' : `${pct}%`}
        </text>
      </svg>
      <span style={{
        fontSize: 11, fontWeight: isActiveTab ? 600 : 500,
        color: isActiveTab ? 'var(--ni-teal)' : 'var(--text-secondary)',
        letterSpacing: '0.01em',
      }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: pct === 0 ? 'var(--text-muted)' : fillColor, fontWeight: 500 }}>
        {tierLabel}
      </span>
    </button>
  );
}

export default function PlanningTab({ openCommentCount, progressData = { planning: 0, fieldwork: 0, reporting: 0 }, onTabChange }) {
  const [activeSection, setActiveSection] = useState('details');
  const signOff = SIGN_OFFS.find(s => s.tab === 'Planning');
  const topRef = useRef(null);

  // Ref counters - separate from array length so deletion doesn't corrupt refs
  const [stepCounter, setStepCounter]  = useState(AUDIT_PROGRAMME.length + 1);
  const [riskCounter, setRiskCounter]  = useState(RACM_RISKS.length + 1);
  const [ctrlCounter, setCtrlCounter]  = useState(
    RACM_RISKS.reduce((sum, r) => sum + r.controls.length, 0) + 1
  );

  // auditState will be lifted here when Supabase is introduced in Phase 1.
  // All tab components (PlanningTab, FieldworkTab, ReportingTab) should read
  // from and write to a single auditState object managed at App level.

  function handleProgressCircleClick(tabId) {
    if (tabId === 'planning') {
      // Scroll to top of Planning content
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (onTabChange) {
      onTabChange(tabId);
    }
  }

  const sections = [
    { id: 'details',   label: 'Audit Details' },
    { id: 'tor',       label: 'Terms of Reference' },
    { id: 'programme', label: 'Audit Programme' },
    { id: 'racm',      label: 'RACM' },
    { id: 'signoff',   label: 'Sign-off' },
  ];

  return (
    <div ref={topRef} style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Progress circles strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        marginBottom: 20,
        padding: '12px 16px',
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 8 }}>
          Sign-off
        </span>
        <TabProgressCircle
          pct={progressData.planning}  label="Planning"  tabId="planning"
          activeTabId="planning" onClick={() => handleProgressCircleClick('planning')}
        />
        <div style={{ width: 24, height: 1, background: 'var(--border)', margin: '0 2px', alignSelf: 'center', marginBottom: 22 }} />
        <TabProgressCircle
          pct={progressData.fieldwork} label="Fieldwork" tabId="fieldwork"
          activeTabId="planning" onClick={() => handleProgressCircleClick('fieldwork')}
        />
        <div style={{ width: 24, height: 1, background: 'var(--border)', margin: '0 2px', alignSelf: 'center', marginBottom: 22 }} />
        <TabProgressCircle
          pct={progressData.reporting} label="Reporting" tabId="reporting"
          activeTabId="planning" onClick={() => handleProgressCircleClick('reporting')}
        />
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.5 }}>
          <div>33% = Auditor &nbsp;&bull;&nbsp; 67% = Reviewer &nbsp;&bull;&nbsp; 100% = HIA</div>
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
      {activeSection === 'details'   && <AuditDetails audit={SAMPLE_AUDIT} />}
      {activeSection === 'tor'       && <TermsOfReference tor={TERMS_OF_REFERENCE} />}
      {activeSection === 'programme' && (
        <AuditProgramme
          steps={AUDIT_PROGRAMME}
          stepCounter={stepCounter}
          onStepCounterIncrement={() => setStepCounter(c => c + 1)}
        />
      )}
      {activeSection === 'racm' && (
        <RACMSection
          risks={RACM_RISKS}
          riskCounter={riskCounter}
          ctrlCounter={ctrlCounter}
          onRiskCounterIncrement={() => setRiskCounter(c => c + 1)}
          onCtrlCounterIncrement={() => setCtrlCounter(c => c + 1)}
        />
      )}
      {activeSection === 'signoff' && (
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
