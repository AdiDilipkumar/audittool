import { useState } from 'react';
import { Card, SectionHeader, Badge, Button, EmptyState } from '../components/UI';

const TAB_OPTIONS = ['Planning', 'Fieldwork', 'Reporting'];
const SECTION_OPTIONS = {
  Planning:  ['Audit Details', 'Terms of Reference', 'Audit Programme', 'RACM', 'Sign-off'],
  Fieldwork: ['Working Papers', 'Query Log', 'Sign-off'],
  Reporting: ['Issues List', 'Management Comments', 'Draft Report', 'Sign-off'],
};

export default function ReviewCommentsTab({
  comments = [],
  onAddComment,
  onRespondToComment,
  onCloseComment,
  currentUser,
  users = [],
  auditId,
}) {
  const [filterTab, setFilterTab]       = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedId, setExpandedId]     = useState(null);
  const [showNewForm, setShowNewForm]   = useState(false);
  const [newCommentTab, setNewCommentTab]         = useState('Planning');
  const [newCommentSection, setNewCommentSection] = useState('Terms of Reference');
  const [newCommentText, setNewCommentText]       = useState('');
  const [responseText, setResponseText]           = useState({});

  const statusCounts = {
    Open:      comments.filter(c => c.status === 'Open').length,
    Responded: comments.filter(c => c.status === 'Responded').length,
    Closed:    comments.filter(c => c.status === 'Closed').length,
  };

  const filtered = comments.filter(c =>
    (filterTab === 'All' || c.tab === filterTab) &&
    (filterStatus === 'All' || c.status === filterStatus)
  );

  function getUserName(id) {
    return users.find(u => u.id === id)?.full_name || 'Unknown';
  }

  const fmt = iso => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

  function handleAddComment() {
    if (!newCommentText.trim()) return;
    onAddComment({
      audit_id:    auditId,
      tab:         newCommentTab,
      sectionRef:  newCommentSection,
      section_ref: newCommentSection,
      rowRef:      null,
      comment_text: newCommentText.trim(),
    });
    setNewCommentText('');
    setShowNewForm(false);
  }

  function handleRespond(commentId) {
    const text = responseText[commentId];
    if (!text?.trim()) return;
    onRespondToComment(commentId, text);
    setResponseText(prev => ({ ...prev, [commentId]: '' }));
  }

  function handleClose(commentId) {
    onCloseComment(commentId);
  }

  const canClose = currentUser?.role === 'Reviewer' || currentUser?.role === 'HIA' || currentUser?.role === 'Audit Lead';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card
            key={status}
            style={{ padding: '12px 20px', flex: 1, cursor: 'pointer', background: filterStatus === status ? 'var(--ni-teal-dim)' : undefined, borderColor: filterStatus === status ? 'rgba(0,167,157,0.4)' : undefined }}
            onClick={() => setFilterStatus(filterStatus === status ? 'All' : status)}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: status === 'Open' ? 'var(--status-amber)' : status === 'Responded' ? 'var(--status-blue)' : 'var(--status-green)' }}>
              {count}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{status}</div>
          </Card>
        ))}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="primary" onClick={() => setShowNewForm(true)}>+ New Comment</Button>
        </div>
      </div>

      {/* Tab filters */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['All', ...TAB_OPTIONS].map(t => (
          <button key={t} onClick={() => setFilterTab(t)} style={{
            padding: '5px 12px', borderRadius: 'var(--radius-md)', fontSize: 12,
            fontWeight: filterTab === t ? 600 : 400,
            color: filterTab === t ? 'var(--ni-teal)' : 'var(--text-secondary)',
            background: filterTab === t ? 'var(--ni-teal-dim)' : 'transparent',
            border: `1px solid ${filterTab === t ? 'rgba(0,167,157,0.3)' : 'transparent'}`,
            cursor: 'pointer',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* New comment form */}
      {showNewForm && (
        <Card style={{ padding: 20, marginBottom: 16, border: '1px solid rgba(0,167,157,0.4)' }}>
          <SectionHeader
            title="New Review Comment"
            action={<button onClick={() => setShowNewForm(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, background: 'none', border: 'none' }}>x</button>}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Tab</label>
              <select value={newCommentTab} onChange={e => { setNewCommentTab(e.target.value); setNewCommentSection(SECTION_OPTIONS[e.target.value][0]); }}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)' }}>
                {TAB_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Section</label>
              <select value={newCommentSection} onChange={e => setNewCommentSection(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)' }}>
                {SECTION_OPTIONS[newCommentTab].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <textarea value={newCommentText} onChange={e => setNewCommentText(e.target.value)} rows={4} placeholder="Enter review comment..."
            style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', resize: 'vertical', marginBottom: 12, background: 'var(--surface-0)' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" onClick={handleAddComment} disabled={!newCommentText.trim()}>Submit Comment</Button>
            <Button variant="ghost" onClick={() => setShowNewForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Comment list */}
      {filtered.length === 0 ? (
        <EmptyState icon="o" title="No comments" description={comments.length === 0 ? "No review comments have been raised on this engagement yet." : "No comments match the current filter."} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(comment => {
            const isExpanded = expandedId === comment.id;
            return (
              <Card key={comment.id} style={{ overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : comment.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: 'var(--surface-0)' }}
                >
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <Badge label={comment.tab} size="sm" />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>{comment.section || comment.section_ref}</span>
                  </div>
                  <p style={{ flex: 1, fontSize: 13, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {comment.comment_text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getUserName(comment.raised_by)}</span>
                    <Badge label={comment.status} />
                    <span style={{ color: 'var(--text-muted)' }}>{isExpanded ? '-' : '+'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 13, lineHeight: 1.6 }}>{comment.comment_text}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Raised by {getUserName(comment.raised_by)} on {fmt(comment.raised_at)}
                      </p>
                    </div>

                    {comment.response_text ? (
                      <div style={{ background: 'var(--status-blue-bg)', border: '1px solid var(--status-blue-border)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--status-blue)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                          Response by {getUserName(comment.responded_by)} - {fmt(comment.responded_at)}
                        </label>
                        <p style={{ fontSize: 13, lineHeight: 1.6 }}>{comment.response_text}</p>
                      </div>
                    ) : null}

                    {comment.status === 'Open' && (
                      <div style={{ marginTop: 12 }}>
                        <textarea
                          value={responseText[comment.id] || ''}
                          onChange={e => setResponseText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                          rows={3} placeholder="Add response..."
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', marginBottom: 8, background: 'var(--surface-0)', resize: 'vertical' }}
                        />
                        <Button variant="secondary" size="sm" onClick={() => handleRespond(comment.id)} disabled={!responseText[comment.id]?.trim()}>
                          Submit Response
                        </Button>
                      </div>
                    )}

                    {comment.status === 'Responded' && canClose && (
                      <Button variant="primary" size="sm" onClick={() => handleClose(comment.id)} style={{ marginTop: 8 }}>
                        Close Thread
                      </Button>
                    )}

                    {comment.status === 'Closed' && (
                      <p style={{ fontSize: 11, color: 'var(--status-green)', marginTop: 8 }}>
                        Closed by {getUserName(comment.closed_by)} on {fmt(comment.closed_at)}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
