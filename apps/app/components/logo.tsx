import Image from 'next/image';
import Link from 'next/link';

// import LogoDarkMode from '~/public/logo-white.svg';
// import LogoLightMode from '~/public/logo.svg';

export const Logo = ({
  href = '/',
  width = 72,
  height = 72,
  className,
  variant = 'default',
}: {
  href?: string;
  width?: number;
  height?: number;
  className?: string;
  variant?: 'default' | 'white';
}) => {
  if (variant === 'white') {
    return (
      <Link className={className} href={href}>
        <Image alt="Logo" height={height} src="/logo-white.svg" width={width} />
      </Link>
    );
  }

  return (
    <Link className={className} href={href}>
      <Image
        alt="Logo"
        className="block dark:hidden"
        height={height}
        src="/logo.svg"
        width={width}
      />
      <Image
        alt="Logo"
        className="hidden dark:block"
        height={height}
        src="/logo-white.svg"
        width={width}
      />
    </Link>
  );
};
