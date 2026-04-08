import { useState } from 'react';
import { Card, SectionHeader, Field, CommentButton, Button } from '../components/UI';

const SECTION_REF = 'Terms of Reference';

const TOR_FIELDS = [
  { key: 'objectives',      label: 'Audit Objectives',  rows: 4 },
  { key: 'scope',           label: 'Scope',             rows: 4 },
  { key: 'out_of_scope',    label: 'Out of Scope',      rows: 3 },
  { key: 'methodology',     label: 'Methodology',       rows: 4 },
  { key: 'reporting_lines', label: 'Reporting Lines',   rows: 2 },
  { key: 'key_contacts',    label: 'Key Contacts',      rows: 3 },
];

const BLANK_TOR = { objectives: '', scope: '', out_of_scope: '', methodology: '', reporting_lines: '', key_contacts: '' };

export default function PlanningToR({ audit, auditData, onUpdateAuditData, reviewComments = [], openDrawer, users = [] }) {
  const stored = auditData?.tor;
  const [data, setData] = useState(
    stored && Object.keys(stored).some(k => stored[k]) ? stored : BLANK_TOR
  );
  const [exporting, setExporting] = useState(false);

  function handleChange(key, val) {
    const updated = { ...data, [key]: val };
    setData(updated);
    onUpdateAuditData?.('tor', updated);
  }

  const allFieldsFilled = TOR_FIELDS.every(f => data[f.key]?.trim()?.length >= 10);

  function handleExportTOR() {
    setExporting(true);
    try {
      // Build team rows
      const team = [];
      if (audit?.lead_auditor_id) {
        const u = users.find(u => u.id === audit.lead_auditor_id);
        if (u) team.push({ name: u.full_name, role: 'Audit Lead' });
      }
      if (audit?.reviewer_id) {
        const u = users.find(u => u.id === audit.reviewer_id);
        if (u) team.push({ name: u.full_name, role: 'Reviewer' });
      }
      if (audit?.auditor_id) {
        const u = users.find(u => u.id === audit.auditor_id);
        if (u) team.push({ name: u.full_name, role: 'Auditor' });
      }
      if (audit?.it_auditor_id) {
        const u = users.find(u => u.id === audit.it_auditor_id);
        if (u) team.push({ name: u.full_name, role: 'IT Auditor' });
      }
      const hia = users.find(u => u.role === 'HIA');
      if (hia && !team.find(t => t.name === hia.full_name)) {
        team.push({ name: hia.full_name, role: 'Head of Internal Audit' });
      }

      // Build risks list from RACM
      const racmRisks = auditData?.racmRisks || auditData?.racm_risks || [];
      const riskItems = racmRisks.map(r => r.risk_description).filter(Boolean);

      // Get month/year
      const monthYear = audit?.planned_start
        ? new Date(audit.planned_start).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

      // Build out_of_scope lines
      const outOfScopeLines = (data.out_of_scope || '')
        .split('\n').filter(l => l.trim())
        .map(l => `<p style="margin:0 0 4pt 0">${l.trim()}</p>`).join('') || '<p style="margin:0">None noted.</p>';

      // Build scope lines
      const scopeLines = (data.scope || '')
        .split('\n').filter(l => l.trim())
        .map(l => `<p style="margin:0 0 4pt 0">${l.trim()}</p>`).join('') || '';

      // Word-compatible HTML matching template structure exactly
      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Calibri, sans-serif; font-size: 11pt; margin: 2cm 2.5cm; color: #000; line-height: 1.4; }
  h1.doc-title { font-size: 20pt; font-weight: bold; color: #000; margin: 0 0 2pt 0; }
  h2.doc-subtitle { font-size: 14pt; font-weight: normal; color: #000; margin: 0 0 2pt 0; }
  .month-year { font-size: 11pt; color: #000; margin: 0 0 24pt 0; }
  h2.section { font-size: 13pt; font-weight: bold; color: #000; margin: 18pt 0 6pt 0; border: none; }
  p { margin: 0 0 8pt 0; font-size: 11pt; }
  ul { margin: 0 0 8pt 0; padding-left: 18pt; }
  li { margin-bottom: 3pt; font-size: 11pt; }
  table { border-collapse: collapse; width: 100%; margin-top: 6pt; }
  th { background: #000; color: #fff; padding: 5pt 8pt; text-align: left; font-size: 11pt; font-weight: bold; }
  td { padding: 5pt 8pt; border: 1pt solid #000; font-size: 11pt; }
  .italic { font-style: italic; color: #444; }
  .signature-line { margin-top: 32pt; }
</style>
</head>
<body>

<h1 class="doc-title">Terms of Reference</h1>
<h2 class="doc-subtitle">${audit?.title || '[Audit Title]'}</h2>
<p class="month-year">${monthYear}</p>

<h2 class="section">Audit Objective</h2>
<p>The objective of the audit is to evaluate the ${audit?.title || '[AUDIT TITLE]'} control environment and assess whether the risks identified are adequately controlled and are commensurate with Management's risk appetite.</p>
${data.objectives ? `<p>${data.objectives.replace(/\n/g, '<br>')}</p>` : ''}

<h2 class="section">Risks</h2>
<p>The audit of ${audit?.title || '[AUDIT TITLE]'} will consider the following risks:</p>
${riskItems.length > 0
  ? `<ul>${riskItems.map(r => `<li>${r}</li>`).join('')}</ul>`
  : '<ul><li>[Risk 1]</li><li>[Risk 2]</li></ul>'
}

<h2 class="section">Scope</h2>
<p>The audit will include, but not necessarily be limited to, a review of the following key processes and will cover the period ${audit?.planned_start ? new Date(audit.planned_start).toLocaleDateString('en-GB') : '[dd/mm/yyyy]'} to ${audit?.planned_end ? new Date(audit.planned_end).toLocaleDateString('en-GB') : '[dd/mm/yyyy]'}:</p>
${scopeLines}
<p>As part of the review, Internal Audit will also consider Management's approach to risk management and internal control. This will include Management's actions in addressing known control deficiencies as well as Management's regular assessment of controls.</p>
<p>Should a change in scope occur, during the performance of the review, this will be communicated by way of a "Scope change" e-mail, and a follow up call with the Head of the business area.</p>

<h2 class="section">Legal Entities</h2>
<p>The review impacts the following legal entities:</p>
<ul>
  <li>Ninety One Plc and subsidiaries</li>
  <li>Ninety One Ltd and subsidiaries</li>
</ul>

<h2 class="section">Scope Exclusions</h2>
<p>This audit will not include the following:</p>
${outOfScopeLines}

<h2 class="section">Resources</h2>
<p>The following staff will be involved in the review:</p>
<table>
  <tr><th>Staff member</th><th>Role</th></tr>
  ${team.map(m => `<tr><td>${m.name}</td><td>${m.role}</td></tr>`).join('')}
  ${team.length === 0 ? '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>' : ''}
</table>

<div class="signature-line">
<p>Kind regards</p>
<p><strong>${team.find(t => t.role === 'Audit Lead')?.name || '[Name]'}</strong></p>
</div>

</body>
</html>`;

      const blob = new Blob([html], { type: 'application/msword' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const safeName = (audit?.title || 'TOR').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
      a.href     = url;
      a.download = `TOR_${safeName}.doc`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('TOR export error:', err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Terms of Reference"
        subtitle="Defines the objectives, scope, and approach for this audit"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {openDrawer && (
              <CommentButton
                sectionRef={SECTION_REF} rowRef={null} comments={reviewComments}
                onClick={() => openDrawer({ sectionRef: SECTION_REF, rowRef: null, title: 'Terms of Reference', contextLabel: 'Planning - Terms of Reference' })}
              />
            )}
            <Button
              variant="secondary" size="sm"
              onClick={handleExportTOR}
              disabled={exporting || !allFieldsFilled}
            >
              {exporting ? 'Exporting...' : 'Export TOR'}
            </Button>
          </div>
        }
      />
      {!allFieldsFilled && (
        <div style={{ padding: '8px 12px', background: 'var(--status-amber-bg)', border: '1px solid var(--status-amber-border)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--status-amber)', marginBottom: 16 }}>
          Complete all 6 fields to enable TOR export and Planning sign-off.
        </div>
      )}
      {TOR_FIELDS.map(f => (
        <Field
          key={f.key}
          label={f.label}
          value={data[f.key] || ''}
          multiline
          rows={f.rows}
          onChange={val => handleChange(f.key, val)}
        />
      ))}
    </Card>
  );
}
