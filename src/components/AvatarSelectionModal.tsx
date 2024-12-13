import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import { useState } from "react";

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatars: string[];
  onSelect: (avatarUrl: string) => void;
  avatarUrl: string; // Add this line
  onAvatarSelect: (avatarUrl: string) => void; // Add this line
  onOpenChange: (open: boolean) => void; // Add this line
};

export default function AvatarSelectionModal({
  avatarUrl,
  onAvatarSelect,
  isOpen,
  onOpenChange
}: AvatarSelectionModalProps) {
    const [selectedAvatar, setSelectedAvatar] = useState(avatarUrl);

    const predefinedAvatars = [
        '/profile_pics/profileNug1.png',
        '/profile_pics/profileNug2.png',
        '/profile_pics/profileNug3.png',
        '/profile_pics/profileNug4.png',
        '/profile_pics/profileNug5.png',
        '/profile_pics/profileNug6.png',
        '/profile_pics/profileNug7.png',
        '/profile_pics/profileNug8.png',
        '/profile_pics/profileNug9.png',
    ];

    const handleAvatarSelect = (avatar: string) => {
        setSelectedAvatar(avatar);
    };

    const handleSaveAvatar = () => {
        onAvatarSelect(selectedAvatar);
        onOpenChange(false);
    };

    return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div className="flex flex-col place-items-center justify-center gap-2">
          <Avatar className="h-36 w-36">
            <AvatarImage
              src={avatarUrl}
              alt="Selected Profile Picture"
              onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
            />
            <AvatarFallback className="text-2xl">TT</AvatarFallback>
          </Avatar>
          <Button variant="outline" size={"sm"} className="text-white">Select Profile Picture</Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Choose your Bud!</DialogTitle>
          <DialogDescription className="text-wrap text-white">
            Select one of the following Buds to be your profile picture. You can change this anytime in the account settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 place-items-center gap-4 py-4">
          {predefinedAvatars.map((avatar, index) => (
            <Avatar
              key={index}
              className={`h-24 w-24 cursor-pointer hover:ring-4 hover:ring-primary ${
                avatar === selectedAvatar ? 'ring-4 ring-primary' : ''
              }`}
              onClick={() => handleAvatarSelect(avatar)}
            >
              <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
            </Avatar>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={handleSaveAvatar}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}