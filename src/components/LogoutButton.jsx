"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="btn-outline text-sm w-full text-ruby border-ruby/30">
      Logout
    </button>
  );
}
