import './styles.css';

import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { env } from '~/env';
import { TRPCReactProvider } from '~/trpc/react';

export const metadata: Metadata = createMetadata({
  metadataBase: new URL(
    env.NODE_ENV === 'production'
      ? env.NEXT_PUBLIC_APP_URL
      : 'http://localhost:3000'
  ),
  title: 'Dashboard',
  description: 'Protein physicochemical analysis dashboard.',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

const RootLayout = (props: { children: ReactNode }) => (
  <html className={fonts} lang="en" suppressHydrationWarning>
    <body className="h-dvh w-full bg-background text-foreground">
      <DesignSystemProvider
        helpUrl={env.NEXT_PUBLIC_APP_URL}
        privacyUrl={new URL(
          '/legal/privacy',
          env.NEXT_PUBLIC_APP_URL
        ).toString()}
        termsUrl={new URL('/legal/terms', env.NEXT_PUBLIC_APP_URL).toString()}
      >
        <TRPCReactProvider>{props.children}</TRPCReactProvider>
      </DesignSystemProvider>
    </body>
  </html>
);

export default RootLayout;
