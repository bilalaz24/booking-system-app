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
    email: "test@email.com",
    password: "password123",
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
      email: "test@email.com",
      name: "Test User",
      role: "admin",
      business_id: "d2959038-68db-47ed-be4f-37fc20f1c713",
    });

  if (dbError) {
    console.log(dbError);
    return;
  }

  console.log("User fully created");
}

createUser();