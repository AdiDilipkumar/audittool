import { useState } from 'react';
import { Card, SectionHeader, Field } from '../components/UI';
import { TERMS_OF_REFERENCE } from '../data/mockData';

export default function PlanningToR() {
  const [data, setData] = useState(TERMS_OF_REFERENCE);

  const fields = [
    { key: 'objectives',     label: 'Audit Objectives',  rows: 4 },
    { key: 'scope',          label: 'Scope',             rows: 4 },
    { key: 'out_of_scope',   label: 'Out of Scope',      rows: 3 },
    { key: 'methodology',    label: 'Methodology',       rows: 4 },
    { key: 'reporting_lines',label: 'Reporting Lines',   rows: 2 },
    { key: 'key_contacts',   label: 'Key Contacts',      rows: 3 },
  ];

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Terms of Reference"
        subtitle="Defines the objectives, scope, and approach for this audit"
      />
      {fields.map(f => (
        <Field
          key={f.key}
          label={f.label}
          value={data[f.key]}
          multiline
          rows={f.rows}
          onChange={val => setData(prev => ({ ...prev, [f.key]: val }))}
        />
      ))}
    </Card>
  );
}
