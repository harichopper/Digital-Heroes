"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";

type ProjectForm = {
  fullName: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  details: string;
};

const initialForm: ProjectForm = {
  fullName: "",
  email: "",
  company: "",
  projectType: "",
  budget: "",
  timeline: "",
  details: "",
};

export default function StartProjectPage() {
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message: string }>({
    type: "idle",
    message: "",
  });

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields: Array<keyof ProjectForm> = [
      "fullName",
      "email",
      "projectType",
      "budget",
      "timeline",
      "details",
    ];

    const hasMissing = requiredFields.some((field) => !form[field].trim());
    if (hasMissing) {
      const message = "Please complete all required fields.";
      setStatus({ type: "error", message });
      await Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: message,
        confirmButtonColor: "#a04223",
      });
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValid) {
      const message = "Please enter a valid email address.";
      setStatus({ type: "error", message });
      await Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: message,
        confirmButtonColor: "#a04223",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/start-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        const message = payload.message ?? "Failed to submit your request. Please try again.";
        setStatus({
          type: "error",
          message,
        });
        await Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: message,
          confirmButtonColor: "#a04223",
        });
        return;
      }

      const message = payload.message ?? "Project request submitted successfully.";
      setStatus({
        type: "success",
        message,
      });
      await Swal.fire({
        icon: "success",
        title: "Request Submitted",
        text: message,
        confirmButtonColor: "#a04223",
      });
      setForm(initialForm);
    } catch {
      const message = "Network error. Please try again in a moment.";
      setStatus({ type: "error", message });
      await Swal.fire({
        icon: "error",
        title: "Network Error",
        text: message,
        confirmButtonColor: "#a04223",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TopNav />
      <main className="bg-background pb-20 pt-32 text-on-surface antialiased">
        <section className="mx-auto max-w-[1120px] px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to homepage
          </Link>

          <div className="mb-10 max-w-3xl">
            <span className="font-label text-xs font-bold uppercase tracking-[0.05em] text-primary">
              Start a Project
            </span>
            <h1 className="mt-4 font-headline text-4xl font-bold leading-tight md:text-5xl">
              Tell us what you are building and we will craft a custom proposal.
            </h1>
            <p className="mt-4 text-lg text-on-surface-variant">
              Fill out the details below. Our team reviews every request and replies with
              scope, timeline, and next steps.
            </p>
          </div>

          <div className="northstar-glow rounded-3xl bg-surface-container-lowest p-6 md:p-10">
            <form className="grid grid-cols-1 gap-5 md:grid-cols-2" onSubmit={onSubmit} noValidate>
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-semibold text-on-surface-variant">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  maxLength={80}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-on-surface-variant">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  maxLength={120}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white"
                  placeholder="jane@company.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-semibold text-on-surface-variant">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={onChange}
                  maxLength={120}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white"
                  placeholder="Northstar Labs"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="projectType" className="text-sm font-semibold text-on-surface-variant">
                  Project Type *
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={form.projectType}
                  onChange={onChange}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white"
                >
                  <option value="">Select type</option>
                  <option value="website-design">Website Design</option>
                  <option value="web-development">Web Development</option>
                  <option value="branding">Branding</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="full-service">Full Service</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-semibold text-on-surface-variant">
                  Budget Range *
                </label>
                <select
                  id="budget"
                  name="budget"
                  value={form.budget}
                  onChange={onChange}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white"
                >
                  <option value="">Select budget</option>
                  <option value="under-5k">Under $5,000</option>
                  <option value="5k-15k">$5,000 - $15,000</option>
                  <option value="15k-30k">$15,000 - $30,000</option>
                  <option value="30k-plus">$30,000+</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="timeline" className="text-sm font-semibold text-on-surface-variant">
                  Desired Timeline *
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  value={form.timeline}
                  onChange={onChange}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white"
                >
                  <option value="">Select timeline</option>
                  <option value="asap">ASAP</option>
                  <option value="2-4-weeks">2-4 weeks</option>
                  <option value="1-2-months">1-2 months</option>
                  <option value="2-plus-months">2+ months</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="details" className="text-sm font-semibold text-on-surface-variant">
                  Project Details *
                </label>
                <textarea
                  id="details"
                  name="details"
                  value={form.details}
                  onChange={onChange}
                  rows={6}
                  maxLength={3000}
                  className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high px-4 py-3 outline-none transition-all focus:border-primary focus:bg-white"
                  placeholder="Tell us about your goals, audience, and expected outcomes..."
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="primary-gradient inline-flex items-center justify-center rounded-xl px-8 py-3 text-base font-bold text-on-primary transition-transform duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Submit Project Request"}
                </button>
              </div>

              {status.type !== "idle" ? (
                <p
                  className={`md:col-span-2 inline-flex items-center gap-2 text-sm font-semibold ${
                    status.type === "success" ? "text-green-700" : "text-red-600"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {status.type === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : null}
                  {status.message}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}