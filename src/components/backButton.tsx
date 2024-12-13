import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
    const router = useRouter();

    return (
        <button 
            onClick={() => router.back()} 
            className="absolute top-4 left-4 text-white hover:text-gray-300"
        >
            <ArrowLeft size={24} />
        </button>
    );
}

export default BackButton;