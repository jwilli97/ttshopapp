'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/app/types/auth';
import AvatarSelectionModal from "@/components/AvatarSelectionModal";

interface ProfileFormProps {
  onSubmit: (data: Partial<UserProfile>) => void;
  onBack: () => void;
}

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
    '/profile_pics/profileNug10.png',
    '/profile_pics/profileNug11.png',
    '/profile_pics/profileNug12.png',
];

export function ProfileForm({ onSubmit, onBack }: ProfileFormProps) {
  const router = useRouter();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [formData, setFormData] = useState({
    display_name: '',
    favorite_strain: '',
    favorite_strain_type: ''
  })

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setAvatarUrl(avatarUrl);
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('profileFormData', JSON.stringify(formData));
    onSubmit(formData);
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        
      </div>
      <div>
      <h1 className="text-xl font-semibold ml-2">CREATE ACCOUNT</h1>
      </div>
      
      <div className="h-2 bg-gray-100 rounded">
        <div className="h-full w-3/6 bg-primary rounded" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-medium">PROFILE</h2>
          
          <div className="flex items-center justify-center">
          <AvatarSelectionModal 
                avatarUrl={avatarUrl}
                onAvatarSelect={handleAvatarSelect}
                onSelect={handleAvatarSelect}
                onClose={() => setIsAvatarModalOpen(false)}
                onOpenChange={setIsAvatarModalOpen}
                isOpen={isAvatarModalOpen}
                avatars={predefinedAvatars}
                />
          </div>

          <Input
            placeholder="Username"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            required
          />

          <Select
            value={formData.favorite_strain}
            onValueChange={(value) => setFormData({ ...formData, favorite_strain: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Favorite strain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indica">Indica</SelectItem>
              <SelectItem value="sativa">Sativa</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={formData.favorite_strain_type}
            onValueChange={(value) => setFormData({ ...formData, favorite_strain_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Favorite strain type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flower">Flower</SelectItem>
              <SelectItem value="concentrate">Concentrate</SelectItem>
              <SelectItem value="edible">Edible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="fixed bottom-12 left-0 right-0 space-y-2 max-w-sm mx-auto">
          <Button
            type="submit"
            className="w-full bg-primary"
          >
            NEXT
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit({})}
            className="w-full bg-gray-200 hover:bg-gray-300 text-black"
          >
            SKIP VERIFICATION (DEV ONLY)
          </Button>
        </div>
      </form>
    </div>
  );
}