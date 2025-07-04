'use client';

import { Spinner } from '@repo/design-system/components/spinner';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { SidebarMenuButton } from '@repo/design-system/components/ui/sidebar';
import { toast } from '@repo/design-system/components/ui/sonner';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { handleError } from '@repo/design-system/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { BRAND_NAME } from '~/lib/constants';
import { useTRPC } from '~/trpc/react';

export function FeedbackForm() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');

  const trpc = useTRPC();

  const createMutation = useMutation(
    trpc.feedback.create.mutationOptions({
      onSuccess: () => {
        toast.success('Thank you for your feedback!');
        setContent('');
        setOpen(false);
      },
      onError: (error) => {
        handleError(error);
      },
    })
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }

    createMutation.mutate({
      content,
    });
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <SidebarMenuButton>
          <MessageCircle size={16} strokeWidth={2} />
          <span>Feedback</span>
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        alignOffset={4}
        className="w-72 p-2"
        side="top"
        sideOffset={4}
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Textarea
            aria-label="Send feedback"
            className="min-h-24"
            disabled={createMutation.isPending}
            id="feedback"
            onChange={(e) => setContent(e.target.value)}
            placeholder={`How can we improve ${BRAND_NAME}?`}
            value={content}
          />
          <div className="flex flex-row justify-between">
            <Button
              disabled={createMutation.isPending}
              onClick={() => setOpen(false)}
              size="sm"
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              disabled={createMutation.isPending || !content.trim()}
              size="sm"
              type="submit"
            >
              {createMutation.isPending ? (
                <>
                  <Spinner className="-ms-1 me-2" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
