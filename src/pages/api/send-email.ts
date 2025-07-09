// API route for sending emails via Supabase Edge Function
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, template, data, immediate = false } = req.body;

    // Validate required fields
    if (!to || !subject || !template) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, template' });
    }

    // Call Supabase Edge Function
    const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`;
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        template,
        data: data || {},
        immediate,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('API send-email error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}