'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useTRPC } from '~/trpc/react';

export function AccountTab() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteAllJobsMutation = useMutation(
    trpc.job.deleteAll.mutationOptions({
      onSuccess: () => {
        // Invalidate jobs query to refresh the list
        queryClient.invalidateQueries({ queryKey: trpc.job.byUser.queryKey() });
      },
    })
  );

  const handleDeleteAllJobs = () => {
    if (
      confirm(
        'Are you sure you want to delete all jobs? This action cannot be undone.'
      )
    ) {
      deleteAllJobsMutation.mutate();
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-5 pr-6 pb-6 pl-0 text-foreground text-sm">
      <div className="flex items-center justify-between border-border border-b pb-3">
        <p className="text-base">Delete all chats</p>
        <Button
          className="rounded-full text-destructive hover:text-destructive-foreground"
          disabled={deleteAllJobsMutation.isPending}
          onClick={handleDeleteAllJobs}
          size="sm"
          variant="outline"
        >
          <Trash2 size={16} />
          {deleteAllJobsMutation.isPending ? 'Deleting...' : 'Delete all'}
        </Button>
      </div>
    </div>
  );
}
