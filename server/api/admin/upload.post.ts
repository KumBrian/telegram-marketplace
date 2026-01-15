import { supabase, BUCKET_NAME } from "../../utils/supabase";
import { randomUUID } from "crypto";

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);

  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, message: "No file uploaded" });
  }

  const uploadedUrls: string[] = [];

  for (const file of files) {
    if (!file.filename) continue;

    // Check size (5MB limit)
    const sizeMB = file.data.length / (1024 * 1024);
    if (sizeMB > 5) {
      throw createError({
        statusCode: 400,
        message: `File ${file.filename} exceeds 5MB limit`,
      });
    }

    // Generate unique path
    const ext = file.filename.split(".").pop() || "jpg";
    const fileName = `${randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file.data, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
      throw createError({
        statusCode: 500,
        message: "Upload failed: " + error.message,
      });
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    uploadedUrls.push(publicUrlData.publicUrl);
  }

  return { urls: uploadedUrls };
});
