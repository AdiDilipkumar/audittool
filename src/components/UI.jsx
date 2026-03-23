// ─── SHARED UI COMPONENTS ────────────────────────────────────────────────────
import { useState } from 'react';

// ── Badge ──────────────────────────────────────────────────────────────────
const STATUS_BADGE_STYLES = {
  // Audit status
  'Planning':    { bg: 'var(--status-blue-bg)',   color: 'var(--status-blue)',   border: 'var(--status-blue-border)' },
  'Fieldwork':   { bg: 'var(--status-amber-bg)',  color: 'var(--status-amber)',  border: 'var(--status-amber-border)' },
  'Reporting':   { bg: 'var(--ni-teal-dim)',       color: 'var(--ni-teal)',       border: 'rgba(0,167,157,0.3)' },
  'Complete':    { bg: 'var(--status-green-bg)',  color: 'var(--status-green)',  border: 'var(--status-green-border)' },
  // Step status
  'Not Started': { bg: 'var(--status-grey-bg)',   color: 'var(--status-grey)',   border: 'var(--status-grey-border)' },
  'In Progress': { bg: 'var(--status-amber-bg)',  color: 'var(--status-amber)',  border: 'var(--status-amber-border)' },
  // Control testing
  'Tested - Effective':   { bg: 'var(--status-green-bg)', color: 'var(--status-green)', border: 'var(--status-green-border)' },
  'Tested - Ineffective': { bg: 'var(--status-red-bg)',   color: 'var(--status-red)',   border: 'var(--status-red-border)' },
  'Not Tested':  { bg: 'var(--status-grey-bg)',   color: 'var(--status-grey)',   border: 'var(--status-grey-border)' },
  // Design/OE
  'Effective':   { bg: 'var(--status-green-bg)', color: 'var(--status-green)', border: 'var(--status-green-border)' },
  'Ineffective': { bg: 'var(--status-red-bg)',   color: 'var(--status-red)',   border: 'var(--status-red-border)' },
  // Query/issue
  'Open':        { bg: 'var(--status-amber-bg)',  color: 'var(--status-amber)',  border: 'var(--status-amber-border)' },
  'Closed':      { bg: 'var(--status-green-bg)',  color: 'var(--status-green)',  border: 'var(--status-green-border)' },
  'Promoted':    { bg: 'var(--status-blue-bg)',   color: 'var(--status-blue)',   border: 'var(--status-blue-border)' },
  'Responded':   { bg: 'var(--status-blue-bg)',   color: 'var(--status-blue)',   border: 'var(--status-blue-border)' },
  'Draft':       { bg: 'var(--status-grey-bg)',   color: 'var(--status-grey)',   border: 'var(--status-grey-border)' },
  'Agreed':      { bg: 'var(--status-green-bg)',  color: 'var(--status-green)',  border: 'var(--status-green-border)' },
  'Disputed':    { bg: 'var(--status-red-bg)',    color: 'var(--status-red)',    border: 'var(--status-red-border)' },
  'Mgmt Response Pending': { bg: 'var(--status-amber-bg)', color: 'var(--status-amber)', border: 'var(--status-amber-border)' },
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
      fontWeight: 500, letterSpacing: '0.02em',
      borderRadius: '100px',
      background: styles.bg,
      color: styles.color,
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
    primary: {
      background: 'var(--ni-teal)', color: '#fff',
      border: '1px solid var(--ni-teal)',
    },
    secondary: {
      background: 'var(--surface-1)', color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--status-red-bg)', color: 'var(--status-red)',
      border: '1px solid var(--status-red-border)',
    },
    ghost: {
      background: 'transparent', color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
  };

  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ── Field (read/edit) ──────────────────────────────────────────────────────
export function Field({ label, value, onChange, multiline = false, rows = 3, hint }) {
  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
    color: 'var(--text-primary)',
    background: 'var(--surface-0)',
    resize: multiline ? 'vertical' : 'none',
    outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'var(--font-sans)',
    lineHeight: 1.5,
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange && onChange(e.target.value)}
          rows={rows} style={inputStyle} readOnly={!onChange} />
      ) : (
        <input type="text" value={value} onChange={e => onChange && onChange(e.target.value)}
          style={inputStyle} readOnly={!onChange} />
      )}
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
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
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
    { key: 'auditor', label: 'Auditor', id: signOff?.auditor_id, signed_at: signOff?.auditor_signed_at },
    { key: 'reviewer', label: 'Reviewer', id: signOff?.reviewer_id, signed_at: signOff?.reviewer_signed_at },
    { key: 'hia', label: 'HIA', id: signOff?.hia_id, signed_at: signOff?.hia_signed_at },
  ];

  return (
    <Card style={{ padding: '16px 20px' }}>
      <SectionHeader title="Sign-off" subtitle="Three-tier approval required to close this phase" />
      <div style={{ display: 'flex', gap: 12 }}>
        {tiers.map((tier, i) => {
          const signed = !!tier.signed_at;
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
              {signed ? (
                <span style={{ fontSize: 12, color: 'var(--status-green)', fontWeight: 500 }}>
                  Signed {new Date(tier.signed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending</span>
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
        boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>x</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
