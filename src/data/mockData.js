// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// Single source of truth for in-browser state.
// Replace this module with dataService.js (Supabase) in Phase 1.

export const CURRENT_USER = {
  id: 'u-001',
  full_name: 'Adi Dilipkumar',
  role: 'HIA',
  team: 'Internal Audit',
};

export const USERS = [
  { id: 'u-001', full_name: 'Adi Dilipkumar',  role: 'HIA'      },
  { id: 'u-002', full_name: 'Sarah Chen',       role: 'Reviewer' },
  { id: 'u-003', full_name: 'James Okafor',     role: 'Auditor'  },
  { id: 'u-004', full_name: 'Priya Nair',       role: 'Auditor'  },
];

export const SAMPLE_AUDIT = {
  id: 'audit-001',
  title: 'Data Operations: Investment Data Integrity & Controls',
  entity: 'Data Operations',
  audit_type: 'Assurance',
  period_under_review: 'Q4 2025 (Oct - Dec 2025)',
  planned_start: '2026-01-13',
  planned_end: '2026-03-28',
  status: 'Fieldwork',
  year: 2026,
  lead_auditor_id: 'u-001',
  reviewer_id: 'u-002',
  team_members: ['u-001', 'u-002', 'u-003', 'u-004'],
};

// ─── AUDIT BUDGET & TIMELINE ─────────────────────────────────────────────────
export const AUDIT_BUDGET = {
  audit_id: 'audit-001',
  budget_weeks: 10,
  rows: [
    { id: 'b-001', role: 'Review Manager', user_id: 'u-001', planning: 8,  fieldwork: 5,  reporting: 8  },
    { id: 'b-002', role: 'Audit Lead',     user_id: 'u-001', planning: 16, fieldwork: 30, reporting: 20 },
    { id: 'b-003', role: 'Auditor',        user_id: 'u-003', planning: 10, fieldwork: 40, reporting: 5  },
    { id: 'b-004', role: 'Auditor',        user_id: 'u-004', planning: 10, fieldwork: 35, reporting: 5  },
  ],
};

export const AUDIT_TIMELINE = {
  audit_id: 'audit-001',
  milestones: [
    { id: 't-001', activity: 'Audit Notification issued',                   planned_date: '2026-01-09' },
    { id: 't-002', activity: 'Planning start (kick-off, walkthroughs, TOR)', planned_date: '2026-01-13' },
    { id: 't-003', activity: 'Terms of Reference issued',                   planned_date: '2026-01-27' },
    { id: 't-004', activity: 'Fieldwork start',                             planned_date: '2026-01-28' },
    { id: 't-005', activity: 'Factual accuracy close-out meeting',          planned_date: '2026-03-07' },
    { id: 't-006', activity: 'Reporting start',                             planned_date: '2026-03-10' },
    { id: 't-007', activity: 'Draft report issued',                         planned_date: '2026-03-17' },
    { id: 't-008', activity: 'Close-out meeting and management comments',   planned_date: '2026-03-24' },
    { id: 't-009', activity: 'Final report issued',                         planned_date: '2026-03-28' },
  ],
};

export const INHERENT_RISK_ASSESSMENT = {
  audit_id: 'audit-001',
  factors: [
    { id: 'ira-001', factor: 'Financial Risk',                              score: 3, rationale: 'Errors in investment data could result in incorrect valuations, P&L misstatement, or client billing discrepancies. Potential financial impact is material given AUM volumes processed through CRIMS.' },
    { id: 'ira-002', factor: 'Reputational Risk',                           score: 3, rationale: "Systemic data errors affecting client reporting or regulatory submissions could damage Ninety One's reputation with institutional clients and consultants." },
    { id: 'ira-003', factor: 'People and Culture Risk',                     score: 2, rationale: 'Staff turnover in Q3 2025 has created knowledge gaps in escalation procedures. Dependency on a small number of experienced data operations staff represents key person risk.' },
    { id: 'ira-004', factor: 'Client Experience Risk',                      score: 3, rationale: 'Investment data underpins all client reporting, performance attribution, and regulatory disclosures.' },
    { id: 'ira-005', factor: 'Legal and Regulatory Risk',                   score: 3, rationale: 'Inaccurate data feeding into regulatory submissions (MiFID II, FCA reporting) could trigger regulatory scrutiny.' },
    { id: 'ira-006', factor: 'Operating Model Risk',                        score: 3, rationale: 'The investment data lifecycle spans multiple systems (ThinkFolio, CRIMS, FactSet) with several manual intervention points.' },
    { id: 'ira-007', factor: 'Data Protection, Security & Confidentiality', score: 3, rationale: 'CRIMS holds sensitive investment positions and client portfolio data. Unauthorised access or data leakage would constitute a significant data protection breach.' },
    { id: 'ira-008', factor: 'Fraud Risk',                                  score: 2, rationale: 'Data amendment capabilities in CRIMS could theoretically be exploited. Mitigated by access controls and reconciliation.' },
    { id: 'ira-009', factor: 'Business Disruption Risk',                    score: 2, rationale: 'ThinkFolio and CRIMS are covered by BCP. Daily reconciliation failures have occurred but resolved within tolerance.' },
    { id: 'ira-010', factor: 'Information Technology Risk',                 score: 4, rationale: 'Core audit scope is the IT-dependent data pipeline. Multiple application interfaces, automated feeds, and exception management systems.' },
  ],
};

export const COMBINED_ASSURANCE = {
  audit_id: 'audit-001',
  compliance: 'Compliance Monitoring completed a targeted review of MiFID II transaction reporting data quality in September 2025 (ref: CM-2025-031). Key finding: 94% accuracy rate on instrument identifiers; two systematic mapping errors identified and remediated.',
  operational_risk: 'Operational Risk team updated the Data Operations RCSA in November 2025. ThinkFolio-CRIMS reconciliation failures are captured as a risk event category; 7 events logged in FY2025, all rated minor.',
  external_audit: 'KPMG (External Audit) reviewed IT general controls over CRIMS as part of the FY2025 statutory audit. Their conclusion was that IT general controls were adequate, with one management letter point on access recertification timeliness.',
  other: 'No other assurance work identified in this area during the planning period.',
};

export const SCOPE_ITEMS = {
  audit_id: 'audit-001',
  key_processes: [
    { id: 'sp-001', process: 'ThinkFolio to CRIMS data ingestion pipeline',         in_scope: 'Y', notes: '' },
    { id: 'sp-002', process: 'Daily reconciliation and exception management',        in_scope: 'Y', notes: '' },
    { id: 'sp-003', process: 'Access controls and user provisioning in CRIMS',      in_scope: 'Y', notes: '' },
    { id: 'sp-004', process: 'FactSet data feed validation and tolerance controls', in_scope: 'Y', notes: 'Added following COO request at planning meeting.' },
    { id: 'sp-005', process: 'Data quality KPI reporting and escalation',           in_scope: 'Y', notes: '' },
    { id: 'sp-006', process: 'Curium fund administration processes',                in_scope: 'N', notes: 'Covered in FY2025 audit.' },
    { id: 'sp-007', process: 'Jasmine OMS front-office controls',                   in_scope: 'N', notes: 'Out of scope per TOR. Separate review planned Q3 2026.' },
  ],
  standard_items: [
    { id: 'si-001', category: 'Governance',           item: 'Procedures documented, up to date, updated within last year',                           in_scope: 'Y', notes: '' },
    { id: 'si-002', category: 'Governance',           item: 'Clarity of roles and responsibilities; clear org chart and role descriptions',           in_scope: 'Y', notes: '' },
    { id: 'si-003', category: 'Governance',           item: 'Reporting lines ensure adequate segregation of duties',                                  in_scope: 'Y', notes: '' },
    { id: 'si-004', category: 'Governance',           item: 'Policies reviewed and approved by appropriate Board committee, at least annually',       in_scope: 'Y', notes: '' },
    { id: 'si-005', category: 'Governance',           item: 'Succession planning / notice periods / key person risks considered',                     in_scope: 'Y', notes: '' },
    { id: 'si-006', category: 'Governance',           item: 'Business strategy clear and aligned to corporate objectives',                            in_scope: 'Y', notes: '' },
    { id: 'si-007', category: 'Governance',           item: 'SMCR statements of responsibility documented and applied',                               in_scope: 'Y', notes: '' },
    { id: 'si-008', category: 'New Products',         item: 'New products taken through New Product Forum approval process',                          in_scope: 'N', notes: 'Not applicable.' },
    { id: 'si-009', category: 'New Products',         item: 'Conditions to approval addressed',                                                       in_scope: 'N', notes: 'Not applicable.' },
    { id: 'si-010', category: 'BCP',                  item: 'BCP covers all processes performed by the team',                                         in_scope: 'Y', notes: '' },
    { id: 'si-011', category: 'BCP',                  item: 'Process priorities correspond to business criticality; reflected in third-party contracts', in_scope: 'Y', notes: '' },
    { id: 'si-012', category: 'BCP',                  item: 'Application list is complete',                                                           in_scope: 'Y', notes: '' },
    { id: 'si-013', category: 'BCP',                  item: 'BCP includes defined interim workaround procedures',                                     in_scope: 'Y', notes: '' },
    { id: 'si-014', category: 'BCP',                  item: 'BCP test performed in last year; all critical systems recovered',                        in_scope: 'Y', notes: '' },
    { id: 'si-015', category: 'Data Protection',      item: 'GDPR, POPIA and equivalent principles adhered to where personal data processed',         in_scope: 'Y', notes: '' },
    { id: 'si-016', category: 'Risk Management',      item: 'RCSAs regularly completed and reviewed; include IT risk',                                in_scope: 'Y', notes: '' },
    { id: 'si-017', category: 'Risk Management',      item: 'Risk events accurately captured centrally with treatment plans',                         in_scope: 'Y', notes: '' },
    { id: 'si-018', category: 'Risk Management',      item: 'Risks / audit issues risk accepted per Risk Appetite Policy',                            in_scope: 'Y', notes: '' },
    { id: 'si-019', category: 'Third-Party',          item: 'Procurement Policy complied with for vendor review and selection',                       in_scope: 'N', notes: 'Not in this scope.' },
    { id: 'si-020', category: 'Third-Party',          item: 'Current software licences for key applications in place',                                in_scope: 'Y', notes: '' },
    { id: 'si-021', category: 'Third-Party',          item: 'Signed agreements per Authorised Signatory List',                                        in_scope: 'Y', notes: '' },
    { id: 'si-022', category: 'Third-Party',          item: 'Contractor performance monitored against SLAs',                                          in_scope: 'Y', notes: '' },
    { id: 'si-023', category: 'Regulatory Filings',   item: 'Team filing tasks have primary/secondary owners and reviewers identified',                in_scope: 'Y', notes: '' },
    { id: 'si-024', category: 'Gifts & Entertainment',item: 'Gifts/entertainment >GBP100 approved and logged',                                        in_scope: 'N', notes: 'Not a primary risk area.' },
    { id: 'si-025', category: 'EUCA Risk',            item: 'Critical spreadsheets managed per EUC policy',                                           in_scope: 'Y', notes: '' },
    { id: 'si-026', category: 'EUCA Risk',            item: 'EUCAs protected for confidentiality, integrity, and availability',                       in_scope: 'Y', notes: '' },
    { id: 'si-027', category: 'IT General Controls',  item: 'Key applications adequately risk-assessed',                                              in_scope: 'Y', notes: '' },
    { id: 'si-028', category: 'IT General Controls',  item: 'Strong password controls in place',                                                      in_scope: 'Y', notes: '' },
    { id: 'si-029', category: 'IT General Controls',  item: 'User access management: access commensurate with role; toxic combinations reviewed',     in_scope: 'Y', notes: '' },
    { id: 'si-030', category: 'IT General Controls',  item: 'Change management: changes tested and approved before production',                       in_scope: 'Y', notes: '' },
    { id: 'si-031', category: 'IT General Controls',  item: 'Backup and recovery performed per business requirements',                                in_scope: 'Y', notes: '' },
    { id: 'si-032', category: 'IT General Controls',  item: 'Service and support processes to identify, report, and track errors',                    in_scope: 'Y', notes: '' },
    { id: 'si-033', category: 'IT General Controls',  item: 'Interfaces: critical feeds monitored for accuracy and completeness',                     in_scope: 'Y', notes: '' },
    { id: 'si-034', category: 'Conduct Risk',         item: 'Conduct risk reporting reviewed; conduct risk events identified and assessed',            in_scope: 'Y', notes: '' },
    { id: 'si-035', category: 'Fraud Risk',           item: 'Fraud risk considered; potential schemes identified',                                    in_scope: 'Y', notes: '' },
    { id: 'si-036', category: 'Risk & Control Culture', item: 'Adequate understanding of objectives and risks inherent in processes',                 in_scope: 'Y', notes: '' },
    { id: 'si-037', category: 'Risk & Control Culture', item: 'Actions and plans in place to address known control deficiencies',                     in_scope: 'Y', notes: '' },
    { id: 'si-038', category: 'Risk & Control Culture', item: 'Attitude towards IA review assessed (timeliness, cooperation)',                        in_scope: 'Y', notes: '' },
  ],
  previous_ia_issues: [
    { id: 'pi-001', issue_ref: 'ISSUE-2024-003', title: 'CRIMS user access recertification performed late', rating: 'Moderate', closed: true,  notes: 'Closed FY2025. Recertification now overdue again - potential repeat issue.' },
    { id: 'pi-002', issue_ref: 'ISSUE-2023-011', title: 'Data quality exception log not reviewed by management', rating: 'Moderate', closed: true, notes: 'Closed FY2024. KRI dashboard established as remediation. Design now assessed as ineffective.' },
  ],
  data_analytics: 'SQL queries against the data warehouse will be used to analyse the full population of reconciliation exceptions in Q4 2025. Python scripting to be used for FactSet feed tolerance analysis.',
};

export const TERMS_OF_REFERENCE = {
  audit_id: 'audit-001',
  objectives: `To provide assurance over the completeness, accuracy, and timeliness of investment data flows across ThinkFolio, CRIMS, and downstream reporting systems. To assess whether controls over data ingestion, reconciliation, and exception management are designed and operating effectively.`,
  scope: `In scope: investment data lifecycle from trade capture through ThinkFolio to CRIMS and FactSet feeds; daily reconciliation processes; exception management and escalation procedures; access controls over data amendment workflows; data quality KPIs and management reporting.`,
  out_of_scope: `Out of scope: Curium fund administration processes (covered in FY2025 audit); Jasmine OMS front-office controls; FactSet market data vendor management; RBIAP regulatory submissions.`,
  methodology: `Risk-based audit approach aligned to Ninety One Internal Audit Methodology (January 2025). Fieldwork comprises walkthrough interviews, control testing with targeted sampling per Appendix 6.3 guidelines, data analytics via SQL queries against the data warehouse, and review of exception logs and reconciliation reports.`,
  reporting_lines: `Report issued to: Chief Operating Officer, Head of Data Operations, Chief Risk Officer. Copied to: Audit Committee (summary). Draft issued for management comment prior to finalisation.`,
  key_contacts: `Head of Data Operations: Marcus Webb\nData Governance Lead: Fatima Al-Rashid\nIT Business Partner (Data): Tom Griggs\nCompliance Liaison: Nina Schwartz`,
};

export const AUDIT_PROGRAMME = [
  { id: 'step-001', audit_id: 'audit-001', step_number: 1, description: 'Perform walkthroughs of investment data ingestion process from ThinkFolio to CRIMS. Document data flow, identify manual intervention points, and confirm process understanding with Data Operations team.', assigned_to: 'u-003', estimated_hours: 6,  status: 'Complete' },
  { id: 'step-002', audit_id: 'audit-001', step_number: 2, description: 'Test design and operating effectiveness of daily reconciliation controls. Select sample of 25 reconciliation runs across Q4 2025.', assigned_to: 'u-003', estimated_hours: 12, status: 'Complete' },
  { id: 'step-003', audit_id: 'audit-001', step_number: 3, description: 'Review access controls over data amendment workflows. Obtain user access listings for ThinkFolio and CRIMS. Assess segregation of duties and recertification evidence.', assigned_to: 'u-004', estimated_hours: 8,  status: 'In Progress' },
  { id: 'step-004', audit_id: 'audit-001', step_number: 4, description: 'Analyse data quality exception logs for Q4 2025. Assess volume, trend, root cause categorisation, and management response.', assigned_to: 'u-004', estimated_hours: 10, status: 'In Progress' },
  { id: 'step-005', audit_id: 'audit-001', step_number: 5, description: 'Test controls over FactSet data feed validation. Sample 20 market data updates and verify validation checks, tolerance thresholds, and override approvals.', assigned_to: 'u-003', estimated_hours: 8,  status: 'Not Started' },
  { id: 'step-006', audit_id: 'audit-001', step_number: 6, description: 'Review data quality KPI reporting to management. Assess completeness of KRI suite and accuracy of reported metrics.', assigned_to: 'u-001', estimated_hours: 5,  status: 'Not Started' },
];

export const RACM_RISKS = [
  {
    id: 'risk-001', audit_id: 'audit-001', risk_ref: 'R-2024-047',
    risk_description: 'Investment data ingested from ThinkFolio into CRIMS contains errors or omissions, resulting in inaccurate portfolio positions and downstream reporting failures.',
    category: 'Data Integrity', likelihood: 2, impact: 4,
    inherent_risk_level: 'High', residual_risk_level: 'Moderate',
    risk_level_override: false, override_rationale: '', risk_owner: 'Marcus Webb', in_scope: true,
    controls: [
      { id: 'ctrl-001', risk_id: 'risk-001', control_ref: 'CTRL-2024-112', control_description: 'Automated reconciliation between ThinkFolio and CRIMS runs daily at 07:00. Breaks exceeding defined tolerance thresholds are flagged in the exception queue for same-day resolution.', control_type: 'Detective', frequency: 'Daily', design_conclusion: 'Effective', operating_effectiveness: 'Effective', testing_status: 'Tested - Effective', sample_size: 25, sample_override: false, sample_override_rationale: '' },
      { id: 'ctrl-002', risk_id: 'risk-001', control_ref: 'CTRL-2024-113', control_description: 'Data Operations team lead performs T+1 review of reconciliation exception report and signs off resolution of all breaks. Unresolved breaks escalated to Head of Data Operations within 24 hours.', control_type: 'Detective', frequency: 'Daily', design_conclusion: 'Effective', operating_effectiveness: 'Ineffective', testing_status: 'Tested - Ineffective', sample_size: 25, sample_override: false, sample_override_rationale: '' },
    ],
  },
  {
    id: 'risk-002', audit_id: 'audit-001', risk_ref: 'R-2024-051',
    risk_description: 'Unauthorised or inappropriate amendments to investment data in CRIMS by users with excessive system access, leading to undetected data manipulation.',
    category: 'Access & Authorisation', likelihood: 2, impact: 3,
    inherent_risk_level: 'Moderate', residual_risk_level: 'Low',
    risk_level_override: false, override_rationale: '', risk_owner: 'Fatima Al-Rashid', in_scope: true,
    controls: [
      { id: 'ctrl-003', risk_id: 'risk-002', control_ref: 'CTRL-2024-118', control_description: 'Role-based access controls restrict data amendment rights in CRIMS to designated Data Operations team members. Access is provisioned via ServiceNow request with line manager and Data Governance Lead approval.', control_type: 'Preventive', frequency: 'Per event', design_conclusion: 'Effective', operating_effectiveness: 'Not Tested', testing_status: 'In Progress', sample_size: 15, sample_override: false, sample_override_rationale: '' },
      { id: 'ctrl-004', risk_id: 'risk-002', control_ref: 'CTRL-2024-119', control_description: 'Quarterly user access recertification performed by Head of Data Operations. Excess access revoked within 5 business days. Evidence retained in ServiceNow.', control_type: 'Detective', frequency: 'Quarterly', design_conclusion: 'Effective', operating_effectiveness: 'Not Tested', testing_status: 'In Progress', sample_size: 4, sample_override: false, sample_override_rationale: '' },
    ],
  },
  {
    id: 'risk-003', audit_id: 'audit-001', risk_ref: 'R-2024-055',
    risk_description: 'Data quality exceptions are not escalated or resolved in a timely manner, resulting in management decisions based on inaccurate data and undetected systemic issues.',
    category: 'Data Quality', likelihood: 3, impact: 3,
    inherent_risk_level: 'High', residual_risk_level: 'Moderate',
    risk_level_override: false, override_rationale: '', risk_owner: 'Marcus Webb', in_scope: true,
    controls: [
      { id: 'ctrl-005', risk_id: 'risk-003', control_ref: 'CTRL-2024-125', control_description: 'Monthly data quality KRI dashboard reviewed by Head of Data Operations and IT Business Partner. KRIs include exception volume trend, mean time to resolution, recurring exception rate, and escalation rate.', control_type: 'Detective', frequency: 'Monthly', design_conclusion: 'Ineffective', operating_effectiveness: 'Not Tested', testing_status: 'Not Tested', sample_size: 3, sample_override: false, sample_override_rationale: '' },
    ],
  },
];

export const QUERY_LOG = [
  { id: 'q-001', audit_id: 'audit-001', query_ref: 'Q-001', description: 'Please provide evidence of escalation approvals for reconciliation breaks exceeding tolerance thresholds during Q4 2025. Specifically, the 14 instances identified in our sample where resolution exceeded the 24-hour SLA.', raised_by: 'u-003', raised_date: '2026-02-10', directed_to: 'Marcus Webb', response: 'Evidence package attached (14 instances). Of these, 11 had documented escalations; 3 instances could not be evidenced as the escalation emails were sent informally and not logged in the exception system.', response_date: '2026-02-14', status: 'Promoted', promoted_to_issue_id: 'issue-001' },
  { id: 'q-002', audit_id: 'audit-001', query_ref: 'Q-002', description: 'Provide the most recent quarterly access recertification sign-off for CRIMS data amendment roles, including the list of users reviewed and any access revocations actioned.', raised_by: 'u-004', raised_date: '2026-02-17', directed_to: 'Fatima Al-Rashid', response: 'Q3 2025 recertification completed and evidence in ServiceNow (ticket RITM0048821). Q4 2025 recertification is overdue - scheduled for w/c 3 March 2026.', response_date: '2026-02-21', status: 'Open', promoted_to_issue_id: null },
  { id: 'q-003', audit_id: 'audit-001', query_ref: 'Q-003', description: 'Confirm whether the monthly data quality KRI dashboard was reviewed and signed off for each month in Q4 2025. Provide sign-off evidence and any documented remediation plans raised during the quarter.', raised_by: 'u-004', raised_date: '2026-02-24', directed_to: 'Marcus Webb', response: '', response_date: null, status: 'Open', promoted_to_issue_id: null },
];

export const ISSUES = [
  {
    id: 'issue-001', audit_id: 'audit-001', issue_ref: 'ISSUE-001',
    title: 'Reconciliation Exception Escalation Process Not Consistently Followed',
    condition: 'Testing of 25 reconciliation exception instances identified 3 occasions (12%) where breaks exceeding the 24-hour resolution SLA were not escalated to the Head of Data Operations via the required exception system.',
    criteria: 'Per CTRL-2024-113, all unresolved reconciliation breaks must be escalated to the Head of Data Operations within 24 hours and documented in the exception management system.',
    cause: 'The escalation procedure is documented in the operational guide but has not been formally communicated to all team members following a period of staff turnover in Q3 2025.',
    consequence: 'Failure to formally escalate and document exceptions creates a risk that systemic data integrity issues are not identified by senior management.',
    risk_rating: 'Medium',
    management_action: 'Data Operations team lead to issue revised escalation procedure to all team members by 31 March 2026. Exception management system to be configured to generate automated escalation alerts at the 20-hour mark.',
    action_owner: 'Marcus Webb', due_date: '2026-03-31',
    status: 'Mgmt Response Pending', mgmt_response: '', mgmt_respondent: '',
    response_adequate: null, response_rationale: '',
    promoted_from_query_id: 'q-001', created_at: '2026-02-18',
  },
];

// ─── REVIEW COMMENTS ─────────────────────────────────────────────────────────
// Added sectionRef (matches section name) and rowRef (item id, or null for section-level).
export const REVIEW_COMMENTS = [
  {
    id: 'rc-001', audit_id: 'audit-001',
    tab: 'Planning', section: 'Terms of Reference',
    sectionRef: 'Terms of Reference', rowRef: null,
    comment_text: 'Scope statement should explicitly reference the FactSet tolerance threshold review - this was a specific ask from the COO in the planning meeting.',
    raised_by: 'u-002', raised_at: '2026-01-20T09:14:00Z',
    response_text: 'Agreed - updated scope to include FactSet feed validation. Step 5 of the audit programme covers this.',
    responded_by: 'u-001', responded_at: '2026-01-21T11:30:00Z',
    status: 'Closed', closed_by: 'u-002', closed_at: '2026-01-22T08:00:00Z',
  },
  {
    id: 'rc-002', audit_id: 'audit-001',
    tab: 'Fieldwork', section: 'Query Log',
    sectionRef: 'Query Log', rowRef: null,
    comment_text: 'Q-002 response from auditee indicates Q4 recertification is overdue. Consider whether this should be promoted to an issue or noted as a finding given it is an ongoing control gap.',
    raised_by: 'u-002', raised_at: '2026-02-22T14:05:00Z',
    response_text: 'Will review once Q4 recertification is completed w/c 3 March. If evidence is not provided by fieldwork close, will raise as a separate issue.',
    responded_by: 'u-003', responded_at: '2026-02-23T10:20:00Z',
    status: 'Responded', closed_by: null, closed_at: null,
  },
  {
    id: 'rc-003', audit_id: 'audit-001',
    tab: 'Planning', section: 'RACM',
    sectionRef: 'RACM', rowRef: 'risk-001',
    comment_text: 'Sample size for CTRL-2024-112 — please confirm whether the n=25 sample for daily controls aligns with NI methodology (guidance range is 20–40). Rationale should be documented in the working paper.',
    raised_by: 'u-002', raised_at: '2026-01-28T10:00:00Z',
    response_text: '',
    responded_by: null, responded_at: null,
    status: 'Open', closed_by: null, closed_at: null,
  },
];

export const SIGN_OFFS = [
  { id: 'so-001', audit_id: 'audit-001', tab: 'Planning',  task_ref: 'planning-complete',  auditor_id: 'u-001', auditor_signed_at: '2026-01-24T16:00:00Z', reviewer_id: 'u-002', reviewer_signed_at: '2026-01-25T09:30:00Z', hia_id: null, hia_signed_at: null },
  { id: 'so-002', audit_id: 'audit-001', tab: 'Fieldwork', task_ref: 'fieldwork-complete', auditor_id: null, auditor_signed_at: null, reviewer_id: null, reviewer_signed_at: null, hia_id: null, hia_signed_at: null },
  { id: 'so-003', audit_id: 'audit-001', tab: 'Reporting', task_ref: 'reporting-complete', auditor_id: null, auditor_signed_at: null, reviewer_id: null, reviewer_signed_at: null, hia_id: null, hia_signed_at: null },
  { id: 'so-004', audit_id: 'audit-002', tab: 'Planning',  task_ref: 'planning-complete',  auditor_id: 'u-003', auditor_signed_at: '2025-10-20T10:00:00Z', reviewer_id: 'u-002', reviewer_signed_at: '2025-10-21T09:00:00Z', hia_id: 'u-001', hia_signed_at: '2025-10-22T11:00:00Z' },
  { id: 'so-005', audit_id: 'audit-002', tab: 'Fieldwork', task_ref: 'fieldwork-complete', auditor_id: 'u-003', auditor_signed_at: '2025-11-28T16:00:00Z', reviewer_id: 'u-002', reviewer_signed_at: '2025-11-29T10:00:00Z', hia_id: 'u-001', hia_signed_at: '2025-12-01T09:00:00Z' },
  { id: 'so-006', audit_id: 'audit-002', tab: 'Reporting', task_ref: 'reporting-complete', auditor_id: 'u-003', auditor_signed_at: '2025-12-08T15:00:00Z', reviewer_id: 'u-002', reviewer_signed_at: '2025-12-09T10:00:00Z', hia_id: 'u-001', hia_signed_at: '2025-12-10T14:00:00Z' },
  { id: 'so-007', audit_id: 'audit-003', tab: 'Planning',  task_ref: 'planning-complete',  auditor_id: 'u-004', auditor_signed_at: '2026-03-10T15:30:00Z', reviewer_id: null, reviewer_signed_at: null, hia_id: null, hia_signed_at: null },
  { id: 'so-008', audit_id: 'audit-003', tab: 'Fieldwork', task_ref: 'fieldwork-complete', auditor_id: null, auditor_signed_at: null, reviewer_id: null, reviewer_signed_at: null, hia_id: null, hia_signed_at: null },
  { id: 'so-009', audit_id: 'audit-003', tab: 'Reporting', task_ref: 'reporting-complete', auditor_id: null, auditor_signed_at: null, reviewer_id: null, reviewer_signed_at: null, hia_id: null, hia_signed_at: null },
];

export const ALL_AUDITS = [
  { ...SAMPLE_AUDIT, open_issues: 1, open_review_comments: 1, planning_signed: true, fieldwork_signed: false, reporting_signed: false },
  { id: 'audit-002', title: 'Technology Risk: Cloud Infrastructure & Change Management', entity: 'Technology', audit_type: 'Assurance', period_under_review: 'Q3 2025', planned_start: '2025-10-06', planned_end: '2025-12-12', status: 'Complete', year: 2025, lead_auditor_id: 'u-003', reviewer_id: 'u-002', open_issues: 0, open_review_comments: 0, planning_signed: true, fieldwork_signed: true, reporting_signed: true },
  { id: 'audit-003', title: 'Compliance: KnowBe4 Security Awareness Programme Effectiveness', entity: 'Compliance', audit_type: 'Advisory', period_under_review: 'FY2025', planned_start: '2026-03-03', planned_end: '2026-04-25', status: 'Planning', year: 2026, lead_auditor_id: 'u-004', reviewer_id: 'u-002', open_issues: 0, open_review_comments: 0, planning_signed: false, fieldwork_signed: false, reporting_signed: false },
];

// ─── PER-AUDIT DATA MAPS ──────────────────────────────────────────────────────
// Keyed by audit_id. New audits created via createAudit() get empty shells.
// audit-001 uses the existing constants above; others start empty.

export const AUDIT_DATA_MAP = {
  'audit-001': {
    audit:        SAMPLE_AUDIT,
    budget:       AUDIT_BUDGET,
    timeline:     AUDIT_TIMELINE,
    inherentRisk: INHERENT_RISK_ASSESSMENT,
    combinedAssurance: COMBINED_ASSURANCE,
    scopeItems:   SCOPE_ITEMS,
    tor:          TERMS_OF_REFERENCE,
    programme:    AUDIT_PROGRAMME,
    racmRisks:    RACM_RISKS,
    queries:      QUERY_LOG,
    issues:       ISSUES,
  },
  'audit-002': {
    audit:        ALL_AUDITS[1],
    budget:       { audit_id: 'audit-002', budget_weeks: 8, rows: [] },
    timeline:     { audit_id: 'audit-002', milestones: [] },
    inherentRisk: { audit_id: 'audit-002', factors: [] },
    combinedAssurance: { audit_id: 'audit-002', compliance: '', operational_risk: '', external_audit: '', other: '' },
    scopeItems:   { audit_id: 'audit-002', key_processes: [], standard_items: [], previous_ia_issues: [], data_analytics: '' },
    tor:          { audit_id: 'audit-002', objectives: '', scope: '', out_of_scope: '', methodology: '', reporting_lines: '', key_contacts: '' },
    programme:    [],
    racmRisks:    [],
    queries:      [],
    issues:       [],
  },
  'audit-003': {
    audit:        ALL_AUDITS[2],
    budget:       { audit_id: 'audit-003', budget_weeks: 6, rows: [] },
    timeline:     { audit_id: 'audit-003', milestones: [] },
    inherentRisk: { audit_id: 'audit-003', factors: [] },
    combinedAssurance: { audit_id: 'audit-003', compliance: '', operational_risk: '', external_audit: '', other: '' },
    scopeItems:   { audit_id: 'audit-003', key_processes: [], standard_items: [], previous_ia_issues: [], data_analytics: '' },
    tor:          { audit_id: 'audit-003', objectives: '', scope: '', out_of_scope: '', methodology: '', reporting_lines: '', key_contacts: '' },
    programme:    [],
    racmRisks:    [],
    queries:      [],
    issues:       [],
  },
};

// ─── CREATE AUDIT FACTORY ─────────────────────────────────────────────────────
// Generates a complete audit skeleton. Called from App.jsx.
export function createAudit({ title, entity, audit_type, lead_auditor_id, reviewer_id, planned_start, planned_end, period_under_review }) {
  const id = `audit-${Date.now()}`;
  const now = new Date().toISOString();

  const audit = {
    id,
    title:               title || 'New Audit',
    entity:              entity || '',
    audit_type:          audit_type || 'Assurance',
    period_under_review: period_under_review || '',
    planned_start:       planned_start || '',
    planned_end:         planned_end || '',
    status:              'Planning',
    year:                new Date().getFullYear(),
    lead_auditor_id:     lead_auditor_id || 'u-001',
    reviewer_id:         reviewer_id || 'u-002',
    team_members:        [lead_auditor_id || 'u-001', reviewer_id || 'u-002'],
    open_issues:         0,
    open_review_comments: 0,
    planning_signed:     false,
    fieldwork_signed:    false,
    reporting_signed:    false,
  };

  const signOffs = [
    { id: `so-${id}-p`, audit_id: id, tab: 'Planning',  task_ref: 'planning-complete',  auditor_id: lead_auditor_id || 'u-001', auditor_signed_at: null, reviewer_id: reviewer_id || 'u-002', reviewer_signed_at: null, hia_id: 'u-001', hia_signed_at: null },
    { id: `so-${id}-f`, audit_id: id, tab: 'Fieldwork', task_ref: 'fieldwork-complete', auditor_id: lead_auditor_id || 'u-001', auditor_signed_at: null, reviewer_id: reviewer_id || 'u-002', reviewer_signed_at: null, hia_id: 'u-001', hia_signed_at: null },
    { id: `so-${id}-r`, audit_id: id, tab: 'Reporting', task_ref: 'reporting-complete', auditor_id: lead_auditor_id || 'u-001', auditor_signed_at: null, reviewer_id: reviewer_id || 'u-002', reviewer_signed_at: null, hia_id: 'u-001', hia_signed_at: null },
  ];

  const data = {
    audit,
    budget:       { audit_id: id, budget_weeks: 0, rows: [] },
    timeline:     { audit_id: id, milestones: [] },
    inherentRisk: { audit_id: id, factors: [] },
    combinedAssurance: { audit_id: id, compliance: '', operational_risk: '', external_audit: '', other: '' },
    scopeItems:   { audit_id: id, key_processes: [], standard_items: [], previous_ia_issues: [], data_analytics: '' },
    tor:          { audit_id: id, objectives: '', scope: '', out_of_scope: '', methodology: '', reporting_lines: '', key_contacts: '' },
    programme:    [],
    racmRisks:    [],
    queries:      [],
    issues:       [],
  };

  return { audit, signOffs, data };
}
