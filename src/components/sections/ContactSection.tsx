"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import Swal from "sweetalert2";

type FormFields = {
  name: string;
  email: string;
  message: string;
};

const initialForm: FormFields = {
  name: "",
  email: "",
  message: "",
};

export function ContactSection() {
  const [form, setForm] = useState<FormFields>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message: string }>(
    {
      type: "idle",
      message: "",
    },
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));

    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      const message = "Please fill in all fields before submitting.";
      setStatus({ type: "error", message });
      await Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: message,
        confirmButtonColor: "#a04223",
      });
      return;
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!isEmailValid) {
      const message = "Please provide a valid email address.";
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

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = payload.message ?? "Something went wrong. Please try again.";
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

      const message = payload.message ?? "Thanks! We will get back to you within 24 hours.";
      setStatus({
        type: "success",
        message,
      });
      await Swal.fire({
        icon: "success",
        title: "Message Sent",
        text: message,
        confirmButtonColor: "#a04223",
      });
      setForm(initialForm);
    } catch {
      const message = "Unable to submit right now. Please try again.";
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
    <section className="bg-surface-container-low py-24" id="contact" aria-labelledby="contact-title">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.05em] text-primary">
              Connect
            </span>
            <h2 id="contact-title" className="mb-6 mt-4 font-headline text-4xl font-bold text-on-surface md:text-5xl">
              Let&apos;s Build the Future Together
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-on-surface-variant">
              Have a groundbreaking idea? We have the expertise to bring it to life. Reach
              out and start the conversation today.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="northstar-glow flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary">
                  <Mail aria-hidden="true" size={20} />
                </div>
                <span className="text-lg font-bold">hello@northstar.studio</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="northstar-glow flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary">
                  <MapPin aria-hidden="true" size={20} />
                </div>
                <span className="text-lg font-bold">San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div className="northstar-glow rounded-[2.5rem] bg-surface-container-lowest p-10">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label
                  className="font-label text-sm font-bold uppercase tracking-wider text-on-surface-variant"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  className="w-full rounded-xl border-none bg-surface-container-high px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary"
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  maxLength={80}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="font-label text-sm font-bold uppercase tracking-wider text-on-surface-variant"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full rounded-xl border-none bg-surface-container-high px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary"
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@company.com"
                  maxLength={120}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="font-label text-sm font-bold uppercase tracking-wider text-on-surface-variant"
                  htmlFor="message"
                >
                  Your Message
                </label>
                <textarea
                  className="w-full rounded-xl border-none bg-surface-container-high px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary"
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project..."
                  rows={5}
                  maxLength={2000}
                />
              </div>

              <button
                className="primary-gradient w-full rounded-xl py-4 text-lg font-bold text-on-primary transition-transform duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {status.type !== "idle" ? (
                <p
                  className={`text-sm font-semibold ${status.type === "success" ? "text-green-600" : "text-red-600"}`}
                  role="status"
                  aria-live="polite"
                >
                  {status.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
