import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SupabaseUploadResult {
  name: string
  url: string
}

export const uploadToSupabase = async (
  file: File,
  bucket: string = 'vendor-licenses',
  folder: string = ''
): Promise<SupabaseUploadResult> => {
  if (!file) throw new Error('Vui lòng chọn một tệp hợp lệ')

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = folder ? `${folder}/${timestamp}_${safeName}` : `${timestamp}_${safeName}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(error.message)

  return {
    name: file.name,
    url: `supabase://${bucket}/${path}`,
  }
}
