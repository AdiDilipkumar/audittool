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

  // Check if all 6 fields have content (for sign-off gate)
  const allFieldsFilled = TOR_FIELDS.every(f => data[f.key]?.trim()?.length >= 10);

  async function handleExportTOR() {
    setExporting(true);
    try {
      // Build team table rows from audit roles
      const team = [];
      if (audit?.lead_auditor_id) {
        const lead = users.find(u => u.id === audit.lead_auditor_id);
        if (lead) team.push({ name: lead.full_name, role: 'Audit Lead' });
      }
      if (audit?.reviewer_id) {
        const reviewer = users.find(u => u.id === audit.reviewer_id);
        if (reviewer) team.push({ name: reviewer.full_name, role: 'Reviewer' });
      }
      const hia = users.find(u => u.role === 'HIA');
      if (hia) team.push({ name: hia.full_name, role: 'Head of Internal Audit' });

      // Call the TOR generation endpoint via the Anthropic API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Return ONLY a JSON object (no markdown, no explanation) with this structure:
{
  "title": "${audit?.title || 'Audit'}",
  "objectives": "${(data.objectives || '').replace(/"/g, '\\"')}",
  "scope": "${(data.scope || '').replace(/"/g, '\\"')}",
  "out_of_scope": "${(data.out_of_scope || '').replace(/"/g, '\\"')}",
  "methodology": "${(data.methodology || '').replace(/"/g, '\\"')}",
  "reporting_lines": "${(data.reporting_lines || '').replace(/"/g, '\\"')}",
  "key_contacts": "${(data.key_contacts || '').replace(/"/g, '\\"')}",
  "team": ${JSON.stringify(team)}
}`
          }]
        })
      });
      const result = await response.json();
      const torData = JSON.parse(result.content[0].text);
      generateTORDocx(torData);
    } catch (err) {
      console.error('TOR export error:', err);
      // Fallback: generate directly from state
      generateTORDocx({
        title: audit?.title || 'Audit',
        ...data,
        team: [],
      });
    } finally {
      setExporting(false);
    }
  }

  function generateTORDocx(torData) {
    // Generate TOR as HTML for download (docx generation requires server-side Node.js)
    // This creates a well-formatted HTML document that can be opened in Word
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 2.5cm; color: #000; }
  .header-bar { background: #1A2B4A; color: #fff; padding: 16px 20px; margin-bottom: 24px; }
  .header-bar h1 { font-size: 16pt; font-weight: bold; margin: 0 0 4px 0; color: #fff; }
  .header-bar p { font-size: 10pt; margin: 0; color: rgba(255,255,255,0.7); }
  .doc-title { font-size: 20pt; font-weight: bold; color: #1A2B4A; margin-bottom: 4px; }
  .subtitle { font-size: 12pt; color: #666; margin-bottom: 24px; }
  h2 { font-size: 13pt; font-weight: bold; color: #1A2B4A; border-bottom: 2px solid #00847F; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
  p { line-height: 1.6; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #1A2B4A; color: #fff; padding: 8px 10px; text-align: left; font-size: 10pt; }
  td { padding: 8px 10px; border-bottom: 1px solid #ddd; font-size: 10pt; }
  .teal { color: #00847F; }
  .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 9pt; color: #999; }
</style>
</head>
<body>
<div class="header-bar">
  <h1>Ninety One | Internal Audit</h1>
  <p>Confidential | Internal Use Only</p>
</div>

<div class="doc-title">Terms of Reference</div>
<div class="subtitle">${torData.title}</div>

<h2>Audit Objective</h2>
<p>${(torData.objectives || '').replace(/\n/g, '<br>')}</p>

<h2>Scope</h2>
<p>${(torData.scope || '').replace(/\n/g, '<br>')}</p>

<h2>Scope Exclusions</h2>
<p>${(torData.out_of_scope || 'None noted.').replace(/\n/g, '<br>')}</p>

<h2>Methodology</h2>
<p>${(torData.methodology || '').replace(/\n/g, '<br>')}</p>

<h2>Reporting Lines</h2>
<p>${(torData.reporting_lines || '').replace(/\n/g, '<br>')}</p>

<h2>Key Contacts</h2>
<p>${(torData.key_contacts || '').replace(/\n/g, '<br>')}</p>

<h2>Resources</h2>
<table>
  <tr><th>Staff Member</th><th>Role</th></tr>
  ${(torData.team || []).map(m => `<tr><td>${m.name}</td><td>${m.role}</td></tr>`).join('')}
</table>

<div class="footer">
  Internal Audit | Ninety One | Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
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
