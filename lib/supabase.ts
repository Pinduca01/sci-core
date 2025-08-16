import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Interface para upload de documentos
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
      exercicios_epi: {
        Row: {
          id: string
          aeroporto: string
          data_exercicio: string
          hora_exercicio: string
          equipe: string
          chefe_equipe_id?: number
          gerente_sci_id?: number
          observacoes?: string
          sci_id?: string
          equipe_id?: string
          created_by?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          aeroporto?: string
          data_exercicio: string
          hora_exercicio: string
          equipe: string
          chefe_equipe_id?: number
          gerente_sci_id?: number
          observacoes?: string
          sci_id?: string
          equipe_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          aeroporto?: string
          data_exercicio?: string
          hora_exercicio?: string
          equipe?: string
          chefe_equipe_id?: number
          gerente_sci_id?: number
          observacoes?: string
          sci_id?: string
          equipe_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      participantes_epi: {
        Row: {
          id: string
          exercicio_id: string
          bombeiro_id: number
          tempo_calca_bota?: string
          tempo_tp_completo?: string
          tempo_epr_tp_completo?: string
          tempo_epr_sem_tp?: string
          created_at: string
        }
        Insert: {
          exercicio_id: string
          bombeiro_id: number
          tempo_calca_bota?: string
          tempo_tp_completo?: string
          tempo_epr_tp_completo?: string
          tempo_epr_sem_tp?: string
          created_at?: string
        }
        Update: {
          exercicio_id?: string
          bombeiro_id?: number
          tempo_calca_bota?: string
          tempo_tp_completo?: string
          tempo_epr_tp_completo?: string
          tempo_epr_sem_tp?: string
          created_at?: string
        }
      }
      bombeiros: {
        Row: {
          id: number
          nome: string
          email: string
          telefone?: string
          cargo?: string
          equipe?: string
          data_admissao?: string
          status: string
          user_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          nome: string
          email: string
          telefone?: string
          cargo?: string
          equipe?: string
          data_admissao?: string
          status?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nome?: string
          email?: string
          telefone?: string
          cargo?: string
          equipe?: string
          data_admissao?: string
          status?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      documentos: {
        Row: {
          id: string
          bombeiro_id: string
          nome_original: string
          nome_personalizado?: string
          tipo_documento: string
          tamanho: number
          url_arquivo: string
          storage_path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          bombeiro_id: string
          nome_original: string
          nome_personalizado?: string
          tipo_documento: string
          tamanho: number
          url_arquivo: string
          storage_path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bombeiro_id?: string
          nome_original?: string
          nome_personalizado?: string
          tipo_documento?: string
          tamanho?: number
          url_arquivo?: string
          storage_path?: string
          created_at?: string
          updated_at?: string
        }
      }
      ocorrencias: {
        Row: {
          id: number
          numero_ocorrencia: string
          data_ocorrencia: string
          hora_ocorrencia: string
          tipo_ocorrencia: string
          endereco: string
          bairro?: string
          cidade: string
          cep?: string
          descricao?: string
          status: string
          prioridade?: string
          vitimas_fatais?: number
          vitimas_feridas?: number
          danos_materiais?: string
          observacoes?: string
          bombeiro_responsavel?: string
          equipe_responsavel?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          numero_ocorrencia: string
          data_ocorrencia: string
          hora_ocorrencia: string
          tipo_ocorrencia: string
          endereco: string
          bairro?: string
          cidade: string
          cep?: string
          descricao?: string
          status?: string
          prioridade?: string
          vitimas_fatais?: number
          vitimas_feridas?: number
          danos_materiais?: string
          observacoes?: string
          bombeiro_responsavel?: string
          equipe_responsavel?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          numero_ocorrencia?: string
          data_ocorrencia?: string
          hora_ocorrencia?: string
          tipo_ocorrencia?: string
          endereco?: string
          bairro?: string
          cidade?: string
          cep?: string
          descricao?: string
          status?: string
          prioridade?: string
          vitimas_fatais?: number
          vitimas_feridas?: number
          danos_materiais?: string
          observacoes?: string
          bombeiro_responsavel?: string
          equipe_responsavel?: string
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
    Functions: {
      [key: string]: never
    }
    Enums: {
      [_ in never]: never
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
    const nomeArquivo = `${bombeiroId}_${timestamp}.${extensao}`
    const caminhoStorage = `documentos/${bombeiroId}/${nomeArquivo}`

    // Upload do arquivo para o storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(caminhoStorage, file)

    if (uploadError) {
      throw uploadError
    }

    // Salvar informações do documento na tabela
    const { data, error } = await supabase
      .from('bombeiros_documentos')
      .insert({
        bombeiro_id: bombeiroId,
        nome_arquivo: nomeArquivo,
        nome_original: file.name,
        tipo_arquivo: file.type,
        tamanho: file.size,
        caminho_storage: caminhoStorage,
        uploaded_by: 'sistema' // Pode ser substituído pelo ID do usuário logado
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, uploadData }
  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error)
    throw error
  }
}

export const getDocumentosBombeiro = async (bombeiroId: number) => {
  try {
    const { data, error } = await supabase
      .from('bombeiros_documentos')
      .select('*')
      .eq('bombeiro_id', bombeiroId)
      .order('data_upload', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    throw error
  }
}

export const downloadDocumento = async (caminhoStorage: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(caminhoStorage)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao fazer download do documento:', error)
    throw error
  }
}

export const deleteDocumento = async (documentoId: string, caminhoStorage: string) => {
  try {
    // Deletar arquivo do storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([caminhoStorage])

    if (storageError) {
      console.error('Erro ao deletar arquivo do storage:', storageError)
    }

    // Deletar registro da tabela
    const { error: dbError } = await supabase
      .from('bombeiros_documentos')
      .delete()
      .eq('id', documentoId)

    if (dbError) throw dbError

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar documento:', error)
    throw error
  }
}

export const getDocumentoUrl = async (caminhoStorage: string) => {
  try {
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(caminhoStorage, 3600) // URL válida por 1 hora

    return data?.signedUrl
  } catch (error) {
    console.error('Erro ao gerar URL do documento:', error)
    throw error
  }
}