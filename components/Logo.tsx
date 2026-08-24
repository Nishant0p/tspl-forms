import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href={'/'} className="flex items-center">
      <Image
        src="/image.png"
        alt="TSPL Group"
        width={160}
        height={64}
        className="h-14 w-auto object-contain"
        priority
      />
    </Link>
  );
}
