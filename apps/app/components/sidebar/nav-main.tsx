'use client';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/design-system/components/ui/sidebar';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const mockMainNavItems = [{ title: 'Home', url: '/', icon: Home }];

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {mockMainNavItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={pathname === item.url}>
              <Link href={item.url}>
                <item.icon size={16} strokeWidth={2} />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
