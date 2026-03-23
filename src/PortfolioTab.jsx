import { useState } from 'react';
import { Card, Badge, SectionHeader } from '../components/UI';
import { ALL_AUDITS, ISSUES, REVIEW_COMMENTS, USERS } from '../data/mockData';

function MetricCard({ label, value, sub, color }) {
  return (
    <Card style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
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
            width: '100%', height: Math.max((d.value / max) * 44, d.value > 0 ? 4 : 0),
            borderRadius: '3px 3px 0 0',
            background: colorFn ? colorFn(d.label) : 'var(--ni-teal)',
          }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function PortfolioTab() {
  const allIssues = ISSUES;
  const allComments = REVIEW_COMMENTS;

  const auditsByStatus = ['Planning', 'Fieldwork', 'Reporting', 'Complete'].map(s => ({
    label: s, value: ALL_AUDITS.filter(a => a.status === s).length,
  }));

  const issuesByRating = ['Very High', 'High', 'Medium', 'Low'].map(r => ({
    label: r, value: allIssues.filter(i => i.risk_rating === r).length,
  }));

  const ratingColors = { 'Very High': 'var(--risk-very-high)', 'High': 'var(--risk-high)', 'Medium': 'var(--risk-medium)', 'Low': 'var(--risk-low)' };
  const statusColors = { 'Planning': 'var(--status-blue)', 'Fieldwork': 'var(--status-amber)', 'Reporting': 'var(--ni-teal)', 'Complete': 'var(--status-green)' };

  const overdueIssues = allIssues.filter(i => i.due_date && new Date(i.due_date) < new Date() && i.status !== 'Agreed');
  const openComments = allComments.filter(c => c.status === 'Open').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <MetricCard label="Active Audits" value={ALL_AUDITS.filter(a => a.status !== 'Complete').length} sub={`of ${ALL_AUDITS.length} total`} color="var(--ni-teal)" />
        <MetricCard label="Open Issues" value={allIssues.filter(i => i.status !== 'Agreed').length} sub="across all audits" color="var(--status-amber)" />
        <MetricCard label="Overdue Actions" value={overdueIssues.length} sub="past due date" color={overdueIssues.length > 0 ? 'var(--status-red)' : 'var(--status-green)'} />
        <MetricCard label="Open Review Comments" value={openComments} sub="awaiting response" color={openComments > 0 ? 'var(--status-amber)' : 'var(--status-green)'} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card style={{ padding: 20 }}>
          <SectionHeader title="Audits by Status" />
          <MiniBarChart data={auditsByStatus} colorFn={l => statusColors[l]} />
        </Card>
        <Card style={{ padding: 20 }}>
          <SectionHeader title="Open Issues by Rating" />
          <MiniBarChart data={issuesByRating} colorFn={l => ratingColors[l]} />
        </Card>
      </div>

      {/* Audit portfolio table */}
      <Card style={{ padding: 20 }}>
        <SectionHeader title="Audit Portfolio" subtitle={`${ALL_AUDITS.length} audits · FY2026`} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-0)' }}>
              {['Audit', 'Entity', 'Type', 'Lead', 'Status', 'P', 'F', 'R', 'Issues', 'Comments'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_AUDITS.map((audit, i) => {
              const lead = USERS.find(u => u.id === audit.lead_auditor_id);
              const tick = signed => (
                <span style={{ color: signed ? 'var(--status-green)' : 'var(--text-muted)', fontSize: 14 }}>
                  {signed ? '✓' : '○'}
                </span>
              );
              return (
                <tr key={audit.id} style={{ borderBottom: i < ALL_AUDITS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{audit.title}</span>
                  </td>
                  <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{audit.entity}</td>
                  <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{audit.audit_type}</td>
                  <td style={{ padding: '10px 10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{lead?.full_name || '-'}</td>
                  <td style={{ padding: '10px 10px' }}><Badge label={audit.status} /></td>
                  <td style={{ padding: '10px 10px', textAlign: 'center' }}>{tick(audit.planning_signed)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'center' }}>{tick(audit.fieldwork_signed)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'center' }}>{tick(audit.reporting_signed)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                    {audit.open_issues > 0 ? (
                      <span style={{ color: 'var(--status-amber)', fontWeight: 600 }}>{audit.open_issues}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                    {audit.open_review_comments > 0 ? (
                      <span style={{ color: 'var(--status-amber)', fontWeight: 600 }}>{audit.open_review_comments}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Issues tracker */}
      <Card style={{ padding: 20 }}>
        <SectionHeader title="Issues Tracker" subtitle="All open issues across portfolio" />
        {allIssues.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No open issues.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-0)' }}>
                {['Ref', 'Title', 'Audit', 'Rating', 'Owner', 'Due Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allIssues.map((issue, i) => {
                const audit = ALL_AUDITS.find(a => a.id === issue.audit_id);
                const isOverdue = issue.due_date && new Date(issue.due_date) < new Date();
                return (
                  <tr key={issue.id} style={{ borderBottom: i < allIssues.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ni-teal)' }}>{issue.issue_ref}</td>
                    <td style={{ padding: '10px 10px', fontWeight: 500 }}>{issue.title}</td>
                    <td style={{ padding: '10px 10px', color: 'var(--text-secondary)', fontSize: 12 }}>{audit?.entity}</td>
                    <td style={{ padding: '10px 10px' }}><Badge label={issue.risk_rating} type="risk" /></td>
                    <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{issue.action_owner || '-'}</td>
                    <td style={{ padding: '10px 10px', color: isOverdue ? 'var(--status-red)' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
                      {issue.due_date ? new Date(issue.due_date).toLocaleDateString('en-GB') : '-'}
                      {isOverdue && ' ⚠'}
                    </td>
                    <td style={{ padding: '10px 10px' }}><Badge label={issue.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
