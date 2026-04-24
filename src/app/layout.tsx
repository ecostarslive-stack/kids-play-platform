import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { PlayerProvider } from "@/providers/PlayerProvider";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { PlayerHeader } from "@/components/ui/PlayerHeader";

const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-sans-hebrew",
  subsets: ["hebrew", "latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "משחקי למידה לילדים | Kids Learning Games",
  description: "משחקים חינוכיים בעברית ואנגלית לילדים | Educational games in Hebrew and English for kids",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kids Play",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
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
          <PlayerProvider>
            <SoundToggle />
            <PlayerHeader />
            {children}
          </PlayerProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
