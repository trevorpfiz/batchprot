import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

type DesignSystemProviderProperties = ThemeProviderProps & {
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
};

export const DesignSystemProvider = ({
  children,
  privacyUrl,
  termsUrl,
  helpUrl,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    <TooltipProvider delayDuration={50} skipDelayDuration={300}>
      {children}
    </TooltipProvider>
    <Toaster duration={5000} richColors />
  </ThemeProvider>
);
