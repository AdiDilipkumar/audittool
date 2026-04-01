import { useState } from 'react';
import { Card, SectionHeader, Field } from '../components/UI';

function fmt(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtShort(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Audit Metadata ────────────────────────────────────────────────────────────
function AuditMetadata({ audit, users = [] }) {
  if (!audit) return null;

  function getUserName(id) {
    return users.find(u => u.id === id)?.full_name || '-';
  }

  const teamIds = [audit.lead_auditor_id, audit.reviewer_id, audit.auditor_id, audit.it_auditor_id].filter(Boolean);
  const uniqueTeamIds = [...new Set(teamIds)];
  const team = uniqueTeamIds.map(id => getUserName(id)).join(', ');

  return (
    <Card style={{ padding: 20, marginBottom: 16 }}>
      <SectionHeader title="Audit Details" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <Field label="Audit Title"              value={audit.title || ''} />
        <Field label="Entity / Business Unit"   value={audit.entity || ''} />
        <Field label="Audit Type"               value={audit.audit_type || ''} />
        <Field label="Period Under Review"       value={audit.period_under_review || ''} />
        <Field label="Planned Start"             value={fmt(audit.planned_start)} />
        <Field label="Planned End"               value={fmt(audit.planned_end)} />
        <Field label="Audit Lead"                value={getUserName(audit.lead_auditor_id)} />
        <Field label="Reviewer"                  value={getUserName(audit.reviewer_id)} />
        {audit.auditor_id    && <Field label="Auditor"     value={getUserName(audit.auditor_id)} />}
        {audit.it_auditor_id && <Field label="IT Auditor"  value={getUserName(audit.it_auditor_id)} />}
        {team && <Field label="Engagement Team" value={team} />}
      </div>
    </Card>
  );
}

// ── Budget ─────────────────────────────────────────────────────────────────────
function BudgetTable({ budget, users = [], onUpdateAuditData }) {
  const [rows, setRows] = useState(budget?.rows || []);
  const budgetWeeks = budget?.budget_weeks || 0;

  if (!budget || rows.length === 0) {
    return (
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <SectionHeader title="Budget" subtitle="No budget data yet" />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Budget will be configured during planning setup.</p>
      </Card>
    );
  }

  const totals = rows.reduce(
    (acc, r) => ({
      planning:  acc.planning  + (r.planning  || 0),
      fieldwork: acc.fieldwork + (r.fieldwork || 0),
      reporting: acc.reporting + (r.reporting || 0),
    }),
    { planning: 0, fieldwork: 0, reporting: 0 }
  );
  const grandTotal = totals.planning + totals.fieldwork + totals.reporting;

  const thStyle = { padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' };
  const numTh = { ...thStyle, textAlign: 'right' };
  const td = (right = false) => ({ padding: '10px 10px', fontSize: 13, color: 'var(--text-secondary)', textAlign: right ? 'right' : 'left', borderBottom: '1px solid var(--border)', fontFamily: right ? 'var(--font-mono)' : 'var(--font-sans)' });

  return (
    <Card style={{ padding: 20, marginBottom: 16 }}>
      <SectionHeader title="Budget" subtitle={`${budgetWeeks} weeks planned`} />
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
            const sub = (row.planning || 0) + (row.fieldwork || 0) + (row.reporting || 0);
            return (
              <tr key={row.id}>
                <td style={td()}>{row.role}</td>
                <td style={td()}>{user?.full_name || '-'}</td>
                <td style={td(true)}>{row.planning}</td>
                <td style={td(true)}>{row.fieldwork}</td>
                <td style={td(true)}>{row.reporting}</td>
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

// ── Timeline ───────────────────────────────────────────────────────────────────
function Timeline({ timeline }) {
  const milestones = timeline || [];
  const today = new Date();

  if (milestones.length === 0) {
    return (
      <Card style={{ padding: 20 }}>
        <SectionHeader title="Key Deliverables Timeline" subtitle="No milestones configured yet" />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Timeline milestones will appear here once configured.</p>
      </Card>
    );
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
            const mDate = new Date(m.planned_date);
            const isPast = mDate < today;
            const isToday = mDate.toDateString() === today.toDateString();
            const statusLabel = isPast ? 'Past' : isToday ? 'Today' : 'Upcoming';
            const statusColor = isPast ? 'var(--status-green)' : isToday ? 'var(--ni-teal)' : 'var(--text-muted)';
            const isLast = i === milestones.length - 1;
            return (
              <tr key={m.id || i} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                <td style={{ padding: '10px 10px', lineHeight: 1.4 }}>{m.activity}</td>
                <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{fmtShort(m.planned_date)}</td>
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

// ── Export ─────────────────────────────────────────────────────────────────────
export default function PlanningAuditDetails({ audit, auditData, users = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <AuditMetadata audit={audit} users={users} />
      <BudgetTable budget={auditData?.budget} users={users} />
      <Timeline timeline={Array.isArray(auditData?.timeline) ? auditData.timeline : []} />
    </div>
  );
}
