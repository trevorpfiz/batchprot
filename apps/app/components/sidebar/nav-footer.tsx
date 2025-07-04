'use client';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/design-system/components/ui/sidebar';
import { HelpCircle } from 'lucide-react';
import { env } from '~/env';
import { FeedbackForm } from './feedback-form';

export function NavFooter() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <FeedbackForm />
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href={`mailto:${env.NEXT_PUBLIC_EMAIL}`}>
            <HelpCircle size={16} strokeWidth={2} />
            <span>Support</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
