"use client";

import { BackButton } from "@/components/ui/BackButton";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default function LearnEnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-full">
      <header className="flex items-center justify-between p-4">
        <BackButton />
        <LanguageToggle />
      </header>
      <main className="flex-1 flex flex-col items-center px-4 pb-8">{children}</main>
    </div>
  );
}
