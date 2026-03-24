import { useState } from 'react';
import { Card, SectionHeader, Badge } from '../components/UI';
import { INHERENT_RISK_ASSESSMENT } from '../data/mockData';

// Score -> rating label and colour per NI methodology Appendix 6.3
function deriveRating(total) {
  if (total >= 31) return { label: 'Very High', sublabel: 'Out of Tolerance',   color: 'var(--risk-very-high)' };
  if (total >= 21) return { label: 'High',      sublabel: 'Out of Appetite',    color: 'var(--risk-high)' };
  if (total >= 13) return { label: 'Moderate',  sublabel: 'Approaching Appetite', color: 'var(--risk-medium)' };
  return              { label: 'Low',       sublabel: 'In Appetite',          color: 'var(--risk-low)' };
}

const SCORE_OPTIONS = [
  { value: 1, label: '1 - Low / In Appetite' },
  { value: 2, label: '2 - Moderate / Approaching Appetite' },
  { value: 3, label: '3 - High / Out of Appetite' },
  { value: 4, label: '4 - Very High / Out of Tolerance' },
];

const SCORE_COLORS = {
  1: 'var(--risk-low)',
  2: 'var(--risk-medium)',
  3: 'var(--risk-high)',
  4: 'var(--risk-very-high)',
};

export default function PlanningInherentRisk() {
  const [factors, setFactors] = useState(INHERENT_RISK_ASSESSMENT.factors);

  const total = factors.reduce((sum, f) => sum + f.score, 0);
  const maxScore = factors.length * 4;
  const rating = deriveRating(total);

  function updateFactor(id, field, value) {
    setFactors(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  }

  return (
    <Card style={{ padding: 20 }}>
      <SectionHeader
        title="Inherent Risk Assessment"
        subtitle="10 risk factors scored 1-4 per NI Methodology Appendix 6.3"
      />

      {/* Summary banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '14px 20px',
        background: `color-mix(in srgb, ${rating.color} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${rating.color} 25%, transparent)`,
        borderRadius: 'var(--radius-md)',
        marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Total Score
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: rating.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {total}
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>/ {maxScore}</span>
          </div>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Inherent Risk Rating
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 15, fontWeight: 700, color: rating.color,
              padding: '3px 10px', borderRadius: 'var(--radius-sm)',
              background: `color-mix(in srgb, ${rating.color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${rating.color} 30%, transparent)`,
            }}>
              {rating.label}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rating.sublabel}</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Score band reference */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.8 }}>
          <div><span style={{ color: 'var(--risk-low)',       fontWeight: 600 }}>Low</span>      0-12</div>
          <div><span style={{ color: 'var(--risk-medium)',    fontWeight: 600 }}>Moderate</span> 13-20</div>
          <div><span style={{ color: 'var(--risk-high)',      fontWeight: 600 }}>High</span>     21-30</div>
          <div><span style={{ color: 'var(--risk-very-high)', fontWeight: 600 }}>Very High</span> 31-40</div>
        </div>
      </div>

      {/* Factor table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--surface-0)' }}>
            {['#', 'Risk Factor', 'Score', 'Rationale'].map(h => (
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
          {factors.map((f, i) => {
            const isLast = i === factors.length - 1;
            return (
              <tr key={f.id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)', verticalAlign: 'top' }}>
                <td style={{ padding: '12px 10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, width: 28 }}>
                  {i + 1}
                </td>
                <td style={{ padding: '12px 10px', fontWeight: 500, whiteSpace: 'nowrap', paddingRight: 16 }}>
                  {f.factor}
                </td>
                <td style={{ padding: '12px 10px', width: 80 }}>
                  <select
                    value={f.score}
                    onChange={e => updateFactor(f.id, 'score', Number(e.target.value))}
                    style={{
                      fontSize: 13, fontWeight: 700,
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${SCORE_COLORS[f.score]}`,
                      background: `color-mix(in srgb, ${SCORE_COLORS[f.score]} 10%, var(--surface-0))`,
                      color: SCORE_COLORS[f.score],
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer', width: 52,
                    }}
                  >
                    {SCORE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.value}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <textarea
                    value={f.rationale}
                    onChange={e => updateFactor(f.id, 'rationale', e.target.value)}
                    rows={2}
                    style={{
                      width: '100%', fontSize: 12, lineHeight: 1.5,
                      padding: '6px 8px', resize: 'vertical',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface-0)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Note */}
      <p style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Scores derived from NI Operational Risk Policy Risk Impact Matrix. Each factor rated 1 (Low/In Appetite) to 4 (Very High/Out of Tolerance). Total score determines inherent risk rating which drives audit frequency per the Annual Audit Plan.
      </p>
    </Card>
  );
}
