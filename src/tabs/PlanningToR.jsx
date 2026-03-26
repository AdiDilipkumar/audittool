import { useState } from 'react';
import { Card, SectionHeader, Field, CommentButton } from '../components/UI';
import { TERMS_OF_REFERENCE } from '../data/mockData';

const SECTION_REF = 'Terms of Reference';

export default function PlanningToR({ auditData, onUpdateAuditData, reviewComments = [], openDrawer }) {
  // Use per-audit TOR if available, fall back to default mock data for audit-001
  const initialTOR = auditData?.tor || TERMS_OF_REFERENCE;
  const [data, setData] = useState(initialTOR);

  const handleChange = (key, val) => {
    const updated = { ...data, [key]: val };
    setData(updated);
    onUpdateAuditData?.('tor', updated);
  };

  const fields = [
    { key: 'objectives',      label: 'Audit Objectives', rows: 4 },
    { key: 'scope',           label: 'Scope',            rows: 4 },
    { key: 'out_of_scope',    label: 'Out of Scope',     rows: 3 },
    { key: 'methodology',     label: 'Methodology',      rows: 4 },
    { key: 'reporting_lines', label: 'Reporting Lines',  rows: 2 },
    { key: 'key_contacts',    label: 'Key Contacts',     rows: 3 },
  ];

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Terms of Reference"
        subtitle="Defines the objectives, scope, and approach for this audit"
        action={
          openDrawer ? (
            <CommentButton
              sectionRef={SECTION_REF}
              rowRef={null}
              comments={reviewComments}
              onClick={() => openDrawer({
                sectionRef: SECTION_REF,
                rowRef: null,
                title: 'Terms of Reference',
                contextLabel: 'Planning — Terms of Reference',
              })}
            />
          ) : null
        }
      />
      {fields.map(f => (
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
