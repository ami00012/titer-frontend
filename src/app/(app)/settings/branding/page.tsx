"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Locked } from "@/components/titer/locked";
import { useEntitlements } from "@/hooks/use-entitlements";
import { apiErrorMessage } from "@/lib/api/client";
import { type BrandingSettings, getBranding, updateBranding } from "@/lib/api/branding";

const EMPTY: BrandingSettings = {
  logoUrl: "",
  primaryColor: "",
  footerText: "",
  customDomain: "",
  removeFooter: false,
};

export default function BrandingPage() {
  const queryClient = useQueryClient();
  const { entitlements } = useEntitlements();
  const { data, isLoading } = useQuery({ queryKey: ["branding"], queryFn: getBranding });

  const [form, setForm] = useState<BrandingSettings>(EMPTY);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => updateBranding(form),
    onSuccess: (saved) => {
      toast.success("Branding saved.");
      setForm(saved);
      queryClient.invalidateQueries({ queryKey: ["branding"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't save branding.")),
  });

  const canRemoveFooter = entitlements?.shareCard === "WHITE_LABEL";

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>Applied to shared score cards and PDF reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input
              id="logo-url"
              value={form.logoUrl ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="primary-color">Primary color</Label>
            <Input
              id="primary-color"
              placeholder="#4f46e5"
              value={form.primaryColor ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="footer-text">Footer text</Label>
            <Input
              id="footer-text"
              value={form.footerText ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, footerText: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="custom-domain">Custom domain</Label>
            <Input
              id="custom-domain"
              placeholder="reports.yourbrand.com"
              value={form.customDomain ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, customDomain: e.target.value }))}
            />
          </div>

          <Locked
            allowed={canRemoveFooter}
            reason="Removing the Titer footer is a white-label feature on Agency."
            suggestedPlan="agency"
          >
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.removeFooter}
                onChange={(e) => setForm((f) => ({ ...f, removeFooter: e.target.checked }))}
              />
              Remove the Titer footer entirely
            </label>
          </Locked>

          <div>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save branding"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
