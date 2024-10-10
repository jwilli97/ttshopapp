import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import HomeIcon from "@/components/icons/homeIcon";
import { Ghost } from "lucide-react";

const HomeButton = () => {
    const router = useRouter();

    const handleHome = () => {
        router.push('/dashboard');
    };

    return (
        <Button variant={'ghost'} className="bg-background hover:bg-background hover:text-white" onClick={handleHome}>
            <HomeIcon />
            <p className="ml-2 font-light text-white">HOME</p>
        </Button>
    );
}

export default HomeButton;