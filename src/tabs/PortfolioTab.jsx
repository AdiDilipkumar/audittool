import { useState } from 'react';
import { Card, Badge, SectionHeader, NewAuditModal } from '../components/UI';
import { USERS } from '../data/mockData';

function ProgressCircle({ pct, label, size = 36 }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;
  let fillColor;
  if (pct === 0)        fillColor = 'transparent';
  else if (pct === 33)  fillColor = 'var(--status-amber)';
  else if (pct === 67)  fillColor = 'var(--ni-teal)';
  else                  fillColor = 'var(--status-green)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth={3} />
        {pct > 0 && (
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={fillColor} strokeWidth={3}
            strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round" />
        )}
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}
          fontSize={pct === 100 ? 8 : 9} fontWeight={600}
          fill={pct === 0 ? 'var(--text-muted)' : fillColor}>
          {pct === 0 ? '-' : `${pct}%`}
        </text>
      </svg>
      <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <Card style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </Card>
  );
}

function MiniBarChart({ data, colorFn }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
      {data.map(d => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{d.value}</span>
          <div style={{
            width: '100%',
            height: Math.max((d.value / max) * 44, d.value > 0 ? 4 : 0),
            borderRadius: '3px 3px 0 0',
            background: colorFn ? colorFn(d.label) : 'var(--ni-teal)',
          }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function PortfolioTab({ audits = [], signOffs = [], reviewComments = [], onSelectAudit, onCreateAudit, progressData = {} }) {
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);

  // Derive all issues across all audits from auditDataMap — for now derive from audits' open_issues count
  // Full issues list is available via auditDataMap in App but not passed here to keep props lean.
  // Portfolio-level counts come from the audit objects themselves.
  const allIssues = audits.flatMap(a => {
    // Build minimal issue stubs for the tracker from audit-level counts
    // Real issues are in auditDataMap — full issues tracker can be wired in a later session
    return [];
  });

  const openIssuesTotal = audits.reduce((sum, a) => sum + (a.open_issues || 0), 0);
  const openCommentsTotal = reviewComments.filter(c => c.status === 'Open').length;

  const auditsByStatus = ['Planning', 'Fieldwork', 'Reporting', 'Complete'].map(s => ({
    label: s, value: audits.filter(a => a.status === s).length,
  }));

  const ratingColors  = { 'Very High': 'var(--risk-very-high)', 'High': 'var(--risk-high)', 'Medium': 'var(--risk-medium)', 'Low': 'var(--risk-low)' };
  const statusColors  = { 'Planning': 'var(--status-blue)', 'Fieldwork': 'var(--status-amber)', 'Reporting': 'var(--ni-teal)', 'Complete': 'var(--status-green)' };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <MetricCard label="Active Audits" value={audits.filter(a => a.status !== 'Complete').length} sub={`of ${audits.length} total`} color="var(--ni-teal)" />
        <MetricCard label="Open Issues" value={openIssuesTotal} sub="across all audits" color="var(--status-amber)" />
        <MetricCard label="Overdue Actions" value={0} sub="past due date" color="var(--status-green)" />
        <MetricCard label="Open Review Comments" value={openCommentsTotal} sub="awaiting response" color={openCommentsTotal > 0 ? 'var(--status-amber)' : 'var(--status-green)'} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card style={{ padding: 20 }}>
          <SectionHeader title="Audits by Status" />
          <MiniBarChart data={auditsByStatus} colorFn={l => statusColors[l]} />
        </Card>
        <Card style={{ padding: 20 }}>
          <SectionHeader title="Open Issues by Rating" />
          <MiniBarChart
            data={['Very High','High','Medium','Low'].map(r => ({ label: r, value: 0 }))}
            colorFn={l => ratingColors[l]}
          />
        </Card>
      </div>

      {/* Audit portfolio table */}
      <Card style={{ padding: 20 }}>
        <SectionHeader
          title="Audit Portfolio"
          subtitle={`${audits.length} audit${audits.length !== 1 ? 's' : ''} · click a row to open engagement`}
          action={
            <button
              onClick={() => setShowNewAuditModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                background: 'var(--ni-teal)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              + New Audit
            </button>
          }
        />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-0)' }}>
              {['Audit', 'Entity', 'Type', 'Lead', 'Status', 'Progress', 'Issues', 'Comments'].map(h => (
                <th key={h} style={{
                  padding: '8px 10px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audits.map((audit, i) => {
              const lead = USERS.find(u => u.id === audit.lead_auditor_id);
              const prog = progressData[audit.id] || { planning: 0, fieldwork: 0, reporting: 0 };
              const auditOpenComments = reviewComments.filter(c => c.audit_id === audit.id && c.status === 'Open').length;
              const isLast = i === audits.length - 1;

              return (
                <tr
                  key={audit.id}
                  onClick={() => onSelectAudit && onSelectAudit(audit.id)}
                  style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-0)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--ni-teal)' }}>{audit.title}</span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{audit.entity}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{audit.audit_type}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{lead?.full_name || '-'}</td>
                  <td style={{ padding: '12px 10px' }}><Badge label={audit.status} /></td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <ProgressCircle pct={prog.planning}  label="Plan" />
                      <ProgressCircle pct={prog.fieldwork} label="Field" />
                      <ProgressCircle pct={prog.reporting} label="Report" />
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    {(audit.open_issues || 0) > 0
                      ? <span style={{ color: 'var(--status-amber)', fontWeight: 600 }}>{audit.open_issues}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    {auditOpenComments > 0
                      ? <span style={{ color: 'var(--status-amber)', fontWeight: 600 }}>{auditOpenComments}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress circles:</span>
          {[
            { color: 'var(--status-amber)', label: '33% Auditor signed' },
            { color: 'var(--ni-teal)',      label: '67% Reviewer signed' },
            { color: 'var(--status-green)', label: '100% HIA signed' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* New Audit Modal */}
      {showNewAuditModal && (
        <NewAuditModal
          onClose={() => setShowNewAuditModal(false)}
          onSubmit={(fields) => { onCreateAudit(fields); setShowNewAuditModal(false); }}
        />
      )}
    </div>
  );
}
