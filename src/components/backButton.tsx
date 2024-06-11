import BackIcon from "@/components/icons/backIcon";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BackButton = () => {
    return (
        <Button className="bg-background hover:bg-background">
            <Link href={"/dashboard"} className="flex flex-row font-thin">
                <BackIcon />
                BACK
            </Link>
        </Button>
    );
}

export default BackButton;