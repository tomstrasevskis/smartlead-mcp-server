import { BaseSmartLeadClient } from '../../client/base.js';
import type { SuccessResponse } from '../../types.js';

export class CampaignManagementClient extends BaseSmartLeadClient {
  /** POST /campaigns/create */
  async createCampaign(params: { name?: string; client_id?: number }): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.post('/campaigns/create', params),
      'create campaign'
    );
    return response.data;
  }

  /** GET /campaigns/{campaign_id} */
  async getCampaign(campaignId: number): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.get(`/campaigns/${campaignId}`),
      'get campaign'
    );
    return response.data;
  }

  /** GET /campaigns/ */
  async listCampaigns(params?: { client_id?: number; include_tags?: boolean }): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.get('/campaigns/', { params }),
      'list campaigns'
    );
    return response.data;
  }

  /** PATCH /campaigns/{campaign_id}/status */
  async updateCampaignStatus(campaignId: number, status: string): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.patch(`/campaigns/${campaignId}/status`, { status }),
      'update campaign status'
    );
    return response.data;
  }

  /** POST /campaigns/{campaign_id}/schedule */
  async updateCampaignSchedule(campaignId: number, params: any): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.post(`/campaigns/${campaignId}/schedule`, params),
      'update campaign schedule'
    );
    return response.data;
  }

  /** POST /campaigns/{campaign_id}/settings */
  async updateCampaignSettings(campaignId: number, params: any): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.post(`/campaigns/${campaignId}/settings`, params),
      'update campaign settings'
    );
    return response.data;
  }

  /** GET /campaigns/{campaign_id}/sequences */
  async getCampaignSequence(campaignId: number): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.get(`/campaigns/${campaignId}/sequences`),
      'get campaign sequence'
    );
    return response.data;
  }

  /** POST /campaigns/{campaign_id}/sequences */
  async saveCampaignSequence(campaignId: number, sequences: any[]): Promise<SuccessResponse> {
    // SmartLead expects a flat format: each variant is a separate entry
    // with the same seq_number, subject/email_body at the top level.
    // We accept a nested variants array for usability and flatten here.
    const flatSequences: any[] = [];
    for (const seq of sequences) {
      const { variants, variant_distribution_type, ...seqBase } = seq;
      if (Array.isArray(variants) && variants.length > 0) {
        for (const variant of variants) {
          const { variant_label, ...variantData } = variant;
          flatSequences.push({ ...seqBase, ...variantData });
        }
      } else {
        flatSequences.push(seqBase);
      }
    }

    const response = await this.withRetry(
      () => this.apiClient.post(`/campaigns/${campaignId}/sequences`, { sequences: flatSequences }),
      'save campaign sequence'
    );
    return response.data;
  }

  /** DELETE /campaigns/{campaign_id} */
  async deleteCampaign(campaignId: number): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.delete(`/campaigns/${campaignId}`),
      'delete campaign'
    );
    return response.data;
  }

  /** GET /leads/{lead_id}/campaigns */
  async fetchAllCampaignsUsingLeadId(leadId: number): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.get(`/leads/${leadId}/campaigns`),
      'fetch all campaigns using lead ID'
    );
    return response.data;
  }

  /** GET /campaigns/{campaign_id}/analytics */
  async getCampaignAnalytics(campaignId: number): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.get(`/campaigns/${campaignId}/analytics`),
      'get campaign analytics'
    );
    return response.data;
  }

  /** GET /campaigns/{campaign_id}/analytics-by-date */
  async getCampaignAnalyticsByDate(
    campaignId: number,
    params?: { start_date?: string; end_date?: string }
  ): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.get(`/campaigns/${campaignId}/analytics-by-date`, { params }),
      'get campaign analytics by date'
    );
    return response.data;
  }

  /** GET /campaigns/{campaign_id}/statistics */
  async getCampaignStatistics(campaignId: number): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.get(`/campaigns/${campaignId}/statistics`),
      'get campaign statistics'
    );
    return response.data;
  }

  /** GET /campaigns/{campaign_id}/leads-export */
  async exportLeadsCsv(campaignId: number): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.get(`/campaigns/${campaignId}/leads-export`),
      'export leads CSV'
    );
    return response.data;
  }

  /** GET /analytics/overview */
  async getAnalyticsOverview(): Promise<SuccessResponse> {
    const response = await this.withRetry(
      () => this.apiClient.get('/analytics/overview'),
      'get analytics overview'
    );
    return response.data;
  }
}
