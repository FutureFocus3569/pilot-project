"use client";

import React, { useRef } from 'react';
import { useSwipe } from '@/hooks/use-swipe';
import { useSidebar } from '@/contexts/sidebar-context';

interface MobileSwipeHandlerProps {
  children: React.ReactNode;
}

export function MobileSwipeHandler({ children }: MobileSwipeHandlerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { open, close, isOpen } = useSidebar();

  useSwipe(containerRef, {
    onSwipeRight: () => {
      // Only open sidebar on swipe right if it's currently closed
      if (!isOpen && window.innerWidth < 1024) {
        open();
      }
    },
    onSwipeLeft: () => {
      // Only close sidebar on swipe left if it's currently open
      if (isOpen && window.innerWidth < 1024) {
        close();
      }
    },
    minSwipeDistance: 75,
  });

  return (
    <div ref={containerRef} className="h-full">
      {children}
    </div>
  );
}
