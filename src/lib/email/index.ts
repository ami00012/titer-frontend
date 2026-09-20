export type EmailEvent =
  | "listing_submitted"
  | "listing_approved"
  | "buyer_inquiry"
  | "new_offer"
  | "offer_accepted"
  | "offer_rejected"
  | "counteroffer"
  | "transaction_update"
  | "mandate_pitch"
  | "wind_down_lead"
  | "valuation_lead";

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>;
}

/** Default provider for local/dev: logs instead of sending. Swap via `setEmailProvider` once a real provider (e.g. Resend) is wired up -- no call site changes needed. */
class ConsoleEmailProvider implements EmailProvider {
  async send(payload: EmailPayload) {
    console.log(`[email] to=${payload.to} subject="${payload.subject}"\n${payload.body}`);
  }
}

let provider: EmailProvider = new ConsoleEmailProvider();

export function setEmailProvider(next: EmailProvider) {
  provider = next;
}

const TEMPLATES: Record<EmailEvent, (data: Record<string, string>) => Pick<EmailPayload, "subject" | "body">> = {
  listing_submitted: (d) => ({
    subject: `Your listing "${d.title}" was submitted for review`,
    body: `Thanks for listing "${d.title}". Our team will review it shortly.`,
  }),
  listing_approved: (d) => ({
    subject: `Your listing "${d.title}" is live`,
    body: `"${d.title}" has been approved and is now published on the marketplace.`,
  }),
  buyer_inquiry: (d) => ({
    subject: `New inquiry on "${d.title}"`,
    body: `A buyer requested information about "${d.title}".`,
  }),
  new_offer: (d) => ({
    subject: `New offer on "${d.title}": ${d.amount}`,
    body: `You received an offer of ${d.amount} on "${d.title}".`,
  }),
  offer_accepted: (d) => ({
    subject: `Offer accepted on "${d.title}"`,
    body: `Your offer of ${d.amount} on "${d.title}" was accepted.`,
  }),
  offer_rejected: (d) => ({
    subject: `Offer declined on "${d.title}"`,
    body: `Your offer on "${d.title}" was declined.`,
  }),
  counteroffer: (d) => ({
    subject: `Counteroffer on "${d.title}": ${d.amount}`,
    body: `The seller countered with ${d.amount} on "${d.title}".`,
  }),
  transaction_update: (d) => ({
    subject: `Transaction update: "${d.title}"`,
    body: `The transaction for "${d.title}" is now ${d.status}.`,
  }),
  mandate_pitch: (d) => ({
    subject: `Pitch for mandate ${d.mandateId} from ${d.fromEmail}`,
    body: d.message,
  }),
  wind_down_lead: (d) => ({
    subject: `Wind-down lead: ${d.url}`,
    body: `URL: ${d.url}\nMonthly revenue: ${d.monthlyRevenue}\nEmail: ${d.email}`,
  }),
  valuation_lead: (d) => ({
    subject: `Valuation request from ${d.email}`,
    body: `Category: ${d.assetType}\nMRR: ${d.mrr}\nEstimated range: ${d.estimatedLow}-${d.estimatedHigh}`,
  }),
};

export async function sendEmailEvent(event: EmailEvent, to: string, data: Record<string, string>) {
  const { subject, body } = TEMPLATES[event](data);
  await provider.send({ to, subject, body });
}
