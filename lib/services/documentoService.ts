import { supabase } from '../supabase'
import { Database } from '../supabase'

type Documento = Database['public']['Tables']['documentos']['Row']
type DocumentoInsert = Database['public']['Tables']['documentos']['Insert']
type DocumentoUpdate = Database['public']['Tables']['documentos']['Update']

export interface FileWithCustomName {
  file: File
  customName?: string
}

export class DocumentoService {
  // Bucket name para documentos
  private static readonly BUCKET_NAME = 'documentos-bombeiros'

  // Upload de arquivo para Supabase Storage
  static async uploadFile(file: File, bombeiroId: string, customName?: string): Promise<string> {
    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${bombeiroId}/${timestamp}_${file.name}`

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error)
      throw error
    }
  }

  // Criar registro de documento no banco
  static async createDocumento(documentoData: DocumentoInsert): Promise<Documento> {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .insert(documentoData)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Erro ao criar documento:', error)
      throw error
    }
  }

  // Upload completo (arquivo + metadados)
  static async uploadDocumento(
    file: File,
    bombeiroId: string,
    customName?: string
  ): Promise<Documento> {
    try {
      // 1. Upload do arquivo
      const publicUrl = await this.uploadFile(file, bombeiroId, customName)

      // 2. Extrair path do storage da URL
      const urlParts = publicUrl.split(`/${this.BUCKET_NAME}/`)
      const storagePath = urlParts[1]

      // 3. Criar registro no banco
      const documentoData: DocumentoInsert = {
        bombeiro_id: bombeiroId,
        nome_original: file.name,
        nome_personalizado: customName || null,
        tipo_documento: file.type || 'application/octet-stream',
        tamanho: file.size,
        url_arquivo: publicUrl,
        storage_path: storagePath
      }

      return await this.createDocumento(documentoData)
    } catch (error) {
      console.error('Erro ao fazer upload completo do documento:', error)
      throw error
    }
  }

  // Upload múltiplo
  static async uploadMultiplosDocumentos(
    files: FileWithCustomName[],
    bombeiroId: string
  ): Promise<Documento[]> {
    try {
      const uploadPromises = files.map(({ file, customName }) =>
        this.uploadDocumento(file, bombeiroId, customName)
      )

      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Erro ao fazer upload múltiplo:', error)
      throw error
    }
  }

  // Buscar documentos por bombeiro
  static async getDocumentosByBombeiro(bombeiroId: string): Promise<Documento[]> {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('bombeiro_id', bombeiroId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
      throw error
    }
  }

  // Atualizar nome personalizado do documento
  static async updateNomePersonalizado(
    documentoId: string,
    nomePersonalizado: string
  ): Promise<Documento> {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .update({
          nome_personalizado: nomePersonalizado,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentoId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Erro ao atualizar nome personalizado:', error)
      throw error
    }
  }

  // Deletar documento
  static async deleteDocumento(documentoId: string): Promise<void> {
    try {
      // 1. Buscar documento para obter storage_path
      const { data: documento, error: fetchError } = await supabase
        .from('documentos')
        .select('storage_path')
        .eq('id', documentoId)
        .single()

      if (fetchError) throw fetchError

      // 2. Deletar arquivo do storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([documento.storage_path])

      if (storageError) {
        console.warn('Erro ao deletar arquivo do storage:', storageError)
        // Continua mesmo com erro no storage
      }

      // 3. Deletar registro do banco
      const { error: dbError } = await supabase
        .from('documentos')
        .delete()
        .eq('id', documentoId)

      if (dbError) throw dbError
    } catch (error) {
      console.error('Erro ao deletar documento:', error)
      throw error
    }
  }

  // Obter URL de download temporária (para arquivos privados)
  static async getDownloadUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(storagePath, expiresIn)

      if (error) throw error

      return data.signedUrl
    } catch (error) {
      console.error('Erro ao gerar URL de download:', error)
      throw error
    }
  }

  // Verificar se bucket existe e criar se necessário
  static async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) throw listError

      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME)

      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ],
          fileSizeLimit: 10485760 // 10MB
        })

        if (createError) throw createError
      }
    } catch (error) {
      console.error('Erro ao verificar/criar bucket:', error)
      throw error
    }
  }
}