import { supabase } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, message: "No file uploaded" });
  }

  const file = files[0];
  const fileExt = file.filename?.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  // Use TelegramShopBucket (with proofs folder) or PaymentProofBucket if exists
  // For now, let's try PaymentProofBucket, fallback to TelegramShopBucket/proofs
  // Actually, I'll force TelegramShopBucket/proofs for simplicity as user might not have created the other one yet
  // If user DID create PaymentProofBucket, better to use it.
  // I will assume TelegramShopBucket for now as it's GUARANTEED to work based on previous task.
  // We can change this later easily.
  const bucket = "TelegramShopBucket";
  const path = `proofs/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file.data, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
});
