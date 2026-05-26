import SideBar from "@/components/staff/SideBar";
import { StaffUserProvider } from "@/components/providers/StaffUserProvider";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const StaffLayout = async ({
    children,
}: {
  children: React.ReactNode;
}) => {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    const {data: {user: authUser}} = await supabase.auth.getUser()

    if (!authUser) {
        redirect("/auth/login")
    }

    const  {data: businessUser, error} = await supabase.from("business_users").select("*").eq("auth_user_id", authUser.id).single()


    if (error || !businessUser) {
        redirect("/auth/login")
    }

  return (
    <StaffUserProvider user={businessUser}>
        <div>
            <SideBar />

            {/* Main content shifted right */}
            <main className="ml-64 min-h-screen p-6">
                {children}
            </main>
        </div>
    </StaffUserProvider>
  );
}

export default StaffLayout