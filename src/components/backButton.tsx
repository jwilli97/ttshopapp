import { useRouter } from "next/navigation";
import BackIcon from "@/components/icons/backIcon";
import { Button } from "@/components/ui/button";

const BackButton = () => {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <Button className="bg-background hover:bg-background" onClick={handleBack}>
            <span className="flex flex-row items-center font-thin">
                <BackIcon className="mr-2" />
                BACK
            </span>
        </Button>
    );
}

export default BackButton;