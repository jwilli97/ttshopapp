'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/app/types/auth';
import AvatarSelectionModal from "@/components/AvatarSelectionModal";
import { getSupabaseClient } from '@/lib/supabaseClient';

interface ProfileFormProps {
  onSubmit: (data: Partial<UserProfile>) => void;
  isLoading?: boolean;
  error?: string;
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

export function ProfileForm({ onSubmit, isLoading = false, error = '' }: ProfileFormProps) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [formData, setFormData] = useState({
    display_name: '',
    strain_preference: '',
    replacement_preference: '',
    avatar_url: ''
  });
  const [userEmail, setUserEmail] = useState('');
  const [formIsLoading, setFormIsLoading] = useState(false);

  // Try to fetch user data on component mount
  useEffect(() => {
    const getUserData = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          if (session.user.email) {
            setUserEmail(session.user.email);
          }
          
          // Try to fetch existing profile data if any
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (data) {
            // Explicitly cast each field to string to avoid type errors
            const display_name = typeof data.display_name === 'string' ? data.display_name : '';
            const strain_preference = typeof data.strain_preference === 'string' ? data.strain_preference : '';
            const replacement_preference = typeof data.replacement_preference === 'string' ? data.replacement_preference : '';
            const avatar_url = typeof data.avatar_url === 'string' ? data.avatar_url : '';
            
            // Pre-fill form with existing data
            setFormData({
              display_name,
              strain_preference,
              replacement_preference,
              avatar_url
            });
            
            if (avatar_url) {
              setAvatarUrl(avatar_url);
              setSelectedAvatar(avatar_url);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    getUserData();
  }, []);

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setAvatarUrl(avatarUrl);
    setFormData({ ...formData, avatar_url: avatarUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormIsLoading(true);
    
    try {
      // Save the form data to local storage for the flow
      localStorage.setItem('profileFormData', JSON.stringify({...formData, avatar_url: avatarUrl}));
      
      // Submit the data to the parent component
      onSubmit({...formData, avatar_url: avatarUrl});
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setFormIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {userEmail && (
        <div className="text-sm text-gray-400 mb-4">
          Signed in as: {userEmail}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-6">
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

          <div className="space-y-2">
            <label htmlFor="username" className="text-white text-sm">
              Username
            </label>
            <Input
              id="username"
              placeholder="Username"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              required
              className="text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="strain" className="text-white text-sm">
              Favorite Strain
            </label>
            <Input
              id="strain"
              placeholder="Favorite strain"
              value={formData.strain_preference}
              onChange={(e) => setFormData({ ...formData, strain_preference: e.target.value })}
              className="text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="substitution" className="text-white text-sm">
              Substitution Preference
            </label>
            <Select
              value={formData.replacement_preference}
              onValueChange={(value) => setFormData({ ...formData, replacement_preference: value })}
            >
              <SelectTrigger id="substitution" className="text-white">
                <SelectValue placeholder="Substitution Preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contact">Contact me</SelectItem>
                <SelectItem value="similar">Similar product</SelectItem>
                <SelectItem value="none">No substitution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/75 h-11 mt-6"
          disabled={isLoading || formIsLoading}
        >
          {isLoading || formIsLoading ? 'Loading...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}