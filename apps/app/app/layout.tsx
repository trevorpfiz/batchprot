import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import type { ReactNode } from 'react';

import { env } from '~/env';
import './styles.css';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={fonts} lang="en" suppressHydrationWarning>
    <body>
      <DesignSystemProvider
        helpUrl={env.NEXT_PUBLIC_APP_URL}
        privacyUrl={new URL(
          '/legal/privacy',
          env.NEXT_PUBLIC_APP_URL
        ).toString()}
        termsUrl={new URL('/legal/terms', env.NEXT_PUBLIC_APP_URL).toString()}
      >
        {children}
      </DesignSystemProvider>
    </body>
  </html>
);

export default RootLayout;
