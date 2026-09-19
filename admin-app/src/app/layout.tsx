import type { Metadata } from "next";
import "./globals.css";
import AdminHeader from "@/components/AdminHeader";
import AdminAuthGuard from "@/components/AdminAuthGuard";

export const metadata: Metadata = {
  title: "JurisShorts - Admin Command Center",
  description: "HITL triage queue, publishing engine controls, and push notification center.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-admin-950 text-slate-100 min-h-screen flex flex-col">
        <AdminAuthGuard>
          <AdminHeader />
          <main className="flex-1 w-full max-w-7xl mx-auto p-6">
            {children}
          </main>
        </AdminAuthGuard>
      </body>
    </html>
  );
}
