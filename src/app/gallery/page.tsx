'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ComingSoonGallery() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          {/* <div className="relative mb-8">
            <Image
            src="/tinytreelogo.png"
            alt="Bud Logo"
            width={125}
            height={125}
            className="mx-auto"
          />
        </div> */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Flower Gallery
        </h1>
        <h2 className='text-white text-xl mb-4'>
          - Coming Soon -
        </h2>
        <p className="mt-4">
          A first ever photo gallery of our products is currently under construction.<br />Stay tuned for updates!
        </p>
        <Button className='mt-4' onClick={() => router.push('/dashboard')}>
          Home
        </Button>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
