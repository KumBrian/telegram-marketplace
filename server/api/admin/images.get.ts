import { supabase, BUCKET_NAME } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list();

  if (error) {
    // If bucket doesn't exist or permissions error
    console.error("Supabase List Error:", error);
    return [];
  }

  // Transform to simpler object and generate public URLs
  const images = data.map((file: any) => {
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(file.name);

    return {
      name: file.name,
      url: publicUrlData.publicUrl,
      createdAt: new Date(file.created_at),
    };
  });

  // Sort by newest first
  return images.sort(
    (a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()
  );
});
