import { useState } from 'react';
import { Card, SectionHeader, Button, Modal, EmptyState } from '../components/UI';

// ── Standard 38 scope items pre-loaded, all default Y ─────────────────────────
const STANDARD_ITEMS_TEMPLATE = [
  { category: 'Governance',           item: 'Procedures documented, up to date, updated within last year' },
  { category: 'Governance',           item: 'Clarity of roles and responsibilities; clear org chart and role descriptions' },
  { category: 'Governance',           item: 'Reporting lines ensure adequate segregation of duties' },
  { category: 'Governance',           item: 'Policies reviewed and approved by appropriate Board committee, at least annually' },
  { category: 'Governance',           item: 'Succession planning / notice periods / key person risks considered' },
  { category: 'Governance',           item: 'Business strategy clear and aligned to corporate objectives' },
  { category: 'Governance',           item: 'SMCR statements of responsibility documented and applied' },
  { category: 'New Products',         item: 'New products taken through New Product Forum approval process' },
  { category: 'New Products',         item: 'Conditions to approval addressed' },
  { category: 'BCP',                  item: 'BCP covers all processes performed by the team' },
  { category: 'BCP',                  item: 'Process priorities correspond to business criticality; reflected in third-party contracts' },
  { category: 'BCP',                  item: 'Application list is complete' },
  { category: 'BCP',                  item: 'BCP includes defined interim workaround procedures' },
  { category: 'BCP',                  item: 'BCP test performed in last year; all critical systems recovered' },
  { category: 'Data Protection',      item: 'GDPR, POPIA and equivalent principles adhered to where personal data processed' },
  { category: 'Risk Management',      item: 'RCSAs regularly completed and reviewed; include IT risk' },
  { category: 'Risk Management',      item: 'Risk events accurately captured centrally with treatment plans' },
  { category: 'Risk Management',      item: 'Risks / audit issues risk accepted per Risk Appetite Policy' },
  { category: 'Third-Party',          item: 'Procurement Policy complied with for vendor review and selection' },
  { category: 'Third-Party',          item: 'Current software licences for key applications in place' },
  { category: 'Third-Party',          item: 'Signed agreements per Authorised Signatory List' },
  { category: 'Third-Party',          item: 'Contractor performance monitored against SLAs' },
  { category: 'Regulatory Filings',   item: 'Team filing tasks have primary/secondary owners and reviewers identified' },
  { category: 'Gifts & Entertainment',item: 'Gifts/entertainment above GBP100 approved and logged' },
  { category: 'EUCA Risk',            item: 'Critical spreadsheets managed per EUC policy' },
  { category: 'EUCA Risk',            item: 'EUCAs protected for confidentiality, integrity, and availability' },
  { category: 'IT General Controls',  item: 'Key applications adequately risk-assessed' },
  { category: 'IT General Controls',  item: 'Strong password controls in place' },
  { category: 'IT General Controls',  item: 'User access management: access commensurate with role; toxic combinations reviewed' },
  { category: 'IT General Controls',  item: 'Change management: changes tested and approved before production' },
  { category: 'IT General Controls',  item: 'Backup and recovery performed per business requirements' },
  { category: 'IT General Controls',  item: 'Service and support processes to identify, report, and track errors' },
  { category: 'IT General Controls',  item: 'Interfaces: critical feeds monitored for accuracy and completeness' },
  { category: 'Conduct Risk',         item: 'Conduct risk reporting reviewed; conduct risk events identified and assessed' },
  { category: 'Fraud Risk',           item: 'Fraud risk considered; potential schemes identified' },
  { category: 'Risk & Control Culture', item: 'Adequate understanding of objectives and risks inherent in processes' },
  { category: 'Risk & Control Culture', item: 'Actions and plans in place to address known control deficiencies' },
  { category: 'Risk & Control Culture', item: 'Attitude towards IA review assessed (timeliness, cooperation)' },
].map((item, i) => ({ ...item, id: `si-${i + 1}`, in_scope: 'Y', notes: '' }));

function scopeColor(val) {
  if (val === 'Y') return 'var(--status-green)';
  if (val === 'N') return 'var(--text-muted)';
  return 'var(--status-amber)';
}

function ScopeToggle({ value, onChange }) {
  return (
    <select value={value ?? ''} onChange={e => onChange(e.target.value === '' ? null : e.target.value)}
      style={{ fontSize: 12, fontWeight: 700, padding: '3px 6px', borderRadius: 'var(--radius-sm)', border: `1px solid ${scopeColor(value)}`, background: 'var(--surface-0)', color: scopeColor(value), fontFamily: 'var(--font-sans)', cursor: 'pointer', width: 90 }}>
      <option value="Y">In Scope</option>
      <option value="N">Out of Scope</option>
      <option value="">TBC</option>
    </select>
  );
}

// ── Key Processes (blank, auditor adds) ───────────────────────────────────────
function KeyProcesses({ items, onUpdate, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false);
  const [processText, setProcessText] = useState('');

  function handleAdd() {
    if (!processText.trim()) return;
    onAdd(processText.trim());
    setProcessText('');
    setShowForm(false);
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Key Processes</h3>
          <span style={{ fontSize: 11, color: 'var(--status-green)', fontWeight: 600 }}>{items.filter(i => i.in_scope === 'Y').length} in scope</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(s => !s)}>+ Add Process</Button>
      </div>

      {showForm && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={processText} onChange={e => setProcessText(e.target.value)}
            placeholder="e.g. Daily reconciliation and exception management"
            style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--ni-teal)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', outline: 'none' }} />
          <Button variant="primary" size="sm" disabled={!processText.trim()} onClick={handleAdd}>Add</Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setProcessText(''); }}>Cancel</Button>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon="+" title="No key processes added" description="Add the processes in scope for this audit." />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-0)' }}>
              {['Process', 'In Scope?', 'Notes', ''].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', opacity: item.in_scope === 'N' ? 0.6 : 1 }}>
                <td style={{ padding: '10px 10px', lineHeight: 1.4, fontWeight: item.in_scope === 'Y' ? 500 : 400 }}>{item.process}</td>
                <td style={{ padding: '10px 10px', width: 100 }}>
                  <ScopeToggle value={item.in_scope} onChange={val => onUpdate('key_processes', item.id, 'in_scope', val)} />
                </td>
                <td style={{ padding: '10px 10px' }}>
                  <input type="text" value={item.notes} onChange={e => onUpdate('key_processes', item.id, 'notes', e.target.value)}
                    placeholder="Add note..."
                    style={{ width: '100%', fontSize: 12, padding: '4px 8px', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--border)'}
                    onBlur={e => e.target.style.borderColor = 'transparent'} />
                </td>
                <td style={{ padding: '10px 10px', width: 32 }}>
                  <button onClick={() => onRemove('key_processes', item.id)} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>x</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Standard Items (pre-loaded 38, default Y, N requires justification) ───────
function StandardItems({ items, onUpdate }) {
  const categories = [...new Set(items.map(i => i.category))];
  const [collapsed, setCollapsed] = useState({});
  const toggleCat = cat => setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
        Standard Scope Areas
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
          (all default In Scope — toggle to Out of Scope and provide justification if not applicable)
        </span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          const inCount  = catItems.filter(i => i.in_scope === 'Y').length;
          const isCollapsed = collapsed[cat];
          return (
            <div key={cat} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div onClick={() => toggleCat(cat)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-0)', cursor: 'pointer', borderBottom: isCollapsed ? 'none' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inCount}/{catItems.length} in scope</span>
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{isCollapsed ? '+' : '-'}</span>
              </div>
              {!isCollapsed && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <tbody>
                    {catItems.map((item, i) => {
                      const needsJustification = item.in_scope === 'N' && !item.notes?.trim();
                      return (
                        <tr key={item.id} style={{ borderBottom: i < catItems.length - 1 ? '1px solid var(--border)' : 'none', verticalAlign: 'top', opacity: item.in_scope === 'N' ? 0.7 : 1 }}>
                          <td style={{ padding: '9px 14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>{item.item}</td>
                          <td style={{ padding: '9px 10px', width: 100 }}>
                            <ScopeToggle value={item.in_scope} onChange={val => onUpdate('standard_items', item.id, 'in_scope', val)} />
                          </td>
                          <td style={{ padding: '9px 10px', width: '40%' }}>
                            <input type="text" value={item.notes}
                              onChange={e => onUpdate('standard_items', item.id, 'notes', e.target.value)}
                              placeholder={item.in_scope === 'N' ? 'Justification required *' : 'Notes...'}
                              style={{
                                width: '100%', fontSize: 11, padding: '3px 8px',
                                border: `1px solid ${needsJustification ? 'var(--status-red-border)' : 'transparent'}`,
                                borderRadius: 'var(--radius-sm)',
                                background: needsJustification ? 'var(--status-red-bg)' : 'transparent',
                                color: 'var(--text-muted)', fontFamily: 'var(--font-sans)',
                              }}
                              onFocus={e => { if (!needsJustification) e.target.style.borderColor = 'var(--border)'; }}
                              onBlur={e => { if (!needsJustification) e.target.style.borderColor = 'transparent'; }}
                            />
                          </td>
                        </tr>
                      );
                    })}
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
function PreviousIssues({ issues, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ issue_ref: '', title: '', rating: 'Moderate', closed: false, notes: '' });

  function handleAdd() {
    if (!form.title.trim()) return;
    onAdd({ ...form, id: `pi-${Date.now()}` });
    setForm({ issue_ref: '', title: '', rating: 'Moderate', closed: false, notes: '' });
    setShowForm(false);
  }

  const ratingColor = r => ({ 'Very High': 'var(--risk-very-high)', 'High': 'var(--risk-high)', 'Moderate': 'var(--risk-medium)', 'Low': 'var(--risk-low)' }[r] || 'var(--risk-low)');
  const inputStyle = { width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 12, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Previous Internal Audit Issues</h3>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(s => !s)}>+ Add Prior Issue</Button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--ni-teal)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>Issue Ref</label><input style={inputStyle} value={form.issue_ref} onChange={e => setForm(p => ({ ...p, issue_ref: e.target.value }))} placeholder="ISSUE-2024-001" /></div>
            <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div>
              <label style={labelStyle}>Rating</label>
              <select style={inputStyle} value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}>
                {['Very High','High','Moderate','Low'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Notes / current status</label>
            <input style={inputStyle} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Closed FY2025. Risk of repeat." />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.closed} onChange={e => setForm(p => ({ ...p, closed: e.target.checked }))}/> Closed
            </label>
            <div style={{ flex: 1 }} />
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="sm" disabled={!form.title.trim()} onClick={handleAdd}>Add</Button>
          </div>
        </div>
      )}

      {issues.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No previous IA issues identified in this area.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {issues.map(issue => (
            <div key={issue.id} style={{ padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: issue.closed ? 'transparent' : 'rgba(251,191,36,0.05)', borderLeft: `3px solid ${issue.closed ? 'var(--status-green)' : 'var(--status-amber)'}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  {issue.issue_ref && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{issue.issue_ref}</span>}
                  <span style={{ fontSize: 11, fontWeight: 700, color: ratingColor(issue.rating), padding: '1px 6px', borderRadius: 'var(--radius-sm)', border: `1px solid ${ratingColor(issue.rating)}` }}>{issue.rating}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: issue.closed ? 'var(--status-green)' : 'var(--status-amber)' }}>{issue.closed ? 'Closed' : 'Open'}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{issue.title}</div>
                {issue.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{issue.notes}</div>}
              </div>
              <button onClick={() => onRemove(issue.id)} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>x</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────
export default function PlanningScope({ auditData, onUpdateAuditData }) {
  const stored = auditData?.scopeItems || auditData?.scope_items;

  const [data, setData] = useState({
    key_processes:       stored?.key_processes      || [],
    standard_items:      stored?.standard_items?.length > 0 ? stored.standard_items : STANDARD_ITEMS_TEMPLATE,
    previous_ia_issues:  stored?.previous_ia_issues || [],
    data_analytics:      stored?.data_analytics     || '',
  });

  function persist(updated) {
    setData(updated);
    onUpdateAuditData?.('scopeItems', updated);
  }

  function updateItem(listKey, itemId, field, value) {
    persist({ ...data, [listKey]: data[listKey].map(item => item.id === itemId ? { ...item, [field]: value } : item) });
  }

  function addKeyProcess(processText) {
    const newItem = { id: `kp-${Date.now()}`, process: processText, in_scope: 'Y', notes: '' };
    persist({ ...data, key_processes: [...data.key_processes, newItem] });
  }

  function removeItem(listKey, itemId) {
    persist({ ...data, [listKey]: data[listKey].filter(i => i.id !== itemId) });
  }

  function addPriorIssue(issue) {
    persist({ ...data, previous_ia_issues: [...data.previous_ia_issues, issue] });
  }

  const inScopeCount = data.key_processes.filter(i => i.in_scope === 'Y').length + data.standard_items.filter(i => i.in_scope === 'Y').length;
  const tbcCount = [...data.key_processes, ...data.standard_items].filter(i => !i.in_scope || i.in_scope === null).length;

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader title="Scope Determination" subtitle="Key processes and standard scope areas covered in this audit" />

      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--status-green)' }}>{inScopeCount}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>In scope</div>
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

      <KeyProcesses
        items={data.key_processes}
        onUpdate={updateItem}
        onAdd={addKeyProcess}
        onRemove={(listKey, id) => removeItem(listKey, id)}
      />
      <PreviousIssues
        issues={data.previous_ia_issues}
        onAdd={addPriorIssue}
        onRemove={id => removeItem('previous_ia_issues', id)}
      />
      <StandardItems items={data.standard_items} onUpdate={updateItem} />

      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Data Analytics</h3>
        <textarea
          value={data.data_analytics}
          onChange={e => persist({ ...data, data_analytics: e.target.value })}
          rows={3}
          placeholder="Describe data analytics approach, tools, and any relevant past analytics..."
          style={{ width: '100%', fontSize: 13, lineHeight: 1.6, padding: '10px 12px', resize: 'vertical', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
        />
      </div>
    </Card>
  );
}
