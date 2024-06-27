import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import PlusIcon from "./icons/plusIcon";

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatars: string[];
  onSelect: (avatar: string) => void;
}

export function AvatarSelectionModal({ isOpen, onClose, avatars, onSelect }: AvatarSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTrigger asChild>
            <Button variant="outline"><PlusIcon /></Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Choose your Bud!</DialogTitle>
                <DialogDescription>Select one of the following Buds:</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4">
                {avatars.map((avatar, index) => (
                <Avatar key={index} className="h-20 w-20 cursor-pointer hover:ring-2 hover:ring-primary" onClick={() => onSelect(avatar)}>
                    <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
                </Avatar>
                ))}
            </div>
        </DialogContent>
    </Dialog>
  );
}