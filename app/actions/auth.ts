"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ORDER_ACCESS_COOKIE } from "@/lib/orders/confirmation-access";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  // "local" ends only this browser's session. The default ("global") would also sign the
  // customer out of every other device.
  if (supabase) await supabase.auth.signOut({ scope: "local" });
  // Also forget which guest order this browser may view, in case the computer is shared.
  (await cookies()).delete(ORDER_ACCESS_COOKIE);
  redirect("/");
}
