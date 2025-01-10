import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tunnel Boring Machine Analysis",
  description:
    "An application that generates analysis for Tunnel Boring Machines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>{children}</body>
    </html>
  );
}
