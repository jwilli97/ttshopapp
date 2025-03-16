import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import Image from 'next/image';
import { useToast } from "@/components/ui/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MenuView() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [menuUrl, setMenuUrl] = useState<string>('');
    const [menuFiles, setMenuFiles] = useState<{name: string, url: string}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchMenuData();
    }, []);

    const fetchMenuData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Add cache busting parameter
            const menuResponse = await fetch(`/api/getMenuUrl?t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!menuResponse.ok) {
                throw new Error(`HTTP error! status: ${menuResponse.status}`);
            }
            
            const data = await menuResponse.json();
            setMenuUrl(data.currentMenu.url);
            setMenuFiles(data.menuFiles);
        } catch (error) {
            console.error("There was a problem fetching data:", error);
            setError("Failed to load data. Please try again later.");
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load menu data. Please try again later."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !fileName.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select a file and provide a filename."
            });
            return;
        }

        try {
            setIsUploading(true);
            setError(null);
            
            // Check file size (e.g., 5MB limit)
            if (selectedFile.size > 5 * 1024 * 1024) {
                throw new Error('File size too large. Please upload a file smaller than 5MB.');
            }

            // Create FormData for the API request
            const formData = new FormData();
            formData.append('operation', 'upload');
            formData.append('file', selectedFile);
            formData.append('fileName', fileName);
            
            // Send request to API
            const response = await fetch('/api/menuOperations', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
            
            const result = await response.json();
            
            // Force a fresh fetch of menu data
            await fetchMenuData();
            
            // Reset form
            setSelectedFile(null);
            setFileName('');
            
            toast({
                title: "Upload Successful",
                description: `Menu image "${result.fileName}" has been uploaded.`,
            });
            
        } catch (error) {
            console.error("Error in upload process:", error);
            setError(error instanceof Error ? error.message : "Failed to upload menu. Please try again.");
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error instanceof Error ? error.message : "Failed to upload menu. Please try again."
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const setAsCurrentMenu = async (fileName: string) => {
        try {
            setIsLoading(true);
            
            // Create FormData for the API request
            const formData = new FormData();
            formData.append('operation', 'setCurrent');
            formData.append('fileName', fileName);
            
            // Send request to API
            const response = await fetch('/api/menuOperations', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to set as current menu');
            }
            
            const result = await response.json();
            
            // Update URL
            setMenuUrl(result.url);
            
            // Refresh the file list to ensure the UI is updated
            await fetchMenuData();
            
            toast({
                title: "Current Menu Updated",
                description: `"${fileName}" is now set as the current menu.`
            });
            
        } catch (error) {
            console.error("Error setting current menu:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to set current menu."
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const deleteMenu = async (fileName: string) => {
        if (fileName === 'current_menu.png') {
            toast({
                variant: "destructive",
                title: "Cannot Delete",
                description: "You cannot delete the current menu. Please upload a replacement first."
            });
            return;
        }
        
        try {
            setIsLoading(true);
            
            // Create FormData for the API request
            const formData = new FormData();
            formData.append('operation', 'delete');
            formData.append('fileName', fileName);
            
            // Send request to API
            const response = await fetch('/api/menuOperations', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete menu');
            }
            
            // Refresh the file list
            await fetchMenuData();
            
            toast({
                title: "Menu Deleted",
                description: `"${fileName}" has been deleted.`
            });
            
        } catch (error) {
            console.error("Error deleting menu:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete menu."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 text-black">
                    <TabsTrigger value="upload">Upload Menu</TabsTrigger>
                    <TabsTrigger value="manage">Manage Menus</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Menu Image</CardTitle>
                                <CardDescription>
                                    Upload a new menu image to the Supabase storage bucket. Images must be PNG format and less than 5MB.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fileName">Filename</Label>
                                    <Input
                                        id="fileName"
                                        placeholder="Enter a filename (e.g., menu_spring_2023)"
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        disabled={isUploading}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        The .png extension will be added automatically if not included.
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="menuFile">Menu Image (PNG)</Label>
                                    <Input
                                        id="menuFile"
                                        type="file"
                                        accept="image/png"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        disabled={isUploading}
                                    />
                                </div>
                                
                                {selectedFile && (
                                    <div className="rounded-md border p-2 mt-2">
                                        <p className="text-sm font-medium">Selected file:</p>
                                        <p className="text-sm text-muted-foreground">{selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</p>
                                    </div>
                                )}
                                
                                {error && (
                                    <div className="text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    onClick={handleFileUpload}
                                    disabled={!selectedFile || !fileName || isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Menu'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>
                
                <TabsContent value="manage" className="mt-4">
                    <div className="max-w-3xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Menu</CardTitle>
                                <CardDescription>
                                    This is the menu currently displayed to customers.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                {isLoading ? (
                                    <div className="text-center p-8">Loading current menu...</div>
                                ) : menuUrl ? (
                                    <Image 
                                        src={`${menuUrl}?t=${Date.now()}`}
                                        alt="Current Menu"
                                        width={400}
                                        height={560}
                                        className="rounded-md shadow-md max-h-[560px] w-auto object-contain"
                                    />
                                ) : (
                                    <div className="text-gray-500 text-center p-8">
                                        No current menu available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-4">All Uploaded Menus</h2>
                            {isLoading ? (
                                <div className="text-center p-8">Loading menus...</div>
                            ) : menuFiles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                    {menuFiles.map((file) => (
                                        <Card key={file.name} className="overflow-hidden max-w-sm">
                                            <div className="aspect-[3/4] relative max-h-[400px]">
                                                <Image
                                                    src={file.url}
                                                    alt={file.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <CardFooter className="flex flex-col items-start space-y-2 pt-4">
                                                <p className="text-sm font-medium truncate w-full">{file.name}</p>
                                                <div className="flex space-x-2 w-full">
                                                    {file.name !== 'current_menu.png' && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => setAsCurrentMenu(file.name)}
                                                            disabled={isLoading}
                                                            className="flex-1"
                                                        >
                                                            Set as Current
                                                        </Button>
                                                    )}
                                                    {file.name !== 'current_menu.png' && (
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => deleteMenu(file.name)}
                                                            disabled={isLoading}
                                                            className="flex-1"
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                    {file.name === 'current_menu.png' && (
                                                        <div className="w-full text-center text-sm text-muted-foreground">
                                                            Current Active Menu
                                                        </div>
                                                    )}
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground p-8 border rounded-md">
                                    No menu files found. Upload your first menu to get started.
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}