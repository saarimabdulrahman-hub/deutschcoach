import type { Metadata } from "next";
import { Providers } from "@/contexts/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeutschCoach — Learn German",
  description:
    "Master German vocabulary, grammar, and conversation with spaced repetition and interactive quizzes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
