import { useState } from 'react';
import { Card, SectionHeader, Button, EmptyState, SignOffBar, Modal, Field } from '../components/UI';
import PlanningRACM from './PlanningRACM';

// ── Query log (shared by control cards and General Queries) ───────────────────
function QueryLog({ queries = [], users = [], currentUser, auditId, controlRef, phase,
  onCreateQuery, onUpdateQuery, onPromoteToIssue }) {

  const [showModal, setShowModal]         = useState(false);
  const [showResolveId, setShowResolveId] = useState(null);
  const [expandedId, setExpandedId]       = useState(null);
  const [title, setTitle]                 = useState('');
  const [detail, setDetail]               = useState('');
  const [directedTo, setDirectedTo]       = useState('');
  const [rationale, setRationale]         = useState('');

  const scopedQueries = queries.filter(q =>
    controlRef ? q.control_ref === controlRef : (!q.control_ref && q.phase === phase)
  );
  const openCount = scopedQueries.filter(q => q.status === 'Open').length;

  function getUserName(id) { return users.find(u => u.id === id)?.full_name || '-'; }

  function handleRaise() {
    if (!title.trim() || !detail.trim()) return;
    onCreateQuery({ audit_id: auditId, title: title.trim(), description: detail.trim(),
      directed_to: directedTo.trim(), control_ref: controlRef || null, phase });
    setTitle(''); setDetail(''); setDirectedTo(''); setShowModal(false);
  }

  function handleResolve() {
    if (!rationale.trim()) return;
    onUpdateQuery(showResolveId, { status: 'Resolved', resolved_rationale: rationale.trim() });
    setRationale(''); setShowResolveId(null);
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Queries ({scopedQueries.length}{openCount > 0 ? ` - ${openCount} open` : ''})
        </span>
        <Button variant="secondary" size="sm" onClick={() => setShowModal(true)}>+ Raise Query</Button>
      </div>

      {scopedQueries.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No queries raised.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {scopedQueries.map(q => {
            const isExp = expandedId === q.id;
            return (
              <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div onClick={() => setExpandedId(isExp ? null : q.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', background: 'var(--surface-0)' }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)', flexShrink: 0 }}>{q.query_ref}</span>
                  <p style={{ flex: 1, fontSize: 12, fontWeight: 500, margin: 0 }}>{q.title}</p>
                  <Badge label={q.status} />
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{isExp ? '-' : '+'}</span>
                </div>
                {isExp && (
                  <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{q.description}</p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Raised by <strong>{getUserName(q.raised_by)}</strong>
                      {q.directed_to && <> - Directed to <strong>{q.directed_to}</strong></>}
                    </div>
                    {q.response && (
                      <div style={{ background: 'var(--status-green-bg)', border: '1px solid var(--status-green-border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', marginBottom: 8, fontSize: 12 }}>
                        <strong>Response:</strong> {q.response}
                      </div>
                    )}
                    {q.resolved_rationale && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <strong>Resolution:</strong> {q.resolved_rationale}
                      </div>
                    )}
                    {q.status === 'Open' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <Button variant="secondary" size="sm" onClick={() => setShowResolveId(q.id)}>Resolve</Button>
                        <Button variant="secondary" size="sm" onClick={() => onPromoteToIssue && onPromoteToIssue(q)}>Promote to Issue</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Raise Query" onClose={() => setShowModal(false)} width={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {controlRef && (
              <div style={{ fontSize: 12, color: 'var(--ni-teal)', background: 'var(--ni-teal-dim)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                Linked to control: <strong>{controlRef}</strong>
              </div>
            )}
            <Field label="Query Title *" value={title} onChange={setTitle} />
            <Field label="Query Detail *" value={detail} onChange={setDetail} multiline rows={4} hint="Be specific about what evidence or information is being requested." />
            <Field label="Directed To" value={directedTo} onChange={setDirectedTo} hint="Auditee contact name (optional)" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" disabled={!title.trim() || !detail.trim()} onClick={handleRaise}>Raise Query</Button>
            </div>
          </div>
        </Modal>
      )}

      {showResolveId && (
        <Modal title="Resolve Query" onClose={() => setShowResolveId(null)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Resolution Rationale *" value={rationale} onChange={setRationale} multiline rows={4} />
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

// ── Working Papers list (per-control, inline add + remove) ────────────────────
function WorkingPapersList({ papers = [], onAdd, onRemove }) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle]     = useState('');
  const [url, setUrl]         = useState('');

  function handleAdd() {
    if (!title.trim()) return;
    onAdd({ id: `wp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: title.trim(), sharepoint_url: url.trim() });
    setTitle(''); setUrl(''); setShowAdd(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Working Papers ({papers.length})
        </span>
        <Button variant="secondary" size="sm" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? 'Cancel' : '+ Add'}
        </Button>
      </div>

      {papers.length === 0 && !showAdd && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No working papers attached.</p>
      )}

      {papers.map(wp => (
        <div key={wp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{wp.title}</span>
          {wp.sharepoint_url
            ? <a href={wp.sharepoint_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--ni-teal)', textDecoration: 'underline' }}>Open</a>
            : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No link</span>
          }
          <button onClick={() => onRemove(wp.id)} title="Remove"
            style={{ fontSize: 14, lineHeight: 1, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>
            x
          </button>
        </div>
      ))}

      {showAdd && (
        <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--surface-0)', border: '1px solid var(--ni-teal)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Field label="Title *" value={title} onChange={setTitle} hint="e.g. WP01 - Sample Testing" />
          <Field label="SharePoint URL" value={url} onChange={setUrl} hint="Paste SharePoint link" />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setTitle(''); setUrl(''); }}>Cancel</Button>
            <Button variant="primary" size="sm" disabled={!title.trim()} onClick={handleAdd}>Add</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function computeFieldworkGates(racmRisks, queries) {
  const allControls = (racmRisks || []).flatMap(r => r.controls || []);
  const hasControls = allControls.length > 0;
  const allComplete = hasControls && allControls.every(c => (c.testing_status_fw || 'Not Started') === 'Complete');
  const completeWithWP = hasControls && allControls
    .filter(c => (c.testing_status_fw || 'Not Started') === 'Complete')
    .every(c => (c.working_papers || []).length > 0);
  const noOpenQueries = (queries || []).every(q => q.status !== 'Open');
  return [
    { label: 'All controls must be marked Complete',                        passed: allComplete    },
    { label: 'Each completed control must have at least one working paper', passed: completeWithWP },
    { label: 'No open queries (any phase)',                                 passed: noOpenQueries  },
  ];
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FieldworkTab({
  audit, auditData, currentUser, users = [],
  onCreateQuery, onUpdateQuery,
  onUpdateAuditData,
  onSignOff, onRevokeSignOff, signOffs = [],
  openCommentCount,
  onPromoteToIssue,
  onTabChange,
}) {
  const [activeSection, setActiveSection] = useState('testing');

  const racmRisks = auditData?.racmRisks || auditData?.racm_risks || [];
  const queries   = auditData?.queries   || [];
  const signOff   = signOffs.find(s => s.tab === 'Fieldwork') || null;

  const fieldworkGates = computeFieldworkGates(racmRisks, queries);
  const canSignOff     = fieldworkGates.every(g => g.passed);

  const sections = [
    { id: 'testing', label: 'Audit Testing'  },
    { id: 'general', label: 'General Queries' },
    { id: 'signoff', label: 'Sign-off'        },
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

      {activeSection === 'testing' && (
        <PlanningRACM
          auditData={auditData}
          onUpdateAuditData={onUpdateAuditData}
          mode="fieldwork"
          onTabChange={onTabChange}
        />
      )}

      {activeSection === 'general' && (
        <Card style={{ padding: 20 }}>
          <SectionHeader title="General Queries" subtitle="Queries not linked to a specific control" />
          <QueryLog
            queries={queries} users={users} currentUser={currentUser}
            auditId={audit?.id} controlRef={null} phase="Fieldwork"
            onCreateQuery={onCreateQuery} onUpdateQuery={onUpdateQuery}
            onPromoteToIssue={onPromoteToIssue}
          />
        </Card>
      )}

      {activeSection === 'signoff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '14px 16px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Sign-off Prerequisites</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {fieldworkGates.map(g => (
                <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, color: g.passed ? 'var(--status-green)' : 'var(--status-amber)', flexShrink: 0 }}>
                    {g.passed ? 'v' : 'o'}
                  </span>
                  <span style={{ fontSize: 12, color: g.passed ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: g.passed ? 400 : 500 }}>
                    {g.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {signOff ? (
            <SignOffBar signOff={signOff} currentUser={currentUser} gates={fieldworkGates}
              onSign={canSignOff ? (role) => onSignOff(signOff.id, role) : null}
              onRevoke={(role) => onRevokeSignOff && onRevokeSignOff(signOff.id, role)} />
          ) : (
            <div style={{ padding: '12px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-muted)' }}>
              Sign-off record not found for this engagement.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
