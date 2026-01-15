import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_KEY || "";

export const supabase = createClient(url, key);
// export const supabase = null as any;
export const BUCKET_NAME = process.env.BUCKET_NAME || "products";
