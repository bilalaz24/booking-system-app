"use server"

import { cookies } from "next/headers";
import { createClient } from "../supabase/server";
import { businessProfileSchema, ProfileFormValues } from "@/app/schemas/business";

export async function updateBusiness(data: ProfileFormValues) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID

    const {
        name,
        hero_title,
        hero_description,

        address,
        city,

        phone,
        email,

        instagram,
        facebook,
    } = data

    if (!name || !phone || !hero_title || !hero_description || !address || !city || !email) {
        return {
            success: false,
            error: "Missing fields"
        }
    }

    const parsed = businessProfileSchema.safeParse(data)

    if (!parsed.success) {
        return {
            success: false,
            error: "Invalid form data",
        }
    }
    
    console.log("FROM SERVER, BUSINESS")
    console.log({
        name,
        hero_title,
        hero_description,

        address,
        city,

        phone,
        email,

        instagram,
        facebook,
    })

    const { error: businessError } = await supabase
    .from("businesses")
    .update({
        name,
        address,
        city,
        phone,
        email,
    })
    .eq("id", businessId)

    const { error: settingsError } = await supabase
    .from("business_settings")
    .update({
        hero_title,
        hero_description,
        instagram_url: instagram,
        facebook_url: facebook
    })
    .eq("business_id", businessId)

    if (businessError) {
        console.error(businessError)
        return {
            success: false,
            error: businessError.message
        }
    }
    if (settingsError) {
        console.error(settingsError)
        return {
            success: false,
            error: settingsError.message
        }
    }

    return {
        success: true
    }
}