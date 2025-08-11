import { supabase } from '../supabase';

export interface Ocorrencia {
  id?: string;
  titulo: string;
  tipo: string;
  status: 'Aberta' | 'Em Andamento' | 'Resolvida' | 'Cancelada';
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  data_ocorrencia: string;
  hora_ocorrencia: string;
  endereco: string;
  area: string;
  equipe: 'Equipe Alpha' | 'Equipe Bravo' | 'Equipe Charlie' | 'Equipe Delta';
  bombeiros_envolvidos: string[];
  hora_acionamento: string;
  hora_saida: string;
  hora_chegada: string;
  hora_termino: string;
  hora_retorno: string;
  tempo_total_minutos?: number;
  vitimas_fatais: number;
  vitimas_feridas: number;
  viaturas?: string;
  equipamentos_utilizados?: string[];
  descricao: string;
  descricao_detalhada?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  created_at?: string;
  updated_at?: string;
}

export const TIPOS_OCORRENCIA = [
  'Atendimento à Aeronave Presidencial',
  'Condições de Baixa Visibilidade',
  'Emergências Médicas em Geral',
  'Iluminação de Emergência em Pista de Pouso e Decolagem',
  'Incêndio em Instalações Aeroportuárias',
  'Incêndios Florestais ou em Áreas de Cobertura Vegetal Próximas ao Aeródromo',
  'Incêndios ou Vazamentos de Combustíveis no PAA',
  'Ocorrência aeronáutica',
  'Ocorrências com Artigos Perigosos',
  'Remoção de Animais e Dispersão de Avifauna'
] as const;

export const EQUIPES = [
  'Equipe Alpha',
  'Equipe Bravo', 
  'Equipe Charlie',
  'Equipe Delta'
] as const;

export const STATUS_OCORRENCIA = [
  'Aberta',
  'Em Andamento',
  'Resolvida',
  'Cancelada'
] as const;

export const PRIORIDADES = [
  'Baixa',
  'Média',
  'Alta',
  'Crítica'
] as const;

class OcorrenciaService {
  // Buscar todas as ocorrências
  async getOcorrencias(): Promise<Ocorrencia[]> {
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Buscar ocorrência por ID
  async getOcorrenciaById(id: string): Promise<Ocorrencia | null> {
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar ocorrência:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Criar nova ocorrência
  async createOcorrencia(ocorrencia: Omit<Ocorrencia, 'id' | 'created_at' | 'updated_at' | 'tempo_total_minutos'>): Promise<Ocorrencia> {
    try {
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', user.id)
        .single();

      const responsavelNome = profile?.nome || user.email || 'Usuário Desconhecido';

      const ocorrenciaCompleta = {
        ...ocorrencia,
        responsavel_id: user.id,
        responsavel_nome: responsavelNome
      };

      const { data, error } = await supabase
        .from('ocorrencias')
        .insert([ocorrenciaCompleta])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar ocorrência:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Atualizar ocorrência
  async updateOcorrencia(id: string, updates: Partial<Ocorrencia>): Promise<Ocorrencia> {
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar ocorrência:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Deletar ocorrência
  async deleteOcorrencia(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ocorrencias')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar ocorrência:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Filtrar ocorrências
  async getOcorrenciasFiltradas(filtros: {
    status?: string;
    tipo?: string;
    equipe?: string;
    dataInicio?: string;
    dataFim?: string;
    busca?: string;
  }): Promise<Ocorrencia[]> {
    try {
      let query = supabase
        .from('ocorrencias')
        .select('*');

      // Aplicar filtros
      if (filtros.status && filtros.status !== 'Todos') {
        query = query.eq('status', filtros.status);
      }

      if (filtros.tipo && filtros.tipo !== 'Todos') {
        query = query.eq('tipo', filtros.tipo);
      }

      if (filtros.equipe && filtros.equipe !== 'Todas') {
        query = query.eq('equipe', filtros.equipe);
      }

      if (filtros.dataInicio) {
        query = query.gte('data_ocorrencia', filtros.dataInicio);
      }

      if (filtros.dataFim) {
        query = query.lte('data_ocorrencia', filtros.dataFim);
      }

      if (filtros.busca) {
        query = query.or(`titulo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%,endereco.ilike.%${filtros.busca}%`);
      }

      // Ordenar por data de criação (mais recentes primeiro)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao filtrar ocorrências:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de ocorrências:', error);
      throw error;
    }
  }

  // Obter estatísticas das ocorrências
  async getEstatisticas(): Promise<{
    total: number;
    abertas: number;
    emAndamento: number;
    resolvidas: number;
    canceladas: number;
    porTipo: Record<string, number>;
    porEquipe: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('status, tipo, equipe');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }

      const ocorrencias = data || [];
      
      const stats = {
        total: ocorrencias.length,
        abertas: ocorrencias.filter(o => o.status === 'Aberta').length,
        emAndamento: ocorrencias.filter(o => o.status === 'Em Andamento').length,
        resolvidas: ocorrencias.filter(o => o.status === 'Resolvida').length,
        canceladas: ocorrencias.filter(o => o.status === 'Cancelada').length,
        porTipo: {} as Record<string, number>,
        porEquipe: {} as Record<string, number>
      };

      // Contar por tipo
      ocorrencias.forEach(o => {
        stats.porTipo[o.tipo] = (stats.porTipo[o.tipo] || 0) + 1;
      });

      // Contar por equipe
      ocorrencias.forEach(o => {
        stats.porEquipe[o.equipe] = (stats.porEquipe[o.equipe] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erro no serviço de estatísticas:', error);
      throw error;
    }
  }
}

export const ocorrenciaService = new OcorrenciaService();