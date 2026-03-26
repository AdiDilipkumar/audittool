import { useState, useRef } from 'react';
import { SignOffBar } from '../components/UI';
import { SIGN_OFFS } from '../data/mockData';
import PlanningAuditDetails      from './PlanningAuditDetails';
import PlanningInherentRisk      from './PlanningInherentRisk';
import PlanningCombinedAssurance from './PlanningCombinedAssurance';
import PlanningScope             from './PlanningScope';
import PlanningToR               from './PlanningToR';
import PlanningProgramme         from './PlanningProgramme';
import PlanningRACM              from './PlanningRACM';

// ── Progress circles strip ─────────────────────────────────────────────────────
function TabProgressCircle({ pct, label, tabId, activeTabId, onClick, size = 44 }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;
  const isActiveTab = tabId === activeTabId;

  let fillColor;
  if (pct === 0)       fillColor = 'var(--border)';
  else if (pct === 33) fillColor = 'var(--status-amber)';
  else if (pct === 67) fillColor = 'var(--ni-teal)';
  else                 fillColor = 'var(--status-green)';

  const tierLabel = pct === 0 ? 'None' : pct === 33 ? 'Auditor' : pct === 67 ? 'Reviewer' : 'HIA';

  return (
    <button
      onClick={onClick}
      title={`${label}: ${tierLabel} signed (${pct}%)`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        background: isActiveTab ? 'var(--ni-teal-dim)' : 'transparent',
        border: `1px solid ${isActiveTab ? 'rgba(0,167,157,0.3)' : 'transparent'}`,
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth={3} />
        {pct > 0 && (
          <circle cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={fillColor} strokeWidth={3}
            strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round"
          />
        )}
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}
          fontSize={pct === 100 ? 9 : 10} fontWeight={600}
          fill={pct === 0 ? 'var(--text-muted)' : fillColor}>
          {pct === 0 ? '-' : `${pct}%`}
        </text>
      </svg>
      <span style={{
        fontSize: 11, fontWeight: isActiveTab ? 600 : 500,
        color: isActiveTab ? 'var(--ni-teal)' : 'var(--text-secondary)',
        letterSpacing: '0.01em',
      }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: pct === 0 ? 'var(--text-muted)' : fillColor, fontWeight: 500 }}>
        {tierLabel}
      </span>
    </button>
  );
}

// ── Planning Tab shell ─────────────────────────────────────────────────────────
export default function PlanningTab({
  // Navigation / progress
  openCommentCount,
  progressData = { planning: 0, fieldwork: 0, reporting: 0 },
  onTabChange,
  // Engagement data (passed down from App via engagementProps)
  audit,
  auditData,
  onUpdateAuditData,
  reviewComments = [],
  setReviewComments,
  currentUser,
  openDrawer,
}) {
  const [activeSection, setActiveSection] = useState('details');
  const signOff = SIGN_OFFS.find(s => s.tab === 'Planning');
  const topRef = useRef(null);

  function handleProgressClick(tabId) {
    if (tabId === 'planning') {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (onTabChange) {
      onTabChange(tabId);
    }
  }

  const sections = [
    { id: 'details',   label: 'Audit Details'       },
    { id: 'risk',      label: 'Inherent Risk'        },
    { id: 'assurance', label: 'Combined Assurance'   },
    { id: 'scope',     label: 'Scope Determination'  },
    { id: 'tor',       label: 'Terms of Reference'   },
    { id: 'programme', label: 'Audit Programme'      },
    { id: 'racm',      label: 'RACM'                 },
    { id: 'signoff',   label: 'Sign-off'             },
  ];

  // Common props forwarded to every sub-component that supports the drawer
  const subProps = {
    audit,
    auditData,
    onUpdateAuditData,
    reviewComments,
    setReviewComments,
    currentUser,
    openDrawer,
  };

  return (
    <div ref={topRef} style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Progress circles strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        marginBottom: 20, padding: '12px 16px',
        background: 'var(--surface-1)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 8 }}>
          Sign-off
        </span>
        <TabProgressCircle pct={progressData.planning}  label="Planning"  tabId="planning"  activeTabId="planning" onClick={() => handleProgressClick('planning')} />
        <div style={{ width: 24, height: 1, background: 'var(--border)', margin: '0 2px', alignSelf: 'center', marginBottom: 22 }} />
        <TabProgressCircle pct={progressData.fieldwork} label="Fieldwork" tabId="fieldwork" activeTabId="planning" onClick={() => handleProgressClick('fieldwork')} />
        <div style={{ width: 24, height: 1, background: 'var(--border)', margin: '0 2px', alignSelf: 'center', marginBottom: 22 }} />
        <TabProgressCircle pct={progressData.reporting} label="Reporting" tabId="reporting" activeTabId="planning" onClick={() => handleProgressClick('reporting')} />
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.5 }}>
          <div>33% = Auditor &nbsp;&bull;&nbsp; 67% = Reviewer &nbsp;&bull;&nbsp; 100% = HIA</div>
          <div style={{ marginTop: 2 }}>Click a circle to jump to that tab</div>
        </div>
      </div>

      {/* Section sub-nav */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto' }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-md)',
            fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400,
            color: activeSection === s.id ? 'var(--ni-teal)' : 'var(--text-secondary)',
            background: activeSection === s.id ? 'var(--ni-teal-dim)' : 'transparent',
            border: `1px solid ${activeSection === s.id ? 'rgba(0,167,157,0.3)' : 'transparent'}`,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content — subProps forwarded to every section */}
      {activeSection === 'details'   && <PlanningAuditDetails   {...subProps} />}
      {activeSection === 'risk'      && <PlanningInherentRisk   {...subProps} />}
      {activeSection === 'assurance' && <PlanningCombinedAssurance {...subProps} />}
      {activeSection === 'scope'     && <PlanningScope          {...subProps} />}
      {activeSection === 'tor'       && <PlanningToR            {...subProps} />}
      {activeSection === 'programme' && <PlanningProgramme      {...subProps} />}
      {activeSection === 'racm'      && <PlanningRACM           {...subProps} />}
      {activeSection === 'signoff'   && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            padding: '12px 16px',
            background: 'var(--status-amber-bg)',
            border: '1px solid var(--status-amber-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13, color: 'var(--status-amber)',
          }}>
            Planning is signed off at Reviewer level. HIA sign-off is pending.
          </div>
          <SignOffBar signOff={signOff} />
        </div>
      )}
    </div>
  );
}
