import { SupabaseClient } from "@supabase/supabase-js"

export async function getBusiness(supabase: SupabaseClient) {
  const business_id = process.env.NEXT_PUBLIC_BUSINESS_ID

  const { data: business, error: business_error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", business_id)
    .single()

  if (business_error) throw business_error

  
  const { data: business_config, error: business_config_error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", business_id)
    .single()

  if (business_config_error) throw business_config_error

  return {
    business: business,
    business_config: business_config
  }
}