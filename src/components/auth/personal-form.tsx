'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/app/types/auth';

interface PersonalFormProps {
  onSubmit: (data: Partial<UserProfile>) => void;
  onBack: () => void;
}

export function PersonalForm({ onSubmit, onBack }: PersonalFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    const { confirmPassword, ...submitData } = formData
    onSubmit(submitData)
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
        <div className="h-full w-4/6 bg-primary rounded" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-medium">PERSONAL</h2>
          
          <Input
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />

          <Input
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />

          <Input
            type="date"
            placeholder="Birthday"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Input
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="space-y-2 text-sm text-gray-300">
            <p>Password must contain:</p>
            <ul className="list-none space-y-1">
              <li>• 8 characters minimum</li>
              <li>• Letters</li>
              <li>• Numbers</li>
              <li>• Special character</li>
            </ul>
          </div>
        </div>

        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm space-y-2">
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