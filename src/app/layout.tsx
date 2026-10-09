import type { Metadata } from "next";
import "./../styles/global.css";

export const metadata: Metadata = {
  title: "TopRank",
  description: "Personalized entrance preparation for students, parents, and schools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
