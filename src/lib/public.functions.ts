import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("admin_settings")
    .select("id, company_name, logo_url, contact_email, whatsapp_number, address, default_lang")
    .eq("id", 1)
    .maybeSingle();
  return data;
});

export const getPublicServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("services")
    .select("id, category, name_fr, name_en, description_fr, description_en, price_xaf, image_url, sort_order")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
});

export const getPublicReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().rpc("public_reviews");
  return data ?? [];
});
