import { useState } from 'react';
import { Card, SectionHeader, Badge } from '../components/UI';
import { AUDIT_PROGRAMME, USERS } from '../data/mockData';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Complete'];

export default function PlanningProgramme() {
  const [items, setItems] = useState(AUDIT_PROGRAMME);

  const counts = { 'Not Started': 0, 'In Progress': 0, 'Complete': 0 };
  items.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
  const totalHours = items.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);
  const completedHours = items
    .filter(s => s.status === 'Complete')
    .reduce((sum, s) => sum + (s.estimated_hours || 0), 0);

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Audit Programme"
        subtitle={`${items.length} steps \u00b7 ${totalHours}h estimated \u00b7 ${completedHours}h complete`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(counts).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Badge label={status} size="sm" />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        }
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--surface-0)' }}>
            {['#', 'Description', 'Assigned To', 'Est. Hours', 'Status'].map(h => (
              <th key={h} style={{
                padding: '8px 10px', textAlign: 'left',
                fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((step, i) => {
            const assignee = USERS.find(u => u.id === step.assigned_to);
            const isLast = i === items.length - 1;
            return (
              <tr key={step.id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                <td style={{ padding: '10px 10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, width: 32 }}>
                  {step.step_number}
                </td>
                <td style={{ padding: '10px 10px', lineHeight: 1.5 }}>{step.description}</td>
                <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                  {assignee?.full_name || '-'}
                </td>
                <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {step.estimated_hours}h
                </td>
                <td style={{ padding: '10px 10px' }}>
                  <select
                    value={step.status}
                    onChange={e => setItems(prev => prev.map(s =>
                      s.id === step.id ? { ...s, status: e.target.value } : s
                    ))}
                    style={{
                      fontSize: 12, padding: '3px 6px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-0)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      cursor: 'pointer',
                    }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
