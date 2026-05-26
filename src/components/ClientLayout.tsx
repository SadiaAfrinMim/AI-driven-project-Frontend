'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChatbotRemover } from '@/components/ChatbotRemover';
import { FloatingAIChatbot } from '@/components/FloatingAIChatbot';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Lightweight chatbot remover (only targets obvious extension-injected chatbots)
  useEffect(() => {
    const removeExternalChatbots = () => {
      // Only remove very specific known chatbot selectors from extensions
      const selectors = [
        '#chatbase-bubble',
        '.chatbase-bubble',
        '[data-chatbase]',
        '.intercom-lightweight-app',
        '#crisp-chatbox'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    };

    removeExternalChatbots();
    const interval = setInterval(removeExternalChatbots, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ChatbotRemover />
      {!isDashboard && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isDashboard && <Footer />}
      <FloatingAIChatbot />
    </>
  );
}