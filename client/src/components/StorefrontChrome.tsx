import type { ReactNode } from "react";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
import "@/styles/staging.css";

export function StorefrontChrome({ children }: { children: ReactNode }) {
  return (
    <div className="stg min-h-screen">
      <StagingHeader />
      {children}
      <StagingFooter />
    </div>
  );
}
