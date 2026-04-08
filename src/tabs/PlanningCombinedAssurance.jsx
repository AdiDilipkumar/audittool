import { useState } from 'react';
import { Card, SectionHeader } from '../components/UI';

const ASSURANCE_PROVIDERS = [
  { key: 'compliance',       label: 'Compliance / Compliance Monitoring', color: 'var(--status-blue)' },
  { key: 'operational_risk', label: 'Operational Risk',                   color: 'var(--status-amber)' },
  { key: 'external_audit',   label: 'External Audit',                     color: 'var(--ni-teal)' },
  { key: 'other',            label: 'Other Assurance Providers',          color: 'var(--text-muted)' },
];

const BLANK = { compliance: '', operational_risk: '', external_audit: '', other: '' };

export default function PlanningCombinedAssurance({ auditData, onUpdateAuditData }) {
  const stored = auditData?.combinedAssurance || auditData?.combined_assurance;
  const [data, setData] = useState(
    stored && Object.keys(stored).length > 0 ? stored : BLANK
  );

  function handleChange(key, val) {
    const updated = { ...data, [key]: val };
    setData(updated);
    onUpdateAuditData?.('combinedAssurance', updated);
  }

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Combined Assurance"
        subtitle="Work performed by other assurance functions relevant to this audit"
      />
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
        Review work undertaken by Compliance, Operational Risk, and External Audit in the audit area.
        Consider whether reliance can be placed on this work and note any coordination required.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ASSURANCE_PROVIDERS.map(provider => (
          <div key={provider.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: provider.color, flexShrink: 0 }} />
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {provider.label}
              </label>
            </div>
            <textarea
              value={data[provider.key]}
              onChange={e => handleChange(provider.key, e.target.value)}
              rows={3}
              placeholder={`Describe any recent work by ${provider.label} in this area, including scope, findings, and open actions...`}
              style={{ width: '100%', fontSize: 13, lineHeight: 1.6, padding: '10px 12px', resize: 'vertical', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--ni-teal-dim)', border: '1px solid rgba(0,167,157,0.2)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--ni-teal)' }}>Coordination note:</strong> Where External Audit is likely to place reliance on IA work, confirm proposed sample sizes with KPMG in advance per NI sampling guidelines.
      </div>
    </Card>
  );
}
