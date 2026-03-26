import { useState } from 'react';
import { Badge, CommentDrawer } from './components/UI';
import PlanningTab from './tabs/PlanningTab';
import FieldworkTab from './tabs/FieldworkTab';
import ReportingTab from './tabs/ReportingTab';
import ReviewCommentsTab from './tabs/ReviewCommentsTab';
import PortfolioTab from './tabs/PortfolioTab';
import {
  CURRENT_USER, ALL_AUDITS, SIGN_OFFS, REVIEW_COMMENTS,
  AUDIT_DATA_MAP, createAudit,
} from './data/mockData';

const ENGAGEMENT_TABS = [
  { id: 'planning',  label: 'Planning'       },
  { id: 'fieldwork', label: 'Fieldwork'      },
  { id: 'reporting', label: 'Reporting'      },
  { id: 'review',    label: 'Review Comments'},
];

function getOpenCommentCount(comments, tab, auditId) {
  return comments.filter(c =>
    c.audit_id === auditId && c.tab === tab && c.status === 'Open'
  ).length;
}

function computeProgress(signOffs) {
  const result = {};
  signOffs.forEach(so => {
    if (!result[so.audit_id]) result[so.audit_id] = { planning: 0, fieldwork: 0, reporting: 0 };
    const tab = so.tab.toLowerCase();
    if (!['planning', 'fieldwork', 'reporting'].includes(tab)) return;
    let pct = 0;
    if (so.hia_signed_at)           pct = 100;
    else if (so.reviewer_signed_at) pct = 67;
    else if (so.auditor_signed_at)  pct = 33;
    result[so.audit_id][tab] = pct;
  });
  return result;
}

export default function App() {
  // ── Core navigation state ──────────────────────────────────────────────────
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [activeEngagementTab, setActiveEngagementTab] = useState('planning');

  // ── Lifted data state ──────────────────────────────────────────────────────
  const [audits, setAudits]               = useState(ALL_AUDITS);
  const [signOffs, setSignOffs]           = useState(SIGN_OFFS);
  const [reviewComments, setReviewComments] = useState(REVIEW_COMMENTS);
  // auditDataMap holds per-audit data (TOR, RACM, queries, issues, etc.)
  const [auditDataMap, setAuditDataMap]   = useState(AUDIT_DATA_MAP);

  // ── Comment drawer state ───────────────────────────────────────────────────
  // { open, sectionRef, rowRef, title, contextLabel }
  const [drawerState, setDrawerState] = useState({
    open: false, sectionRef: null, rowRef: null, title: '', contextLabel: '',
  });

  const openDrawer = ({ sectionRef, rowRef, title, contextLabel }) => {
    setDrawerState({ open: true, sectionRef, rowRef, title, contextLabel });
  };
  const closeDrawer = () => setDrawerState(s => ({ ...s, open: false }));

  // ── Derived values ─────────────────────────────────────────────────────────
  const progressData = computeProgress(signOffs);

  const inEngagement   = selectedAuditId !== null;
  const selectedAudit  = inEngagement ? (audits.find(a => a.id === selectedAuditId) || null) : null;
  const selectedData   = inEngagement ? (auditDataMap[selectedAuditId] || null) : null;

  const openPlanningComments  = inEngagement ? getOpenCommentCount(reviewComments, 'Planning',  selectedAuditId) : 0;
  const openFieldworkComments = inEngagement ? getOpenCommentCount(reviewComments, 'Fieldwork', selectedAuditId) : 0;
  const openReportingComments = inEngagement ? getOpenCommentCount(reviewComments, 'Reporting', selectedAuditId) : 0;
  const totalOpenComments     = inEngagement ? reviewComments.filter(c => c.audit_id === selectedAuditId && c.status === 'Open').length : 0;

  // Comments scoped to current audit for the drawer
  const auditComments = inEngagement
    ? reviewComments.filter(c => c.audit_id === selectedAuditId)
    : [];

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleSelectAudit(auditId) {
    setSelectedAuditId(auditId);
    setActiveEngagementTab('planning');
    closeDrawer();
  }

  function handleBackToPortfolio() {
    setSelectedAuditId(null);
    closeDrawer();
  }

  function handleCreateAudit(fields) {
    const { audit, signOffs: newSOs, data } = createAudit(fields);
    setAudits(prev => [...prev, audit]);
    setSignOffs(prev => [...prev, ...newSOs]);
    setAuditDataMap(prev => ({ ...prev, [audit.id]: data }));
    // Auto-open the new audit
    setSelectedAuditId(audit.id);
    setActiveEngagementTab('planning');
  }

  // Update a single audit's data sub-key (e.g. 'tor', 'racmRisks', 'queries')
  function handleUpdateAuditData(auditId, key, value) {
    setAuditDataMap(prev => ({
      ...prev,
      [auditId]: { ...prev[auditId], [key]: value },
    }));
  }

  // ── Props bundle passed to each engagement tab ─────────────────────────────
  const engagementProps = {
    audit:            selectedAudit,
    auditData:        selectedData,
    onUpdateAuditData:(key, value) => handleUpdateAuditData(selectedAuditId, key, value),
    reviewComments:   auditComments,
    setReviewComments:(updater) => {
      setReviewComments(prev => {
        const others = prev.filter(c => c.audit_id !== selectedAuditId);
        const updated = typeof updater === 'function'
          ? updater(auditComments)
          : updater;
        return [...others, ...updated];
      });
    },
    currentUser:      CURRENT_USER,
    openDrawer,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--surface-0)' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'var(--ni-navy)',
        borderBottom: '1px solid var(--ni-navy-light)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, flexShrink: 0, position: 'relative', zIndex: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <span style={{ fontSize: 14 }}>&#8592;</span>
                Portfolio
              </button>
              <div style={{ width: 1, height: 20, background: 'var(--ni-navy-light)' }} />
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500, maxWidth: 440, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedAudit?.title || ''}
              </span>
            </>
          )}
        </div>

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
        display: 'flex', alignItems: 'stretch',
        flexShrink: 0, height: 44,
        position: 'relative', zIndex: 200,
      }}>
        {inEngagement ? (
          <>
            {ENGAGEMENT_TABS.map(tab => {
              const count = tab.id === 'review'
                ? totalOpenComments
                : (tab.id === 'planning'  ? openPlanningComments
                :  tab.id === 'fieldwork' ? openFieldworkComments
                :                           openReportingComments);
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
                    background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
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
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <Badge label={selectedAudit?.status || ''} />
            </div>
          </>
        ) : (
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 16px', fontSize: 13, fontWeight: 600,
            color: 'var(--ni-teal)',
            borderBottom: '2px solid var(--ni-teal)',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            background: 'none', cursor: 'default', whiteSpace: 'nowrap',
          }}>
            Portfolio
          </button>
        )}
      </nav>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', padding: 24, position: 'relative' }}>
        {!inEngagement && (
          <PortfolioTab
            audits={audits}
            signOffs={signOffs}
            reviewComments={reviewComments}
            onSelectAudit={handleSelectAudit}
            onCreateAudit={handleCreateAudit}
            progressData={progressData}
          />
        )}
        {inEngagement && activeEngagementTab === 'planning' && (
          <PlanningTab
            {...engagementProps}
            openCommentCount={openPlanningComments}
            progressData={progressData[selectedAuditId] || { planning: 0, fieldwork: 0, reporting: 0 }}
            onTabChange={setActiveEngagementTab}
          />
        )}
        {inEngagement && activeEngagementTab === 'fieldwork' && (
          <FieldworkTab {...engagementProps} openCommentCount={openFieldworkComments} />
        )}
        {inEngagement && activeEngagementTab === 'reporting' && (
          <ReportingTab {...engagementProps} openCommentCount={openReportingComments} />
        )}
        {inEngagement && activeEngagementTab === 'review' && (
          <ReviewCommentsTab
            comments={auditComments}
            setComments={engagementProps.setReviewComments}
            currentUser={CURRENT_USER}
            auditId={selectedAuditId}
          />
        )}
      </main>

      {/* ── Comment Drawer — rendered once at app level, fixed overlay ─────── */}
      {inEngagement && (
        <CommentDrawer
          isOpen={drawerState.open}
          onClose={closeDrawer}
          title={drawerState.title}
          contextLabel={drawerState.contextLabel}
          sectionRef={drawerState.sectionRef}
          rowRef={drawerState.rowRef}
          auditId={selectedAuditId}
          comments={auditComments}
          setComments={engagementProps.setReviewComments}
          currentUser={CURRENT_USER}
        />
      )}
    </div>
  );
}
