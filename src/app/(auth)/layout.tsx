import { BRAND_NAME } from "@/lib/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <span className="text-lg font-semibold">{BRAND_NAME}</span>
      {children}
    </div>
  );
}
