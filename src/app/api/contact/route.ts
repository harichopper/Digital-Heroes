import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContactMessage } from '@/models/ContactMessage';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/contact
 * Accepts a contact form submission and persists it to MongoDB.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, topic, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const doc = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      topic: topic?.trim() || 'General Enquiry',
      message: message.trim(),
    });

    const supportInbox = process.env.SUPPORT_EMAIL || 'support@digitalheroes.co.in';
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const normalizedTopic = topic?.trim() || 'General Enquiry';

    // Send notifications best-effort; form submission should not fail if email provider is unavailable.
    await Promise.allSettled([
      sendEmail({
        to: normalizedEmail,
        subject: 'We received your message - Digital Heroes',
        html: `
          <p>Hi ${normalizedName},</p>
          <p>Thanks for contacting Digital Heroes. We received your message and will reply within 24 hours on business days.</p>
          <p><strong>Topic:</strong> ${normalizedTopic}</p>
          <p><strong>Your message:</strong><br/>${message.trim()}</p>
          <p>Regards,<br/>Digital Heroes Support</p>
        `,
      }),
      sendEmail({
        to: supportInbox,
        subject: `New contact message: ${normalizedTopic}`,
        html: `
          <p><strong>From:</strong> ${normalizedName} (${normalizedEmail})</p>
          <p><strong>Topic:</strong> ${normalizedTopic}</p>
          <p><strong>Message:</strong><br/>${message.trim()}</p>
          <p><strong>Message ID:</strong> ${String(doc._id)}</p>
        `,
      }),
    ]);

    return NextResponse.json({ success: true, id: doc._id }, { status: 201 });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
