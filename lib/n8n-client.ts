const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

export class N8nClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    if (!N8N_BASE_URL) {
      console.error("NEXT_PUBLIC_N8N_BASE_URL is not defined in environment variables.");
      throw new Error("n8n base URL is missing.");
    }
    this.baseURL = N8N_BASE_URL;
    this.apiKey = N8N_API_KEY || ""; // API key might be optional for some public webhooks
  }

  private async request(endpoint: string, options?: RequestInit) {
    const headers = {
      "Content-Type": "application/json",
      ...(this.apiKey && { "X-N8N-API-KEY": this.apiKey }),
      ...(options?.headers || {}),
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Fetches all workflows
  async getWorkflows() {
    return this.request("/api/v1/workflows");
  }

  // Executes a specific workflow
  async executeWorkflow(workflowId: string, data?: any) {
    return this.request(`/api/v1/workflows/${workflowId}/execute`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Fetches executions for a specific workflow
  async getExecutions(workflowId: string) {
    return this.request(`/api/v1/executions?workflowId=${workflowId}`);
  }

  // Triggers a webhook (for workflows with a Webhook trigger node)
  // Added 'method' parameter with a default of 'GET'
  async triggerWebhook(webhookPath: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("NEXT_PUBLIC_N8N_WEBHOOK_URL is not defined.");
      throw new Error("n8n webhook URL is missing.");
    }

    const options: RequestInit = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Only include body for POST requests that have data
    if (method === 'POST' && data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${webhookUrl}/${webhookPath}`, options);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use status text
        throw new Error(`Webhook request failed with status ${response.status}: ${response.statusText}`);
      }
      throw new Error(errorData.message || `Webhook request failed with status ${response.status}`);
    }

    return response; // Return the raw Response object for calling components to parse
  }
}

export const n8nClient = new N8nClient();
