import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para documentos
export interface DocumentoUpload {
  id?: string
  bombeiro_id: number
  nome_arquivo: string
  nome_original: string
  nome_personalizado?: string
  tipo_arquivo: string
  tamanho: number
  caminho_storage: string
  data_upload: string
  data_criacao?: string
  created_at?: string
  uploaded_by?: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      bombeiros_documentos: {
        Row: {
          id: string
          bombeiro_id: number
          nome_arquivo: string
          nome_original: string
          tipo_arquivo: string
          tamanho: number
          caminho_storage: string
          data_upload: string
          uploaded_by: string
        }
        Insert: {
          bombeiro_id: number
          nome_arquivo: string
          nome_original: string
          tipo_arquivo: string
          tamanho: number
          caminho_storage: string
          data_upload?: string
          uploaded_by?: string
        }
        Update: {
          id?: string
          bombeiro_id?: number
          nome_arquivo?: string
          nome_original?: string
          tipo_arquivo?: string
          tamanho?: number
          caminho_storage?: string
          data_upload?: string
          uploaded_by?: string
        }
      }
    }
  }
}

// Funções utilitárias para storage
export const STORAGE_BUCKET = 'bombeiros-documentos'

export const uploadDocumento = async (
  bombeiroId: number,
  file: File,
  nomePersonalizado?: string
) => {
  try {
    // Gerar nome único para o arquivo
    const timestamp = new Date().getTime()
    const extensao = file.name.split('.').pop()
    const nomeArquivo = `${bombeiroId}/${timestamp}_${nomePersonalizado || file.name}`
    
    // Upload do arquivo para o storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(nomeArquivo, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Salvar metadados na tabela
    const { data: docData, error: docError } = await supabase
      .from('bombeiros_documentos')
      .insert({
        bombeiro_id: bombeiroId,
        nome_arquivo: nomePersonalizado || file.name,
        nome_original: file.name,
        tipo_arquivo: file.type,
        tamanho: file.size,
        caminho_storage: uploadData.path,
        data_upload: new Date().toISOString()
      })
      .select()
      .single()

    if (docError) {
      // Se falhar ao salvar metadados, remover arquivo do storage
      await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path])
      throw docError
    }

    return { data: docData, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const getDocumentosBombeiro = async (bombeiroId: number) => {
  try {
    const { data, error } = await supabase
      .from('bombeiros_documentos')
      .select('*')
      .eq('bombeiro_id', bombeiroId)
      .order('data_upload', { ascending: false })

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const downloadDocumento = async (caminhoStorage: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(caminhoStorage)

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const deleteDocumento = async (documentoId: string, caminhoStorage: string) => {
  try {
    // Remover arquivo do storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([caminhoStorage])

    if (storageError) {
      throw storageError
    }

    // Remover registro da tabela
    const { error: dbError } = await supabase
      .from('bombeiros_documentos')
      .delete()
      .eq('id', documentoId)

    return { error: dbError }
  } catch (error) {
    return { error }
  }
}

export const getDocumentoUrl = async (caminhoStorage: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(caminhoStorage, 3600) // URL válida por 1 hora

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}