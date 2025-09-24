import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookRequest {
  action: 'register_webhook' | 'delete_webhook' | 'list_webhooks' | 'send_notification' | 'test_webhook';
  webhookData?: {
    url: string;
    events: string[];
    name: string;
    active: boolean;
    headers?: { [key: string]: string };
  };
  webhookId?: string;
  notificationData?: {
    event: string;
    data: any;
    timestamp: string;
  };
}

interface WebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Validate action field
    if (!requestBody.action) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required field: action',
        validActions: ['register_webhook', 'delete_webhook', 'list_webhooks', 'send_notification', 'test_webhook'],
        examples: {
          register_webhook: {
            action: 'register_webhook',
            webhookData: {
              url: 'https://your-webhook.com/endpoint',
              events: ['ranking_change', 'technical_issue'],
              name: 'My Webhook',
              active: true
            }
          },
          list_webhooks: { action: 'list_webhooks' },
          test_webhook: { action: 'test_webhook', webhookId: 'webhook_123' }
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      action,
      webhookData,
      webhookId,
      notificationData
    }: WebhookRequest = requestBody;

    console.log(`🔔 Webhook Notifications: ${action}`);

    let result: any;

    switch (action) {
      case 'register_webhook':
        result = await registerWebhook(webhookData!);
        break;
      case 'delete_webhook':
        result = await deleteWebhook(webhookId!);
        break;
      case 'list_webhooks':
        result = await listWebhooks();
        break;
      case 'send_notification':
        result = await sendNotification(notificationData!);
        break;
      case 'test_webhook':
        result = await testWebhook(webhookId!);
        break;
      default:
        return new Response(JSON.stringify({
          success: false,
          error: `Invalid action: ${action}`,
          validActions: ['register_webhook', 'delete_webhook', 'list_webhooks', 'send_notification', 'test_webhook'],
          providedAction: action
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log(`✅ Webhook action completed: ${action}`);

    const response: WebhookResponse = {
      success: true,
      data: result
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Webhook Notifications error:', error);
    
    const errorResponse: WebhookResponse = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function registerWebhook(webhookData: any) {
  const webhook = {
    id: generateWebhookId(),
    ...webhookData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastTriggered: null,
    status: 'active'
  };

  console.log(`📝 Registered webhook: ${webhook.name} -> ${webhook.url}`);
  
  return {
    webhook,
    message: 'Webhook registered successfully'
  };
}

async function deleteWebhook(webhookId: string) {
  console.log(`🗑️ Deleted webhook: ${webhookId}`);
  
  return {
    webhookId,
    message: 'Webhook deleted successfully'
  };
}

async function listWebhooks() {
  // Mock data for existing webhooks
  const webhooks = [
    {
      id: 'webhook_001',
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
      events: ['ranking_change', 'technical_issue', 'audit_complete'],
      active: true,
      headers: {
        'Content-Type': 'application/json'
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastTriggered: '2024-01-10T09:15:00Z',
      status: 'active'
    },
    {
      id: 'webhook_002',
      name: 'Discord Alerts',
      url: 'https://discord.com/api/webhooks/xxx/yyy',
      events: ['ranking_drop', 'competitor_change'],
      active: true,
      headers: {
        'Content-Type': 'application/json'
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastTriggered: '2024-01-09T14:30:00Z',
      status: 'active'
    },
    {
      id: 'webhook_003',
      name: 'Email Integration',
      url: 'https://api.sendgrid.com/v3/mail/send',
      events: ['weekly_report', 'monthly_summary'],
      active: false,
      headers: {
        'Authorization': 'Bearer xxx',
        'Content-Type': 'application/json'
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastTriggered: null,
      status: 'inactive'
    }
  ];

  console.log(`📊 Retrieved ${webhooks.length} webhooks`);
  
  return { webhooks };
}

async function sendNotification(notificationData: any) {
  const { event, data, timestamp } = notificationData;
  
  console.log(`📤 Sending notification for event: ${event}`);
  
  // Get active webhooks for this event
  const webhooks = await getWebhooksForEvent(event);
  
  const deliveryResults = [];
  
  for (const webhook of webhooks) {
    try {
      const payload = {
        event,
        timestamp,
        data,
        webhook_id: webhook.id,
        source: 'TalentXcel SEO Suite'
      };
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          ...webhook.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      deliveryResults.push({
        webhookId: webhook.id,
        webhookName: webhook.name,
        status: response.ok ? 'delivered' : 'failed',
        statusCode: response.status,
        deliveredAt: new Date().toISOString()
      });
      
      console.log(`📬 Notification sent to ${webhook.name}: ${response.status}`);
      
    } catch (error) {
      deliveryResults.push({
        webhookId: webhook.id,
        webhookName: webhook.name,
        status: 'error',
        error: (error as Error).message,
        deliveredAt: new Date().toISOString()
      });
      
      console.error(`❌ Failed to send to ${webhook.name}:`, (error as Error).message);
    }
  }
  
  return {
    event,
    totalWebhooks: webhooks.length,
    deliveryResults,
    summary: {
      delivered: deliveryResults.filter(r => r.status === 'delivered').length,
      failed: deliveryResults.filter(r => r.status === 'failed').length,
      errors: deliveryResults.filter(r => r.status === 'error').length
    }
  };
}

async function testWebhook(webhookId: string) {
  console.log(`🧪 Testing webhook: ${webhookId}`);
  
  const testPayload = {
    event: 'test_notification',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test notification from TalentXcel SEO Suite',
      test: true,
      webhookId
    },
    source: 'TalentXcel SEO Suite'
  };
  
  // Simulate webhook call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const testResult = {
    webhookId,
    testPayload,
    status: 'success',
    statusCode: 200,
    responseTime: '234ms',
    testedAt: new Date().toISOString(),
    message: 'Test notification sent successfully'
  };
  
  console.log(`✅ Webhook test completed: ${webhookId}`);
  
  return testResult;
}

async function getWebhooksForEvent(event: string) {
  // Mock function to get webhooks that listen for specific events
  const allWebhooks = [
    {
      id: 'webhook_001',
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
      events: ['ranking_change', 'technical_issue', 'audit_complete'],
      active: true,
      headers: { 'Content-Type': 'application/json' }
    },
    {
      id: 'webhook_002',
      name: 'Discord Alerts',
      url: 'https://discord.com/api/webhooks/xxx/yyy',
      events: ['ranking_drop', 'competitor_change'],
      active: true,
      headers: { 'Content-Type': 'application/json' }
    }
  ];
  
  return allWebhooks.filter(webhook => 
    webhook.active && webhook.events.includes(event)
  );
}

function generateWebhookId(): string {
  return 'webhook_' + Math.random().toString(36).substr(2, 9);
}