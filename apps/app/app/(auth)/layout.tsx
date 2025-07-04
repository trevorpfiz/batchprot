import { Button } from '@repo/design-system/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { env } from '~/env';
import { BRAND_NAME } from '~/lib/constants';

const webUrl =
  env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : env.NEXT_PUBLIC_APP_URL;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-background px-4 py-6">
      <div className="absolute top-8 left-8 z-10">
        <Button asChild className="group" variant="ghost">
          <Link href={webUrl ?? '/'}>
            <ArrowLeft
              aria-hidden="true"
              className="-ms-1 group-hover:-translate-x-0.5 me-2 opacity-60 transition-transform"
              size={16}
              strokeWidth={2}
            />
            Back
          </Link>
        </Button>
      </div>

      <div className="relative flex w-full max-w-96 flex-1 flex-col justify-center gap-6">
        <main className="flex-1 content-center">{children}</main>

        <footer className="flex justify-between">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} {BRAND_NAME}
          </p>

          <ul className="flex gap-2">
            <li className="flex items-center gap-2 after:size-0.5 after:rounded-full after:bg-muted-foreground last:after:hidden">
              <a
                className="after:-inset-x-1 after:-inset-y-0.5 relative rounded-sm text-muted-foreground text-sm after:absolute after:rounded-sm after:border-2 after:border-primary after:opacity-0 hover:text-foreground focus-visible:after:opacity-100"
                href={`mailto:${env.NEXT_PUBLIC_EMAIL}`}
              >
                Support
              </a>
            </li>
            <li className="flex items-center gap-2 after:size-0.5 after:rounded-full after:bg-muted-foreground last:after:hidden">
              <Link
                className="after:-inset-x-1 after:-inset-y-0.5 relative rounded-sm text-muted-foreground text-sm after:absolute after:rounded-sm after:border-2 after:border-primary after:opacity-0 hover:text-foreground focus-visible:after:opacity-100"
                href={`${webUrl}/privacy`}
              >
                Privacy
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Link
                className="after:-inset-x-1 after:-inset-y-0.5 relative rounded-sm text-muted-foreground text-sm after:absolute after:rounded-sm after:border-2 after:border-primary after:opacity-0 hover:text-foreground focus-visible:after:opacity-100"
                href={`${webUrl}/terms`}
              >
                Terms
              </Link>
            </li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
