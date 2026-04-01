import { useState } from 'react';

// Role colours matching the app's badge system
const ROLE_STYLES = {
  'HIA':      { bg: 'var(--ni-teal-dim)',      color: 'var(--ni-teal)',      border: 'rgba(0,167,157,0.3)' },
  'Reviewer': { bg: 'var(--status-blue-bg)',   color: 'var(--status-blue)',  border: 'var(--status-blue-border)' },
  'Auditor':  { bg: 'var(--status-amber-bg)',  color: 'var(--status-amber)', border: 'var(--status-amber-border)' },
};

// Initials avatar
function Avatar({ name, size = 48 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--ni-teal)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: '#fff',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function ProfileSelector({ users, onSelectProfile }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      height: '100vh',
      background: 'var(--surface-0)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--ni-teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, fontWeight: 700, color: '#fff',
        }}>91</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Internal Audit
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ninety One</div>
        </div>
      </div>

      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Who are you?
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.5 }}>
          Select your profile. This will be remembered on this browser so you only need to do this once.
        </p>
      </div>

      {/* Profile cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 14,
        width: '100%',
        maxWidth: 480,
      }}>
        {users.map(user => {
          const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES['Auditor'];
          const isHovered = hovered === user.id;
          return (
            <button
              key={user.id}
              onClick={() => onSelectProfile(user)}
              onMouseEnter={() => setHovered(user.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '24px 16px',
                background: isHovered ? 'var(--surface-1)' : 'var(--surface-1)',
                border: `1.5px solid ${isHovered ? 'var(--ni-teal)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-xl)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                textAlign: 'center',
              }}
            >
              <Avatar name={user.full_name} size={52} />
              <div>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}>
                  {user.full_name}
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  fontSize: 11, fontWeight: 500,
                  background: roleStyle.bg,
                  color: roleStyle.color,
                  border: `1px solid ${roleStyle.border}`,
                }}>
                  {user.role}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
        Testing environment - no password required
      </p>
    </div>
  );
}
