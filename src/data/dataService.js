// ─── DATA SERVICE ─────────────────────────────────────────────────────────────
// All reads and writes go through here.
// Replaces mockData.js imports across the app.
// When Supabase backend migrates to NI-approved instance,
// only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY change. No code changes.

import { supabase } from '../lib/supabaseClient';

// ── USERS ─────────────────────────────────────────────────────────────────────

export async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}

// ── AUDITS ────────────────────────────────────────────────────────────────────

export async function fetchAudits() {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAuditRecord(fields) {
  const id = `audit-${Date.now()}`;
  const audit = {
    id,
    title:               fields.title || 'New Audit',
    entity:              fields.entity || '',
    audit_type:          fields.audit_type || 'Assurance',
    period_under_review: fields.period_under_review || '',
    planned_start:       fields.planned_start || null,
    planned_end:         fields.planned_end || null,
    status:              'Planning',
    year:                new Date().getFullYear(),
    lead_auditor_id:     fields.lead_auditor_id || null,
    reviewer_id:         fields.reviewer_id || null,
  };

  const { error: auditErr } = await supabase.from('audits').insert(audit);
  if (auditErr) throw auditErr;

  // Create blank sign-off rows for all three phases
  const signOffs = ['Planning', 'Fieldwork', 'Reporting'].map((tab, i) => ({
    id: `so-${id}-${i}`,
    audit_id:         id,
    tab,
    task_ref:         `${tab.toLowerCase()}-complete`,
    auditor_id:       fields.lead_auditor_id || null,
    auditor_signed_at: null,
    reviewer_id:      fields.reviewer_id || null,
    reviewer_signed_at: null,
    hia_id:           'u-001',
    hia_signed_at:    null,
  }));
  const { error: soErr } = await supabase.from('sign_offs').insert(signOffs);
  if (soErr) throw soErr;

  // Create blank metadata row
  const { error: metaErr } = await supabase.from('audit_metadata').insert({
    audit_id: id,
    budget: {},
    timeline: [],
    inherent_risk: {},
    combined_assurance: {},
    scope_items: {},
    tor: {},
    programme: [],
    racm_risks: [],
  });
  if (metaErr) throw metaErr;

  return id;
}

export async function deleteAuditRecord(auditId) {
  // Cascade deletes handle related rows (sign_offs, issues, queries, etc.)
  const { error } = await supabase.from('audits').delete().eq('id', auditId);
  if (error) throw error;
}

export async function updateAuditStatus(auditId, status) {
  const { error } = await supabase
    .from('audits')
    .update({ status })
    .eq('id', auditId);
  if (error) throw error;
}

// ── SIGN OFFS ─────────────────────────────────────────────────────────────────

export async function fetchSignOffs() {
  const { data, error } = await supabase.from('sign_offs').select('*');
  if (error) throw error;
  return data;
}

export async function signOffPhase(signOffId, role, userId) {
  const field = `${role}_signed_at`;
  const { error } = await supabase
    .from('sign_offs')
    .update({ [field]: new Date().toISOString() })
    .eq('id', signOffId);
  if (error) throw error;
}

export async function revokeSignOff(signOffId, role) {
  const field = `${role}_signed_at`;
  const { error } = await supabase
    .from('sign_offs')
    .update({ [field]: null })
    .eq('id', signOffId);
  if (error) throw error;
}

// ── REVIEW COMMENTS ───────────────────────────────────────────────────────────

export async function fetchReviewComments(auditId) {
  let query = supabase
    .from('review_comments')
    .select('*')
    .order('raised_at', { ascending: true });
  // Pass 'all' to fetch all comments globally (for portfolio comment counts)
  if (auditId && auditId !== 'all') {
    query = query.eq('audit_id', auditId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function addReviewComment(comment) {
  const record = {
    id:            `rc-${Date.now()}`,
    audit_id:      comment.audit_id,
    tab:           comment.tab,
    section:       comment.sectionRef,
    section_ref:   comment.sectionRef,
    row_ref:       comment.rowRef || null,
    comment_text:  comment.comment_text,
    raised_by:     comment.raised_by,
    raised_at:     new Date().toISOString(),
    response_text: '',
    status:        'Open',
  };
  const { error } = await supabase.from('review_comments').insert(record);
  if (error) throw error;
  return record;
}

export async function respondToComment(commentId, responseText, userId) {
  const { error } = await supabase
    .from('review_comments')
    .update({
      response_text:  responseText,
      responded_by:   userId,
      responded_at:   new Date().toISOString(),
      status:         'Responded',
    })
    .eq('id', commentId);
  if (error) throw error;
}

export async function closeComment(commentId, userId) {
  const { error } = await supabase
    .from('review_comments')
    .update({
      status:     'Closed',
      closed_by:  userId,
      closed_at:  new Date().toISOString(),
    })
    .eq('id', commentId);
  if (error) throw error;
}

// ── ISSUES ────────────────────────────────────────────────────────────────────

export async function fetchIssues(auditId) {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('audit_id', auditId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createIssue(issue) {
  const { data: existing } = await supabase
    .from('issues')
    .select('issue_ref')
    .eq('audit_id', issue.audit_id)
    .order('created_at', { ascending: false })
    .limit(1);

  const lastNum = existing?.[0]?.issue_ref
    ? parseInt(existing[0].issue_ref.replace('ISSUE-', ''), 10)
    : 0;
  const nextRef = `ISSUE-${String(lastNum + 1).padStart(3, '0')}`;

  const record = {
    id:           `issue-${Date.now()}`,
    audit_id:     issue.audit_id,
    issue_ref:    nextRef,
    title:        issue.title || '',
    condition:    issue.condition || '',
    criteria:     issue.criteria || '',
    cause:        issue.cause || '',
    consequence:  issue.consequence || '',
    risk_rating:  issue.risk_rating || 'Medium',
    management_action: issue.management_action || '',
    action_owner: issue.action_owner || '',
    due_date:     issue.due_date || null,
    status:       'Mgmt Response Pending',
    mgmt_response: '',
    mgmt_respondent: '',
    factual_accuracy_confirmed: false,
    factual_accuracy_date: null,
    promoted_from_query_id: issue.promoted_from_query_id || null,
  };
  const { error } = await supabase.from('issues').insert(record);
  if (error) throw error;
  return record;
}

export async function updateIssue(issueId, updates) {
  const { error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', issueId);
  if (error) throw error;
}

// ── QUERIES ───────────────────────────────────────────────────────────────────

export async function fetchQueries(auditId) {
  const { data, error } = await supabase
    .from('queries')
    .select('*')
    .eq('audit_id', auditId)
    .order('raised_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createQuery(query) {
  const { data: existing } = await supabase
    .from('queries')
    .select('query_ref')
    .eq('audit_id', query.audit_id)
    .order('raised_date', { ascending: false })
    .limit(1);

  const lastNum = existing?.[0]?.query_ref
    ? parseInt(existing[0].query_ref.replace('Q-', ''), 10)
    : 0;
  const nextRef = `Q-${String(lastNum + 1).padStart(3, '0')}`;

  const record = {
    id:          `q-${Date.now()}`,
    audit_id:    query.audit_id,
    query_ref:   nextRef,
    title:       query.title || '',
    description: query.description || '',
    raised_by:   query.raised_by,
    raised_date: new Date().toISOString().slice(0, 10),
    directed_to: query.directed_to || '',
    response:    '',
    status:      'Open',
    resolved_rationale: null,
    promoted_to_issue_id: null,
  };
  const { error } = await supabase.from('queries').insert(record);
  if (error) throw error;
  return record;
}

export async function updateQuery(queryId, updates) {
  const { error } = await supabase
    .from('queries')
    .update(updates)
    .eq('id', queryId);
  if (error) throw error;
}

// ── WORKING PAPERS ────────────────────────────────────────────────────────────

export async function fetchWorkingPapers(auditId) {
  const { data, error } = await supabase
    .from('working_papers')
    .select('*')
    .eq('audit_id', auditId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createWorkingPaper(paper) {
  const record = {
    id:             `wp-${Date.now()}`,
    audit_id:       paper.audit_id,
    title:          paper.title || '',
    sharepoint_url: paper.sharepoint_url || '',
    status:         'Draft',
    created_by:     paper.created_by,
  };
  const { error } = await supabase.from('working_papers').insert(record);
  if (error) throw error;
  return record;
}

export async function updateWorkingPaper(paperId, updates) {
  const { error } = await supabase
    .from('working_papers')
    .update(updates)
    .eq('id', paperId);
  if (error) throw error;
}

// ── AUDIT METADATA (planning tab data) ───────────────────────────────────────

export async function fetchAuditMetadata(auditId) {
  const { data, error } = await supabase
    .from('audit_metadata')
    .select('*')
    .eq('audit_id', auditId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function upsertAuditMetadata(auditId, key, value) {
  // Upsert a single key in the metadata JSONB row
  const { error } = await supabase
    .from('audit_metadata')
    .upsert({ audit_id: auditId, [key]: value }, { onConflict: 'audit_id' });
  if (error) throw error;
}

// ── REALTIME SUBSCRIPTIONS ────────────────────────────────────────────────────
// Called from App.jsx to wire live updates.

export function subscribeToAudits(onchange) {
  return supabase
    .channel('audits-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'audits' }, onchange)
    .subscribe();
}

export function subscribeToIssues(auditId, onchange) {
  return supabase
    .channel(`issues-${auditId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'issues',
      filter: `audit_id=eq.${auditId}`,
    }, onchange)
    .subscribe();
}

export function subscribeToQueries(auditId, onchange) {
  return supabase
    .channel(`queries-${auditId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'queries',
      filter: `audit_id=eq.${auditId}`,
    }, onchange)
    .subscribe();
}

export function subscribeToComments(auditId, onchange) {
  return supabase
    .channel(`comments-${auditId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'review_comments',
      filter: `audit_id=eq.${auditId}`,
    }, onchange)
    .subscribe();
}

export function subscribeToSignOffs(onchange) {
  return supabase
    .channel('signoffs-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sign_offs' }, onchange)
    .subscribe();
}

export function subscribeToWorkingPapers(auditId, onchange) {
  return supabase
    .channel(`papers-${auditId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'working_papers',
      filter: `audit_id=eq.${auditId}`,
    }, onchange)
    .subscribe();
}

export function unsubscribeAll(channels) {
  channels.forEach(ch => { if (ch) supabase.removeChannel(ch); });
}
