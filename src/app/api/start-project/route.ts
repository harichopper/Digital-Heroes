import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

type ProjectRequest = {
  fullName?: string;
  email?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  details?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(payload: ProjectRequest) {
  const requiredFields: Array<keyof ProjectRequest> = [
    "fullName",
    "email",
    "projectType",
    "budget",
    "timeline",
    "details",
  ];

  const missing = requiredFields.some((field) => !(payload[field] ?? "").trim());
  if (missing) {
    return "Please complete all required fields.";
  }

  if (!EMAIL_PATTERN.test((payload.email ?? "").trim())) {
    return "Please enter a valid email address.";
  }

  if ((payload.fullName ?? "").length > 80 || (payload.company ?? "").length > 120) {
    return "Name or company input is too long.";
  }

  if ((payload.details ?? "").length > 3000) {
    return "Project details are too long. Please shorten and submit again.";
  }

  return null;
}

export async function POST(request: Request) {
  let payload: ProjectRequest;

  try {
    payload = (await request.json()) as ProjectRequest;
  } catch {
    return NextResponse.json(
      { message: "Invalid request payload. Please try again." },
      { status: 400 },
    );
  }

  const validationError = validate(payload);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const requestId = crypto.randomUUID();
    const now = new Date();
    const db = await getDatabase();

    await db.collection("project_requests").insertOne({
      requestId,
      fullName: payload.fullName?.trim(),
      email: payload.email?.trim(),
      company: payload.company?.trim() || null,
      projectType: payload.projectType?.trim(),
      budget: payload.budget?.trim(),
      timeline: payload.timeline?.trim(),
      details: payload.details?.trim(),
      source: "start_project_page",
      createdAt: now,
    });

    return NextResponse.json(
      {
        message: "Request submitted. Our team will contact you within 24 hours.",
        requestId,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to save your request right now. Please try again." },
      { status: 500 },
    );
  }
}