import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JJ Game Plan",
  description: "BJJ game plan, decision tree, and submission tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0a0a0a", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
