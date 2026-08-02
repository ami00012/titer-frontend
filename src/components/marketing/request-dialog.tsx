"use client";

import { useId, useState, type ReactElement } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/api/leads";

type Mode = "trial" | "demo";

const COPY: Record<
  Mode,
  {
    title: string;
    description: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
    successTitle: string;
    successBody: (calendarUrl: string) => ReactElement;
  }
> = {
  trial: {
    title: "Request a trial",
    description: "Trials are set up by us, usually within a day.",
    messageLabel: "What do you want to measure?",
    messagePlaceholder: "e.g. emotional tone on our blog before it publishes",
    submitLabel: "Request trial",
    submittingLabel: "Sending…",
    successTitle: "Request received",
    successBody: () => <>We&apos;ll set you up within a day.</>,
  },
  demo: {
    title: "Book a demo",
    description: "A short call to see the dials on your own pages.",
    messageLabel: "Anything we should know?",
    messagePlaceholder: "e.g. we run 500 pages a month across clients",
    submitLabel: "Book a demo",
    submittingLabel: "Sending…",
    successTitle: "Request received",
    successBody: (calendarUrl) => (
      <>
        Grab a time that works:{" "}
        <a href={calendarUrl} className="text-[color:var(--titer-ink)] underline underline-offset-2">
          {calendarUrl}
        </a>
      </>
    ),
  },
};

const CALENDAR_URL = "https://calendly.com/titer-support/30min";

interface RequestDialogProps {
  mode: Mode;
  trigger: ReactElement;
}

type Status = "idle" | "submitting" | "success" | "error";

export function RequestDialog({ mode, trigger }: RequestDialogProps) {
  const copy = COPY[mode];
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  function reset() {
    setStatus("idle");
    setName("");
    setWorkEmail("");
    setCompany("");
    setRole("");
    setMessage("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitLead({
        type: mode === "trial" ? "trial_request" : "demo_request",
        name,
        workEmail,
        company,
        role: role || undefined,
        message: message || undefined,
      });
      setStatus("success");
      track(mode === "trial" ? "trial_requested" : "demo_requested", { role, company });
    } catch {
      setStatus("error");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{status === "success" ? copy.successTitle : copy.title}</DialogTitle>
          <DialogDescription>
            {status === "success" ? copy.successBody(CALENDAR_URL) : copy.description}
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-full"
            >
              Done
            </Button>
          </DialogFooter>
        ) : (
          <form id={formId} className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-name`}>Name</Label>
              <Input
                id={`${formId}-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-email`}>Work email</Label>
              <Input
                id={`${formId}-email`}
                type="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-company`}>Company</Label>
              <Input
                id={`${formId}-company`}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                autoComplete="organization"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-role`}>Role</Label>
              <Input id={`${formId}-role`} value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-message`}>{copy.messageLabel}</Label>
              <textarea
                id={`${formId}-message`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={copy.messagePlaceholder}
                rows={3}
                className={cn(
                  "w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                )}
              />
            </div>

            {status === "error" ? (
              <p className="flex items-center gap-2 text-sm text-[color:var(--titer-ink)]">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--status-critical)" }}
                  aria-hidden="true"
                />
                Something went wrong sending that. Try again in a moment.
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="submit"
                form={formId}
                disabled={status === "submitting"}
                className="rounded-full"
              >
                {status === "submitting" ? copy.submittingLabel : copy.submitLabel}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
