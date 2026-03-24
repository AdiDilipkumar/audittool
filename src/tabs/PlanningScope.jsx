import { useState } from 'react';
import { Card, SectionHeader, Badge } from '../components/UI';
import { SCOPE_ITEMS } from '../data/mockData';

const IN_SCOPE_OPTIONS = [
  { value: 'Y', label: 'In Scope',     color: 'var(--status-green)' },
  { value: 'N', label: 'Out of Scope', color: 'var(--text-muted)' },
  { value: null, label: 'TBC',         color: 'var(--status-amber)' },
];

function scopeColor(val) {
  if (val === 'Y')  return 'var(--status-green)';
  if (val === 'N')  return 'var(--text-muted)';
  return 'var(--status-amber)';
}

function scopeLabel(val) {
  if (val === 'Y') return 'Y';
  if (val === 'N') return 'N';
  return 'TBC';
}

function ScopeBadge({ value }) {
  const color = scopeColor(value);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 40, padding: '2px 8px',
      fontSize: 11, fontWeight: 700,
      color, border: `1px solid ${color}`,
      borderRadius: 'var(--radius-sm)',
      background: value === 'Y' ? 'rgba(34,197,94,0.08)' : 'transparent',
    }}>
      {scopeLabel(value)}
    </span>
  );
}

function ScopeToggle({ value, onChange }) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? null : e.target.value)}
      style={{
        fontSize: 12, fontWeight: 700,
        padding: '3px 6px',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${scopeColor(value)}`,
        background: 'var(--surface-0)',
        color: scopeColor(value),
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        width: 72,
      }}
    >
      <option value="Y">In Scope</option>
      <option value="N">Out of Scope</option>
      <option value="">TBC</option>
    </select>
  );
}

// ── Key Processes table ───────────────────────────────────────────────────────
function KeyProcesses({ items, onUpdate }) {
  const inCount  = items.filter(i => i.in_scope === 'Y').length;
  const outCount = items.filter(i => i.in_scope === 'N').length;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Key Processes
        </h3>
        <span style={{ fontSize: 11, color: 'var(--status-green)', fontWeight: 600 }}>{inCount} in scope</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{outCount} excluded</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--surface-0)' }}>
            {['Process', 'In Scope?', 'Notes'].map(h => (
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
          {items.map((item, i) => (
            <tr key={item.id} style={{
              borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: item.in_scope === 'N' ? 0.55 : 1,
            }}>
              <td style={{ padding: '10px 10px', lineHeight: 1.4, fontWeight: item.in_scope === 'Y' ? 500 : 400 }}>
                {item.process}
              </td>
              <td style={{ padding: '10px 10px', width: 90 }}>
                <ScopeToggle value={item.in_scope} onChange={val => onUpdate('key_processes', item.id, 'in_scope', val)} />
              </td>
              <td style={{ padding: '10px 10px' }}>
                <input
                  type="text"
                  value={item.notes}
                  onChange={e => onUpdate('key_processes', item.id, 'notes', e.target.value)}
                  placeholder="Add note..."
                  style={{
                    width: '100%', fontSize: 12, padding: '4px 8px',
                    border: '1px solid transparent', borderRadius: 'var(--radius-sm)',
                    background: 'transparent', color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--border)'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Standard scope items grouped by category ──────────────────────────────────
function StandardItems({ items, onUpdate }) {
  const categories = [...new Set(items.map(i => i.category))];
  const [collapsed, setCollapsed] = useState({});

  function toggleCategory(cat) {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
        Standard Scope Areas
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          const inCount  = catItems.filter(i => i.in_scope === 'Y').length;
          const isCollapsed = collapsed[cat];

          return (
            <div key={cat} style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              {/* Category header */}
              <div
                onClick={() => toggleCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--surface-0)',
                  cursor: 'pointer',
                  borderBottom: isCollapsed ? 'none' : '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {inCount}/{catItems.length} in scope
                  </span>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  {isCollapsed ? '+' : '-'}
                </span>
              </div>

              {/* Items */}
              {!isCollapsed && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <tbody>
                    {catItems.map((item, i) => (
                      <tr key={item.id} style={{
                        borderBottom: i < catItems.length - 1 ? '1px solid var(--border)' : 'none',
                        opacity: item.in_scope === 'N' ? 0.5 : 1,
                        verticalAlign: 'top',
                      }}>
                        <td style={{ padding: '9px 14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                          {item.item}
                        </td>
                        <td style={{ padding: '9px 10px', width: 90 }}>
                          <ScopeToggle value={item.in_scope} onChange={val => onUpdate('standard_items', item.id, 'in_scope', val)} />
                        </td>
                        <td style={{ padding: '9px 10px', width: '35%' }}>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={e => onUpdate('standard_items', item.id, 'notes', e.target.value)}
                            placeholder="Notes / rationale if excluded..."
                            style={{
                              width: '100%', fontSize: 11, padding: '3px 8px',
                              border: '1px solid transparent', borderRadius: 'var(--radius-sm)',
                              background: 'transparent', color: 'var(--text-muted)',
                              fontFamily: 'var(--font-sans)',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--border)'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Previous IA Issues ────────────────────────────────────────────────────────
function PreviousIssues({ issues }) {
  const ratingColor = r => {
    if (r === 'Very High') return 'var(--risk-very-high)';
    if (r === 'High')      return 'var(--risk-high)';
    if (r === 'Moderate')  return 'var(--risk-medium)';
    return 'var(--risk-low)';
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
        Previous Internal Audit Issues
      </h3>
      {issues.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No previous IA issues identified in this area.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {issues.map(issue => (
            <div key={issue.id} style={{
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: issue.closed ? 'transparent' : 'rgba(251,191,36,0.05)',
              borderLeft: `3px solid ${issue.closed ? 'var(--status-green)' : 'var(--status-amber)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {issue.issue_ref}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: ratingColor(issue.rating),
                  padding: '1px 6px', borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${ratingColor(issue.rating)}`,
                }}>
                  {issue.rating}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: issue.closed ? 'var(--status-green)' : 'var(--status-amber)',
                }}>
                  {issue.closed ? 'Closed' : 'Open'}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{issue.title}</div>
              {issue.notes && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{issue.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Data Analytics ────────────────────────────────────────────────────────────
function DataAnalytics({ value, onChange }) {
  return (
    <div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
        Data Analytics
      </h3>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        placeholder="Describe data analytics approach, tools, and any past analytics results relevant to this audit..."
        style={{
          width: '100%', fontSize: 13, lineHeight: 1.6,
          padding: '10px 12px', resize: 'vertical',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-0)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
        }}
      />
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────
export default function PlanningScope() {
  const [data, setData] = useState(SCOPE_ITEMS);

  function updateItem(listKey, itemId, field, value) {
    setData(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  }

  const inScopeProcess = data.key_processes.filter(i => i.in_scope === 'Y').length;
  const inScopeStandard = data.standard_items.filter(i => i.in_scope === 'Y').length;
  const tbcCount = [...data.key_processes, ...data.standard_items].filter(i => i.in_scope === null).length;

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Scope Determination"
        subtitle="Key processes and standard scope areas covered in this audit"
      />

      {/* Summary counts */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--status-green)' }}>{inScopeProcess + inScopeStandard}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Items in scope</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-muted)' }}>
            {data.key_processes.filter(i => i.in_scope === 'N').length + data.standard_items.filter(i => i.in_scope === 'N').length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Excluded</div>
        </div>
        {tbcCount > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--status-amber)' }}>{tbcCount}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>TBC</div>
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--status-amber)' }}>{data.previous_ia_issues.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Prior IA issues</div>
        </div>
      </div>

      <KeyProcesses items={data.key_processes} onUpdate={updateItem} />
      <PreviousIssues issues={data.previous_ia_issues} />
      <StandardItems items={data.standard_items} onUpdate={updateItem} />
      <DataAnalytics
        value={data.data_analytics}
        onChange={val => setData(prev => ({ ...prev, data_analytics: val }))}
      />
    </Card>
  );
}
