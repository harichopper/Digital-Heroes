import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(body: ContactBody) {
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !message) {
    return "Please fill in all fields before submitting.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Please provide a valid email address.";
  }

  if (name.length > 80 || email.length > 120 || message.length > 2000) {
    return "Input is too long. Please shorten your message and try again.";
  }

  return null;
}

export async function POST(request: Request) {
  let body: ContactBody;

  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json(
      { message: "Invalid request payload. Please try again." },
      { status: 400 },
    );
  }

  const validationError = validateContact(body);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const submissionId = crypto.randomUUID();
    const now = new Date();
    const db = await getDatabase();

    await db.collection("contact_submissions").insertOne({
      submissionId,
      name: body.name?.trim(),
      email: body.email?.trim(),
      message: body.message?.trim(),
      source: "contact_form",
      createdAt: now,
    });

    return NextResponse.json(
      {
        message: "Thanks! Your message has been received. We will reply within 24 hours.",
        submissionId,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to save your message right now. Please try again." },
      { status: 500 },
    );
  }
}