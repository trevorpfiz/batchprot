'use client';

import type { RouterInputs, RouterOutputs } from '@repo/api';
import { Spinner } from '@repo/design-system/components/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@repo/design-system/components/ui/popover';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/design-system/components/ui/sidebar';
import { handleError } from '@repo/design-system/lib/utils';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Check, MoreHorizontal, Pen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { useTRPC } from '~/trpc/react';

type Job = RouterOutputs['job']['byUser']['jobs'][number];
type RenameJobInput = RouterInputs['job']['rename'];

export function NavJobs() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(trpc.job.byUser.queryOptions());
  const jobs: Job[] = data.jobs ?? [];

  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [name, setName] = useState('');

  const renameMutation = useMutation(
    trpc.job.rename.mutationOptions({
      onMutate: async (updatedJob: RenameJobInput) => {
        await queryClient.cancelQueries({
          queryKey: trpc.job.byUser.queryKey(),
        });

        const previousJobs = queryClient.getQueryData<
          RouterOutputs['job']['byUser']
        >(trpc.job.byUser.queryKey());

        queryClient.setQueryData(
          trpc.job.byUser.queryKey(),
          (old: RouterOutputs['job']['byUser'] | undefined) => {
            if (!old) {
              return { jobs: [] };
            }
            return {
              ...old,
              jobs: old.jobs.map((job) =>
                job.id === updatedJob.id
                  ? { ...job, title: updatedJob.title ?? job.title }
                  : job
              ),
            };
          }
        );

        setOpen(false);
        return { previousJobs };
      },
      onError: (_err, _newTodo, context) => {
        if (context?.previousJobs) {
          queryClient.setQueryData(
            trpc.job.byUser.queryKey(),
            context.previousJobs
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.job.byUser.queryKey(),
        });
        setSelectedJob(null);
      },
    })
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!(selectedJob && name.trim())) {
      return;
    }

    renameMutation.mutate({
      id: selectedJob.id,
      title: name.trim(),
    });
  };

  const deleteMutation = useMutation(
    trpc.job.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.job.byUser.queryKey(),
        });
      },
      onError: (error) => {
        handleError(error);
      },
    })
  );

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Jobs</SidebarGroupLabel>
      <SidebarMenu>
        {jobs.map((job) => (
          <SidebarMenuItem key={job.id}>
            <Popover
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setOpen(false);
                  setSelectedJob(null);
                }
              }}
              open={open && selectedJob?.id === job.id}
            >
              <PopoverAnchor asChild>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/job/${job.id}`}
                  tooltip={job.title}
                >
                  <Link href={`/job/${job.id}`}>
                    <span>{job.title}</span>
                  </Link>
                </SidebarMenuButton>
              </PopoverAnchor>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover={pathname !== `/job/${job.id}`}
                  >
                    <MoreHorizontal size={16} strokeWidth={2} />
                    <span className="sr-only">Options</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isMobile ? 'end' : 'start'}
                  className="w-48"
                  onCloseAutoFocus={(e) => {
                    e.preventDefault();

                    if (selectedJob) {
                      setOpen(true);
                    }
                  }}
                  side={isMobile ? 'bottom' : 'right'}
                >
                  <DropdownMenuItem
                    onSelect={() => {
                      setSelectedJob(job);
                      setName(job.title);
                    }}
                  >
                    <Pen size={16} strokeWidth={2} />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => {
                      if (
                        window.confirm(
                          'Are you sure you want to delete this job? This action cannot be undone.'
                        )
                      ) {
                        deleteMutation.mutate({ id: job.id });
                      }
                    }}
                  >
                    <Trash2
                      aria-hidden="true"
                      className="text-destructive"
                      size={16}
                      strokeWidth={2}
                    />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <PopoverContent
                align="start"
                className="w-56 p-0.5"
                side="bottom"
              >
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                  <div className="flex rounded-lg shadow-black/5 shadow-sm">
                    <Input
                      autoFocus
                      className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
                      disabled={renameMutation.isPending}
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      value={name}
                    />
                    <button
                      aria-label="Rename"
                      className="inline-flex w-9 items-center justify-center rounded-e-lg border border-input bg-background text-muted-foreground/80 text-sm outline-offset-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={renameMutation.isPending || !name.trim()}
                      type="submit"
                    >
                      {renameMutation.isPending ? (
                        <Spinner />
                      ) : (
                        <Check aria-hidden="true" size={16} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export const NavJobsSkeleton = () => {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Jobs</SidebarGroupLabel>
      <div className="flex justify-center py-2">
        <Spinner />
      </div>
    </SidebarGroup>
  );
};
