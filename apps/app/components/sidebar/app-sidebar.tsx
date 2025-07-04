'use client';

import { Spinner } from '@repo/design-system/components/spinner';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@repo/design-system/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/design-system/components/ui/tooltip';
import { handleError } from '@repo/design-system/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SquarePen } from 'lucide-react';
import React from 'react';
import { Logo } from '~/components/logo';
import { NavFooter } from '~/components/sidebar/nav-footer';
import { NavJobs, NavJobsSkeleton } from '~/components/sidebar/nav-jobs';
import { NavMain } from '~/components/sidebar/nav-main';
import { useTRPC } from '~/trpc/react';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.job.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.job.byUser.queryKey() });
      },
      onError: (error) => {
        handleError(error);
      },
    })
  );

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="mb-[1px] py-3">
        <SidebarMenu className="h-8">
          <SidebarMenuItem>
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-0.5 pl-2 leading-none">
                <Logo className="h-6 w-auto" href="/" />
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Add new job"
                    className="h-8 w-8"
                    disabled={createMutation.isPending}
                    onClick={() => {
                      createMutation.mutate({
                        title: 'New job',
                      });
                    }}
                    size="icon"
                    variant="ghost"
                  >
                    {createMutation.isPending ? (
                      <Spinner />
                    ) : (
                      <SquarePen aria-hidden="true" size={16} strokeWidth={2} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">
                  New job
                </TooltipContent>
              </Tooltip>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <React.Suspense fallback={<NavJobsSkeleton />}>
          <NavJobs />
        </React.Suspense>
      </SidebarContent>
      <SidebarFooter>
        <NavFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
