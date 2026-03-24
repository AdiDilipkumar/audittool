import { useState } from 'react';
import { Badge } from './components/UI';
import PlanningTab from './tabs/PlanningTab';
import FieldworkTab from './tabs/FieldworkTab';
import ReportingTab from './tabs/ReportingTab';
import ReviewCommentsTab from './tabs/ReviewCommentsTab';
import PortfolioTab from './tabs/PortfolioTab';
import { SAMPLE_AUDIT, ALL_AUDITS, CURRENT_USER, REVIEW_COMMENTS, SIGN_OFFS } from './data/mockData';

// Engagement-level tabs (shown when inside an audit)
const ENGAGEMENT_TABS = [
  { id: 'planning',  label: 'Planning',         icon: '◈' },
  { id: 'fieldwork', label: 'Fieldwork',         icon: '◉' },
  { id: 'reporting', label: 'Reporting',         icon: '◎' },
  { id: 'review',    label: 'Review Comments',   icon: '◇' },
];

function getOpenCommentCount(comments, tab) {
  return comments.filter(c => c.tab === tab && c.status === 'Open').length;
}

// ─── Progress calculation ─────────────────────────────────────────────────────
// Sign-off tiers: 0 = none, 33 = Auditor, 67 = Reviewer, 100 = HIA
// progressData shape: { [auditId]: { planning: 0|33|67|100, fieldwork: ..., reporting: ... } }
function computeProgress(signOffs) {
  const result = {};
  signOffs.forEach(so => {
    if (!result[so.audit_id]) {
      result[so.audit_id] = { planning: 0, fieldwork: 0, reporting: 0 };
    }
    const tab = so.tab.toLowerCase();
    if (!['planning', 'fieldwork', 'reporting'].includes(tab)) return;
    let pct = 0;
    if (so.hia_signed_at)      pct = 100;
    else if (so.reviewer_signed_at) pct = 67;
    else if (so.auditor_signed_at)  pct = 33;
    result[so.audit_id][tab] = pct;
  });
  return result;
}

export default function App() {
  // null = Portfolio home; string = audit id of open engagement
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [activeEngagementTab, setActiveEngagementTab] = useState('planning');
  const [reviewComments, setReviewComments] = useState(REVIEW_COMMENTS);

  const progressData = computeProgress(SIGN_OFFS);

  const openPlanningComments  = getOpenCommentCount(reviewComments, 'Planning');
  const openFieldworkComments = getOpenCommentCount(reviewComments, 'Fieldwork');
  const openReportingComments = getOpenCommentCount(reviewComments, 'Reporting');
  const totalOpenComments     = reviewComments.filter(c => c.status === 'Open').length;

  const tabCommentCounts = {
    planning:  openPlanningComments,
    fieldwork: openFieldworkComments,
    reporting: openReportingComments,
  };

  // The audit currently open in the engagement view
  // For the mock phase, all engagement content still reads from SAMPLE_AUDIT (audit-001).
  // When Supabase arrives, swap this for a lookup: ALL_AUDITS.find(a => a.id === selectedAuditId)
  const selectedAudit = selectedAuditId
    ? (ALL_AUDITS.find(a => a.id === selectedAuditId) || SAMPLE_AUDIT)
    : null;

  function handleSelectAudit(auditId) {
    setSelectedAuditId(auditId);
    setActiveEngagementTab('planning');
  }

  function handleBackToPortfolio() {
    setSelectedAuditId(null);
  }

  const inEngagement = selectedAuditId !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--surface-0)' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'var(--ni-navy)',
        borderBottom: '1px solid var(--ni-navy-light)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--ni-teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>91</div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>
              Internal Audit
            </span>
          </div>

          {/* Back button - only shown inside an engagement */}
          {inEngagement && (
            <>
              <div style={{ width: 1, height: 20, background: 'var(--ni-navy-light)' }} />
              <button
                onClick={handleBackToPortfolio}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px 4px 6px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 12, fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>&#8592;</span>
                Portfolio
              </button>
              <div style={{ width: 1, height: 20, background: 'var(--ni-navy-light)' }} />
              <span style={{
                color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500,
                maxWidth: 440, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {selectedAudit?.title || ''}
              </span>
            </>
          )}
        </div>

        {/* User avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{CURRENT_USER.full_name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{CURRENT_USER.role}</div>
          </div>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--ni-teal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: '#fff',
          }}>
            {CURRENT_USER.full_name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      {/* ── Tab navigation ──────────────────────────────────────────────────── */}
      <nav style={{
        background: 'var(--surface-1)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex', alignItems: 'stretch', gap: 0,
        flexShrink: 0, height: 44,
      }}>
        {inEngagement ? (
          // Engagement tabs: Planning / Fieldwork / Reporting / Review Comments
          <>
            {ENGAGEMENT_TABS.map(tab => {
              const count = tabCommentCounts[tab.id] || (tab.id === 'review' ? totalOpenComments : 0);
              const isActive = activeEngagementTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveEngagementTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0 16px',
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--ni-teal)' : 'var(--text-secondary)',
                    borderBottom: `2px solid ${isActive ? 'var(--ni-teal)' : 'transparent'}`,
                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                    background: 'none', cursor: 'pointer',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                  {count > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'var(--status-amber)', color: '#fff',
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Audit status chip - right aligned */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <Badge label={selectedAudit?.status || ''} />
            </div>
          </>
        ) : (
          // Portfolio home tab
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 16px',
              fontSize: 13, fontWeight: 600,
              color: 'var(--ni-teal)',
              borderBottom: '2px solid var(--ni-teal)',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              background: 'none', cursor: 'default',
              whiteSpace: 'nowrap',
            }}
          >
            Portfolio
          </button>
        )}
      </nav>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {!inEngagement && (
          <PortfolioTab
            onSelectAudit={handleSelectAudit}
            progressData={progressData}
          />
        )}
        {inEngagement && activeEngagementTab === 'planning' && (
          <PlanningTab
            openCommentCount={openPlanningComments}
            progressData={progressData[selectedAuditId] || { planning: 0, fieldwork: 0, reporting: 0 }}
            onTabChange={setActiveEngagementTab}
          />
        )}
        {inEngagement && activeEngagementTab === 'fieldwork' && (
          <FieldworkTab openCommentCount={openFieldworkComments} />
        )}
        {inEngagement && activeEngagementTab === 'reporting' && (
          <ReportingTab openCommentCount={openReportingComments} />
        )}
        {inEngagement && activeEngagementTab === 'review' && (
          <ReviewCommentsTab
            comments={reviewComments}
            setComments={setReviewComments}
            currentUser={CURRENT_USER}
          />
        )}
      </main>
    </div>
  );
}
