import { ToolPlaceholder } from "@/components/titer/tool-placeholder";

export default function VisibilityPage() {
  return (
    <ToolPlaceholder
      name="Titer Visibility"
      description="How often AI answers mention and cite your brand."
      direction="higher-is-better"
      inputLabel="Track a brand"
      inputPlaceholder="yourbrand.com"
      actionLabel="Add brand"
      phaseNote="The visibility crawler and query tracking ship in Phase B4."
    />
  );
}
