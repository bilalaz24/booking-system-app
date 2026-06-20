import SideBar from "@/components/staff/SideBar";
import { StaffUserProvider } from "@/components/providers/StaffUserProvider";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

const StaffLayout = async ({
    children,
}: {
  children: React.ReactNode;
}) => {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    const {data: {user: authUser}, error: authError} = await supabase.auth.getUser()

    if (!authUser) {
        console.error("Error fetching auth user", authError)
        redirect(routes.login)
    }

    if (!authUser) {
        redirect(routes.login)
    }

    const  {data: businessUser, error} = await supabase.from("business_users").select("*").eq("auth_user_id", authUser.id).single()

    if (error || !businessUser) {
        redirect(routes.login)
    }

  return (
    <StaffUserProvider user={businessUser}>
        <div>
            <SideBar />

            {/* Main content shifted right */}
            <main className="mt-14 md:mt-0 md:ml-72 min-h-screen p-6">
                {children}
            </main>
        </div>
    </StaffUserProvider>
  );
}

export default StaffLayout