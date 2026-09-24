import { Navbar } from "@/components/general/Navbar";
import { ReactNode } from "react";
import { ChatBot } from "@/components/general/ChatBot";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {children}
      </main>
      <ChatBot />
    </div>
  );
}