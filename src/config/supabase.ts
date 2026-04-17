import { createClient } from '@supabase/supabase-js';

// Centralized Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Helper for storage operations (can use the same client)
export const supabaseStorage = supabase;

/**
 * Upload a file buffer to a specific Supabase bucket
 */
export const uploadToSupabase = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  bucketName: string = 'documents'
) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  return data.path;
};

// Alias for specific PDF usage to maintain backward compatibility during migration
export const uploadPDFToSupabase = uploadToSupabase;

/**
 * Generate a temporary signed URL for a file
 */
export const generateSignedURL = async (filePath: string, bucketName: string) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 604800); // 7 days expiry

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
};

/**
 * Delete a file from a specific bucket
 */
export const deleteFileFromSupabase = async (filePath: string, bucketName: string) => {
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    console.error(`[Supabase] Failed to delete file ${filePath}:`, error.message);
  }
};

// Alias for PDF usage
export const deletePDFFromSupabase = deleteFileFromSupabase;

/**
 * Download a file buffer from Supabase
 */
export const downloadFileFromSupabase = async (filePath: string, bucketName: string) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);

  if (error) {
    throw new Error(`Failed to download file from Supabase: ${error.message}`);
  }

  return data;
};

