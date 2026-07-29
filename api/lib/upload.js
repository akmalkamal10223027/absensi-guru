import { getStorage } from './supabase.js';

export async function uploadPhoto(fileBuffer, fileName, mimetype) {
    const storage = getStorage();

    const { error: uploadError } = await storage.upload(fileName, fileBuffer, {
        contentType: mimetype,
        upsert: false
    });

    if (uploadError) throw uploadError;

    const { data: urlData } = storage.getPublicUrl(fileName);
    return urlData.publicUrl;
}