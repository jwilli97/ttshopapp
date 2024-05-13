import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#57C18E] px-4 py-12">
      <div className="mb-10">
        <Image src="/tinytreelogo.png" width={115} height={100} alt="Welcome Logo"  />
      </div>
      <div>
        <h1 className="text-4xl mb-8 text-[#FAFFF0]">Welcome to Tiny Trees</h1>
      </div>
      <div className="grid w-full max-w-sm items center gap-2 mb-4">
        <Label className="text-[#FAFFF0]" htmlFor="email">Email</Label>
        <Input type="email" id="email" placeholder="mikewazowski@aol.com" />
      </div>
      <div className="grid w-full max-w-sm items center gap-2 mb-6">
        <Label className="text-[#FAFFF0]" htmlFor="password">Password</Label>
        <Input type="password" id="password" placeholder="*******" />
      </div>
      <div>
        <Button size="lg" className="bg-[#007A58]" asChild>
          <Link className="text-[#FAFFF0]" href="/dashboard">Login</Link>
        </Button>
      </div>
    </div>
  );
}
