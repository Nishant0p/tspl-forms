import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href={'/'} className="flex items-center">
      <Image
        src="/image.png"
        alt="TSPL Group"
        width={200}
        height={80}
        className="h-11 sm:h-16 w-auto object-contain drop-shadow-sm"
        priority
      />
    </Link>
  );
}
