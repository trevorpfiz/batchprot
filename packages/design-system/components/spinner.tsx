import { cn } from '@repo/design-system/lib/utils';
import type { LucideProps } from 'lucide-react';
import { LoaderCircle } from 'lucide-react';

function Spinner({
  className,
  size = 16,
  strokeWidth = 2,
  ...props
}: LucideProps) {
  return (
    <LoaderCircle
      aria-hidden="true"
      className={cn('animate-spin text-muted-foreground', className)}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

Spinner.displayName = 'Spinner';

export { Spinner };
