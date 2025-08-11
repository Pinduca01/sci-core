import { supabase } from '../supabase'
import { Database } from '../supabase'

type Bombeiro = Database['public']['Tables']['bombeiros']['Row']
type BombeiroInsert = Database['public']['Tables']['bombeiros']['Insert']
type BombeiroUpdate = Database['public']['Tables']['bombeiros']['Update']

export class BombeiroService {
  // Buscar bombeiro por user_id
  static async getBombeiroByUserId(userId: string): Promise<Bombeiro | null> {
    try {
      const { data, error } = await supabase
        .from('bombeiros')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar bombeiro:', error)
      throw error
    }
  }

  // Criar novo bombeiro
  static async createBombeiro(bombeiroData: BombeiroInsert): Promise<Bombeiro> {
    try {
      const { data, error } = await supabase
        .from('bombeiros')
        .insert(bombeiroData)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Erro ao criar bombeiro:', error)
      throw error
    }
  }

  // Atualizar bombeiro
  static async updateBombeiro(id: string, bombeiroData: BombeiroUpdate): Promise<Bombeiro> {
    try {
      const { data, error } = await supabase
        .from('bombeiros')
        .update({
          ...bombeiroData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Erro ao atualizar bombeiro:', error)
      throw error
    }
  }

  // Buscar todos os bombeiros (para admin)
  static async getAllBombeiros(): Promise<Bombeiro[]> {
    try {
      const { data, error } = await supabase
        .from('bombeiros')
        .select('*')
        .order('nome_completo')

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao buscar bombeiros:', error)
      throw error
    }
  }

  // Verificar se CPF já existe
  static async checkCpfExists(cpf: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('bombeiros')
        .select('id')
        .eq('cpf', cpf)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data?.length || 0) > 0
    } catch (error) {
      console.error('Erro ao verificar CPF:', error)
      throw error
    }
  }

  // Verificar se número de bombeiro já existe
  static async checkNumeroBombeiroExists(numeroBombeiro: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('bombeiros')
        .select('id')
        .eq('numero_bombeiro', numeroBombeiro)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data?.length || 0) > 0
    } catch (error) {
      console.error('Erro ao verificar número de bombeiro:', error)
      throw error
    }
  }
}