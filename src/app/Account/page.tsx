'use client';

import { supabase } from "@/lib/supabaseClient";
import AccountInfo from "@/app/Account/account-info";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

export default function AccountPage() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null> (null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Account Information</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : userData ? (
          <Card className="p-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="personal"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-black"
                >
                  Personal Info
                </TabsTrigger>
                <TabsTrigger 
                  value="delivery"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-black"
                >
                  Delivery Info
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-black"
                >
                  Preferences
                </TabsTrigger>
              </TabsList>
              <TabsContent value="personal">
                <AccountInfo userData={userData} section="personal" />
              </TabsContent>
              <TabsContent value="delivery">
                <AccountInfo userData={userData} section="delivery" />
              </TabsContent>
              <TabsContent value="preferences">
                <AccountInfo userData={userData} section="preferences" />
              </TabsContent>
            </Tabs>
          </Card>
        ) : null}
      </div>
      <BottomNav />
    </div>
  );
}