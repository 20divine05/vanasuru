import type { ReactNode } from "react";
import { SiteHeader } from "./Header";
import { SiteFooter } from "./Footer";
import { WhatsAppFab } from "./WhatsAppFab";

export function SiteShell({
  children,
  transparentHeader = true,
}: {
  children: ReactNode;
  transparentHeader?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader transparentOnTop={transparentHeader} />
      <main>{children}</main>
      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}
