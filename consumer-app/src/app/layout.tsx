import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import PushPrompt from "@/components/PushPrompt";

export const metadata: Metadata = {
  title: "JurisShorts - 60s Legal Intelligence",
  description: "Inshorts for lawyers and citizens: daily judicial rulings, bare acts, and legal awareness.",
  manifest: "/manifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JurisShorts",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-judicial-900 text-slate-100 antialiased overflow-hidden">
        <main className="w-full h-full flex flex-col items-center justify-center">
          <PushPrompt />
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
