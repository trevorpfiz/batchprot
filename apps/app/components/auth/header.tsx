import Image from 'next/image';
import { BRAND_NAME } from '~/lib/constants';

interface HeaderProps {
  headerTitle: string;
  headerSubtitle: string;
}

export const Header = ({ headerTitle, headerSubtitle }: HeaderProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <Image
        alt={`${BRAND_NAME} logo`}
        height={24}
        src="/icon.png"
        width={24}
      />

      <div className="flex flex-col items-center justify-center gap-1">
        <h1 className="font-bold text-[17px] leading-6">{headerTitle}</h1>
        <p className="text-[13px] text-muted-foreground leading-snug">
          {headerSubtitle}
        </p>
      </div>
    </div>
  );
};
