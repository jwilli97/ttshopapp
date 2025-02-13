import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import Image from 'next/image'

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
            
            console.log("Starting upload process...");

            // Check file size (e.g., 5MB limit)
            if (selectedFile.size > 5 * 1024 * 1024) {
                throw new Error('File size too large. Please upload a file smaller than 5MB.');
            }

            // Use a fixed filename
            const fileName = 'current_menu.png';
            console.log("Attempting to upload as:", fileName);

            // Upload file to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('menus')
                .upload(fileName, selectedFile, {
                    cacheControl: '3600',
                    upsert: true  // This will replace the existing file
                });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw new Error(`Upload error: ${uploadError.message}`);
            }

            console.log("Upload successful, getting public URL...");

            // Get public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from('menus')
                .getPublicUrl(fileName);

            console.log("Got public URL:", publicUrl);

            // Update local state with the new URL
            setMenuUrl(publicUrl);
            setSelectedFile(null);

            console.log("Upload process completed successfully");
            
        } catch (error) {
            console.error("Error in upload process:", error);
            setError(error instanceof Error ? error.message : "Failed to upload menu. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-row items-center gap-2">
                <Input 
                    className="text-white"
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={isLoading}
                />
                <Button 
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isLoading}
                >
                    {isLoading ? 'Uploading...' : 'Upload New Menu'}
                </Button>
            </div>
            
            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="border bg-background rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Current Menu</h2>
                {menuUrl ? (
                    <Image 
                        src={menuUrl} 
                        alt="Current Menu"
                        width={500}
                        height={300}
                    />
                ) : (
                    <div className="text-gray-500">
                        No menu uploaded yet
                    </div>
                )}
            </div>
        </div>
    );
}