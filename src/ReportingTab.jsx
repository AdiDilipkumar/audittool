import { useState } from 'react';
import { Card, SectionHeader, Badge, Button, Field, EmptyState, SignOffBar } from '../components/UI';
import { ISSUES } from '../data/mockData';

const OPINION_OPTIONS = ['Satisfactory', 'Needs Improvement', 'Needs Significant Improvement', 'Not Effective'];

const OPINION_STYLE = {
  'Satisfactory':                 { color: 'var(--status-green)',  bg: 'var(--status-green-bg)',  border: 'var(--status-green-border)' },
  'Needs Improvement':            { color: 'var(--status-amber)',  bg: 'var(--status-amber-bg)',  border: 'var(--status-amber-border)' },
  'Needs Significant Improvement':{ color: 'var(--risk-high)',     bg: 'var(--risk-high-bg)',     border: 'var(--status-amber-border)' },
  'Not Effective':                { color: 'var(--risk-very-high)',bg: 'var(--risk-very-high-bg)',border: 'var(--status-red-border)' },
};

// ── Issues List ───────────────────────────────────────────────────────────────
function IssuesList({ issues, setIssues }) {
  const [expandedId, setExpandedId] = useState(issues[0]?.id);

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Issues List"
        subtitle={`${issues.length} issue${issues.length !== 1 ? 's' : ''} · ${issues.filter(i => i.risk_rating === 'High' || i.risk_rating === 'Very High').length} High/Very High`}
        action={<Button variant="secondary" size="sm">+ Add Issue</Button>}
      />
      {issues.length === 0 ? (
        <EmptyState icon="!" title="No issues raised" description="Issues can be raised directly here or promoted from the Query Log." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {issues.map(issue => {
            const isExpanded = expandedId === issue.id;
            return (
              <div key={issue.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', background: 'var(--surface-0)' }}
                >
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ni-teal)', width: 68 }}>
                    {issue.issue_ref}
                  </span>
                  <p style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{issue.title}</p>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Badge label={issue.risk_rating} type="risk" />
                    <Badge label={issue.status} />
                    <span style={{ color: 'var(--text-muted)' }}>{isExpanded ? '−' : '+'}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
                    {[
                      { key: 'condition', label: 'Condition (What was found)' },
                      { key: 'criteria', label: 'Criteria (What should be)' },
                      { key: 'cause', label: 'Cause (Why it happened)' },
                      { key: 'consequence', label: 'Consequence (Impact / Risk)' },
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                          {f.label}
                        </label>
                        <p style={{ fontSize: 13, lineHeight: 1.6 }}>{issue[f.key]}</p>
                      </div>
                    ))}
                    <div style={{ background: 'var(--ni-teal-dim)', border: '1px solid rgba(0,167,157,0.3)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ni-teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        Management Action
                      </label>
                      <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{issue.management_action || 'Pending management response.'}</p>
                      <div style={{ display: 'flex', gap: 24 }}>
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Owner: </span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{issue.action_owner || '-'}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due: </span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{issue.due_date ? new Date(issue.due_date).toLocaleDateString('en-GB') : '-'}</span>
                        </div>
                      </div>
                    </div>
                    {issue.promoted_from_query_id && (
                      <p style={{ marginTop: 10, fontSize: 11, color: 'var(--status-blue)' }}>
                        Promoted from Q-001
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ── Draft Report ──────────────────────────────────────────────────────────────
function DraftReport({ issues }) {
  const [opinion, setOpinion] = useState('Needs Improvement');
  const [execSummary, setExecSummary] = useState(
    'The audit of Data Operations: Investment Data Integrity & Controls identified one medium-rated finding relating to the consistency of the reconciliation exception escalation process. The control environment requires improvement in this area. Access controls and data quality KRI reporting are still under review with findings expected.\n\nManagement have agreed remediation actions. Progress against these actions will be tracked through the Internal Audit follow-up process.'
  );

  const style = OPINION_STYLE[opinion];
  const mainReportIssues = issues.filter(i => i.risk_rating !== 'Low');
  const lowIssues = issues.filter(i => i.risk_rating === 'Low');

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader title="Draft Report" subtitle="Overall opinion and executive summary for the audit report" />
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Overall Control Environment Opinion
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {OPINION_OPTIONS.map(o => {
            const s = OPINION_STYLE[o];
            const isSelected = opinion === o;
            return (
              <button
                key={o}
                onClick={() => setOpinion(o)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  fontWeight: isSelected ? 600 : 400,
                  background: isSelected ? s.bg : 'var(--surface-0)',
                  color: isSelected ? s.color : 'var(--text-secondary)',
                  border: `1.5px solid ${isSelected ? s.border : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>
      <Field label="Executive Summary" value={execSummary} multiline rows={5} onChange={setExecSummary} />
      <div style={{ marginTop: 4 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Issues in Main Report
        </label>
        {mainReportIssues.length === 0
          ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No High/Medium/Very High issues raised.</p>
          : mainReportIssues.map(i => (
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

// ── Reporting Tab ─────────────────────────────────────────────────────────────
export default function ReportingTab({ openCommentCount }) {
  const [issues, setIssues] = useState(ISSUES);
  const [activeSection, setActiveSection] = useState('issues');

  const sections = [
    { id: 'issues', label: 'Issues List' },
    { id: 'report', label: 'Draft Report' },
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
      {activeSection === 'issues'  && <IssuesList issues={issues} setIssues={setIssues} />}
      {activeSection === 'report'  && <DraftReport issues={issues} />}
      {activeSection === 'signoff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-muted)' }}>
            Reporting sign-off is available once all issues have an Agreed management response and the Draft Report is complete.
          </div>
          <SignOffBar signOff={{ auditor_id: 'u-003', auditor_signed_at: null, reviewer_id: 'u-002', reviewer_signed_at: null, hia_id: 'u-001', hia_signed_at: null }} />
        </div>
      )}
    </div>
  );
}
