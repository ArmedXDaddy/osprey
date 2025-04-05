
import { supabase } from './client';

/**
 * Uploads an image to Supabase storage
 * @param file File to upload
 * @param path Path to store the file at in the bucket
 * @returns URL of the uploaded file
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${path}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('covers')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Error uploading file');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    // Fallback to local URL for development
    return URL.createObjectURL(file);
  }
};
