
import Image from 'next/image';

export default function ComingSoonGallery() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="relative mb-8">
          <Image
            src="/tinytreelogo.png"
            alt="Bud Logo"
            width={125}
            height={125}
            className="mx-auto"
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl mb-4">
          Gallery Coming Soon
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-white sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          We're working hard to bring you an amazing photo gallery of our products.<br />Stay tuned for updates!
        </p>
      </div>
    </div>
  );
}
