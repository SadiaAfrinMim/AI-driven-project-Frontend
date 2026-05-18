'use client';

import { useEffect } from 'react';

/**
 * Component that removes chatbot elements injected by browser extensions
 * This component can be added to any page layout to ensure chatbots are hidden
 */
export function ChatbotRemover() {
  useEffect(() => {
    const removeChatbots = () => {
      // Common chatbot selectors
      const selectors = [
        '.chatbot',
        '.chat-widget',
        '.ai-assist',
        '.floating-chat',
        '.chat-bubble',
        '[class*="chatbot"]',
        '[class*="chat-widget"]',
        '[class*="ai-assist"]',
        '[class*="floating-chat"]',
        '[id*="chatbot"]',
        '[id*="chat-widget"]',
        '[id*="ai-assist"]',
        '[id*="floating-chat"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          (element as HTMLElement).style.display = 'none';
          (element as HTMLElement).style.visibility = 'hidden';
          (element as HTMLElement).style.opacity = '0';
          (element as HTMLElement).style.pointerEvents = 'none';
        });
      });

      // Hide elements with high z-index
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const zIndex = computedStyle.zIndex;
        if (zIndex && !isNaN(parseInt(zIndex)) && parseInt(zIndex) >= 9999) {
          (element as HTMLElement).style.display = 'none';
        }
      });
    };

    // Run on mount
    removeChatbots();

    // Run periodically to catch dynamically added elements
    const intervalId = setInterval(removeChatbots, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return null; // This component doesn't render anything
}