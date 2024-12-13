import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

export function MenuView() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [menuUrl, setMenuUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch menu URL
                const menuResponse = await fetch('/api/getMenuUrl');
                if (!menuResponse.ok) {
                    throw new Error(`HTTP error! status: ${menuResponse.status}`);
                }
                const menuData: { url: string } = await menuResponse.json();
                setMenuUrl(menuData.url);
            } catch (error) {
                console.error("There was a problem fetching data:", error);
                setError("Failed to load data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleFileUpload = async () => {
        if (!selectedFile) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            // Check file size (e.g., 5MB limit)
            if (selectedFile.size > 5 * 1024 * 1024) {
                throw new Error('File size too large. Please upload a file smaller than 5MB.');
            }

            // Upload file to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('menus')
                .upload(`menu-${Date.now()}.${selectedFile.name.split('.').pop()}`, selectedFile, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                throw new Error(`Upload error: ${uploadError.message}`);
            }

            if (!uploadData) {
                throw new Error('Upload failed: No data received');
            }

            // Get public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from('menus')
                .getPublicUrl(uploadData.path);

            // Update the menu URL in the database
            const { data: updateData, error: updateError } = await supabase
                .from('settings')
                .update({ value: publicUrl })
                .eq('key', 'menu_url');

            if (updateError) {
                throw new Error(`Database update error: ${updateError.message}`);
            }

            // Update local state
            setMenuUrl(publicUrl);
            setSelectedFile(null);
            
        } catch (error) {
            console.error("Error uploading menu:", error);
            setError(error instanceof Error ? error.message : "Failed to upload menu. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-2 flex flex-row items-center">
                <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Button 
                    onClick={handleFileUpload}
                    disabled={!selectedFile}
                >
                    Upload New Menu
                </Button>
            </div>
            <div className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Current Menu</h2>
                <img 
                    src={menuUrl} 
                    alt="Current Menu"
                    className="w-full h-auto"
                />
            </div>
        </div>
    );
}