'use client';

import type { User } from '@repo/auth';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

import { signOut } from '~/lib/actions/auth';
import { getNameFromUser } from '~/lib/utils';
import { useSettingsDialogStore } from '~/providers/settings-dialog-store-provider';

interface UserButtonProps {
  user: User;
}

function UserButton({ user }: UserButtonProps) {
  const openSettingsDialog = useSettingsDialogStore(
    (state) => state.openSettingsDialog
  );
  const [open, setOpen] = useState(false);

  const name = getNameFromUser(user);
  const displayEmail = user?.email ?? 'email';

  const handleSettings = () => {
    setOpen(false);
    openSettingsDialog('general');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button className="relative h-10 w-10 rounded-full p-0" variant="ghost">
          <Avatar className="h-8 w-8">
            {/* <AvatarImage src={user.user_metadata.avatar_url} /> */}
            <AvatarImage className="border-2 border-border bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white" />
            <AvatarFallback className="border-2 border-border bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              {/* {initials || ""} */}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-foreground text-sm leading-none">
                {name}
              </p>
            </div>
            <p className="truncate text-muted-foreground text-xs leading-none">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleSettings}>
            <Settings
              aria-hidden="true"
              className="opacity-60"
              size={16}
              strokeWidth={2}
            />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut
            aria-hidden="true"
            className="opacity-60"
            size={16}
            strokeWidth={2}
          />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserButton };
