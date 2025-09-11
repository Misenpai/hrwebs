import type { Metadata } from "next";
import { AuthProvider } from "../hooks/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR Attendance Portal",
  description: "HR dashboard for managing PI attendance reports",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
