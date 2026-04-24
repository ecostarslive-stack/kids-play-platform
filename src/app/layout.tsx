import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { SoundToggle } from "@/components/ui/SoundToggle";

const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-sans-hebrew",
  subsets: ["hebrew", "latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "משחקי למידה לילדים | Kids Learning Games",
  description: "משחקים חינוכיים בעברית ואנגלית לילדים | Educational games in Hebrew and English for kids",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${notoSansHebrew.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-hebrew bg-background text-foreground">
        <LanguageProvider>
          <SoundToggle />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
