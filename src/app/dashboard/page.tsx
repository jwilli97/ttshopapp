import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from "@fortawesome/fontawesome-svg-core";
import TinyTokenShop from "@/components/TinyTokenShop";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
config.autoAddCss = false;

export default function Dashboard() {

    return (
        <div className="flex h-screen w-full flex-col items-center px-4 py-6 md:py-12 relative">
            <div className="flex flex-row items-center w-full md:w-11/12 justify-between">
                <div className="flex flex-row items-center">
                    <Link href="/Account">
                        <Avatar>
                            <AvatarImage src="profileNug3.png" alt="Profile Picture" /> {/* take image set by user in DB for profile picture, delete comment when complete */}
                            <AvatarFallback className="text-2xl">TT</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex flex-col items-center md:items-start ml-4">
                        <Link href="/Account">
                            <p className="text-2xl mt-3 font-semibold">Stonedy</p> {/* take display name set by user from DB and link to account page, delete comment when complete */}
                            <p className="text-sm mt-0.5 text-center hover:font-bold">View Account</p>
                        </Link>
                    </div>
                </div>
                <Button className="bg-background hover:bg-transparent w-15 h-11" asChild>
                    <Link href={"/"}> {/* logout function button, delete comment when complete */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 mx-auto md:mx-0">
                            <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </Button>
            </div>
            <div className="flex flex-col w-full items-center mt-6">
                <div className="container bg-[#cbd5e1] h-0.5 w-full md:w-11/12 mb-3 rounded-full"></div>
                <TinyTokenShop /> {/* Renders the TinyTokenShop component, which displays the tiny tokens and shop menu */}
                <div className="container bg-[#cbd5e1] h-0.5 w-full md:w-11/12 mt-3 rounded-full"></div>
                <div className="mt-3 mb-3 w-full md:w-auto">
                    <Image src="/TTMayMenu24.png" width={500} height={100} alt="Current Menu" /> {/* display current menu from DB, delete comment when complete */}
                </div>
                <div className="container bg-[#cbd5e1] h-0.5 w-full md:w-11/12 mb-20 rounded-full"></div>
            </div>
            <div className="fixed bottom-0 left-0 w-full flex justify-center pb-6 px-4 z-50">
                <Button className="bg-primary hover:bg-primary/75 w-full md:w-72 h-11 shadow-lg" asChild> 
                    <Link href="/dashboard">Place Order</Link>
                </Button>
            </div>
        </div>
    );
}