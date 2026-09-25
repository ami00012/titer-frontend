"use server";

import Anthropic from "@anthropic-ai/sdk";
import { requireUser } from "@/lib/auth";
import { BASE_FIELDS, TYPE_FIELDS } from "@/lib/asset-form-fields";
import { ASSET_TYPE_LABELS, type AssetTypeValue } from "@/lib/validation/asset";
import { ASSET_PRICE_CAP } from "@/lib/pricing";

const MODEL = "claude-sonnet-5";

/** Prefill values for AssetForm -- always a DRAFT the seller reviews and can
 * edit before anything is submitted. createAsset() (assets.ts) re-validates
 * and re-enforces the price cap independently; nothing here is trusted. */
export type ListingDraft = Record<string, string | number | boolean>;

export async function generateListingDraft(
  assetType: AssetTypeValue,
  roughDescription: string,
): Promise<ListingDraft> {
  await requireUser();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("AI drafting isn't configured on this deployment yet.");
  }
  const trimmed = roughDescription.trim();
  if (trimmed.length < 10) {
    throw new Error("Give a bit more detail so there's something to work with.");
  }

  // Fields the model is allowed to fill, drawn from the same list the form
  // itself renders -- so a new form field is automatically in scope here too,
  // and the model can never target a field the seller-facing form doesn't have.
  const fields = [...BASE_FIELDS, ...TYPE_FIELDS[assetType]].filter((f) => f.name !== "confidential");
  const fieldList = fields
    .map((f) => `- ${f.name} (${f.label}${f.type === "number" ? ", number" : ""})`)
    .join("\n");

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You draft a Titer marketplace listing from a seller's rough, informal description of what they're selling. The asset type is "${ASSET_TYPE_LABELS[assetType]}".

Titer is a micro-marketplace: every listing is priced at $${ASSET_PRICE_CAP} or less, no exceptions. If the description implies something worth more, suggest exactly ${ASSET_PRICE_CAP} as the price -- never more.

Hard rules:
- Use only facts the seller actually stated. Never invent or round up revenue, customers, traffic, growth, or any other metric they didn't mention -- omit the field entirely rather than guess.
- "price" must be a number greater than 0 and no more than ${ASSET_PRICE_CAP}.
- "title" under 140 characters, "description" a few honest sentences -- no hype words ("amazing", "guaranteed", "incredible"), no unverifiable claims.
- This is a draft the seller will review and edit themselves before anything is published -- never state something is verified, tested, or confirmed.
- Output ONLY a single JSON object, no prose before or after, using a subset of these fields (omit any you have no basis for):
${fieldList}
- Every value must be a plain string, number, or (for boolean-typed fields) true/false -- never a nested object or array.`,
    messages: [{ role: "user", content: trimmed.slice(0, 2000) }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return sanitizeDraft(parseDraftObject(text), fields.map((f) => f.name));
}

function parseDraftObject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Couldn't generate a draft from that description -- try adding more detail.");
  }
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error("Couldn't generate a draft from that description -- try adding more detail.");
  }
}

/** Keep only known field names and primitive values -- defends the form
 * (which uses these as `defaultValue`/`defaultChecked`) against a malformed
 * or off-spec model response, independent of the system prompt holding. */
function sanitizeDraft(raw: Record<string, unknown>, allowedFields: string[]): ListingDraft {
  const draft: ListingDraft = {};
  for (const name of allowedFields) {
    const value = raw[name];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      draft[name] = value;
    }
  }
  if (typeof draft.price === "number" && (draft.price > ASSET_PRICE_CAP || draft.price <= 0)) {
    draft.price = Math.min(Math.max(draft.price, 1), ASSET_PRICE_CAP);
  }
  return draft;
}
