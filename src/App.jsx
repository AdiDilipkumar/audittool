import { useState } from 'react';
import { Badge } from './components/UI';
import PlanningTab from './tabs/PlanningTab';
import FieldworkTab from './tabs/FieldworkTab';
import ReportingTab from './tabs/ReportingTab';
import ReviewCommentsTab from './tabs/ReviewCommentsTab';
import PortfolioTab from './tabs/PortfolioTab';
import { SAMPLE_AUDIT, CURRENT_USER, REVIEW_COMMENTS } from './data/mockData';

const TABS = [
  { id: 'portfolio', label: 'Portfolio', icon: '◫' },
  { id: 'planning', label: 'Planning', icon: '◈' },
  { id: 'fieldwork', label: 'Fieldwork', icon: '◉' },
  { id: 'reporting', label: 'Reporting', icon: '◎' },
  { id: 'review', label: 'Review Comments', icon: '◇' },
];

function getOpenCommentCount(comments, tab) {
  return comments.filter(c => c.tab === tab && c.status === 'Open').length;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('planning');
  const [reviewComments, setReviewComments] = useState(REVIEW_COMMENTS);

  const openPlanningComments = getOpenCommentCount(reviewComments, 'Planning');
  const openFieldworkComments = getOpenCommentCount(reviewComments, 'Fieldwork');
  const openReportingComments = getOpenCommentCount(reviewComments, 'Reporting');
  const totalOpenComments = reviewComments.filter(c => c.status === 'Open').length;

  const tabCommentCounts = {
    planning: openPlanningComments,
    fieldwork: openFieldworkComments,
    reporting: openReportingComments,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--surface-0)' }}>
      {/* Top bar */}
      <header style={{
        background: 'var(--ni-navy)',
        borderBottom: '1px solid var(--ni-navy-light)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Ninety One wordmark substitute */}
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
          <div style={{ width: 1, height: 20, background: 'var(--ni-navy-light)' }} />
          {activeTab !== 'portfolio' && (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, maxWidth: 440, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {SAMPLE_AUDIT.title}
            </span>
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

      {/* Tab navigation */}
      <nav style={{
        background: 'var(--surface-1)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex', alignItems: 'stretch', gap: 0,
        flexShrink: 0, height: 44,
      }}>
        {TABS.map(tab => {
          const count = tabCommentCounts[tab.id] || (tab.id === 'review' ? totalOpenComments : 0);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 16px',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--ni-teal)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${isActive ? 'var(--ni-teal)' : 'transparent'}`,
                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
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
          <Badge label={SAMPLE_AUDIT.status} />
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'planning' && <PlanningTab openCommentCount={openPlanningComments} />}
        {activeTab === 'fieldwork' && <FieldworkTab openCommentCount={openFieldworkComments} />}
        {activeTab === 'reporting' && <ReportingTab openCommentCount={openReportingComments} />}
        {activeTab === 'review' && (
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
