/**
 * SmartLead MCP Server - Server Implementation
 *
 * A comprehensive Model Context Protocol (MCP) server that exposes SmartLead API
 * endpoints as MCP tools. This server provides seamless integration with MCP-compatible
 * clients like Claude Desktop, Cursor, Windsurf, and others.
 *
 * Architecture:
 * - Built on the official MCP SDK for maximum compatibility
 * - Modular tool structure for better maintainability
 * - Comprehensive error handling and user-friendly responses
 * - Type-safe parameter validation using Zod schemas
 * - Professional logging and debugging capabilities
 * - Production-ready with graceful degradation
 *
 * Tool Categories:
 * - Campaign Management (14 tools)
 * - Lead Management (17 tools)
 * - Analytics & Reporting (20 tools)
 * - Email Account Management (16 tools)
 * - Smart Delivery (16 tools)
 * - Webhooks (12 tools)
 * - Client Management (12 tools)
 * - Smart Senders (15 tools)
 *
 * @author LeadMagic Team
 * @version 1.5.0
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { SmartLeadClient, SmartLeadError } from './client/index.js';
import {
  registerCampaignTools,
  registerLeadTools,
  registerAnalyticsTools,
  registerEmailAccountTools,
  registerWebhookTools,
  registerClientManagementTools,
  registerSmartSendersTools,
  registerStatisticsTools,
  registerSmartDeliveryTools,
} from './tools/index.js';
import type { MCPToolResponse } from './types/config.js';

/**
 * SmartLead MCP Server
 *
 * Main server class that orchestrates the MCP server functionality.
 * Handles client initialization, tool registration, and request processing.
 */
export class SmartLeadMCPServer {
  private server: McpServer;
  private client: SmartLeadClient;

  /**
   * Creates a new SmartLead MCP Server instance
   *
   * @param apiKey - SmartLead API key for authentication
   * @param options - Optional configuration for the client
   */
  constructor(
    apiKey: string,
    options?: {
      baseUrl?: string;
      timeout?: number;
      maxRetries?: number;
      retryDelay?: number;
      rateLimit?: number;
    }
  ) {
    // Initialize the MCP server
    this.server = new McpServer({
      name: 'smartlead-mcp-server',
      version: '1.5.0',
      description:
        'Unofficial SmartLead MCP Server - We are partners with SmartLead and love the product!',
    });

    // Initialize the SmartLead API client
    this.client = new SmartLeadClient({
      apiKey,
      baseUrl: options?.baseUrl || 'https://server.smartlead.ai/api/v1',
      timeout: options?.timeout || 30000,
      maxRetries: options?.maxRetries || 3,
      retryDelay: options?.retryDelay || 1000,
      rateLimit: options?.rateLimit || 100,
    });

    // Set up the server
    this.setupServer();
  }

  /**
   * Sets up the MCP server with tools and handlers
   * @private
   */
  private setupServer(): void {
    // Test connection on startup
    this.testConnection();

    // Register all tools
    this.setupTools();

    // Set up error handlers
    this.setupErrorHandlers();
  }

  /**
   * Tests the SmartLead API connection
   * @private
   */
  private async testConnection(): Promise<void> {
    try {
      const result = await this.client.testConnection();
      if (result.success) {
        console.log('✅ SmartLead API connection successful');
      } else {
        console.error('❌ SmartLead API connection failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Failed to test SmartLead API connection:', error);
    }
  }

  /**
   * Registers all SmartLead API endpoints as MCP tools
   *
   * This method sets up SmartLead tools using a tiered approach to prevent overwhelming
   * MCP clients. Tools are organized into categories that can be selectively enabled:
   *
   * **Essential Tools (Always Loaded):**
   * - Campaign Management (13 tools)
   * - Lead Management (17 tools)
   * - Basic Email Accounts (10 tools)
   * - Basic Statistics (9 tools)
   *
   * **Advanced Tools (Optional - Set SMARTLEAD_ADVANCED_TOOLS=true):**
   * - Smart Delivery (25 tools)
   * - Global Analytics (20 tools)
   * - Webhooks (5 tools)
   *
   * **Administrative Tools (Optional - Set SMARTLEAD_ADMIN_TOOLS=true):**
   * - Client Management (6 tools)
   * - Smart Senders (5 tools)
   *
   * @private
   */
  private setupTools(): void {
    console.log('🔧 Configuring SmartLead MCP Tools...');

    // Always load essential tools (49 tools total)
    console.log('✅ Loading Essential Tools: Campaigns, Leads, Email Accounts, Statistics');
    registerCampaignTools(
      this.server,
      this.client,
      this.formatSuccessResponse.bind(this),
      this.handleError.bind(this)
    );
    registerLeadTools(
      this.server,
      this.client,
      this.formatSuccessResponse.bind(this),
      this.handleError.bind(this)
    );
    registerEmailAccountTools(
      this.server,
      this.client,
      this.formatSuccessResponse.bind(this),
      this.handleError.bind(this)
    );
    registerStatisticsTools(
      this.server,
      this.client,
      this.formatSuccessResponse.bind(this),
      this.handleError.bind(this)
    );

    // Load advanced tools if enabled (50 additional tools)
    const enableAdvancedTools = process.env.SMARTLEAD_ADVANCED_TOOLS === 'true';
    if (enableAdvancedTools) {
      console.log('🚀 Loading Advanced Tools: Smart Delivery, Analytics, Webhooks');
      registerSmartDeliveryTools(
        this.server,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
      registerAnalyticsTools(
        this.server,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
      registerWebhookTools(
        this.server,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
    } else {
      console.log('⏸️  Advanced Tools disabled (set SMARTLEAD_ADVANCED_TOOLS=true to enable)');
    }

    // Load administrative tools if enabled (11 additional tools)
    const enableAdminTools = process.env.SMARTLEAD_ADMIN_TOOLS === 'true';
    if (enableAdminTools) {
      console.log('🔐 Loading Administrative Tools: Client Management, Smart Senders');
      registerClientManagementTools(
        this.server,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
      registerSmartSendersTools(
        this.server,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
    } else {
      console.log('⏸️  Administrative Tools disabled (set SMARTLEAD_ADMIN_TOOLS=true to enable)');
    }

    // Show summary
    const toolCount = this.getLoadedToolCount(enableAdvancedTools, enableAdminTools);
    console.log(`📊 Total Tools Loaded: ${toolCount}/113+ available`);
    console.log(
      '💡 To enable more tools, see: https://github.com/LeadMagic/smartlead-mcp-server#readme'
    );
  }

  /**
   * Calculates the number of loaded tools based on enabled features
   * @private
   */
  private getLoadedToolCount(advancedEnabled: boolean, adminEnabled: boolean): number {
    let count = 49; // Essential tools
    if (advancedEnabled) count += 50; // Advanced tools
    if (adminEnabled) count += 11; // Admin tools
    return count;
  }

  /**
   * Sets up error handlers for the MCP server
   * @private
   */
  private setupErrorHandlers(): void {
    // Handle uncaught errors gracefully
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Formats successful API responses for MCP clients
   *
   * @param message - User-friendly message describing the operation
   * @param data - Raw API response data
   * @param summary - Optional summary for quick overview
   * @returns Formatted MCP tool response
   * @private
   */
  private formatSuccessResponse(
    message: string,
    data?: unknown,
    summary?: string
  ): MCPToolResponse {
    const responseText = [
      `✅ ${message}`,
      summary ? `\n📊 ${summary}` : '',
      data
        ? `\n\n📋 **Detailed Results:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
        : '',
    ]
      .filter(Boolean)
      .join('');

    return {
      content: [
        {
          type: 'text' as const,
          text: responseText,
        },
      ],
    };
  }

  /**
   * Handles and formats errors for MCP clients
   *
   * Provides comprehensive error information while maintaining user-friendly messaging.
   * Includes specific guidance for common error scenarios.
   *
   * @param error - The error that occurred
   * @returns Formatted MCP error response
   * @private
   */
  private handleError(error: unknown): MCPToolResponse {
    console.error('SmartLead API Error:', error);

    let errorMessage = '❌ An unexpected error occurred';
    let errorDetails = '';
    let troubleshooting = '';

    if (error instanceof SmartLeadError) {
      // Handle SmartLead-specific errors
      errorMessage = `❌ SmartLead API Error: ${error.message}`;
      errorDetails = `**Error Code:** ${error.code}\n**Status:** ${error.status}`;

      // Provide specific troubleshooting guidance
      if (error.isClientError()) {
        if (error.status === 401) {
          troubleshooting =
            '🔧 **Troubleshooting:** Please check your API key is valid and has sufficient permissions.';
        } else if (error.status === 429) {
          troubleshooting =
            '🔧 **Troubleshooting:** Rate limit exceeded. Please wait a moment before making more requests.';
        } else if (error.status === 400) {
          troubleshooting =
            '🔧 **Troubleshooting:** Please check that all required parameters are provided and valid.';
        } else {
          troubleshooting =
            '🔧 **Troubleshooting:** Please verify your request parameters and try again.';
        }
      } else if (error.isServerError()) {
        troubleshooting =
          '🔧 **Troubleshooting:** SmartLead server error. Please try again in a few moments.';
      } else if (error.isNetworkError()) {
        troubleshooting =
          '🔧 **Troubleshooting:** Network connectivity issue. Please check your internet connection.';
      }
    } else if (error instanceof Error) {
      // Handle generic JavaScript errors
      errorMessage = `❌ Error: ${error.message}`;
      errorDetails = `**Type:** ${error.name}`;
      troubleshooting = '🔧 **Troubleshooting:** Please check your input parameters and try again.';
    } else {
      // Handle unknown error types
      errorMessage = '❌ An unknown error occurred';
      errorDetails = '**Type:** Unknown';
      troubleshooting =
        '🔧 **Troubleshooting:** Please try again or contact support if the issue persists.';
    }

    const responseText = [
      errorMessage,
      errorDetails ? `\n${errorDetails}` : '',
      troubleshooting ? `\n\n${troubleshooting}` : '',
      '\n\n💡 **Need Help?** Visit: https://github.com/LeadMagic/smartlead-mcp-server/issues',
    ]
      .filter(Boolean)
      .join('');

    return {
      content: [
        {
          type: 'text' as const,
          text: responseText,
        },
      ],
    };
  }

  /**
   * Creates a fresh McpServer instance with all tools registered.
   * Used for HTTP transport where each request needs its own server instance
   * (the MCP SDK only allows one active connection per McpServer).
   * The shared SmartLeadClient is reused since it's stateless.
   * @private
   */
  private createFreshMcpServer(): McpServer {
    const freshServer = new McpServer({
      name: 'smartlead-mcp-server',
      version: '1.5.0',
      description:
        'Unofficial SmartLead MCP Server - We are partners with SmartLead and love the product!',
    });

    // Register essential tools
    registerCampaignTools(
      freshServer,
      this.client,
      this.formatSuccessResponse.bind(this),
      this.handleError.bind(this)
    );
    registerLeadTools(
      freshServer,
      this.client,
      this.formatSuccessResponse.bind(this),
      this.handleError.bind(this)
    );
    registerEmailAccountTools(
      freshServer,
      this.client,
      this.formatSuccessResponse.bind(this),
      this.handleError.bind(this)
    );
    registerStatisticsTools(
      freshServer,
      this.client,
      this.formatSuccessResponse.bind(this),
      this.handleError.bind(this)
    );

    // Advanced tools
    if (process.env.SMARTLEAD_ADVANCED_TOOLS === 'true') {
      registerSmartDeliveryTools(
        freshServer,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
      registerAnalyticsTools(
        freshServer,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
      registerWebhookTools(
        freshServer,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
    }

    // Admin tools
    if (process.env.SMARTLEAD_ADMIN_TOOLS === 'true') {
      registerClientManagementTools(
        freshServer,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
      registerSmartSendersTools(
        freshServer,
        this.client,
        this.formatSuccessResponse.bind(this),
        this.handleError.bind(this)
      );
    }

    return freshServer;
  }

  /**
   * Connects the MCP server via HTTP (Streamable HTTP transport).
   * Each incoming request gets a fresh McpServer instance with its own transport,
   * while sharing the same SmartLeadClient for API calls.
   *
   * @param port - Port to listen on (default: 8083)
   * @param host - Host to bind to (default: '0.0.0.0')
   */
  async connectHttp(port: number = 8083, host: string = '0.0.0.0'): Promise<void> {
    console.log(`🚀 Starting SmartLead MCP Server (HTTP) on http://${host}:${port}/mcp`);

    const self = this;

    const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);

      if (url.pathname === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
      }

      if (url.pathname === '/mcp' && (req.method === 'POST' || req.method === 'GET' || req.method === 'DELETE')) {
        const freshServer = self.createFreshMcpServer();
        const mcpTransport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await freshServer.connect(mcpTransport);
        await mcpTransport.handleRequest(req, res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

    httpServer.listen(port, host, () => {
      console.log(`✅ SmartLead MCP Server (HTTP) running on http://${host}:${port}/mcp`);
    });
  }

  /**
   * Connects the MCP server to stdio
   */
  async connect(): Promise<void> {
    console.log('🚀 Starting SmartLead MCP Server v1.5.0...');
    console.log(
      '📡 Server: Unofficial SmartLead MCP Server - We are partners with SmartLead and love the product!'
    );

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('✅ SmartLead MCP Server is running and ready to accept connections');
  }

  /**
   * Gets the MCP server instance
   */
  getServer(): McpServer {
    return this.server;
  }

  /**
   * Gets the SmartLead client instance
   */
  getClient(): SmartLeadClient {
    return this.client;
  }

  /**
   * Closes the MCP server
   */
  async close(): Promise<void> {
    console.log('🛑 Stopping SmartLead MCP Server...');
    await this.server.close();
    console.log('✅ SmartLead MCP Server stopped');
  }
}
