'use client';

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
import { SquarePen } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Logo } from '~/components/logo';
import { NavFooter } from '~/components/sidebar/nav-footer';
import { NavJobs, NavJobsSkeleton } from '~/components/sidebar/nav-jobs';
import { NavMain } from '~/components/sidebar/nav-main';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="mb-[1px] py-3">
        <SidebarMenu className="h-8">
          <SidebarMenuItem>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center pl-2">
                <Logo height={32} href="/" priority width={80} />
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Add new job"
                    asChild
                    className="h-8 w-8"
                    size="icon"
                    variant="ghost"
                  >
                    <Link href="/">
                      <SquarePen aria-hidden="true" size={16} strokeWidth={2} />
                    </Link>
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
