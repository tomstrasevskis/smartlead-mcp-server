/**
 * SmartLead MCP Server - Type Definitions
 *
 * Zod schemas and TypeScript types for all documented SmartLead API endpoints.
 * Based on: https://helpcenter.smartlead.ai/en/articles/125-full-api-documentation
 *
 * API Coverage (37 endpoints):
 * - Campaign management (14 endpoints)
 * - Email account management (6 endpoints)
 * - Lead management (14 endpoints)
 * - Analytics (3 endpoints)
 */

import { z } from 'zod';

// ================================
// COMMON RESPONSE SCHEMAS
// ================================

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

// ================================
// CAMPAIGN MANAGEMENT SCHEMAS
// ================================

export const CreateCampaignRequestSchema = z.object({
  name: z.string().optional().describe('Campaign name (defaults to "Untitled Campaign")'),
  client_id: z.number().optional().describe('Client ID for the campaign'),
});

export const GetCampaignRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
});

export const ListCampaignsRequestSchema = z.object({
  client_id: z.number().optional().describe('Filter by client ID'),
  include_tags: z.boolean().optional().describe('Include campaign tags'),
});

export const UpdateCampaignStatusRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  status: z.enum(['START', 'ACTIVE', 'PAUSED', 'STOPPED']).describe('New campaign status (ACTIVE is an alias for START)'),
});

export const UpdateCampaignScheduleRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  timezone: z.string().describe('IANA timezone (e.g., "America/New_York")'),
  days_of_the_week: z.array(z.number().min(0).max(6)).describe('Days of the week (0=Sunday, 6=Saturday)'),
  start_hour: z.string().describe('Start hour in 24-hour format (e.g., "09:00")'),
  end_hour: z.string().describe('End hour in 24-hour format (e.g., "17:00")'),
  min_time_btw_emails: z.number().describe('Minimum time between emails in minutes'),
  max_new_leads_per_day: z.number().describe('Maximum new leads to contact per day'),
});

export const UpdateCampaignSettingsRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  track_settings: z.array(z.string()).optional().describe('Tracking settings'),
  stop_lead_settings: z.string().optional().describe('When to stop sending to a lead'),
  unsubscribe_text: z.string().optional().describe('Unsubscribe text to append'),
  send_as_plain_text: z.boolean().optional().describe('Send emails as plain text'),
  follow_up_percentage: z.number().min(0).max(100).optional().describe('Follow-up percentage (0-100)'),
  enable_ai_esp_matching: z.boolean().optional().describe('Enable AI ESP matching'),
  client_id: z.number().nullable().optional().describe('Client ID or null'),
});

export const DeleteCampaignRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID to delete'),
});

// Email Sequence schemas
export const SequenceVariantSchema = z.object({
  subject: z.string().describe('Email subject line'),
  email_body: z.string().describe('Email body content in HTML'),
  variant_label: z.string().describe('Variant label (A, B, C, etc.)'),
});

export const SequenceDelaySchema = z.object({
  delay_in_days: z.number().describe('Days to wait before sending'),
});

export const EmailSequenceSchema = z.object({
  seq_number: z.number().describe('Sequence number (order)'),
  seq_delay_details: SequenceDelaySchema,
  variant_distribution_type: z.string().describe('How to distribute variants'),
  variants: z.array(SequenceVariantSchema).describe('Email variants'),
});

export const SaveCampaignSequenceRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  sequences: z.array(EmailSequenceSchema).describe('Array of email sequences'),
});

export const GetCampaignSequenceRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
});

export const FetchAllCampaignsUsingLeadIdRequestSchema = z.object({
  lead_id: z.number().describe('Lead ID'),
});

// Campaign analytics schemas
export const GetCampaignAnalyticsRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
});

export const GetCampaignAnalyticsByDateRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
});

export const ExportLeadsCsvRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
});

export const GetAnalyticsOverviewRequestSchema = z.object({});

// ================================
// EMAIL ACCOUNT SCHEMAS
// ================================

export const CreateEmailAccountRequestSchema = z.object({
  from_name: z.string().describe('Display name for sent emails'),
  from_email: z.string().email().describe('Email address'),
  username: z.string().describe('SMTP/IMAP username'),
  password: z.string().describe('SMTP/IMAP password'),
  smtp_host: z.string().describe('SMTP server host'),
  smtp_port: z.number().describe('SMTP server port'),
  smtp_port_type: z.enum(['TLS', 'SSL']).describe('SMTP encryption type'),
  imap_host: z.string().describe('IMAP server host'),
  imap_port: z.number().describe('IMAP server port'),
  max_email_per_day: z.number().optional().describe('Maximum emails per day'),
  custom_tracking_url: z.string().optional().describe('Custom tracking URL'),
  bcc: z.string().optional().describe('BCC email address'),
  signature: z.string().optional().describe('Email signature HTML'),
});

export const GetEmailAccountByIdRequestSchema = z.object({
  email_account_id: z.number().describe('Email account ID'),
});

export const UpdateEmailAccountRequestSchema = z.object({
  email_account_id: z.number().describe('Email account ID'),
  from_name: z.string().optional().describe('Display name'),
  from_email: z.string().email().optional().describe('Email address'),
  username: z.string().optional().describe('SMTP/IMAP username'),
  password: z.string().optional().describe('SMTP/IMAP password'),
  smtp_host: z.string().optional().describe('SMTP host'),
  smtp_port: z.number().optional().describe('SMTP port'),
  smtp_port_type: z.enum(['TLS', 'SSL']).optional().describe('SMTP encryption'),
  imap_host: z.string().optional().describe('IMAP host'),
  imap_port: z.number().optional().describe('IMAP port'),
  max_email_per_day: z.number().optional().describe('Max emails per day'),
  custom_tracking_url: z.string().optional().describe('Custom tracking URL'),
  bcc: z.string().optional().describe('BCC email'),
  signature: z.string().optional().describe('Email signature'),
});

export const GetAllEmailAccountsRequestSchema = z.object({
  offset: z.number().optional().default(0).describe('Pagination offset'),
  limit: z.number().optional().default(100).describe('Max results (max 100)'),
});

export const UpdateEmailAccountWarmupRequestSchema = z.object({
  email_account_id: z.number().describe('Email account ID'),
  warmup_enabled: z.boolean().describe('Enable or disable warmup'),
  total_warmup_per_day: z.number().describe('Total warmup emails per day'),
  daily_rampup: z.number().describe('Daily ramp-up increment'),
  reply_rate_percentage: z.number().describe('Reply rate percentage'),
});

export const GetWarmupStatsRequestSchema = z.object({
  email_account_id: z.number().describe('Email account ID'),
});

// Campaign email account schemas
export const ListEmailAccountsPerCampaignRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
});

export const AddEmailAccountToCampaignRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  email_account_id: z.number().describe('Email account ID to add'),
});

export const RemoveEmailAccountFromCampaignRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  email_account_id: z.number().describe('Email account ID to remove'),
});

// ================================
// LEAD MANAGEMENT SCHEMAS
// ================================

export const ListLeadsByCampaignRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  offset: z.number().optional().default(0).describe('Pagination offset'),
  limit: z.number().optional().default(100).describe('Max results (max 100)'),
});

export const FetchLeadByEmailRequestSchema = z.object({
  email: z.string().email().describe('Lead email address'),
});

export const FetchLeadCategoriesRequestSchema = z.object({});

export const AddLeadsToCampaignRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  lead_list: z.array(z.object({
    email: z.string().email().describe('Lead email address'),
    first_name: z.string().optional().describe('First name'),
    last_name: z.string().optional().describe('Last name'),
    company_name: z.string().optional().describe('Company name'),
    company_url: z.string().optional().describe('Company website URL'),
    website: z.string().optional().describe('Website URL'),
    location: z.string().optional().describe('Location'),
    phone_number: z.string().optional().describe('Phone number'),
    linkedin_profile: z.string().optional().describe('LinkedIn profile URL'),
    custom_fields: z.record(z.unknown()).optional().describe('Custom fields (e.g., job_title, industry). Max 200 key-value pairs.'),
  })).describe('Array of leads (max 400 per request)'),
  settings: z.object({
    ignore_global_block_list: z.boolean().optional(),
    ignore_unsubscribe_list: z.boolean().optional(),
    ignore_community_bounce_list: z.boolean().optional(),
    ignore_duplicate_leads_in_other_campaign: z.boolean().optional(),
  }).optional().describe('Import settings'),
});

export const UpdateLeadRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  lead_id: z.number().describe('Lead ID'),
  email: z.string().email().describe('Lead email (required even if not changing)'),
  first_name: z.string().optional().describe('Updated first name'),
  last_name: z.string().optional().describe('Updated last name'),
  company_name: z.string().optional().describe('Updated company name'),
  website: z.string().optional().describe('Updated website URL'),
  location: z.string().optional().describe('Updated location'),
  phone_number: z.string().optional().describe('Updated phone number'),
  linkedin_profile: z.string().optional().describe('Updated LinkedIn profile URL'),
  company_url: z.string().optional().describe('Updated company URL'),
  custom_fields: z.record(z.unknown()).optional().describe('Updated custom fields (merged, not replaced)'),
});

export const PauseLeadRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  lead_id: z.number().describe('Lead ID'),
});

export const ResumeLeadRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  lead_id: z.number().describe('Lead ID'),
});

export const DeleteLeadRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  lead_id: z.number().describe('Lead ID'),
});

export const UnsubscribeLeadFromCampaignRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  lead_id: z.number().describe('Lead ID'),
});

export const UnsubscribeLeadGloballyRequestSchema = z.object({
  lead_id: z.number().describe('Lead ID'),
});

export const AddToBlockListRequestSchema = z.object({
  email: z.string().email().describe('Email or domain to block'),
});

export const FetchMessageHistoryRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  lead_id: z.number().describe('Lead ID'),
});

export const ReplyToLeadRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
  email_account_id: z.number().describe('Email account to send from'),
  lead_id: z.number().describe('Lead ID'),
  email_body: z.string().describe('Reply email body'),
});

// ================================
// ANALYTICS SCHEMAS
// ================================

export const GetCampaignStatisticsRequestSchema = z.object({
  campaign_id: z.number().describe('Campaign ID'),
});

// ================================
// TYPE EXPORTS
// ================================

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type CreateCampaignRequest = z.infer<typeof CreateCampaignRequestSchema>;
export type UpdateCampaignScheduleRequest = z.infer<typeof UpdateCampaignScheduleRequestSchema>;
export type UpdateCampaignSettingsRequest = z.infer<typeof UpdateCampaignSettingsRequestSchema>;
export type EmailSequence = z.infer<typeof EmailSequenceSchema>;
export type ListCampaignsRequest = z.infer<typeof ListCampaignsRequestSchema>;
