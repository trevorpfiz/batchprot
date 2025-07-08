'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { Settings, User } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { GeneralTab } from '~/components/settings/general-tab';
import { useSettingsDialogStore } from '~/providers/settings-dialog-store-provider';

export function SettingsDialog() {
  const { isOpen, closeSettingsDialog } = useSettingsDialogStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      closeSettingsDialog: state.closeSettingsDialog,
    }))
  );

  return (
    <Dialog
      onOpenChange={(open) => !open && closeSettingsDialog()}
      open={isOpen}
    >
      <DialogContent className="flex h-[42rem] min-h-96 flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-3xl [&>button:last-child]:top-3.5">
        <DialogHeader className="border-border border-b px-6 py-4">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Make changes to your settings here.
          </DialogDescription>
        </DialogHeader>

        <div className="grow overflow-y-auto">
          <Tabs
            className="flex flex-row gap-8 p-6"
            defaultValue="general"
            orientation="vertical"
          >
            <TabsList className="min-w-44 flex-col items-start justify-start bg-transparent p-0">
              <TabsTrigger
                className="w-full justify-start font-medium text-base text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-muted data-[state=active]:shadow-none"
                value="general"
              >
                <Settings
                  aria-hidden="true"
                  className="-ms-0.5 me-2 opacity-60"
                  size={20}
                  strokeWidth={2}
                />
                General
              </TabsTrigger>
              <TabsTrigger
                className="w-full justify-start font-medium text-base text-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-muted data-[state=active]:shadow-none"
                value="account"
              >
                <User
                  aria-hidden="true"
                  className="-ms-0.5 me-2 opacity-60"
                  size={20}
                  strokeWidth={2}
                />
                Account
              </TabsTrigger>
            </TabsList>
            <div className="grow p-0 text-start">
              <TabsContent className="m-0" value="general">
                <GeneralTab />
              </TabsContent>
              <TabsContent className="m-0" value="account" />
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsButton() {
  const { openSettingsDialog } = useSettingsDialogStore((state) => ({
    openSettingsDialog: state.openSettingsDialog,
  }));

  return (
    <Button
      className="h-9 w-9"
      onClick={() => openSettingsDialog()}
      size="icon"
      variant="ghost"
    >
      <Settings size={16} strokeWidth={2} />
      <span className="sr-only">Open settings</span>
    </Button>
  );
}
