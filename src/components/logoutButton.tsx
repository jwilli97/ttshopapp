import LogOutIcon from "@/components/icons/logoutIcon";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LogOutButton = () => {
    return (
        <Button className="bg-background hover:bg-background">
            <Link href={"/"} className="flex flex-row font-thin">
                LOG OUT
                <LogOutIcon />
            </Link>
        </Button>
    );
}

export default LogOutButton;