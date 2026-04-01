import { useState } from 'react';
import { Card, SectionHeader, Badge, Button, EmptyState, SignOffBar, Modal, Field } from '../components/UI';

// ── Working Papers ────────────────────────────────────────────────────────────
function WorkingPapers({ papers = [], users = [], currentUser, onCreateWorkingPaper, onUpdateWorkingPaper, signOff, onSignOff }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle]         = useState('');
  const [url, setUrl]             = useState('');

  function handleSave() {
    if (!title.trim()) return;
    onCreateWorkingPaper({ title: title.trim(), sharepoint_url: url.trim() });
    setTitle('');
    setUrl('');
    setShowModal(false);
  }

  function getUserName(id) {
    return users.find(u => u.id === id)?.full_name || '-';
  }

  return (
    <>
      <Card style={{ padding: 20 }}>
        <SectionHeader
          title="Working Papers"
          subtitle={`${papers.length} paper${papers.length !== 1 ? 's' : ''} - ${papers.filter(p => p.status === 'Final').length} final`}
          action={<Button variant="secondary" size="sm" onClick={() => setShowModal(true)}>+ Add Paper</Button>}
        />

        {papers.length === 0 ? (
          <EmptyState icon="o" title="No working papers yet" description="Add working papers to document your fieldwork evidence." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Title', 'Prepared By', 'Status', 'SharePoint'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', background: 'var(--surface-0)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {papers.map((wp, i) => (
                <tr key={wp.id} style={{ borderBottom: i < papers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '10px 10px', fontWeight: 500 }}>{wp.title}</td>
                  <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{getUserName(wp.created_by)}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <select
                      value={wp.status}
                      onChange={e => onUpdateWorkingPaper(wp.id, { status: e.target.value })}
                      style={{ fontSize: 12, padding: '3px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-0)', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                    >
                      {['Draft', 'In Progress', 'Final'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    {wp.sharepoint_url
                      ? <a href={wp.sharepoint_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--ni-teal)', textDecoration: 'underline' }}>Open</a>
                      : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <Modal title="Add Working Paper" onClose={() => setShowModal(false)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Title *" value={title} onChange={setTitle} hint="e.g. WP01 - Process Walkthrough" />
            <Field label="SharePoint URL" value={url} onChange={setUrl} hint="Paste the SharePoint link to the working paper file" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" disabled={!title.trim()} onClick={handleSave}>Add Paper</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Query Log ─────────────────────────────────────────────────────────────────
function QueryLog({ queries = [], users = [], currentUser, auditId, onCreateQuery, onUpdateQuery, onPromoteToIssue }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [showResolveId, setShowResolveId] = useState(null);
  const [title, setTitle]           = useState('');
  const [detail, setDetail]         = useState('');
  const [directedTo, setDirectedTo] = useState('');
  const [rationale, setRationale]   = useState('');

  function getUserName(id) {
    return users.find(u => u.id === id)?.full_name || '-';
  }

  function handleRaiseQuery() {
    if (!title.trim() || !detail.trim()) return;
    onCreateQuery({
      audit_id: auditId,
      title: title.trim(),
      description: detail.trim(),
      directed_to: directedTo.trim(),
    });
    setTitle(''); setDetail(''); setDirectedTo('');
    setShowModal(false);
  }

  function handleResolve() {
    if (!rationale.trim()) return;
    onUpdateQuery(showResolveId, { status: 'Resolved', resolved_rationale: rationale.trim() });
    setRationale('');
    setShowResolveId(null);
  }

  function handlePromote(query) {
    onPromoteToIssue && onPromoteToIssue(query);
  }

  const openCount = queries.filter(q => q.status === 'Open').length;

  return (
    <>
      <Card style={{ padding: 20 }}>
        <SectionHeader
          title="Query Log"
          subtitle={`${queries.length} quer${queries.length !== 1 ? 'ies' : 'y'} - ${openCount} open`}
          action={<Button variant="secondary" size="sm" onClick={() => setShowModal(true)}>+ Raise Query</Button>}
        />

        {queries.length === 0 ? (
          <EmptyState icon="?" title="No queries raised" description="Raise queries to request information or evidence from the auditee." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {queries.map(q => {
              const isExpanded = expandedId === q.id;
              return (
                <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', background: 'var(--surface-0)' }}
                  >
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)', width: 52, flexShrink: 0 }}>
                      {q.query_ref}
                    </span>
                    <p style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{q.title || q.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.directed_to}</span>
                      <Badge label={q.status} />
                      <span style={{ color: 'var(--text-muted)' }}>{isExpanded ? '-' : '+'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Query Detail</label>
                        <p style={{ fontSize: 13, lineHeight: 1.6 }}>{q.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>Raised by <strong>{getUserName(q.raised_by)}</strong> on {q.raised_date ? new Date(q.raised_date).toLocaleDateString('en-GB') : '-'}</span>
                        {q.directed_to && <span>Directed to <strong>{q.directed_to}</strong></span>}
                      </div>

                      {q.response ? (
                        <div style={{ background: 'var(--status-green-bg)', border: '1px solid var(--status-green-border)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 12 }}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                            Auditee Response{q.response_date ? ` - ${new Date(q.response_date).toLocaleDateString('en-GB')}` : ''}
                          </label>
                          <p style={{ fontSize: 13, lineHeight: 1.6 }}>{q.response}</p>
                        </div>
                      ) : (
                        <div style={{ background: 'var(--status-amber-bg)', borderRadius: 'var(--radius-md)', padding: 10, marginBottom: 12, fontSize: 12, color: 'var(--status-amber)' }}>
                          Awaiting auditee response
                        </div>
                      )}

                      {q.resolved_rationale && (
                        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 10, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                          <strong>Resolution rationale:</strong> {q.resolved_rationale}
                        </div>
                      )}

                      {q.promoted_to_issue_id && (
                        <div style={{ fontSize: 12, color: 'var(--status-blue)', background: 'var(--status-blue-bg)', border: '1px solid var(--status-blue-border)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', display: 'inline-block', marginBottom: 8 }}>
                          Promoted to issue
                        </div>
                      )}

                      {q.status === 'Open' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <Button variant="secondary" size="sm" onClick={() => setShowResolveId(q.id)}>Resolve</Button>
                          <Button variant="secondary" size="sm" onClick={() => handlePromote(q)}>Promote to Issue</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Raise Query Modal */}
      {showModal && (
        <Modal title="Raise Query" onClose={() => setShowModal(false)} width={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Query Title *" value={title} onChange={setTitle} />
            <Field label="Query Detail *" value={detail} onChange={setDetail} multiline rows={4} hint="Be specific about what evidence or information is being requested." />
            <Field label="Directed To" value={directedTo} onChange={setDirectedTo} hint="Auditee contact name (optional)" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" disabled={!title.trim() || !detail.trim()} onClick={handleRaiseQuery}>Raise Query</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Resolve Modal */}
      {showResolveId && (
        <Modal title="Resolve Query" onClose={() => setShowResolveId(null)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Resolution Rationale *" value={rationale} onChange={setRationale} multiline rows={4} hint="Explain why this query is being closed." />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Button variant="ghost" onClick={() => setShowResolveId(null)}>Cancel</Button>
              <Button variant="primary" disabled={!rationale.trim()} onClick={handleResolve}>Mark Resolved</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Fieldwork Tab ─────────────────────────────────────────────────────────────
export default function FieldworkTab({
  audit, auditData, currentUser, users = [],
  onCreateQuery, onUpdateQuery,
  onCreateWorkingPaper, onUpdateWorkingPaper,
  onSignOff, signOffs = [],
  openCommentCount,
  onPromoteToIssue,
}) {
  const [activeSection, setActiveSection] = useState('papers');

  const papers  = auditData?.workingPapers || [];
  const queries = auditData?.queries || [];

  const signOff = signOffs.find(s => s.tab === 'Fieldwork') || null;

  const allPapersFinal = papers.length > 0 && papers.every(p => p.status === 'Final');
  const noOpenQueries  = queries.every(q => q.status !== 'Open');
  const canSignOff     = allPapersFinal && noOpenQueries;

  const sections = [
    { id: 'papers',  label: 'Working Papers' },
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

      {activeSection === 'papers' && (
        <WorkingPapers
          papers={papers} users={users} currentUser={currentUser}
          onCreateWorkingPaper={onCreateWorkingPaper}
          onUpdateWorkingPaper={onUpdateWorkingPaper}
        />
      )}

      {activeSection === 'queries' && (
        <QueryLog
          queries={queries} users={users} currentUser={currentUser}
          auditId={audit?.id}
          onCreateQuery={onCreateQuery}
          onUpdateQuery={onUpdateQuery}
          onPromoteToIssue={onPromoteToIssue}
        />
      )}

      {activeSection === 'signoff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!canSignOff && (
            <div style={{ padding: '12px 16px', background: 'var(--status-amber-bg)', border: '1px solid var(--status-amber-border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--status-amber)' }}>
              Sign-off is available once all working papers are marked Final and there are no open queries.
              {!allPapersFinal && <span> ({papers.filter(p => p.status !== 'Final').length} paper{papers.filter(p => p.status !== 'Final').length !== 1 ? 's' : ''} not final.)</span>}
              {!noOpenQueries && <span> ({queries.filter(q => q.status === 'Open').length} open {queries.filter(q => q.status === 'Open').length !== 1 ? 'queries' : 'query'}.)</span>}
            </div>
          )}
          {signOff && (
            <SignOffBar
              signOff={signOff}
              currentUser={currentUser}
              onSign={canSignOff ? (role) => onSignOff(signOff.id, role) : null}
            />
          )}
        </div>
      )}
    </div>
  );
}
