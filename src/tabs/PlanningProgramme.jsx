import { useState } from 'react';
import { Card, SectionHeader, Badge, Button, EmptyState, Modal, Field } from '../components/UI';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Complete'];

export default function PlanningProgramme({ auditData, onUpdateAuditData, users = [], currentUser }) {
  const items = auditData?.programme || [];
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo]   = useState('');
  const [hours, setHours]             = useState('');

  const counts = { 'Not Started': 0, 'In Progress': 0, 'Complete': 0 };
  items.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
  const totalHours     = items.reduce((sum, s) => sum + (Number(s.estimated_hours) || 0), 0);
  const completedHours = items.filter(s => s.status === 'Complete').reduce((sum, s) => sum + (Number(s.estimated_hours) || 0), 0);

  function getUserName(id) {
    return users.find(u => u.id === id)?.full_name || '-';
  }

  function updateStatus(stepId, newStatus) {
    const updated = items.map(s => s.id === stepId ? { ...s, status: newStatus } : s);
    onUpdateAuditData('programme', updated);
  }

  function handleAddStep() {
    if (!description.trim()) return;
    const newStep = {
      id: `step-${Date.now()}`,
      step_number: items.length + 1,
      description: description.trim(),
      assigned_to: assignedTo || null,
      estimated_hours: Number(hours) || 0,
      status: 'Not Started',
    };
    onUpdateAuditData('programme', [...items, newStep]);
    setDescription(''); setAssignedTo(''); setHours('');
    setShowModal(false);
  }

  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'var(--font-sans)', background: 'var(--surface-0)', color: 'var(--text-primary)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 };

  return (
    <>
      <Card style={{ padding: 20 }}>
        <SectionHeader
          title="Audit Programme"
          subtitle={items.length > 0 ? `${items.length} steps - ${totalHours}h estimated - ${completedHours}h complete` : 'No steps yet'}
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {items.length > 0 && Object.entries(counts).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Badge label={status} size="sm" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => setShowModal(true)}>+ Add Step</Button>
            </div>
          }
        />

        {items.length === 0 ? (
          <EmptyState icon="o" title="No programme steps yet" description="Build out your audit programme by adding steps with assignees and estimated hours." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-0)' }}>
                {['#', 'Description', 'Assigned To', 'Est. Hours', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((step, i) => {
                const isLast = i === items.length - 1;
                return (
                  <tr key={step.id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, width: 32 }}>{step.step_number}</td>
                    <td style={{ padding: '10px 10px', lineHeight: 1.5 }}>{step.description}</td>
                    <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{getUserName(step.assigned_to)}</td>
                    <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{step.estimated_hours}h</td>
                    <td style={{ padding: '10px 10px' }}>
                      <select
                        value={step.status}
                        onChange={e => updateStatus(step.id, e.target.value)}
                        style={{ fontSize: 12, padding: '3px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <Modal title="Add Programme Step" onClose={() => setShowModal(false)} width={500}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Description *" value={description} onChange={setDescription} multiline rows={3} hint="Describe what testing or work will be performed in this step." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Assigned To</label>
                <select style={inputStyle} value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                  <option value="">-- Unassigned --</option>
                  {users.filter(u => u.role !== 'HIA').map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Estimated Hours</label>
                <input style={inputStyle} type="number" min="0" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 8" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" disabled={!description.trim()} onClick={handleAddStep}>Add Step</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
