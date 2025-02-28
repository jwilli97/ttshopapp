'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from '@/app/types/auth';
import { Label } from '@/components/ui/label';

interface PersonalFormProps {
  onSubmit: (data: Partial<UserProfile>) => void;
  isLoading?: boolean;
  error?: string;
  initialEmail?: string;
  initialPhoneNumber?: string;
}

export function PersonalForm({ 
  onSubmit, 
  isLoading = false, 
  error = '',
  initialEmail = '',
  initialPhoneNumber = ''
}: PersonalFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    phoneNumber: initialPhoneNumber || '',
    email: initialEmail || '',
  })
  const [formError, setFormError] = useState('')

  // Update form data if initialEmail or initialPhoneNumber changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: initialPhoneNumber || prev.phoneNumber,
      email: initialEmail || prev.email
    }));
  }, [initialEmail, initialPhoneNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.firstName.trim()) {
      setFormError('First name is required');
      return;
    }
    
    if (!formData.lastName.trim()) {
      setFormError('Last name is required');
      return;
    }
    
    if (!formData.birthday) {
      setFormError('Birthday is required');
      return;
    }
    
    // Clear any previous errors
    setFormError('');
    
    // Submit the form data
    onSubmit(formData);
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white">
              First Name
            </Label>
            <Input
              id="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white">
              Last Name
            </Label>
            <Input
              id="lastName" 
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className="text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="text-white"
              disabled={!!initialEmail}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="555-555-5555"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
              className="text-white"
              disabled={!!initialPhoneNumber}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday" className="text-white">
              Birthday
            </Label>
            <Input
              id="birthday"
              type="date"
              placeholder="Birthday"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              required
              className="text-white"
            />
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/75 h-11 mt-6"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}