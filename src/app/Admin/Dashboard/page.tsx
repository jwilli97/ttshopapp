'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }
    
        try {
            // Upload file to Supabase Storage
            const { data, error } = await supabase.storage
                .from('menus')
                .upload(`menu-${Date.now()}.${file.name.split('.').pop()}`, file);
    
            if (error) throw error;
    
            // Get public URL of the uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from('menus')
                .getPublicUrl(data.path);
    
            // Update the current menu in the database
            const { error: updateError } = await supabase
                .from('settings')
                .update({ current_menu: publicUrl })
                .eq('id', 1); // Assuming you have a single row for settings
    
            if (updateError) throw updateError;
    
            alert('Menu updated successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    return (
        <div className="flex h-screen w-full flex-col items-center px-4 py-6 relative">
            <h1> ADMIN DASHBOARD</h1>
            <div>
                <Card className="w-96 bg-primary">
                    <CardHeader>
                        <CardTitle>Current Menu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="picture">Upload Menu</Label>
                        <Input id="picture" type="file" onChange={handleFileChange} />
                        <Button className="bg-black" onClick={handleUpload}>Upload</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};