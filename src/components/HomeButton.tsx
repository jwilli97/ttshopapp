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
        <Button variant={'ghost'} className="bg-background hover:bg-background" onClick={handleHome}>
            <HomeIcon />
            <p className="ml-2 font-light">HOME</p>
        </Button>
    );
}

export default HomeButton;