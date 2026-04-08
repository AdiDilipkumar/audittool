import { useState, useEffect } from 'react';
import { Card, SectionHeader } from '../components/UI';

const AUDIT_TYPE_OPTIONS = ['Assurance', 'Advisory', 'Follow-up', 'Thematic', 'Regulatory'];

function fmt(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtShort(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const inputStyle = {
  width: '100%', padding: '7px 10px', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)',
  background: 'var(--surface-0)', color: 'var(--text-primary)', outline: 'none',
  boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
};

function EditField({ label, value, onChange, type = 'text', options = null, readOnly = false }) {
  if (readOnly) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>{label}</label>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', padding: '7px 0' }}>{value || '-'}</div>
      </div>
    );
  }
  if (options) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>{label}</label>
        <select style={inputStyle} value={value || ''} onChange={e => onChange(e.target.value)}>
          <option value="">-- Select --</option>
          {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} style={inputStyle} value={value || ''} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

// Audit Metadata
function AuditMetadata({ audit, users = [], canEdit, onUpdateAudit }) {
  if (!audit) return null;

  const [form, setForm] = useState({
    title:               audit.title               || '',
    entity:              audit.entity              || '',
    audit_type:          audit.audit_type          || 'Assurance',
    period_under_review: audit.period_under_review || '',
    planned_start:       audit.planned_start       || '',
    planned_end:         audit.planned_end         || '',
    lead_auditor_id:     audit.lead_auditor_id     || '',
    reviewer_id:         audit.reviewer_id         || '',
    auditor_id:          audit.auditor_id          || '',
    it_auditor_id:       audit.it_auditor_id       || '',
  });

  useEffect(() => {
    setForm({
      title:               audit.title               || '',
      entity:              audit.entity              || '',
      audit_type:          audit.audit_type          || 'Assurance',
      period_under_review: audit.period_under_review || '',
      planned_start:       audit.planned_start       || '',
      planned_end:         audit.planned_end         || '',
      lead_auditor_id:     audit.lead_auditor_id     || '',
      reviewer_id:         audit.reviewer_id         || '',
      auditor_id:          audit.auditor_id          || '',
      it_auditor_id:       audit.it_auditor_id       || '',
    });
  }, [audit.id]);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    onUpdateAudit?.(field, value);
  }

  function getUserName(id) {
    return users.find(u => u.id === id)?.full_name || '-';
  }

  const assignableUsers = users.filter(u => u.role !== 'HIA');
  const userOptions     = assignableUsers.map(u => ({ value: u.id, label: u.full_name }));
  const userOptBlank    = [{ value: '', label: '-- None --' }, ...userOptions];

  return (
    <Card style={{ padding: 20, marginBottom: 16 }}>
      <SectionHeader
        title="Audit Details"
        subtitle={canEdit ? 'Edit enabled - changes save immediately' : 'Read-only - Audit Lead or HIA can edit'}
      />
      {canEdit && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--ni-teal-dim)', border: '1px solid rgba(0,167,157,0.2)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--ni-teal)' }}>
          Changes save immediately to the database.
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <EditField label="Audit Title"            value={form.title}               onChange={v => handleChange('title', v)}               readOnly={!canEdit} />
        <EditField label="Entity / Business Unit" value={form.entity}              onChange={v => handleChange('entity', v)}              readOnly={!canEdit} />
        <EditField label="Audit Type"             value={form.audit_type}          onChange={v => handleChange('audit_type', v)}          readOnly={!canEdit} options={canEdit ? AUDIT_TYPE_OPTIONS : null} />
        <EditField label="Period Under Review"    value={form.period_under_review} onChange={v => handleChange('period_under_review', v)} readOnly={!canEdit} />
        <EditField label="Planned Start" type="date"
          value={canEdit ? form.planned_start : fmt(form.planned_start)}
          onChange={v => handleChange('planned_start', v)} readOnly={!canEdit} />
        <EditField label="Planned End" type="date"
          value={canEdit ? form.planned_end : fmt(form.planned_end)}
          onChange={v => handleChange('planned_end', v)} readOnly={!canEdit} />
        <EditField label="Audit Lead"
          value={canEdit ? form.lead_auditor_id : getUserName(form.lead_auditor_id)}
          onChange={v => handleChange('lead_auditor_id', v)}
          readOnly={!canEdit} options={canEdit ? userOptions : null} />
        <EditField label="Reviewer"
          value={canEdit ? form.reviewer_id : getUserName(form.reviewer_id)}
          onChange={v => handleChange('reviewer_id', v)}
          readOnly={!canEdit} options={canEdit ? userOptBlank : null} />
        <EditField label="Auditor"
          value={canEdit ? form.auditor_id : getUserName(form.auditor_id)}
          onChange={v => handleChange('auditor_id', v)}
          readOnly={!canEdit} options={canEdit ? userOptBlank : null} />
        <EditField label="IT Auditor"
          value={canEdit ? form.it_auditor_id : getUserName(form.it_auditor_id)}
          onChange={v => handleChange('it_auditor_id', v)}
          readOnly={!canEdit} options={canEdit ? userOptBlank : null} />
      </div>
    </Card>
  );
}

// Budget
function BudgetTable({ budget, users = [], canEdit, onUpdateAuditData }) {
  const [rows, setRows]               = useState(budget?.rows || []);
  const [budgetWeeks, setBudgetWeeks] = useState(budget?.budget_weeks || 0);

  useEffect(() => {
    setRows(budget?.rows || []);
    setBudgetWeeks(budget?.budget_weeks || 0);
  }, [budget]);

  if (!budget || rows.length === 0) {
    return (
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <SectionHeader title="Budget" subtitle="No budget data yet" />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Budget will be configured during planning setup.</p>
      </Card>
    );
  }

  function updateRow(rowId, field, value) {
    const updated = rows.map(r => r.id === rowId ? { ...r, [field]: Number(value) || 0 } : r);
    setRows(updated);
    onUpdateAuditData?.('budget', { rows: updated, budget_weeks: budgetWeeks });
  }

  function updateWeeks(val) {
    const w = Number(val) || 0;
    setBudgetWeeks(w);
    onUpdateAuditData?.('budget', { rows, budget_weeks: w });
  }

  const totals = rows.reduce(
    (acc, r) => ({ planning: acc.planning + (r.planning || 0), fieldwork: acc.fieldwork + (r.fieldwork || 0), reporting: acc.reporting + (r.reporting || 0) }),
    { planning: 0, fieldwork: 0, reporting: 0 }
  );
  const grandTotal = totals.planning + totals.fieldwork + totals.reporting;

  const thStyle  = { padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' };
  const numTh    = { ...thStyle, textAlign: 'right' };
  const td       = (right = false) => ({ padding: '8px 10px', fontSize: 13, color: 'var(--text-secondary)', textAlign: right ? 'right' : 'left', borderBottom: '1px solid var(--border)', fontFamily: right ? 'var(--font-mono)' : 'var(--font-sans)' });
  const numInput = { width: '100%', padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--font-mono)', textAlign: 'right', background: 'var(--surface-0)', outline: 'none' };

  return (
    <Card style={{ padding: 20, marginBottom: 16 }}>
      <SectionHeader title="Budget"
        subtitle={
          canEdit ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              Budget weeks:
              <input type="number" min="0" value={budgetWeeks} onChange={e => updateWeeks(e.target.value)}
                style={{ ...numInput, width: 52 }} />
            </span>
          ) : `${budgetWeeks} weeks planned`
        }
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--surface-0)' }}>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Name</th>
            <th style={numTh}>Planning (h)</th>
            <th style={numTh}>Fieldwork (h)</th>
            <th style={numTh}>Reporting (h)</th>
            <th style={numTh}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const user = users.find(u => u.id === row.user_id);
            const sub  = (row.planning || 0) + (row.fieldwork || 0) + (row.reporting || 0);
            return (
              <tr key={row.id}>
                <td style={td()}>{row.role}</td>
                <td style={td()}>{user?.full_name || '-'}</td>
                {canEdit ? (
                  <>
                    <td style={td(true)}><input type="number" min="0" value={row.planning  || 0} onChange={e => updateRow(row.id, 'planning',  e.target.value)} style={numInput} /></td>
                    <td style={td(true)}><input type="number" min="0" value={row.fieldwork || 0} onChange={e => updateRow(row.id, 'fieldwork', e.target.value)} style={numInput} /></td>
                    <td style={td(true)}><input type="number" min="0" value={row.reporting || 0} onChange={e => updateRow(row.id, 'reporting', e.target.value)} style={numInput} /></td>
                  </>
                ) : (
                  <>
                    <td style={td(true)}>{row.planning}</td>
                    <td style={td(true)}>{row.fieldwork}</td>
                    <td style={td(true)}>{row.reporting}</td>
                  </>
                )}
                <td style={{ ...td(true), fontWeight: 600, color: 'var(--text-primary)' }}>{sub}</td>
              </tr>
            );
          })}
          <tr style={{ background: 'var(--surface-0)' }}>
            <td colSpan={2} style={{ ...td(), fontWeight: 700, color: 'var(--text-primary)', borderBottom: 'none' }}>Total</td>
            <td style={{ ...td(true), fontWeight: 700, color: 'var(--text-primary)', borderBottom: 'none' }}>{totals.planning}</td>
            <td style={{ ...td(true), fontWeight: 700, color: 'var(--text-primary)', borderBottom: 'none' }}>{totals.fieldwork}</td>
            <td style={{ ...td(true), fontWeight: 700, color: 'var(--text-primary)', borderBottom: 'none' }}>{totals.reporting}</td>
            <td style={{ ...td(true), fontWeight: 700, color: 'var(--ni-teal)', borderBottom: 'none', fontSize: 14 }}>{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

// Timeline
function Timeline({ timeline, canEdit, onUpdateAuditData }) {
  const [milestones, setMilestones] = useState(timeline || []);
  const today = new Date();

  useEffect(() => { setMilestones(timeline || []); }, [timeline]);

  if (milestones.length === 0) {
    return (
      <Card style={{ padding: 20 }}>
        <SectionHeader title="Key Deliverables Timeline" subtitle="No milestones configured yet" />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Timeline milestones will appear here once configured.</p>
      </Card>
    );
  }

  function updateMilestone(id, field, value) {
    const updated = milestones.map(m => m.id === id ? { ...m, [field]: value } : m);
    setMilestones(updated);
    onUpdateAuditData?.('timeline', updated);
  }

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader title="Key Deliverables Timeline" />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--surface-0)' }}>
            {['Activity', 'Planned Date', 'Status'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {milestones.map((m, i) => {
            const mDate       = new Date(m.planned_date);
            const isPast      = mDate < today;
            const isToday     = mDate.toDateString() === today.toDateString();
            const statusLabel = isPast ? 'Past' : isToday ? 'Today' : 'Upcoming';
            const statusColor = isPast ? 'var(--status-green)' : isToday ? 'var(--ni-teal)' : 'var(--text-muted)';
            const isLast      = i === milestones.length - 1;
            return (
              <tr key={m.id || i} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                <td style={{ padding: '10px 10px', lineHeight: 1.4 }}>
                  {canEdit
                    ? <input style={{ ...inputStyle, padding: '4px 8px' }} value={m.activity || ''} onChange={e => updateMilestone(m.id, 'activity', e.target.value)} />
                    : m.activity}
                </td>
                <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                  {canEdit
                    ? <input type="date" style={{ ...inputStyle, width: 'auto', padding: '4px 8px', fontSize: 12 }} value={m.planned_date || ''} onChange={e => updateMilestone(m.id, 'planned_date', e.target.value)} />
                    : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{fmtShort(m.planned_date)}</span>}
                </td>
                <td style={{ padding: '10px 10px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, background: isPast ? 'rgba(34,197,94,0.08)' : isToday ? 'var(--ni-teal-dim)' : 'transparent', padding: isPast || isToday ? '2px 8px' : '0', borderRadius: 'var(--radius-sm)' }}>
                    {statusLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

// Export
export default function PlanningAuditDetails({ audit, auditData, users = [], currentUser, onUpdateAudit, onUpdateAuditData }) {
  const isLead  = currentUser?.id === audit?.lead_auditor_id;
  const isHIA   = currentUser?.role === 'HIA';
  const canEdit = isLead || isHIA;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <AuditMetadata audit={audit} users={users} canEdit={canEdit} onUpdateAudit={onUpdateAudit} />
      <BudgetTable   budget={auditData?.budget} users={users} canEdit={canEdit} onUpdateAuditData={onUpdateAuditData} />
      <Timeline      timeline={Array.isArray(auditData?.timeline) ? auditData.timeline : []} canEdit={canEdit} onUpdateAuditData={onUpdateAuditData} />
    </div>
  );
}
