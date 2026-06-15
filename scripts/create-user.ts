//pnpm ts-node scripts/create-user.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createUser() {
  // 1. create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email: "tranare@email.com",
    password: "password987",
    email_confirm: true,
  });

  if (error || !data.user) {
    console.log(error);
    return;
  }

  // 2. insert into your table
  const { error: dbError } = await supabase
    .from("business_users")
    .insert({
      auth_user_id: data.user.id,
      email: "tranare@email.com",
      name: "Tränaren",
      role: "admin",
      business_id: "f98fa9c3-5240-487d-b35c-83b5800d824c",
    });

  if (dbError) {
    console.log(dbError);
    return;
  }

  console.log("User fully created");
}

createUser();