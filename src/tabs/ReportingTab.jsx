import { useState, useEffect } from 'react';
import { Card, SectionHeader, Badge, Button, Field, EmptyState, SignOffBar, Modal } from '../components/UI';

const OPINION_OPTIONS = ['Satisfactory', 'Needs Improvement', 'Needs Significant Improvement', 'Not Effective'];

const OPINION_STYLE = {
  'Satisfactory':                  { color: 'var(--status-green)',   bg: 'var(--status-green-bg)',   border: 'var(--status-green-border)'  },
  'Needs Improvement':             { color: 'var(--status-amber)',   bg: 'var(--status-amber-bg)',   border: 'var(--status-amber-border)'  },
  'Needs Significant Improvement': { color: 'var(--risk-high)',      bg: 'var(--risk-high-bg)',      border: 'var(--status-amber-border)'  },
  'Not Effective':                 { color: 'var(--risk-very-high)', bg: 'var(--risk-very-high-bg)', border: 'var(--status-red-border)'    },
};

const RATING_OPTIONS = ['Low', 'Medium', 'High', 'Very High'];

const BLANK_ISSUE = {
  title: '', condition: '', criteria: '', cause: '', consequence: '',
  risk_rating: 'Medium', management_action: '', action_owner: '', due_date: '',
};

// ── Add / Edit Issue Modal ────────────────────────────────────────────────────
function IssueModal({ initial = {}, promotedFromQuery = null, onSave, onClose }) {
  const [form, setForm] = useState({ ...BLANK_ISSUE, ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const inputStyle = {
    width: '100%', padding: '8px 10px', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)',
    background: 'var(--surface-0)', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
  };

  const canSave = form.title.trim() && form.condition.trim();

  return (
    <Modal title={initial.id ? 'Edit Issue' : 'Add Issue'} onClose={onClose} width={620}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>

        {promotedFromQuery && (
          <div style={{ padding: '8px 12px', background: 'var(--ni-teal-dim)', border: '1px solid rgba(0,167,157,0.3)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--ni-teal)' }}>
            Promoted from query: <strong>{promotedFromQuery.query_ref}</strong> - {promotedFromQuery.title}
          </div>
        )}

        <div>
          <label style={labelStyle}>Issue Title *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Write in report language" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Risk Rating</label>
            <select style={inputStyle} value={form.risk_rating} onChange={e => set('risk_rating', e.target.value)}>
              {RATING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="date" style={inputStyle} value={form.due_date || ''} onChange={e => set('due_date', e.target.value)} />
          </div>
        </div>

        {[
          { key: 'condition',   label: 'Condition (What was found) *', rows: 3 },
          { key: 'criteria',    label: 'Criteria (What should be)',     rows: 3 },
          { key: 'cause',       label: 'Cause (Why it happened)',       rows: 3 },
          { key: 'consequence', label: 'Consequence (Impact / Risk)',   rows: 3 },
        ].map(f => (
          <div key={f.key}>
            <label style={labelStyle}>{f.label}</label>
            <textarea rows={f.rows} style={{ ...inputStyle, resize: 'vertical' }}
              value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
              placeholder="Write in report language" />
          </div>
        ))}

        <div>
          <label style={labelStyle}>Management Action</label>
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }}
            value={form.management_action || ''} onChange={e => set('management_action', e.target.value)}
            placeholder="Agreed management action" />
        </div>

        <div>
          <label style={labelStyle}>Action Owner</label>
          <input style={inputStyle} value={form.action_owner || ''} onChange={e => set('action_owner', e.target.value)} placeholder="Name / role" />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!canSave} onClick={() => onSave(form)}>
            {initial.id ? 'Save Changes' : 'Add Issue'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Issues List ───────────────────────────────────────────────────────────────
function IssuesList({ issues = [], onCreateIssue, onUpdateIssue,
  promoteQuery, onCreateIssueFromPromotion, onDismissPromotion }) {

  const [expandedId, setExpandedId]   = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  // Auto-open Add modal when a query is being promoted
  useEffect(() => {
    if (promoteQuery) setShowAddModal(true);
  }, [promoteQuery]);

  function handleSaveNew(form) {
    if (promoteQuery) {
      onCreateIssueFromPromotion({ ...form, promoted_from_query_id: promoteQuery.id });
    } else {
      onCreateIssue(form);
    }
    setShowAddModal(false);
  }

  function handleSaveEdit(form) {
    onUpdateIssue(editingIssue.id, form);
    setEditingIssue(null);
  }

  function handleConfirmFA(issue) {
    onUpdateIssue(issue.id, {
      factual_accuracy_confirmed: true,
      factual_accuracy_date: new Date().toISOString().slice(0, 10),
    });
  }

  function handleCloseModal() {
    setShowAddModal(false);
    if (promoteQuery) onDismissPromotion?.();
  }

  return (
    <>
      <Card style={{ padding: 20 }}>
        <SectionHeader
          title="Issues List"
          subtitle={issues.length === 0
            ? 'No issues raised'
            : `${issues.length} issue${issues.length !== 1 ? 's' : ''} - ${issues.filter(i => i.risk_rating === 'High' || i.risk_rating === 'Very High').length} High/Very High`}
          action={<Button variant="secondary" size="sm" onClick={() => setShowAddModal(true)}>+ Add Issue</Button>}
        />

        {promoteQuery && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--ni-teal-dim)', border: '1px solid rgba(0,167,157,0.3)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--ni-teal)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Promoting query <strong>{promoteQuery.query_ref}</strong> to issue - complete the form below.</span>
            <button onClick={onDismissPromotion} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>x</button>
          </div>
        )}

        {issues.length === 0 ? (
          <EmptyState icon="!" title="No issues raised"
            description="Issues can be raised directly here or promoted from the Query Log." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {issues.map(issue => {
              const isExpanded = expandedId === issue.id;
              return (
                <div key={issue.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', background: 'var(--surface-0)' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)', width: 68, flexShrink: 0 }}>
                      {issue.issue_ref}
                    </span>
                    <p style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.4, margin: 0 }}>{issue.title}</p>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                      {issue.factual_accuracy_confirmed && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: 'var(--status-green-bg)', color: 'var(--status-green)', border: '1px solid var(--status-green-border)' }}>FA</span>
                      )}
                      <Badge label={issue.risk_rating} type="risk" />
                      <Badge label={issue.status} />
                      <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>{isExpanded ? '-' : '+'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
                      {[
                        { key: 'condition',   label: 'Condition (What was found)'  },
                        { key: 'criteria',    label: 'Criteria (What should be)'   },
                        { key: 'cause',       label: 'Cause (Why it happened)'     },
                        { key: 'consequence', label: 'Consequence (Impact / Risk)' },
                      ].map(f => (
                        issue[f.key] ? (
                          <div key={f.key} style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label}</label>
                            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{issue[f.key]}</p>
                          </div>
                        ) : null
                      ))}

                      {/* Management Action block */}
                      <div style={{ background: 'var(--ni-teal-dim)', border: '1px solid rgba(0,167,157,0.3)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ni-teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                          Management Action
                        </label>
                        <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10, margin: '0 0 10px' }}>
                          {issue.management_action || 'Pending management response.'}
                        </p>
                        <div style={{ display: 'flex', gap: 24 }}>
                          <div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Owner: </span>
                            <span style={{ fontSize: 12, fontWeight: 500 }}>{issue.action_owner || '-'}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due: </span>
                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                              {issue.due_date ? new Date(issue.due_date).toLocaleDateString('en-GB') : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Factual Accuracy */}
                      <div style={{ padding: '10px 12px', background: issue.factual_accuracy_confirmed ? 'var(--status-green-bg)' : 'var(--surface-1)', border: `1px solid ${issue.factual_accuracy_confirmed ? 'var(--status-green-border)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, color: issue.factual_accuracy_confirmed ? 'var(--status-green)' : 'var(--text-muted)', fontWeight: 500 }}>
                          {issue.factual_accuracy_confirmed
                            ? `Factual accuracy confirmed with management - ${issue.factual_accuracy_date ? new Date(issue.factual_accuracy_date).toLocaleDateString('en-GB') : ''}`
                            : 'Factual accuracy not yet confirmed with management'}
                        </span>
                        {!issue.factual_accuracy_confirmed && (
                          <Button variant="secondary" size="sm" onClick={() => handleConfirmFA(issue)}>
                            Confirm FA
                          </Button>
                        )}
                      </div>

                      {issue.promoted_from_query_id && (
                        <p style={{ fontSize: 11, color: 'var(--ni-teal)', marginBottom: 8 }}>
                          Promoted from query
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <Button variant="secondary" size="sm" onClick={() => setEditingIssue(issue)}>Edit Issue</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {showAddModal && (
        <IssueModal
          promotedFromQuery={promoteQuery || null}
          onSave={handleSaveNew}
          onClose={handleCloseModal}
        />
      )}

      {editingIssue && (
        <IssueModal
          initial={editingIssue}
          onSave={handleSaveEdit}
          onClose={() => setEditingIssue(null)}
        />
      )}
    </>
  );
}

// ── Draft Report ──────────────────────────────────────────────────────────────
function DraftReport({ issues = [], auditData, onUpdateAuditData }) {
  const stored = auditData?.report || {};
  const [opinion, setOpinion]         = useState(stored.opinion || 'Needs Improvement');
  const [execSummary, setExecSummary] = useState(stored.exec_summary || '');

  function handleChange(field, val) {
    const updated = { ...stored, [field]: val };
    onUpdateAuditData?.('report', updated);
  }

  const allFAConfirmed = issues.length > 0 && issues.every(i => i.factual_accuracy_confirmed);
  const mainIssues = issues.filter(i => i.risk_rating !== 'Low');
  const lowIssues  = issues.filter(i => i.risk_rating === 'Low');

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader title="Draft Report" subtitle="Overall opinion and executive summary" />

      {!allFAConfirmed && issues.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--status-amber-bg)', border: '1px solid var(--status-amber-border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--status-amber)' }}>
          {issues.filter(i => !i.factual_accuracy_confirmed).length} issue{issues.filter(i => !i.factual_accuracy_confirmed).length !== 1 ? 's' : ''} pending factual accuracy confirmation.
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Overall Control Environment Opinion
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {OPINION_OPTIONS.map(o => {
            const s = OPINION_STYLE[o];
            const isSelected = opinion === o;
            return (
              <button key={o} onClick={() => { setOpinion(o); handleChange('opinion', o); }} style={{
                padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                fontWeight: isSelected ? 600 : 400,
                background: isSelected ? s.bg : 'var(--surface-0)',
                color: isSelected ? s.color : 'var(--text-secondary)',
                border: `1.5px solid ${isSelected ? s.border : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                {o}
              </button>
            );
          })}
        </div>
      </div>

      <Field
        label="Executive Summary"
        value={execSummary}
        multiline rows={5}
        onChange={val => { setExecSummary(val); handleChange('exec_summary', val); }}
      />

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Issues in Main Report
        </label>
        {mainIssues.length === 0
          ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No High/Medium/Very High issues raised.</p>
          : mainIssues.map(i => (
            <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ni-teal)' }}>{i.issue_ref}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{i.title}</span>
              <Badge label={i.risk_rating} type="risk" />
            </div>
          ))
        }
        {lowIssues.length > 0 && (
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            {lowIssues.length} Low issue{lowIssues.length !== 1 ? 's' : ''} reported separately in the Low Issues Schedule.
          </p>
        )}
      </div>
    </Card>
  );
}

// ── Reporting sign-off gates ───────────────────────────────────────────────────
function computeReportingGates(issues, auditData) {
  const allFA = issues.length > 0 && issues.every(i => i.factual_accuracy_confirmed);
  const hasOpinion = !!(auditData?.report?.opinion);
  const hasExecSummary = (auditData?.report?.exec_summary || '').trim().length >= 20;
  return [
    { label: 'All issues must have factual accuracy confirmed with management', passed: allFA },
    { label: 'Overall opinion must be selected',                                passed: hasOpinion },
    { label: 'Executive summary must be completed (min 20 characters)',         passed: hasExecSummary },
  ];
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ReportingTab({
  audit, auditData, currentUser, users = [],
  onCreateIssue, onUpdateIssue,
  onUpdateAuditData,
  onSignOff, signOffs = [],
  openCommentCount,
  promoteQuery,
  onCreateIssueFromPromotion,
  onDismissPromotion,
}) {
  const [activeSection, setActiveSection] = useState('issues');

  const issues  = auditData?.issues  || [];
  const signOff = signOffs.find(s => s.tab === 'Reporting') || null;

  const reportingGates = computeReportingGates(issues, auditData);
  const canSignOff     = reportingGates.every(g => g.passed);

  // If a promotion just came in, switch to issues tab
  useEffect(() => {
    if (promoteQuery) setActiveSection('issues');
  }, [promoteQuery]);

  const sections = [
    { id: 'issues',  label: 'Issues List'  },
    { id: 'report',  label: 'Draft Report' },
    { id: 'signoff', label: 'Sign-off'     },
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

      {activeSection === 'issues' && (
        <IssuesList
          issues={issues}
          onCreateIssue={onCreateIssue}
          onUpdateIssue={onUpdateIssue}
          promoteQuery={promoteQuery}
          onCreateIssueFromPromotion={onCreateIssueFromPromotion}
          onDismissPromotion={onDismissPromotion}
        />
      )}

      {activeSection === 'report' && (
        <DraftReport
          issues={issues}
          auditData={auditData}
          onUpdateAuditData={onUpdateAuditData}
        />
      )}

      {activeSection === 'signoff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '14px 16px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Sign-off Prerequisites</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {reportingGates.map(g => (
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
            <SignOffBar signOff={signOff} currentUser={currentUser} gates={reportingGates}
              onSign={canSignOff ? (role) => onSignOff(signOff.id, role) : null} />
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
