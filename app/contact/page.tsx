"use client";

import { useState, useRef } from "react";
import {
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { siteConfig, mailtoUrl } from "@/lib/site";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type FormState = "idle" | "submitting" | "success" | "error";

interface Draft {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");
    setFallbackHref(null);

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setFormState("error");
      setErrorMessage("Please complete the verification challenge.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const draft: Draft = {
      name: (formData.get("name") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      subject: (formData.get("subject") as string) ?? "",
      message: (formData.get("message") as string) ?? "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          honeypot: formData.get("website") as string,
          turnstileToken,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Delivery is unavailable: hand the visitor a prefilled email so
        // nothing they typed is lost.
        if (result.undelivered) {
          setFallbackHref(
            mailtoUrl({
              subject: draft.subject || `Portfolio contact from ${draft.name}`,
              body: `${draft.message}\n\n${draft.name} (${draft.email})`,
            })
          );
        }
        throw new Error(result.error || "Something went wrong.");
      }

      setFormState("success");
      setTurnstileToken(null);
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
          <p className="text-lg text-muted-foreground">
            If you have a project in mind, a question about something
            I&apos;ve built, or just want to compare notes on analytics
            and AI, I&apos;d welcome the conversation.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            {formState === "success" ? (
              <div className="rounded-xl border border-green-500/50 bg-green-500/5 p-8 text-center space-y-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="text-xl font-semibold">Message sent.</h3>
                <p className="text-muted-foreground">
                  Got it. I&apos;ll reply within a day or two.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFormState("idle")}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      disabled={formState === "submitting"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      maxLength={254}
                      autoComplete="email"
                      disabled={formState === "submitting"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What is this about?"
                    maxLength={200}
                    disabled={formState === "submitting"}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="What are you working on?"
                    rows={6}
                    required
                    maxLength={5000}
                    disabled={formState === "submitting"}
                  />
                </div>

                {/* Cloudflare Turnstile CAPTCHA */}
                {TURNSTILE_SITE_KEY && (
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => setTurnstileToken(null)}
                    options={{
                      theme: "auto",
                      size: "normal",
                    }}
                  />
                )}

                {formState === "error" && (
                  <div
                    role="alert"
                    className="space-y-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorMessage}
                    </div>
                    {fallbackHref && (
                      <a
                        href={fallbackHref}
                        className="ml-6 inline-flex items-center gap-1.5 font-medium underline underline-offset-2 hover:text-foreground"
                      >
                        Open this message in your email app
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={formState === "submitting"}
                >
                  {formState === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Connect directly</h3>
              <div className="space-y-3">
                <a
                  href={mailtoUrl()}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Email</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {siteConfig.email}
                    </div>
                  </div>
                </a>
                <a
                  href={siteConfig.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <LinkedinIcon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">LinkedIn</div>
                    <div className="text-xs text-muted-foreground">
                      nicholas-a-wiley
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-2">
              <p className="text-sm font-medium">Based in {siteConfig.location}</p>
              <p className="text-xs text-muted-foreground">
                Open to conversations about analytics, decision-support
                tools, or applied AI in regulated environments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
