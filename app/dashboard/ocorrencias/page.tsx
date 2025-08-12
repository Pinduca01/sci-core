'use client';

import Header from '@/components/ui/header';
import { SidebarDemo } from '@/components/ui/sidebar-demo';
import { useState, useEffect } from 'react';
import { Search, Filter, FileText, AlertTriangle, Car, Flame, Users, Edit, X, Phone, Mail, MapPin, Calendar, DollarSign, Plus, Upload, Trash2, UserPlus, Eye, Clock, CheckCircle, XCircle, AlertCircle, Brain, Send, Loader2, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ocorrenciaService, Ocorrencia, TIPOS_OCORRENCIA, EQUIPES, STATUS_OCORRENCIA } from '@/lib/services/ocorrenciaService';

// Interface para compatibilidade com o código existente
interface OcorrenciaLegacy {
  id: string;
  titulo: string;
  tipo: string;
  status: 'Aberta' | 'Em Andamento' | 'Resolvida' | 'Cancelada';
  endereco: string;
  dataOcorrencia: string;
  horaOcorrencia: string;
  responsavel: string;
  descricao: string;
  equipesEnvolvidas: number;
  tempoResposta: string;
  descricaoDetalhada?: string;
  // Campos de cronologia
  cronologia?: Array<{ hora: string; descricao: string; }>;
  horarioAcionamento?: string;
  horarioSaida?: string;
  horarioChegada?: string;
  horarioTermino?: string;
  horarioRetorno?: string;
  // Campos de vítimas
  vitimas?: number;
  numeroVitimas?: number;
  vitimasIlesas?: number;
  vitimas_feridas?: number;
  vitimasObito?: number;
  vitimas_fatais?: number;
  // Campos de recursos
  recursos?: string[];
  viaturas?: string[];
  bombeirosEnvolvidos?: string[];
  equipamentosUtilizados?: string[];
  // Campos legados (manter compatibilidade)
  equipe?: string;
  area?: string;
  data?: string;
  aeroporto?: string;
  horaAcionamento?: string;
  horaSaida?: string;
  horaChegada?: string;
  horaTermino?: string;
  horaRetorno?: string;
  declaracaoSucinta?: string;
}

export default function OcorrenciasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [equipeFilter, setEquipeFilter] = useState('Todos');
  const [dataFilter, setDataFilter] = useState('');
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<OcorrenciaLegacy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaLegacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newOcorrencia, setNewOcorrencia] = useState<Partial<Ocorrencia>>({
    titulo: '',
    tipo: TIPOS_OCORRENCIA[0],

    status: 'Aberta',
    endereco: '',
    data_ocorrencia: '',
    hora_ocorrencia: '',
    descricao: '',
    equipe: EQUIPES[0],
    vitimas_fatais: 0,
    vitimas_feridas: 0,
    area: '',
    viaturas: '',
    equipamentos_utilizados: [],
    bombeiros_envolvidos: [],
    // Campos de cronologia
    hora_acionamento: '',
    hora_saida: '',
    hora_chegada: '',
    hora_termino: '',
    hora_retorno: '',
    descricao_detalhada: ''
  });
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [isCorrectingText, setIsCorrectingText] = useState(false);

  // Dados do usuário - usar dados básicos para evitar recursão RLS
  const [userData, setUserData] = useState({
    userName: 'Usuário',
    userEmail: 'usuario@empresa.com'
  });

  // Carregar dados do usuário autenticado
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Usar dados básicos do auth para evitar recursão RLS
          setUserData({
            userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            userEmail: user.email || 'email@exemplo.com'
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setUserData({
          userName: 'Usuário',
          userEmail: 'usuario@empresa.com'
        });
      }
    };

    loadUserData();
  }, []);

  // Carregar ocorrências do Supabase
  useEffect(() => {
    const loadOcorrencias = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await ocorrenciaService.getOcorrencias();
        
        // Converter dados do Supabase para formato legacy
        const ocorrenciasLegacy: OcorrenciaLegacy[] = data.map(ocorrencia => ({
          id: ocorrencia.id || '',
          titulo: ocorrencia.titulo,
          tipo: ocorrencia.tipo,
    
          status: ocorrencia.status,
          endereco: ocorrencia.endereco,
          dataOcorrencia: formatDateForDisplay(ocorrencia.data_ocorrencia),
          horaOcorrencia: ocorrencia.hora_ocorrencia,
          responsavel: ocorrencia.responsavel_nome || 'Não informado',
          descricao: ocorrencia.descricao,
          equipesEnvolvidas: 1, // Valor padrão
          tempoResposta: ocorrencia.tempo_total_minutos ? `${ocorrencia.tempo_total_minutos} min` : 'Pendente',
          descricaoDetalhada: ocorrencia.descricao_detalhada,
          equipe: ocorrencia.equipe,
          area: ocorrencia.area,
          vitimas_fatais: ocorrencia.vitimas_fatais,
          vitimas_feridas: ocorrencia.vitimas_feridas,
          horarioAcionamento: ocorrencia.hora_acionamento,
          horarioSaida: ocorrencia.hora_saida,
          horarioChegada: ocorrencia.hora_chegada,
          horarioTermino: ocorrencia.hora_termino,
          horarioRetorno: ocorrencia.hora_retorno,
          viaturas: ocorrencia.viaturas ? [ocorrencia.viaturas] : [],
          bombeirosEnvolvidos: ocorrencia.bombeiros_envolvidos || [],
          equipamentosUtilizados: ocorrencia.equipamentos_utilizados || []
        }));
        
        setOcorrencias(ocorrenciasLegacy);
      } catch (err) {
        console.error('Erro ao carregar ocorrências:', err);
        setError('Erro ao carregar ocorrências. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadOcorrencias();
  }, []);

  // Função para formatar data para exibição (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Função para formatar data para banco (DD/MM/YYYY -> YYYY-MM-DD)
  const formatDateForDatabase = (dateString: string): string => {
    if (!dateString) return '';
    if (dateString.includes('-')) return dateString; // Já está no formato correto
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  // Função para obter ícone do tipo
  const getTipoIcon = (tipo: string, className: string = "w-5 h-5") => {
    const baseClasses = className;
    switch (tipo) {
      case 'Incêndio': return <Flame className={`${baseClasses} text-red-600`} />;
      case 'Resgate': return <Users className={`${baseClasses} text-blue-600`} />;
      case 'Acidente': return <Car className={`${baseClasses} text-yellow-600`} />;
      case 'Emergência Médica': return <AlertTriangle className={`${baseClasses} text-green-600`} />;
      case 'Vazamento': return <AlertCircle className={`${baseClasses} text-purple-600`} />;
      default: return <AlertTriangle className={`${baseClasses} text-gray-600`} />;
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolvida': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelada': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  // Filtrar ocorrências
  const filteredOcorrencias = ocorrencias.filter(ocorrencia => {
    const matchesSearch = ocorrencia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ocorrencia.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ocorrencia.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || ocorrencia.status === statusFilter;
    const matchesTipo = tipoFilter === 'Todos' || ocorrencia.tipo === tipoFilter;
    const matchesEquipe = equipeFilter === 'Todos' || (ocorrencia.equipe && ocorrencia.equipe === equipeFilter);
    
    // Filtro de data - comparar apenas a data (formato YYYY-MM-DD)
    let matchesData = true;
    if (dataFilter) {
      // Converter data da ocorrência de DD/MM/YYYY para YYYY-MM-DD para comparação
      const dataOcorrenciaFormatted = ocorrencia.dataOcorrencia.split('/').reverse().join('-');
      matchesData = dataOcorrenciaFormatted === dataFilter;
    }
    
    return matchesSearch && matchesStatus && matchesTipo && matchesEquipe && matchesData;
   });

  // Abrir modal com detalhes
  const openModal = (ocorrencia: OcorrenciaLegacy) => {
    setSelectedOcorrencia(ocorrencia);
    setIsModalOpen(true);
  };

  // Fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOcorrencia(null);
  };

  // Abrir modal de adicionar
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Fechar modal de adicionar
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewOcorrencia({
      titulo: '',
      tipo: TIPOS_OCORRENCIA[0],

      status: 'Aberta',
      endereco: '',
      data_ocorrencia: '',
      hora_ocorrencia: '',
      descricao: '',
      equipe: EQUIPES[0],
      vitimas_fatais: 0,
      vitimas_feridas: 0,
      area: '',
      viaturas: '',
      equipamentos_utilizados: [],
      bombeiros_envolvidos: [],
      // Campos de cronologia
      hora_acionamento: '',
      hora_saida: '',
      hora_chegada: '',
      hora_termino: '',
      hora_retorno: '',
      descricao_detalhada: ''
    });
  };

  // Adicionar nova ocorrência
  const addOcorrencia = async () => {
    // Validação de campos obrigatórios
    const camposObrigatorios = [
      { campo: 'titulo', nome: 'Título da Ocorrência' },
      { campo: 'endereco', nome: 'Endereço' },
      { campo: 'data_ocorrencia', nome: 'Data da Ocorrência' },
      { campo: 'hora_ocorrencia', nome: 'Hora da Ocorrência' },
      { campo: 'descricao', nome: 'Descrição' }
    ];

    const camposFaltando = camposObrigatorios.filter(item => 
      !newOcorrencia[item.campo as keyof Ocorrencia] || 
      String(newOcorrencia[item.campo as keyof Ocorrencia]).trim() === ''
    );

    if (camposFaltando.length > 0) {
      const mensagem = `Por favor, preencha os seguintes campos obrigatórios:\n${camposFaltando.map(item => `• ${item.nome}`).join('\n')}`;
      alert(mensagem);
      return;
    }

    // Validação de formato de data e hora
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    const horaRegex = /^\d{2}:\d{2}$/;
    
    if (!dataRegex.test(newOcorrencia.data_ocorrencia || '')) {
      alert('Por favor, insira uma data válida no formato YYYY-MM-DD.');
      return;
    }
    
    if (!horaRegex.test(newOcorrencia.hora_ocorrencia || '')) {
      alert('Por favor, insira uma hora válida no formato HH:MM.');
      return;
    }

    try {
      setLoading(true);
      
      // Criar objeto da ocorrência para o Supabase
      const ocorrenciaData: Omit<Ocorrencia, 'id' | 'created_at' | 'updated_at' | 'tempo_total_minutos'> = {
        titulo: newOcorrencia.titulo!.trim(),
        tipo: newOcorrencia.tipo!,

        status: 'Aberta',
        endereco: newOcorrencia.endereco!.trim(),
        data_ocorrencia: newOcorrencia.data_ocorrencia!,
        hora_ocorrencia: newOcorrencia.hora_ocorrencia!,
        area: newOcorrencia.area || 'Não especificada',
        equipe: newOcorrencia.equipe!,
        bombeiros_envolvidos: newOcorrencia.bombeiros_envolvidos || [],
        hora_acionamento: newOcorrencia.hora_ocorrencia!, // Usar hora da ocorrência como padrão
        hora_saida: newOcorrencia.hora_ocorrencia!,
        hora_chegada: newOcorrencia.hora_ocorrencia!,
        hora_termino: newOcorrencia.hora_ocorrencia!,
        hora_retorno: newOcorrencia.hora_ocorrencia!,
        vitimas_fatais: newOcorrencia.vitimas_fatais || 0,
        vitimas_feridas: newOcorrencia.vitimas_feridas || 0,
        viaturas: newOcorrencia.viaturas || '',
        equipamentos_utilizados: newOcorrencia.equipamentos_utilizados || [],
        descricao: newOcorrencia.descricao!.trim(),
        descricao_detalhada: newOcorrencia.descricao_detalhada?.trim()
      };

      // Salvar no Supabase
      const novaOcorrencia = await ocorrenciaService.createOcorrencia(ocorrenciaData);
      
      // Converter para formato legacy e adicionar à lista
      const ocorrenciaLegacy: OcorrenciaLegacy = {
        id: novaOcorrencia.id || '',
        titulo: novaOcorrencia.titulo,
        tipo: novaOcorrencia.tipo,

        status: novaOcorrencia.status,
        endereco: novaOcorrencia.endereco,
        dataOcorrencia: formatDateForDisplay(novaOcorrencia.data_ocorrencia),
        horaOcorrencia: novaOcorrencia.hora_ocorrencia,
        responsavel: novaOcorrencia.responsavel_nome || 'Não informado',
        descricao: novaOcorrencia.descricao,
        equipesEnvolvidas: 1,
        tempoResposta: 'Pendente',
        descricaoDetalhada: novaOcorrencia.descricao_detalhada,
        equipe: novaOcorrencia.equipe,
        area: novaOcorrencia.area,
        vitimas_fatais: novaOcorrencia.vitimas_fatais,
        vitimas_feridas: novaOcorrencia.vitimas_feridas,
        horarioAcionamento: novaOcorrencia.hora_acionamento,
        horarioSaida: novaOcorrencia.hora_saida,
        horarioChegada: novaOcorrencia.hora_chegada,
        horarioTermino: novaOcorrencia.hora_termino,
        horarioRetorno: novaOcorrencia.hora_retorno,
        viaturas: novaOcorrencia.viaturas ? [novaOcorrencia.viaturas] : [],
        bombeirosEnvolvidos: novaOcorrencia.bombeiros_envolvidos || [],
        equipamentosUtilizados: novaOcorrencia.equipamentos_utilizados || []
      };

      // Adicionar à lista local
      setOcorrencias(prevOcorrencias => [ocorrenciaLegacy, ...prevOcorrencias]);
      
      // Mostrar mensagem de sucesso
      alert(`Ocorrência registrada com sucesso!\n\nTítulo: ${novaOcorrencia.titulo}\nTipo: ${novaOcorrencia.tipo}\nData/Hora: ${formatDateForDisplay(novaOcorrencia.data_ocorrencia)} às ${novaOcorrencia.hora_ocorrencia}`);
      
      // Fechar modal
      closeAddModal();
      
    } catch (error) {
      console.error('Erro ao registrar ocorrência:', error);
      alert('Erro ao registrar a ocorrência. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo da nova ocorrência
  const updateNewOcorrenciaField = (field: keyof Ocorrencia, value: any) => {
    setNewOcorrencia(prev => ({ ...prev, [field]: value }));
  };

  // Funções do Assistente de IA
  const openAiAssistant = () => {
    setIsAiAssistantOpen(true);
  };

  const closeAiAssistant = () => {
    setIsAiAssistantOpen(false);
    setAiMessage('');
    setAiResponse('');
  };

  const sendAiMessage = async () => {
    if (!aiMessage.trim()) return;
    
    setIsAiLoading(true);
    try {
      // Simulação de chamada para API de IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAiResponse(`Baseado na sua pergunta "${aiMessage}", posso ajudá-lo com informações sobre ocorrências aeroportuárias. Como assistente especializado, posso orientar sobre procedimentos, classificações de emergência, protocolos de segurança e preenchimento de relatórios.`);
    } catch (error) {
      setAiResponse('Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const correctText = async (text: string) => {
    if (!text.trim()) return;
    
    setIsCorrectingText(true);
    setOriginalText(text);
    
    try {
      // Simulação de correção de texto (substituir por chamada real para API de correção)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulação de correções básicas
      let corrected = text
        // Correções ortográficas básicas
        .replace(/\bvc\b/gi, 'você')
        .replace(/\btb\b/gi, 'também')
        .replace(/\bpq\b/gi, 'porque')
        .replace(/\bmto\b/gi, 'muito')
        .replace(/\bqdo\b/gi, 'quando')
        .replace(/\bqto\b/gi, 'quanto')
        .replace(/\bpra\b/gi, 'para')
        .replace(/\bmas\s+porem\b/gi, 'mas')
        .replace(/\bmais\s+porem\b/gi, 'mas porém')
        // Correções de concordância
        .replace(/\bfazem\s+(\d+)\s+anos?\b/gi, 'faz $1 anos')
        .replace(/\bhouveram\s+/gi, 'houve ')
        .replace(/\bexistem\s+(\d+)\s+anos?\b/gi, 'há $1 anos')
        // Correções de coerência
        .replace(/\b(\w+)\s+\1\b/gi, '$1') // Remove palavras duplicadas
        // Capitalização
        .replace(/^(\w)/gm, (match) => match.toUpperCase())
        // Pontuação
        .replace(/([.!?])\s*([a-z])/g, '$1 $2')
        .replace(/\s+([.!?])/g, '$1')
        .trim();
      
      setCorrectedText(corrected);
    } catch (error) {
      console.error('Erro ao corrigir texto:', error);
    } finally {
      setIsCorrectingText(false);
    }
  };

  const handleTextPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.length > 10) { // Só corrige textos com mais de 10 caracteres
      setTimeout(() => {
        correctText(pastedText);
      }, 100);
    }
  };

  const applyCorrection = () => {
    setAiMessage(correctedText);
    setCorrectedText('');
    setOriginalText('');
  };

  const discardCorrection = () => {
    setCorrectedText('');
    setOriginalText('');
  };

  // Funções de exportação
  const exportToPDF = () => {
    // Simulação de exportação para PDF
    const dataStr = JSON.stringify(filteredOcorrencias, null, 2);
    const dataBlob = new Blob([`Relatório de Ocorrências\n\nData: ${new Date().toLocaleDateString()}\n\nDados:\n${dataStr}`], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocorrencias_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // Simulação de exportação para Excel (CSV)
    const headers = ['ID', 'Título', 'Tipo', 'Status', 'Data', 'Hora', 'Responsável', 'Equipe'];
    const csvContent = [
      headers.join(','),
      ...filteredOcorrencias.map(ocorrencia => [
        ocorrencia.id,
        `"${ocorrencia.titulo}"`,
        `"${ocorrencia.tipo}"`,
        ocorrencia.status,
  
        ocorrencia.dataOcorrencia,
        ocorrencia.horaOcorrencia,
        `"${ocorrencia.responsavel}"`,
        `"${ocorrencia.equipe || 'Não informado'}"`
      ].join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocorrencias_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SidebarDemo>
      <div className="flex flex-col h-full">
        <Header userName={userData.userName} userEmail={userData.userEmail} />
        
        <div className="flex-1 bg-fog-gray/30 overflow-auto min-h-screen">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Cabeçalho */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-coal-black mb-2">Gestão de Ocorrências</h1>
              <p className="text-coal-black/70">Controle completo das ocorrências da corporação</p>
            </div>
            
            {/* Botão Adicionar */}
            <div className="mb-6">
              <button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-radiant-orange to-radiant-orange/80 hover:from-radiant-orange/90 hover:to-radiant-orange/70 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nova ocorrência
                </button>
            </div>
            

            
            {/* Filtros */}
            <div className="bg-pure-white rounded-lg shadow-sm border border-fog-gray/20 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coal-black mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coal-black/40 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por título, endereço ou responsável..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-fog-gray/30 rounded-lg focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-coal-black mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-fog-gray/30 rounded-lg focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                  >
                    <option value="Todos">Todos os status</option>
                    <option value="Aberta">Aberta</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Resolvida">Resolvida</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-coal-black mb-2">Tipo</label>
                  <select
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-fog-gray/30 rounded-lg focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                  >
                    <option value="Todos">Todos os tipos</option>
                    <option value="Atendimento à Aeronave Presidencial">Atendimento à Aeronave Presidencial</option>
                    <option value="Condições de Baixa Visibilidade">Condições de Baixa Visibilidade</option>
                    <option value="Emergências Médicas em Geral">Emergências Médicas em Geral</option>
                    <option value="Iluminação de Emergência em Pista de Pouso e Decolagem">Iluminação de Emergência em Pista de Pouso e Decolagem</option>
                    <option value="Incêndio em Instalações Aeroportuárias">Incêndio em Instalações Aeroportuárias</option>
                    <option value="Incêndios Florestais ou em Áreas de Cobertura Vegetal Próximas ao Aeródromo">Incêndios Florestais ou em Áreas de Cobertura Vegetal Próximas ao Aeródromo</option>
                    <option value="Incêndios ou Vazamentos de Combustíveis no PAA">Incêndios ou Vazamentos de Combustíveis no PAA</option>
                    <option value="Ocorrência aeronáutica">Ocorrência aeronáutica</option>
                    <option value="Ocorrências com Artigos Perigosos">Ocorrências com Artigos Perigosos</option>
                    <option value="Remoção de Animais e Dispersão de Avifauna">Remoção de Animais e Dispersão de Avifauna</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-coal-black mb-2">Equipe</label>
                  <select
                    value={equipeFilter}
                    onChange={(e) => setEquipeFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-fog-gray/30 rounded-lg focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                  >
                    <option value="Todos">Todas as equipes</option>
                    <option value="Equipe Alpha">Equipe Alpha</option>
                    <option value="Equipe Bravo">Equipe Bravo</option>
                    <option value="Equipe Charlie">Equipe Charlie</option>
                    <option value="Equipe Delta">Equipe Delta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-coal-black mb-2">Data</label>
                  <input
                    type="date"
                    value={dataFilter}
                    onChange={(e) => setDataFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-fog-gray/30 rounded-lg focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Título do Histórico */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-coal-black flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-radiant-orange to-radiant-orange/70 rounded-full"></div>
                Histórico de ocorrências da SCI
              </h2>
              <p className="text-coal-black/60 mt-2 ml-7">
                Registro completo de todas as ocorrências atendidas pela Seção Contra Incêndio
              </p>
            </div>

            {/* Lista de Ocorrências - Design Moderno */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOcorrencias.map((ocorrencia) => (
                <div 
                  key={ocorrencia.id} 
                  className="bg-white rounded-2xl p-6 shadow-lg border border-fog-gray/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group animate-scaleIn"
                  onClick={() => openModal(ocorrencia)}
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-radiant-orange/10 to-radiant-orange/5 rounded-xl p-3 group-hover:from-radiant-orange/20 group-hover:to-radiant-orange/10 transition-all duration-300">
                        {getTipoIcon(ocorrencia.tipo, 'w-6 h-6')}
                      </div>
                      <div>
                        <h3 className="font-bold text-coal-black text-lg line-clamp-1">{ocorrencia.titulo}</h3>
                        <p className="text-sm text-coal-black/60">{ocorrencia.tipo}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ocorrencia.status)}`}>
                        {ocorrencia.status}
                      </span>

                    </div>
                  </div>

                  {/* Informações Principais */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-coal-black/70">
                      <MapPin className="w-4 h-4 text-radiant-orange" />
                      <span className="line-clamp-1">{ocorrencia.endereco}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-coal-black/70">
                      <Calendar className="w-4 h-4 text-radiant-orange" />
                      <span>{ocorrencia.dataOcorrencia} às {ocorrencia.horaOcorrencia}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-coal-black/70">
                      <Users className="w-4 h-4 text-radiant-orange" />
                      <span>{ocorrencia.equipe || 'Não informado'}</span>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="mb-4">
                    <p className="text-sm text-coal-black/80 line-clamp-2">{ocorrencia.descricao}</p>
                  </div>

                  {/* Estatísticas */}
                  <div className="flex items-center justify-between pt-4 border-t border-fog-gray/20">
                    <div className="flex items-center gap-4">
                      {((ocorrencia.vitimas_fatais || 0) > 0 || (ocorrencia.vitimas_feridas || 0) > 0) && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-coal-black/60">
                            {(ocorrencia.vitimas_fatais || 0) + (ocorrencia.vitimas_feridas || 0)} vítimas
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-coal-black/40" />
                        <span className="text-xs text-coal-black/60">{ocorrencia.tempoResposta}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToPDF();
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Exportar PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToExcel();
                        }}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Exportar Excel"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Estado Vazio */}
            {filteredOcorrencias.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-fog-gray/10">
                <div className="bg-gradient-to-br from-fog-gray/10 to-fog-gray/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-12 h-12 text-coal-black/30" />
                </div>
                <h3 className="text-xl font-bold text-coal-black mb-2">Nenhuma ocorrência encontrada</h3>
                <p className="text-coal-black/60 mb-6">Tente ajustar os filtros ou adicionar uma nova ocorrência.</p>
                <button
                  onClick={openAddModal}
                  className="px-6 py-3 bg-gradient-to-r from-radiant-orange to-radiant-orange/90 text-white rounded-xl font-semibold hover:from-radiant-orange/90 hover:to-radiant-orange transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Adicionar Primeira Ocorrência
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de Detalhes - Versão Moderna */}
        {isModalOpen && selectedOcorrencia && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-pure-white to-fog-gray/5 rounded-3xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-fog-gray/20 overflow-hidden animate-slideUp">
              
              {/* Cabeçalho Moderno */}
              <div className="relative bg-gradient-to-r from-radiant-orange via-radiant-orange/90 to-orange-500 p-8">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                        {getTipoIcon(selectedOcorrencia.tipo, 'w-8 h-8 text-white')}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Detalhes da Ocorrência</h2>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedOcorrencia.status)} bg-white/20 backdrop-blur-sm border-white/30`}>
                            {selectedOcorrencia.status}
                          </span>

                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Conteúdo Principal */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Coluna Principal - Informações Básicas */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Card de Informações Básicas */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-fog-gray/10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-gradient-to-r from-radiant-orange to-orange-500 rounded-full"></div>
                        <h3 className="text-xl font-bold text-coal-black">Informações Básicas</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-fog-gray/5 to-transparent rounded-xl p-4">
                          <label className="text-sm font-semibold text-coal-black/60 uppercase tracking-wide">Título</label>
                          <p className="text-lg font-semibold text-coal-black mt-1">{selectedOcorrencia.titulo}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-fog-gray/5 to-transparent rounded-xl p-4">
                            <label className="text-sm font-semibold text-coal-black/60 uppercase tracking-wide">Tipo</label>
                            <div className="flex items-center gap-2 mt-1">
                              {getTipoIcon(selectedOcorrencia.tipo, 'w-5 h-5 text-radiant-orange')}
                              <span className="font-semibold text-coal-black">{selectedOcorrencia.tipo}</span>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-fog-gray/5 to-transparent rounded-xl p-4">
                            <label className="text-sm font-semibold text-coal-black/60 uppercase tracking-wide">Responsável</label>
                            <p className="font-semibold text-coal-black mt-1">{selectedOcorrencia.responsavel}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card de Localização e Tempo */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-fog-gray/10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-coal-black">Localização e Tempo</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-xl p-4">
                          <label className="text-sm font-semibold text-coal-black/60 uppercase tracking-wide">Endereço</label>
                          <p className="font-semibold text-coal-black mt-1">{selectedOcorrencia.endereco}</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-xl p-4">
                          <label className="text-sm font-semibold text-coal-black/60 uppercase tracking-wide">Data e Hora</label>
                          <p className="font-semibold text-coal-black mt-1">{selectedOcorrencia.dataOcorrencia} às {selectedOcorrencia.horaOcorrencia}</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-xl p-4">
                          <label className="text-sm font-semibold text-coal-black/60 uppercase tracking-wide">Tempo de Resposta</label>
                          <p className="font-semibold text-coal-black mt-1">{selectedOcorrencia.tempoResposta}</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-xl p-4">
                          <label className="text-sm font-semibold text-coal-black/60 uppercase tracking-wide">Equipes Envolvidas</label>
                          <p className="font-semibold text-coal-black mt-1">{selectedOcorrencia.equipesEnvolvidas} equipe(s)</p>
                        </div>
                      </div>
                    </div>

                    {/* Card de Descrição */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-fog-gray/10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-coal-black">Descrição</h3>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-transparent rounded-xl p-4">
                        <p className="text-coal-black leading-relaxed">{selectedOcorrencia.descricao}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar - Estatísticas e Informações Adicionais */}
                  <div className="space-y-6">
                    
                    {/* Card de Status */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-fog-gray/10">
                      <h3 className="text-lg font-bold text-coal-black mb-4">Status da Ocorrência</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-coal-black/60">Status Atual</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOcorrencia.status)}`}>
                            {selectedOcorrencia.status}
                          </span>
                        </div>

                      </div>
                    </div>

                    {/* Card de Cronologia */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-fog-gray/10">
                      <h3 className="text-lg font-bold text-coal-black mb-4">Cronologia</h3>
                      <div className="space-y-4">
                        {selectedOcorrencia.cronologia && selectedOcorrencia.cronologia.length > 0 ? (
                          selectedOcorrencia.cronologia.map((evento, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-radiant-orange rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-semibold text-coal-black">{evento.hora}</p>
                                <p className="text-sm text-coal-black/70">{evento.descricao}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-coal-black/60 italic">Nenhum evento registrado</p>
                        )}
                      </div>
                    </div>

                    {/* Card de Vítimas */}
                    {(selectedOcorrencia.vitimas || (selectedOcorrencia.vitimas_fatais || 0) > 0 || (selectedOcorrencia.vitimas_feridas || 0) > 0) && (
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-fog-gray/10">
                        <h3 className="text-lg font-bold text-coal-black mb-4">Vítimas</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-coal-black/60">Fatais</span>
                            <span className="text-lg font-bold text-red-600">{selectedOcorrencia.vitimas_fatais || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-coal-black/60">Feridas</span>
                            <span className="text-lg font-bold text-orange-600">{selectedOcorrencia.vitimas_feridas || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card de Recursos */}
                    {selectedOcorrencia.recursos && selectedOcorrencia.recursos.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-fog-gray/10">
                        <h3 className="text-lg font-bold text-coal-black mb-4">Recursos Utilizados</h3>
                        <div className="space-y-2">
                          {selectedOcorrencia.recursos.map((recurso, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-coal-black">{recurso}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rodapé com Ações */}
              <div className="bg-gradient-to-r from-fog-gray/5 to-transparent p-6 border-t border-fog-gray/20">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-coal-black/60">
                    Última atualização: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      Editar
                    </button>
                    <button 
                      onClick={closeModal}
                      className="px-6 py-2 bg-gradient-to-r from-fog-gray/20 to-fog-gray/30 text-coal-black rounded-xl font-semibold hover:from-fog-gray/30 hover:to-fog-gray/40 transition-all duration-200"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Botão de IA Assistente */}
        {isAddModalOpen && (
          <button
              onClick={openAiAssistant}
              className="fixed top-4 right-4 z-[60] bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-5 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 animate-pulse hover:animate-none ring-4 ring-purple-300/30 hover:ring-purple-400/50"
              title="Assistente de IA"
            >
              <Brain className="h-8 w-8" />
            </button>
        )}

        {/* Modal de Adicionar */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-pure-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-fog-gray/20">
              {/* Cabeçalho do Modal */}
              <div className="bg-gradient-to-r from-radiant-orange to-radiant-orange/90 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-pure-white flex items-center gap-3">
                      <Plus className="w-8 h-8" />
                      Nova Ocorrência
                    </h2>
                    <p className="text-pure-white/80 text-sm mt-1">Registre uma nova ocorrência no sistema</p>
                  </div>
                  <button
                    onClick={closeAddModal}
                    className="bg-pure-white/20 backdrop-blur-sm rounded-xl p-2 text-pure-white hover:bg-pure-white/30 transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal - Com Scroll */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-pure-white to-fog-gray/5">
                
                {/* Seção Informações Básicas */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-5 mb-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-coal-black mb-2">Título da Ocorrência *</label>
                      <input
                        type="text"
                        value={newOcorrencia.titulo || ''}
                        onChange={(e) => updateNewOcorrenciaField('titulo', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="Digite o título da ocorrência"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Tipo de Ocorrência *</label>
                      <select
                        value={newOcorrencia.tipo || ''}
                        onChange={(e) => updateNewOcorrenciaField('tipo', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      >
                        <option value="">Selecione o tipo</option>
                        {TIPOS_OCORRENCIA.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-coal-black mb-2">Endereço/Local *</label>
                      <input
                        type="text"
                        value={newOcorrencia.endereco || ''}
                        onChange={(e) => updateNewOcorrenciaField('endereco', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="Digite o endereço ou local da ocorrência"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Data da Ocorrência *</label>
                      <input
                        type="date"
                        value={newOcorrencia.data_ocorrencia || ''}
                        onChange={(e) => updateNewOcorrenciaField('data_ocorrencia', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Hora da Ocorrência *</label>
                      <input
                        type="time"
                        value={newOcorrencia.hora_ocorrencia || ''}
                        onChange={(e) => updateNewOcorrenciaField('hora_ocorrencia', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Equipe *</label>
                      <select
                        value={newOcorrencia.equipe || ''}
                        onChange={(e) => updateNewOcorrenciaField('equipe', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      >
                        <option value="">Selecione uma equipe</option>
                        {EQUIPES.map(equipe => (
                          <option key={equipe} value={equipe}>{equipe}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Área do Evento</label>
                      <input
                        type="text"
                        value={newOcorrencia.area || ''}
                        onChange={(e) => updateNewOcorrenciaField('area', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="Digite a área do evento"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-coal-black mb-2">Descrição *</label>
                      <textarea
                        value={newOcorrencia.descricao || ''}
                        onChange={(e) => updateNewOcorrenciaField('descricao', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 min-h-[100px]"
                        placeholder="Descreva a ocorrência..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Seção de Recursos */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-5 mb-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Recursos Utilizados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Viaturas</label>
                      <input
                        type="text"
                        value={newOcorrencia.viaturas || ''}
                        onChange={(e) => updateNewOcorrenciaField('viaturas', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="Ex: ABT-01, ABT-02"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Bombeiros Envolvidos</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nome do bombeiro"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                const nome = e.currentTarget.value.trim();
                                const bombeiros = newOcorrencia.bombeiros_envolvidos || [];
                                if (!bombeiros.includes(nome)) {
                                  updateNewOcorrenciaField('bombeiros_envolvidos', [...bombeiros, nome]);
                                }
                                e.currentTarget.value = '';
                              }
                            }}
                            className="flex-1 px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                          />
                        </div>
                        {newOcorrencia.bombeiros_envolvidos && newOcorrencia.bombeiros_envolvidos.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Bombeiros selecionados:</p>
                            <div className="flex flex-wrap gap-2">
                              {newOcorrencia.bombeiros_envolvidos.map((bombeiro, index) => (
                                <div key={index} className="flex items-center bg-radiant-orange/10 text-radiant-orange px-3 py-2 rounded-lg border border-radiant-orange/20">
                                  <span className="text-sm font-medium">👨‍🚒 {bombeiro}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const bombeiros = newOcorrencia.bombeiros_envolvidos?.filter((_, i) => i !== index) || [];
                                      updateNewOcorrenciaField('bombeiros_envolvidos', bombeiros);
                                    }}
                                    className="ml-2 text-radiant-orange hover:text-red-600 transition-colors"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                


                {/* Seção de Vítimas */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-5 mb-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Vítimas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Vítimas Fatais</label>
                      <input
                        type="number"
                        min="0"
                        value={newOcorrencia.vitimas_fatais || ''}
                        onChange={(e) => updateNewOcorrenciaField('vitimas_fatais', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Vítimas Feridas</label>
                      <input
                        type="number"
                        min="0"
                        value={newOcorrencia.vitimas_feridas || ''}
                        onChange={(e) => updateNewOcorrenciaField('vitimas_feridas', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção de Cronologia */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-5 mb-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
              Cronologia da Ocorrência
            </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Horário de Acionamento *</label>
                      <input
                        type="time"
                        step="60"
                        value={newOcorrencia.hora_acionamento || ''}
                        onChange={(e) => updateNewOcorrenciaField('hora_acionamento', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Horário de Saída *</label>
                      <input
                        type="time"
                        step="60"
                        value={newOcorrencia.hora_saida || ''}
                        onChange={(e) => updateNewOcorrenciaField('hora_saida', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Horário de Chegada no Local *</label>
                      <input
                        type="time"
                        step="60"
                        value={newOcorrencia.hora_chegada || ''}
                        onChange={(e) => updateNewOcorrenciaField('hora_chegada', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Horário de Término da Ocorrência *</label>
                      <input
                        type="time"
                        step="60"
                        value={newOcorrencia.hora_termino || ''}
                        onChange={(e) => updateNewOcorrenciaField('hora_termino', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Horário de Retorno à SCI *</label>
                      <input
                        type="time"
                        step="60"
                        value={newOcorrencia.hora_retorno || ''}
                        onChange={(e) => updateNewOcorrenciaField('hora_retorno', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Tempo Gasto na Ocorrência</label>
                      <div className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl bg-gray-50 text-gray-700 font-medium">
                        {(() => {
                          if (newOcorrencia.hora_acionamento && newOcorrencia.hora_retorno) {
                            const inicio = new Date(`2000-01-01T${newOcorrencia.hora_acionamento}:00`);
                            const fim = new Date(`2000-01-01T${newOcorrencia.hora_retorno}:00`);
                            const diffMs = fim.getTime() - inicio.getTime();
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            return `${diffHours}h ${diffMinutes}min`;
                          }
                          return 'Preencha os horários';
                        })()} 
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Seção Recursos Utilizados */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-5 mb-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
              Recursos Utilizados
            </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Viaturas</label>
                      <input
                        type="text"
                        value={newOcorrencia.viaturas || ''}
                        onChange={(e) => updateNewOcorrenciaField('viaturas', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="Ex: ABT-01, ABM-02"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Equipamentos</label>
                      <input
                        type="text"
                        value={Array.isArray(newOcorrencia.equipamentos_utilizados) ? newOcorrencia.equipamentos_utilizados.join(', ') : (newOcorrencia.equipamentos_utilizados || '')}
                        onChange={(e) => updateNewOcorrenciaField('equipamentos_utilizados', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="Ex: Mangueiras, EPIs, Desencarcerador"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção Descrição Detalhada */}
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-5 mb-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
              Descrição Detalhada
            </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Descrição Inicial da Ocorrência</label>
                      <textarea
                        value={newOcorrencia.descricao || ''}
                        onChange={(e) => updateNewOcorrenciaField('descricao', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-fog-gray/40 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 resize-vertical bg-white"
                        placeholder="Descreva detalhadamente a ocorrência, procedimentos realizados, observações importantes..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Descrição Complementar da Ocorrência</label>
                      <textarea
                        value={newOcorrencia.descricao_detalhada || ''}
                        onChange={(e) => updateNewOcorrenciaField('descricao_detalhada', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-fog-gray/40 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 resize-vertical bg-white"
                        placeholder="Forneça uma descrição mais detalhada da ocorrência..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>



              </div>
              
              {/* Rodapé Fixo com Botões */}
              <div className="border-t border-fog-gray/20 bg-pure-white p-6 flex justify-between items-center rounded-b-2xl">
                <p className="text-sm text-coal-black/60">* Campos obrigatórios</p>
                <div className="flex gap-4">
                  <button
                    onClick={closeAddModal}
                    className="px-8 py-3 border-2 border-fog-gray/30 text-coal-black rounded-xl hover:bg-fog-gray/10 hover:border-fog-gray/50 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addOcorrencia}
                    className="bg-gradient-to-r from-radiant-orange to-radiant-orange/90 hover:from-radiant-orange/90 hover:to-radiant-orange text-pure-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Registrar Ocorrência
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal do Assistente de IA */}
        {isAiAssistantOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-end pr-8 z-[60]">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto mr-4 shadow-2xl border border-purple-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    Assistente de Correção IA
                  </h2>
                  <button
                    onClick={closeAiAssistant}
                    className="text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg border border-purple-200">
                    <p className="text-purple-800 text-sm font-medium">
                      ✨ Olá! Sou seu assistente inteligente de correção textual. 
                      Especializado em aprimorar seus textos com correções ortográficas, 
                      gramaticais e de coerência para relatórios profissionais.
                    </p>
                  </div>

                {aiResponse && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Resposta:</h4>
                    <p className="text-gray-700 text-sm">{aiResponse}</p>
                  </div>
                )}

                {/* Seção de Correção de Texto */}
                {(isCorrectingText || correctedText) && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-300 p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                      {isCorrectingText ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                          🔍 Analisando e corrigindo seu texto...
                        </>
                      ) : (
                        <>
                          <span className="text-purple-600">✨</span>
                          Texto corrigido e aprimorado:
                        </>
                      )}
                    </h4>
                    {correctedText && (
                      <>
                        <div className="bg-white p-3 rounded-lg border border-purple-200 mb-3 shadow-sm">
                          <p className="text-sm text-gray-700 leading-relaxed">{correctedText}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={applyCorrection}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-1 shadow-md"
                          >
                            ✓ Aplicar Correção
                          </button>
                          <button
                            onClick={discardCorrection}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-md"
                          >
                            ✗ Descartar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-purple-700">
                    📝 Seu texto para correção:
                    <span className="text-xs text-purple-500 block mt-1 font-normal">
                      ✨ Cole qualquer texto aqui e eu o corrigirei automaticamente
                    </span>
                  </label>
                  <textarea
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onPaste={handleTextPaste}
                    placeholder="Cole ou digite seu texto aqui para correção automática de ortografia, gramática e coerência..."
                    className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none bg-white shadow-sm transition-all duration-200"
                    rows={4}
                  />
                  <button
                    onClick={sendAiMessage}
                    disabled={isAiLoading || !aiMessage.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md font-medium"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando correção...
                      </>
                    ) : (
                      <>
                         <Send className="h-4 w-4" />
                         Corrigir Texto
                       </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarDemo>
  );
}