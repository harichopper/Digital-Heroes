type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

type SendEmailResult = {
  sent: boolean;
  skipped?: boolean;
  providerId?: string;
  error?: string;
};

const RESEND_API_URL = 'https://api.resend.com/emails';

function getDefaultFromAddress(): string {
  return process.env.EMAIL_FROM || 'Digital Heroes <no-reply@digitalheroes.co.in>';
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not configured; skipping email send');
    return { sent: false, skipped: true };
  }

  const payload = {
    from: getDefaultFromAddress(),
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
    ...(input.text ? { text: input.text } : {}),
  };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[email] provider error:', errorBody);
      return { sent: false, error: errorBody };
    }

    const data = (await response.json()) as { id?: string };
    return { sent: true, providerId: data.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown email error';
    console.error('[email] send failed:', message);
    return { sent: false, error: message };
  }
}
