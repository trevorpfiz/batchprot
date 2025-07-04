'use client';

import { Button } from '@lamp/ui/components/button';
import { PencilLine, Sparkle } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { usePanelsStore } from '~/providers/panels-store-provider';

export function NavActions() {
  const { toggleChat, toggleNotes, isChatOpen, isNotesOpen } = usePanelsStore(
    useShallow((state) => ({
      toggleChat: state.toggleChat,
      toggleNotes: state.toggleNotes,
      isChatOpen: state.isChatOpen,
      isNotesOpen: state.isNotesOpen,
    }))
  );

  return (
    <div className="flex items-center gap-2">
      <Button
        className="group"
        onMouseDown={toggleChat}
        size="sm"
        variant={isChatOpen ? 'secondary' : 'ghost'}
      >
        <Sparkle
          aria-hidden="true"
          className="-ms-1 me-1 opacity-60"
          size={16}
          strokeWidth={2}
        />
        Chat
      </Button>
      <Button
        onMouseDown={toggleNotes}
        size="sm"
        variant={isNotesOpen ? 'secondary' : 'ghost'}
      >
        <PencilLine
          aria-hidden="true"
          className="-ms-1 me-1 opacity-60"
          size={16}
          strokeWidth={2}
        />
        Notes
      </Button>
    </div>
  );
}
