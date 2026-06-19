"use server"

import { cookies } from "next/headers"
import { createClient } from "../supabase/server"
import { ServiceFormValues } from "@/app/schemas/business"

export const updateServices = async (services: ServiceFormValues[]) => {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // 1. Auth check
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
        return {
            success: false,
            error: "Unauthorized",
        }
    }

    // 2. Get business_id from user
    const { data: businessUser, error: businessError } = await supabase
        .from("business_users")
        .select("business_id")
        .eq("auth_user_id", userData.user.id)
        .single()
    if (businessError || !businessUser) {
        return {
            success: false,
            error: "Business not found",
        }
    }

    const businessId = businessUser.business_id

    const { data: existingServices, error: fetchError } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", businessId)

    const toUpdate = services.filter((s) => s.id)
    const toCreate = services.filter((s) => !s.id)
    
    console.log("Services to update:", toUpdate)
    console.log("Services to create:", toCreate)
    console.log("Existing services:", existingServices)

}