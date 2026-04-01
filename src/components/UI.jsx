// ─── SHARED UI COMPONENTS ────────────────────────────────────────────────────
import { useState } from 'react';

// ── Badge ──────────────────────────────────────────────────────────────────
const STATUS_BADGE_STYLES = {
  'Planning':    { bg: 'var(--status-blue-bg)',   color: 'var(--status-blue)',   border: 'var(--status-blue-border)' },
  'Fieldwork':   { bg: 'var(--status-amber-bg)',  color: 'var(--status-amber)',  border: 'var(--status-amber-border)' },
  'Reporting':   { bg: 'var(--ni-teal-dim)',       color: 'var(--ni-teal)',       border: 'rgba(0,167,157,0.3)' },
  'Complete':    { bg: 'var(--status-green-bg)',  color: 'var(--status-green)',  border: 'var(--status-green-border)' },
  'Not Started': { bg: 'var(--status-grey-bg)',   color: 'var(--status-grey)',   border: 'var(--status-grey-border)' },
  'In Progress': { bg: 'var(--status-amber-bg)',  color: 'var(--status-amber)',  border: 'var(--status-amber-border)' },
  'Tested - Effective':   { bg: 'var(--status-green-bg)', color: 'var(--status-green)', border: 'var(--status-green-border)' },
  'Tested - Ineffective': { bg: 'var(--status-red-bg)',   color: 'var(--status-red)',   border: 'var(--status-red-border)' },
  'Not Tested':  { bg: 'var(--status-grey-bg)',   color: 'var(--status-grey)',   border: 'var(--status-grey-border)' },
  'Effective':   { bg: 'var(--status-green-bg)', color: 'var(--status-green)', border: 'var(--status-green-border)' },
  'Ineffective': { bg: 'var(--status-red-bg)',   color: 'var(--status-red)',   border: 'var(--status-red-border)' },
  'Open':        { bg: 'var(--status-amber-bg)',  color: 'var(--status-amber)',  border: 'var(--status-amber-border)' },
  'Closed':      { bg: 'var(--status-green-bg)',  color: 'var(--status-green)',  border: 'var(--status-green-border)' },
  'Promoted':    { bg: 'var(--status-blue-bg)',   color: 'var(--status-blue)',   border: 'var(--status-blue-border)' },
  'Responded':   { bg: 'var(--status-blue-bg)',   color: 'var(--status-blue)',   border: 'var(--status-blue-border)' },
  'Draft':       { bg: 'var(--status-grey-bg)',   color: 'var(--status-grey)',   border: 'var(--status-grey-border)' },
  'Final':       { bg: 'var(--status-green-bg)',  color: 'var(--status-green)',  border: 'var(--status-green-border)' },
  'Agreed':      { bg: 'var(--status-green-bg)',  color: 'var(--status-green)',  border: 'var(--status-green-border)' },
  'Disputed':    { bg: 'var(--status-red-bg)',    color: 'var(--status-red)',    border: 'var(--status-red-border)' },
  'Mgmt Response Pending': { bg: 'var(--status-amber-bg)', color: 'var(--status-amber)', border: 'var(--status-amber-border)' },
  'Audit Lead':  { bg: 'var(--ni-teal-dim)',      color: 'var(--ni-teal)',       border: 'rgba(0,167,157,0.3)' },
  'HIA':         { bg: 'var(--ni-teal-dim)',      color: 'var(--ni-teal)',       border: 'rgba(0,167,157,0.3)' },
  'Reviewer':    { bg: 'var(--status-blue-bg)',   color: 'var(--status-blue)',   border: 'var(--status-blue-border)' },
  'Auditor':     { bg: 'var(--status-amber-bg)',  color: 'var(--status-amber)',  border: 'var(--status-amber-border)' },
};

const RISK_BADGE_STYLES = {
  'Very High': { bg: 'var(--risk-very-high-bg)', color: 'var(--risk-very-high)' },
  'High':      { bg: 'var(--risk-high-bg)',      color: 'var(--risk-high)' },
  'Moderate':  { bg: 'var(--risk-medium-bg)',    color: 'var(--risk-medium)' },
  'Medium':    { bg: 'var(--risk-medium-bg)',    color: 'var(--risk-medium)' },
  'Low':       { bg: 'var(--risk-low-bg)',       color: 'var(--risk-low)' },
};

export function Badge({ label, type = 'status', size = 'sm' }) {
  const styles = type === 'risk'
    ? RISK_BADGE_STYLES[label] || {}
    : STATUS_BADGE_STYLES[label] || { bg: 'var(--surface-2)', color: 'var(--text-secondary)', border: 'var(--border)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      fontSize: size === 'sm' ? '11px' : '12px',
      fontWeight: 500, letterSpacing: '0.02em', borderRadius: '100px',
      background: styles.bg, color: styles.color,
      border: `1px solid ${styles.border || styles.bg}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, className = '' }) {
  return (
    <div className={className} style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── SectionHeader ──────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: subtitle ? 2 : 0 }}>
          {title}
        </h3>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Button ──────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontWeight: 500, borderRadius: 'var(--radius-md)',
    transition: 'all 0.15s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontSize: size === 'sm' ? 12 : 13,
    padding: size === 'sm' ? '5px 10px' : '7px 14px',
  };
  const variants = {
    primary:   { background: 'var(--ni-teal)', color: '#fff', border: '1px solid var(--ni-teal)' },
    secondary: { background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    danger:    { background: 'var(--status-red-bg)', color: 'var(--status-red)', border: '1px solid var(--status-red-border)' },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────
export function Field({ label, value, onChange, multiline = false, rows = 3, hint }) {
  const inputStyle = {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    fontSize: 13, color: 'var(--text-primary)', background: 'var(--surface-0)',
    resize: multiline ? 'vertical' : 'none', outline: 'none',
    transition: 'border-color 0.15s', fontFamily: 'var(--font-sans)', lineHeight: 1.5,
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </label>
      {multiline
        ? <textarea value={value} onChange={e => onChange && onChange(e.target.value)} rows={rows} style={inputStyle} readOnly={!onChange} />
        : <input type="text" value={value} onChange={e => onChange && onChange(e.target.value)} style={inputStyle} readOnly={!onChange} />
      }
      {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{hint}</p>}
    </div>
  );
}

// ── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', padding: '8px 10px',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
        fontSize: 13, color: 'var(--text-primary)', background: 'var(--surface-0)',
        outline: 'none', fontFamily: 'var(--font-sans)',
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
      {icon && <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>{icon}</div>}
      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</h4>
      {description && <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, marginBottom: 16 }}>{description}</p>}
      {action}
    </div>
  );
}

// ── SignOffBar ─────────────────────────────────────────────────────────────
export function SignOffBar({ signOff, currentUser, onSign }) {
  const tiers = [
    { key: 'auditor',  label: 'Audit Lead', id: signOff?.auditor_id,  signed_at: signOff?.auditor_signed_at },
    { key: 'reviewer', label: 'Reviewer',   id: signOff?.reviewer_id, signed_at: signOff?.reviewer_signed_at },
    { key: 'hia',      label: 'HIA',        id: signOff?.hia_id,      signed_at: signOff?.hia_signed_at },
  ];

  return (
    <Card style={{ padding: '16px 20px' }}>
      <SectionHeader title="Sign-off" subtitle="Three-tier approval required to close this phase" />
      <div style={{ display: 'flex', gap: 12 }}>
        {tiers.map((tier, i) => {
          const signed = !!tier.signed_at;
          const canSign = currentUser && tier.id === currentUser.id && !signed;
          return (
            <div key={tier.key} style={{
              flex: 1, padding: 14, borderRadius: 'var(--radius-md)',
              background: signed ? 'var(--status-green-bg)' : 'var(--surface-0)',
              border: `1px solid ${signed ? 'var(--status-green-border)' : 'var(--border)'}`,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                {i + 1}. {tier.label}
              </span>
              {signed
                ? <span style={{ fontSize: 12, color: 'var(--status-green)', fontWeight: 500 }}>
                    Signed {new Date(tier.signed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending</span>
              }
              {canSign && onSign && (
                <button
                  onClick={() => onSign(tier.key)}
                  style={{
                    marginTop: 4, padding: '5px 10px',
                    background: 'var(--ni-teal)', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Sign off
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,22,40,0.5)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, background: 'none', border: 'none' }}>x</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ── New Audit Modal ────────────────────────────────────────────────────────
// users prop passed in from App — no mockData import needed
export function NewAuditModal({ onClose, onSubmit, users = [] }) {
  const HIA_USER = users.find(u => u.role === 'HIA');

  const [fields, setFields] = useState({
    title: '',
    entity: '',
    audit_type: 'Assurance',
    period_under_review: '',
    planned_start: '',
    planned_end: '',
    lead_auditor_id: '',
    reviewer_id: '',
    auditor_id: '',
    it_auditor_id: '',
  });

  const set = (key, val) => setFields(prev => ({ ...prev, [key]: val }));

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: 4,
  };
  const inputStyle = {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    fontSize: 13, fontFamily: 'var(--font-sans)',
    background: 'var(--surface-0)', color: 'var(--text-primary)', outline: 'none',
  };

  // Non-HIA users available for role assignment
  const assignableUsers = users.filter(u => u.role !== 'HIA');

  // Validation: title + lead + reviewer required; lead != reviewer
  const leadAndReviewerSame = fields.lead_auditor_id && fields.reviewer_id && fields.lead_auditor_id === fields.reviewer_id;
  const isValid = fields.title.trim() && fields.lead_auditor_id && fields.reviewer_id && !leadAndReviewerSame;

  function buildUserOptions(placeholder = '-- Select --') {
    return [
      <option key="" value="">{placeholder}</option>,
      ...assignableUsers.map(u => (
        <option key={u.id} value={u.id}>{u.full_name}</option>
      )),
    ];
  }

  return (
    <Modal title="New Audit" onClose={onClose} width={560}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Title */}
        <div>
          <label style={labelStyle}>Audit Title *</label>
          <input
            style={inputStyle}
            value={fields.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Fund Operations: Distribution Controls"
          />
        </div>

        {/* Entity + Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Auditable Entity</label>
            <input style={inputStyle} value={fields.entity} onChange={e => set('entity', e.target.value)} placeholder="e.g. Fund Operations" />
          </div>
          <div>
            <label style={labelStyle}>Audit Type</label>
            <select style={inputStyle} value={fields.audit_type} onChange={e => set('audit_type', e.target.value)}>
              <option>Assurance</option>
              <option>Advisory</option>
              <option>Agile</option>
              <option>Ad Hoc</option>
            </select>
          </div>
        </div>

        {/* Period */}
        <div>
          <label style={labelStyle}>Period Under Review</label>
          <input style={inputStyle} value={fields.period_under_review} onChange={e => set('period_under_review', e.target.value)} placeholder="e.g. Q1 2026 (Jan - Mar 2026)" />
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Planned Start *</label>
            <input style={inputStyle} type="date" value={fields.planned_start} onChange={e => set('planned_start', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Planned End *</label>
            <input style={inputStyle} type="date" value={fields.planned_end} onChange={e => set('planned_end', e.target.value)} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Engagement Team
          </p>

          {/* HIA - always Elsabe, locked */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>HIA (Head of Internal Audit)</label>
            <div style={{
              padding: '8px 10px', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', fontSize: 13,
              background: 'var(--surface-0)', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{HIA_USER?.full_name || 'Elsabe De Vries'}</span>
              <span style={{ fontSize: 11, color: 'var(--ni-teal)' }}>Auto-assigned</span>
            </div>
          </div>

          {/* Lead + Reviewer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Audit Lead *</label>
              <select style={inputStyle} value={fields.lead_auditor_id} onChange={e => set('lead_auditor_id', e.target.value)}>
                {buildUserOptions()}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Reviewer *</label>
              <select style={inputStyle} value={fields.reviewer_id} onChange={e => set('reviewer_id', e.target.value)}>
                {buildUserOptions()}
              </select>
            </div>
          </div>

          {leadAndReviewerSame && (
            <p style={{ fontSize: 12, color: 'var(--status-red)', marginBottom: 10, marginTop: -6 }}>
              Audit Lead and Reviewer cannot be the same person.
            </p>
          )}

          {/* Auditor + IT Auditor (optional) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Auditor <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <select style={inputStyle} value={fields.auditor_id} onChange={e => set('auditor_id', e.target.value)}>
                {buildUserOptions('-- None --')}
              </select>
            </div>
            <div>
              <label style={labelStyle}>IT Auditor <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <select style={inputStyle} value={fields.it_auditor_id} onChange={e => set('it_auditor_id', e.target.value)}>
                {buildUserOptions('-- None --')}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!isValid}
            onClick={() => { onSubmit(fields); onClose(); }}
          >
            Create Audit
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── CommentButton ──────────────────────────────────────────────────────────
export function CommentButton({ sectionRef, rowRef = null, comments = [], onClick }) {
  const openCount = comments.filter(c =>
    c.section_ref === sectionRef &&
    (rowRef ? c.row_ref === rowRef : true) &&
    c.status === 'Open'
  ).length;

  const totalCount = comments.filter(c =>
    c.section_ref === sectionRef &&
    (rowRef ? c.row_ref === rowRef : true)
  ).length;

  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={`${totalCount} comment${totalCount !== 1 ? 's' : ''}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px',
        border: '1px solid var(--border)',
        borderRadius: '100px',
        background: openCount > 0 ? 'var(--status-amber-bg)' : 'var(--surface-0)',
        borderColor: openCount > 0 ? 'var(--status-amber-border)' : 'var(--border)',
        cursor: 'pointer', fontSize: 11,
        color: openCount > 0 ? 'var(--status-amber)' : 'var(--text-muted)',
        transition: 'all 0.15s', flexShrink: 0,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M8 1.5C4.41 1.5 1.5 4.07 1.5 7.25c0 1.47.57 2.81 1.5 3.84l-.94 2.41 2.54-.9C5.4 12.84 6.67 13 8 13c3.59 0 6.5-2.57 6.5-5.75S11.59 1.5 8 1.5z"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      {totalCount > 0 && (
        <span style={{ fontWeight: 600 }}>{openCount > 0 ? openCount : totalCount}</span>
      )}
    </button>
  );
}

// ── CommentDrawer ──────────────────────────────────────────────────────────
export function CommentDrawer({
  isOpen, onClose, title, contextLabel,
  sectionRef, rowRef, auditId,
  comments, onAddComment, onRespondToComment, onCloseComment,
  currentUser, users = [],
}) {
  const [showForm, setShowForm]         = useState(false);
  const [newText, setNewText]           = useState('');
  const [responseText, setResponseText] = useState({});

  const fmt = iso => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  const userName = id => users.find(u => u.id === id)?.full_name || 'Unknown';

  const threads = comments.filter(c =>
    c.section_ref === sectionRef &&
    (rowRef ? c.row_ref === rowRef : !c.row_ref || c.row_ref === null)
  );

  const openCount = threads.filter(c => c.status === 'Open').length;

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAddComment({
      audit_id: auditId,
      tab: contextLabel?.split(' - ')[0] || 'Planning',
      sectionRef, rowRef: rowRef || null,
      comment_text: newText.trim(),
    });
    setNewText('');
    setShowForm(false);
  };

  const handleRespond = (id) => {
    const text = responseText[id];
    if (!text?.trim()) return;
    onRespondToComment(id, text);
    setResponseText(prev => ({ ...prev, [id]: '' }));
  };

  const statusBorderColor = { Open: '#C9A84C', Responded: 'var(--ni-teal)', Closed: 'var(--border)' };

  return (
    <>
      {isOpen && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,22,40,0.15)' }} />
      )}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        background: 'var(--surface-1)', borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 24px rgba(26,43,74,0.12)',
        display: 'flex', flexDirection: 'column', zIndex: 400,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ background: 'var(--ni-navy)', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>{contextLabel || 'Review comments'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        </div>

        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface-0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {threads.length} comment{threads.length !== 1 ? 's' : ''}{openCount > 0 ? ` - ${openCount} open` : ''}
          </span>
          <button onClick={() => setShowForm(s => !s)} style={{ padding: '5px 12px', background: 'var(--ni-teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            + New comment
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {showForm && (
            <div style={{ border: '1px solid var(--ni-teal)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--ni-teal)', borderBottom: '1px solid var(--border)', background: 'var(--ni-teal-dim)' }}>New comment</div>
              <div style={{ padding: 14 }}>
                <textarea value={newText} onChange={e => setNewText(e.target.value)} rows={3} placeholder="Describe the issue or question..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 12, fontFamily: 'var(--font-sans)', resize: 'vertical', background: 'var(--surface-0)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ padding: '8px 14px', display: 'flex', gap: 6, justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setNewText(''); }}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleAdd} disabled={!newText.trim()}>Raise comment</Button>
              </div>
            </div>
          )}

          {threads.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
              No comments yet on this {rowRef ? 'item' : 'section'}.
            </div>
          )}

          {[...threads].reverse().map(thread => (
            <div key={thread.id} style={{
              border: `1px solid var(--border)`,
              borderLeft: `3px solid ${statusBorderColor[thread.status] || 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              opacity: thread.status === 'Closed' ? 0.7 : 1,
            }}>
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: thread.status === 'Closed' ? 'var(--text-muted)' : 'var(--ni-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff' }}>
                  {userName(thread.raised_by).split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{userName(thread.raised_by)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(thread.raised_at)}</div>
                </div>
                <Badge label={thread.status} size="sm" />
              </div>
              <div style={{ padding: '0 14px 10px 52px', fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>{thread.comment_text}</div>

              {thread.response_text && (
                <div style={{ background: 'var(--ni-teal-dim)', borderTop: '1px solid var(--border)', padding: '10px 14px', display: 'flex', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2, background: 'var(--ni-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#fff' }}>
                    {userName(thread.responded_by).split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>{thread.response_text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{userName(thread.responded_by)} - {fmt(thread.responded_at)}</div>
                  </div>
                </div>
              )}

              {thread.status !== 'Closed' && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '8px 14px', background: 'var(--surface-0)' }}>
                  {thread.status === 'Open' && (
                    <div style={{ marginBottom: 8 }}>
                      <textarea value={responseText[thread.id] || ''} onChange={e => setResponseText(prev => ({ ...prev, [thread.id]: e.target.value }))}
                        rows={2} placeholder="Add response..." style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 12, fontFamily: 'var(--font-sans)', resize: 'none', background: 'var(--surface-0)', color: 'var(--text-primary)', marginBottom: 6 }} />
                      <Button variant="secondary" size="sm" onClick={() => handleRespond(thread.id)}>Submit response</Button>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => onCloseComment(thread.id)} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
                      Mark closed
                    </button>
                  </div>
                </div>
              )}

              {thread.status === 'Closed' && (
                <div style={{ padding: '6px 14px', fontSize: 11, color: 'var(--status-green)', borderTop: '1px solid var(--border)' }}>
                  Closed by {userName(thread.closed_by)} - {fmt(thread.closed_at)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
