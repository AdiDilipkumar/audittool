import { useState } from 'react';
import { Card, SectionHeader, Badge, Button, Field, EmptyState, SignOffBar } from '../components/UI';
import { QUERY_LOG, ISSUES, USERS } from '../data/mockData';

// ── Working Papers ────────────────────────────────────────────────────────────
const MOCK_WORKING_PAPERS = [
  {
    id: 'wp-001', audit_id: 'audit-001',
    title: 'WP01 - ThinkFolio to CRIMS Data Flow Walkthrough',
    prepared_by: 'u-003', reviewed_by: 'u-002',
    status: 'Final', sharepoint_url: '#', notes: 'Process confirmed with Marcus Webb and Tom Griggs on 30 Jan 2026.',
  },
  {
    id: 'wp-002', audit_id: 'audit-001',
    title: 'WP02 - Daily Reconciliation Control Testing',
    prepared_by: 'u-003', reviewed_by: 'u-002',
    status: 'Final', sharepoint_url: '#', notes: 'Sample of 25 reconciliation runs. 3 exceptions identified - see Q-001 and ISSUE-001.',
  },
  {
    id: 'wp-003', audit_id: 'audit-001',
    title: 'WP03 - Access Controls Testing',
    prepared_by: 'u-004', reviewed_by: null,
    status: 'Draft', sharepoint_url: '#', notes: 'In progress. Awaiting Q4 recertification evidence from auditee (see Q-002).',
  },
];

function WorkingPapers() {
  const [papers] = useState(MOCK_WORKING_PAPERS);

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Working Papers"
        subtitle={`${papers.length} papers · ${papers.filter(p => p.status === 'Final').length} final`}
        action={<Button variant="secondary" size="sm">+ Add Paper</Button>}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Title', 'Prepared By', 'Reviewed By', 'Status', 'SharePoint'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', background: 'var(--surface-0)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {papers.map((wp, i) => {
            const preparedBy = USERS.find(u => u.id === wp.prepared_by);
            const reviewedBy = USERS.find(u => u.id === wp.reviewed_by);
            return (
              <tr key={wp.id} style={{ borderBottom: i < papers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '10px 10px' }}>
                  <div style={{ fontWeight: 500 }}>{wp.title}</div>
                  {wp.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{wp.notes}</div>}
                </td>
                <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{preparedBy?.full_name || '-'}</td>
                <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{reviewedBy?.full_name || '-'}</td>
                <td style={{ padding: '10px 10px' }}><Badge label={wp.status} /></td>
                <td style={{ padding: '10px 10px' }}>
                  <a href={wp.sharepoint_url} style={{ fontSize: 12, color: 'var(--ni-teal)', textDecoration: 'underline' }}>
                    Open
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

// ── Query Log ─────────────────────────────────────────────────────────────────
function QueryLog() {
  const [queries, setQueries] = useState(QUERY_LOG);
  const [expandedId, setExpandedId] = useState(null);

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Query Log"
        subtitle={`${queries.length} queries · ${queries.filter(q => q.status === 'Open').length} open`}
        action={<Button variant="secondary" size="sm">+ Raise Query</Button>}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {queries.map(q => {
          const raisedBy = USERS.find(u => u.id === q.raised_by);
          const isExpanded = expandedId === q.id;
          return (
            <div key={q.id} style={{
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', background: 'var(--surface-0)' }}
              >
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)', width: 44 }}>
                  {q.query_ref}
                </span>
                <p style={{ flex: 1, fontSize: 13, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {q.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.directed_to}</span>
                  <Badge label={q.status} />
                  <span style={{ color: 'var(--text-muted)' }}>{isExpanded ? '−' : '+'}</span>
                </div>
              </div>
              {isExpanded && (
                <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Query</label>
                    <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{q.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Raised by <strong>{raisedBy?.full_name}</strong> on {new Date(q.raised_date).toLocaleDateString('en-GB')}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Directed to <strong>{q.directed_to}</strong>
                    </div>
                  </div>
                  {q.response ? (
                    <div style={{ background: 'var(--status-green-bg)', border: '1px solid var(--status-green-border)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Auditee Response · {q.response_date && new Date(q.response_date).toLocaleDateString('en-GB')}
                      </label>
                      <p style={{ fontSize: 13, lineHeight: 1.6 }}>{q.response}</p>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--status-amber-bg)', borderRadius: 'var(--radius-md)', padding: 10, marginBottom: 12, fontSize: 12, color: 'var(--status-amber)' }}>
                      Awaiting auditee response
                    </div>
                  )}
                  {q.status === 'Promoted' && (
                    <div style={{ fontSize: 12, color: 'var(--status-blue)', background: 'var(--status-blue-bg)', border: '1px solid var(--status-blue-border)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', display: 'inline-block' }}>
                      Promoted to ISSUE-001
                    </div>
                  )}
                  {q.status === 'Open' && q.response && (
                    <Button variant="secondary" size="sm">Promote to Issue</Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Fieldwork Tab ─────────────────────────────────────────────────────────────
export default function FieldworkTab({ openCommentCount }) {
  const [activeSection, setActiveSection] = useState('papers');
  const signOff = null; // Not yet signed off

  const sections = [
    { id: 'papers', label: 'Working Papers' },
    { id: 'queries', label: 'Query Log' },
    { id: 'signoff', label: 'Sign-off' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-md)',
            fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400,
            color: activeSection === s.id ? 'var(--ni-teal)' : 'var(--text-secondary)',
            background: activeSection === s.id ? 'var(--ni-teal-dim)' : 'transparent',
            border: `1px solid ${activeSection === s.id ? 'rgba(0,167,157,0.3)' : 'transparent'}`,
            cursor: 'pointer',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'papers'  && <WorkingPapers />}
      {activeSection === 'queries' && <QueryLog />}
      {activeSection === 'signoff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 16px', background: 'var(--status-amber-bg)', border: '1px solid var(--status-amber-border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--status-amber)' }}>
            Fieldwork is in progress. Sign-off is available once all working papers are marked Final and outstanding queries are resolved.
          </div>
          <SignOffBar signOff={{ auditor_id: 'u-003', auditor_signed_at: null, reviewer_id: 'u-002', reviewer_signed_at: null, hia_id: 'u-001', hia_signed_at: null }} />
        </div>
      )}
    </div>
  );
}
