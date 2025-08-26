"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  // Optionally, show a loading spinner while checking auth
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500 text-lg">Loading...</div>
    </div>
  );
}
