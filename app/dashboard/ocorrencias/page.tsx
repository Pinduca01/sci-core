'use client';

import Header from '@/components/ui/header';
import { SidebarDemo } from '@/components/ui/sidebar-demo';
import { useState } from 'react';
import { Search, Filter, FileText, AlertTriangle, Car, Flame, Users, Edit, X, Phone, Mail, MapPin, Calendar, DollarSign, Plus, Upload, Trash2, UserPlus, Eye, Clock, CheckCircle, XCircle, AlertCircle, Brain, Send, Loader2, Download } from 'lucide-react';

// Tipos para os dados
interface Ocorrencia {
  id: number;
  titulo: string;
  tipo: 'Incêndios ou Vazamentos de Combustíveis no PAA' | 'Condições de Baixa Visibilidade' | 'Atendimento à Aeronave Presidencial' | 'Incêndio em Instalações Aeroportuárias' | 'Ocorrências com Artigos Perigosos' | 'Remoção de Animais e Dispersão de Avifauna' | 'Incêndios Florestais ou em Áreas de Cobertura Vegetal Próximas ao Aeródromo' | 'Emergências Médicas em Geral' | 'Iluminação de Emergência em Pista de Pouso e Decolagem' | 'Ocorrência aeronáutica';
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
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
  horarioAcionamento?: string;
  horarioSaida?: string;
  horarioChegada?: string;
  horarioTermino?: string;
  horarioRetorno?: string;
  // Campos de vítimas
  numeroVitimas?: number;
  vitimasIlesas?: number;
  vitimasFeridas?: number;
  vitimasObito?: number;
  // Campos de recursos
  viaturas?: string[];
  bombeirosEnvolvidos?: string[];
  equipamentosUtilizados?: string[];
  // Campos legados (manter compatibilidade)
  equipe?: string;
  area?: string;
  data?: string;
  aeroporto?: string;
  vitimasFatais?: number;
  horaAcionamento?: string;
  horaSaida?: string;
  horaChegada?: string;
  horaTermino?: string;
  horaRetorno?: string;
  declaracaoSucinta?: string;
}

// Dados mockados
const ocorrenciasMock: Ocorrencia[] = [
  {
    id: 1,
    titulo: 'Incêndio em Residência',
    tipo: 'Incêndios ou Vazamentos de Combustíveis no PAA',
    prioridade: 'Alta',
    status: 'Resolvida',
    endereco: 'Rua das Flores, 123 - Centro',
    dataOcorrencia: '15/03/2024',
    horaOcorrencia: '14:30',
    responsavel: 'João Silva Santos',
    descricao: 'Incêndio em cozinha de residência unifamiliar',
    equipesEnvolvidas: 2,
    tempoResposta: '8 min',
    equipe: 'Equipe Alpha'
  },
  {
    id: 2,
    titulo: 'Resgate em Altura',
    tipo: 'Emergências Médicas em Geral',
    prioridade: 'Crítica',
    status: 'Em Andamento',
    endereco: 'Av. Principal, 456 - Jardim',
    dataOcorrencia: '16/03/2024',
    horaOcorrencia: '09:15',
    responsavel: 'Maria Oliveira Costa',
    descricao: 'Trabalhador preso em andaime de prédio em construção',
    equipesEnvolvidas: 3,
    tempoResposta: '12 min',
    equipe: 'Equipe Bravo'
  },
  {
    id: 3,
    titulo: 'Acidente de Trânsito',
    tipo: 'Ocorrência aeronáutica',
    prioridade: 'Média',
    status: 'Aberta',
    endereco: 'Rua da Paz, 789 - Vila Nova',
    dataOcorrencia: '16/03/2024',
    horaOcorrencia: '16:45',
    responsavel: 'Carlos Roberto Lima',
    descricao: 'Colisão entre dois veículos com vítimas presas',
    equipesEnvolvidas: 2,
    tempoResposta: 'Pendente',
    equipe: 'Equipe Charlie'
  }
];

export default function OcorrenciasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [equipeFilter, setEquipeFilter] = useState('Todos');
  const [dataFilter, setDataFilter] = useState('');
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(ocorrenciasMock);
  const [newOcorrencia, setNewOcorrencia] = useState<Partial<Ocorrencia>>({
    titulo: '',
    tipo: 'Incêndios ou Vazamentos de Combustíveis no PAA',
    prioridade: 'Média',
    status: 'Aberta',
    endereco: '',
    dataOcorrencia: '',
    horaOcorrencia: '',
    responsavel: '',
    descricao: '',
    equipesEnvolvidas: 1,
    tempoResposta: 'Pendente'
  });
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [isCorrectingText, setIsCorrectingText] = useState(false);

  // Dados mockados do usuário
  const userData = {
    userName: 'Usuário',
    userEmail: 'usuario@empresa.com'
  };

  // Função para obter ícone do tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Incêndio': return <Flame className="w-5 h-5 text-red-600" />;
      case 'Resgate': return <Users className="w-5 h-5 text-blue-600" />;
      case 'Acidente': return <Car className="w-5 h-5 text-yellow-600" />;
      case 'Emergência Médica': return <AlertTriangle className="w-5 h-5 text-green-600" />;
      case 'Vazamento': return <AlertCircle className="w-5 h-5 text-purple-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
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

  // Função para obter cor da prioridade
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Baixa': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Crítica': return 'bg-red-100 text-red-800 border-red-200';
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
  const openModal = (ocorrencia: Ocorrencia) => {
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
      tipo: 'Incêndios ou Vazamentos de Combustíveis no PAA',
      prioridade: 'Média',
      status: 'Aberta',
      endereco: '',
      dataOcorrencia: '',
      horaOcorrencia: '',
      responsavel: '',
      descricao: '',
      equipesEnvolvidas: 1,
      tempoResposta: 'Pendente'
    });
  };

  // Adicionar nova ocorrência
  const addOcorrencia = () => {
    // Validação de campos obrigatórios
    const camposObrigatorios = [
      { campo: 'titulo', nome: 'Título da Ocorrência' },
      { campo: 'endereco', nome: 'Endereço' },
      { campo: 'responsavel', nome: 'Responsável' },
      { campo: 'dataOcorrencia', nome: 'Data da Ocorrência' },
      { campo: 'horaOcorrencia', nome: 'Hora da Ocorrência' }
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
    
    if (!dataRegex.test(newOcorrencia.dataOcorrencia || '')) {
      alert('Por favor, insira uma data válida no formato correto.');
      return;
    }
    
    if (!horaRegex.test(newOcorrencia.horaOcorrencia || '')) {
      alert('Por favor, insira uma hora válida no formato correto.');
      return;
    }

    try {
      // Gerar novo ID
      const newId = ocorrencias.length > 0 ? Math.max(...ocorrencias.map(o => o.id)) + 1 : 1;
      
      // Criar objeto da ocorrência
      const ocorrenciaToAdd: Ocorrencia = {
         id: newId,
         titulo: newOcorrencia.titulo!.trim(),
         tipo: newOcorrencia.tipo as 'Incêndios ou Vazamentos de Combustíveis no PAA' | 'Condições de Baixa Visibilidade' | 'Atendimento à Aeronave Presidencial' | 'Incêndio em Instalações Aeroportuárias' | 'Ocorrências com Artigos Perigosos' | 'Remoção de Animais e Dispersão de Avifauna' | 'Incêndios Florestais ou em Áreas de Cobertura Vegetal Próximas ao Aeródromo' | 'Emergências Médicas em Geral' | 'Iluminação de Emergência em Pista de Pouso e Decolagem' | 'Ocorrência aeronáutica',
         prioridade: newOcorrencia.prioridade as 'Baixa' | 'Média' | 'Alta' | 'Crítica',
         status: 'Aberta', // Sempre inicia como 'Aberta'
         endereco: newOcorrencia.endereco!.trim(),
         dataOcorrencia: newOcorrencia.dataOcorrencia!,
         horaOcorrencia: newOcorrencia.horaOcorrencia!,
         responsavel: newOcorrencia.responsavel!.trim(),
         descricao: newOcorrencia.descricao?.trim() || '',
         equipesEnvolvidas: newOcorrencia.equipesEnvolvidas || 1,
         tempoResposta: 'Pendente',
        descricaoDetalhada: newOcorrencia.descricaoDetalhada?.trim() || '',
        // Campos de cronologia
        horarioAcionamento: newOcorrencia.horarioAcionamento || '',
        horarioSaida: newOcorrencia.horarioSaida || '',
        horarioChegada: newOcorrencia.horarioChegada || '',
        horarioTermino: newOcorrencia.horarioTermino || '',
        horarioRetorno: newOcorrencia.horarioRetorno || '',
        // Campos de vítimas
        numeroVitimas: newOcorrencia.numeroVitimas || 0,
        vitimasIlesas: newOcorrencia.vitimasIlesas || 0,
        vitimasFeridas: newOcorrencia.vitimasFeridas || 0,
        vitimasObito: newOcorrencia.vitimasObito || 0,
        // Campos de recursos
        viaturas: newOcorrencia.viaturas || [],
        bombeirosEnvolvidos: newOcorrencia.bombeirosEnvolvidos || [],
        equipamentosUtilizados: newOcorrencia.equipamentosUtilizados || []
      };

      // Adicionar a ocorrência à lista
      setOcorrencias(prevOcorrencias => [...prevOcorrencias, ocorrenciaToAdd]);
      
      // Mostrar mensagem de sucesso
      alert(`Ocorrência #${newId} registrada com sucesso!\n\nTítulo: ${ocorrenciaToAdd.titulo}\nTipo: ${ocorrenciaToAdd.tipo}\nData/Hora: ${ocorrenciaToAdd.dataOcorrencia} às ${ocorrenciaToAdd.horaOcorrencia}`);
      
      // Fechar modal
      closeAddModal();
      
    } catch (error) {
      console.error('Erro ao registrar ocorrência:', error);
      alert('Erro interno ao registrar a ocorrência. Tente novamente.');
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
    const headers = ['ID', 'Título', 'Tipo', 'Status', 'Prioridade', 'Data', 'Hora', 'Responsável', 'Equipe'];
    const csvContent = [
      headers.join(','),
      ...filteredOcorrencias.map(ocorrencia => [
        ocorrencia.id,
        `"${ocorrencia.titulo}"`,
        `"${ocorrencia.tipo}"`,
        ocorrencia.status,
        ocorrencia.prioridade,
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

            {/* Lista de Ocorrências */}
            <div className="bg-pure-white rounded-lg shadow-sm border border-fog-gray/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-fog-gray/10 border-b border-fog-gray/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-coal-black">Tipo de Ocorrência</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-coal-black">Equipe</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-coal-black">Data/Hora da Ocorrência</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-coal-black">Ações</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-fog-gray/10">
                    {filteredOcorrencias.map((ocorrencia) => (
                      <tr key={ocorrencia.id} className="hover:bg-fog-gray/5 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getTipoIcon(ocorrencia.tipo)}
                            <span className="text-sm font-medium text-coal-black">{ocorrencia.tipo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-coal-black">{ocorrencia.equipe || 'Não informado'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-coal-black">
                            <div>{ocorrencia.dataOcorrencia}</div>
                            <div className="text-coal-black/60">{ocorrencia.horaOcorrencia}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(ocorrencia)}
                              className="text-gray-500 hover:text-blue-600 p-1 rounded transition-all duration-200"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                               onClick={exportToPDF}
                               className="text-red-500 hover:text-red-700 p-1 rounded transition-all duration-200"
                               title="Exportar PDF"
                             >
                               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                 <text x="12" y="16" fontSize="6" textAnchor="middle" fill="white">PDF</text>
                               </svg>
                             </button>
                             <button
                               onClick={exportToExcel}
                               className="text-green-600 hover:text-green-800 p-1 rounded transition-all duration-200"
                               title="Exportar Excel"
                             >
                               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                 <text x="12" y="16" fontSize="5" textAnchor="middle" fill="white">XLS</text>
                               </svg>
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredOcorrencias.length === 0 && (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-coal-black/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-coal-black mb-2">Nenhuma ocorrência encontrada</h3>
                    <p className="text-coal-black/60">Tente ajustar os filtros ou adicionar uma nova ocorrência.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de Detalhes */}
        {isModalOpen && selectedOcorrencia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-coal-black">Detalhes da Ocorrência</h2>
                  <button
                    onClick={closeModal}
                    className="text-coal-black/60 hover:text-coal-black transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-coal-black mb-2">Informações Básicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-coal-black/60">Título</label>
                        <p className="font-medium text-coal-black">{selectedOcorrencia.titulo}</p>
                      </div>
                      <div>
                        <label className="text-sm text-coal-black/60">Tipo</label>
                        <div className="flex items-center gap-2">
                          {getTipoIcon(selectedOcorrencia.tipo)}
                          <span className="font-medium text-coal-black">{selectedOcorrencia.tipo}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-coal-black/60">Prioridade</label>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getPrioridadeColor(selectedOcorrencia.prioridade)}`}>
                          {selectedOcorrencia.prioridade}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm text-coal-black/60">Status</label>
                        <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedOcorrencia.status)}`}>
                          {selectedOcorrencia.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-coal-black mb-2">Localização e Tempo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-coal-black/60">Endereço</label>
                        <p className="font-medium text-coal-black">{selectedOcorrencia.endereco}</p>
                      </div>
                      <div>
                        <label className="text-sm text-coal-black/60">Data e Hora</label>
                        <p className="font-medium text-coal-black">{selectedOcorrencia.dataOcorrencia} às {selectedOcorrencia.horaOcorrencia}</p>
                      </div>
                      <div>
                        <label className="text-sm text-coal-black/60">Tempo de Resposta</label>
                        <p className="font-medium text-coal-black">{selectedOcorrencia.tempoResposta}</p>
                      </div>
                      <div>
                        <label className="text-sm text-coal-black/60">Equipes Envolvidas</label>
                        <p className="font-medium text-coal-black">{selectedOcorrencia.equipesEnvolvidas} equipe(s)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-coal-black mb-2">Responsável</h3>
                    <p className="font-medium text-coal-black">{selectedOcorrencia.responsavel}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-coal-black mb-2">Descrição</h3>
                    <p className="text-coal-black">{selectedOcorrencia.descricao}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-coal-black mb-2">Aeroporto *</label>
                      <select
                        value={newOcorrencia.aeroporto || ''}
                        onChange={(e) => updateNewOcorrenciaField('aeroporto', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      >
                        <option value="">Selecione um aeroporto</option>
                        <option value="Aeroporto Internacional de Brasília">Aeroporto Internacional de Brasília (BSB)</option>
                <option value="Aeroporto Internacional de Guarulhos">Aeroporto Internacional de Guarulhos (GRU)</option>
                <option value="Aeroporto Santos Dumont">Aeroporto Santos Dumont (SDU)</option>
                <option value="Aeroporto Internacional do Galeão">Aeroporto Internacional do Galeão (GIG)</option>
                <option value="Aeroporto de Congonhas">Aeroporto de Congonhas (CGH)</option>
                <option value="Aeroporto Internacional de Salvador">Aeroporto Internacional de Salvador (SSA)</option>
                <option value="Aeroporto Internacional de Recife">Aeroporto Internacional de Recife (REC)</option>
                <option value="Aeroporto Internacional de Fortaleza">Aeroporto Internacional de Fortaleza (FOR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Data/Hora da Ocorrência *</label>
                      <input
                        type="datetime-local"
                        step="60"
                        value={newOcorrencia.data || ''}
                        onChange={(e) => updateNewOcorrenciaField('data', e.target.value)}
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
                        <option value="Equipe Alpha">Equipe Alpha</option>
                <option value="Equipe Bravo">Equipe Bravo</option>
                <option value="Equipe Charlie">Equipe Charlie</option>
                <option value="Equipe Delta">Equipe Delta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Bombeiros Envolvidos *</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <select
                            value={''}
                            onChange={(e) => {
                              if (e.target.value && !newOcorrencia.bombeirosEnvolvidos?.includes(e.target.value)) {
                                const bombeiros = newOcorrencia.bombeirosEnvolvidos || [];
                                updateNewOcorrenciaField('bombeirosEnvolvidos', [...bombeiros, e.target.value]);
                              }
                              e.target.value = '';
                            }}
                            className="flex-1 px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                          >
                            <option value="">Adicionar bombeiro</option>
                            <option value="João Silva">👨‍🚒 João Silva (Equipe Alpha)</option>
                            <option value="Maria Santos">👩‍🚒 Maria Santos (Equipe Alpha)</option>
                            <option value="Pedro Costa">👨‍🚒 Pedro Costa (Equipe Alpha)</option>
                            <option value="Ana Oliveira">👩‍🚒 Ana Oliveira (Equipe Bravo)</option>
                            <option value="Carlos Lima">👨‍🚒 Carlos Lima (Equipe Bravo)</option>
                            <option value="Lucia Ferreira">👩‍🚒 Lucia Ferreira (Equipe Bravo)</option>
                            <option value="Roberto Alves">👨‍🚒 Roberto Alves (Equipe Charlie)</option>
                            <option value="Fernanda Rocha">👩‍🚒 Fernanda Rocha (Equipe Charlie)</option>
                            <option value="Marcos Pereira">👨‍🚒 Marcos Pereira (Equipe Charlie)</option>
                            <option value="Juliana Souza">👩‍🚒 Juliana Souza (Equipe Delta)</option>
                            <option value="Rafael Martins">👨‍🚒 Rafael Martins (Equipe Delta)</option>
                            <option value="Camila Barbosa">👩‍🚒 Camila Barbosa (Equipe Delta)</option>
                          </select>
                        </div>
                        {newOcorrencia.bombeirosEnvolvidos && newOcorrencia.bombeirosEnvolvidos.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Bombeiros selecionados:</p>
                            <div className="flex flex-wrap gap-2">
                              {newOcorrencia.bombeirosEnvolvidos.map((bombeiro, index) => (
                                <div key={index} className="flex items-center bg-radiant-orange/10 text-radiant-orange px-3 py-2 rounded-lg border border-radiant-orange/20">
                                  <span className="text-sm font-medium">👨‍🚒 {bombeiro}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const bombeiros = newOcorrencia.bombeirosEnvolvidos?.filter((_, i) => i !== index) || [];
                                      updateNewOcorrenciaField('bombeirosEnvolvidos', bombeiros);
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
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Área do Evento *</label>
                      <input
                        type="text"
                        value={newOcorrencia.area || ''}
                        onChange={(e) => updateNewOcorrenciaField('area', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="Digite a área do evento"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-coal-black mb-2">Tipo de Ocorrência *</label>
                      <select
                        value={newOcorrencia.tipo || ''}
                        onChange={(e) => updateNewOcorrenciaField('tipo', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      >
                        <option value="">Selecione o tipo</option>
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
                        value={newOcorrencia.vitimasFatais || ''}
                        onChange={(e) => updateNewOcorrenciaField('vitimasFatais', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Vítimas Feridas</label>
                      <input
                        type="number"
                        min="0"
                        value={newOcorrencia.vitimasFeridas || ''}
                        onChange={(e) => updateNewOcorrenciaField('vitimasFeridas', parseInt(e.target.value) || 0)}
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
                        value={newOcorrencia.horaAcionamento || ''}
                        onChange={(e) => updateNewOcorrenciaField('horaAcionamento', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Horário de Saída *</label>
                      <input
                        type="time"
                        step="60"
                        value={newOcorrencia.horaSaida || ''}
                        onChange={(e) => updateNewOcorrenciaField('horaSaida', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Horário de Chegada no Local *</label>
                      <input
                        type="time"
                        step="60"
                        value={newOcorrencia.horaChegada || ''}
                        onChange={(e) => updateNewOcorrenciaField('horaChegada', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Horário de Término da Ocorrência *</label>
                      <input
                        type="time"
                        step="60"
                        value={newOcorrencia.horaTermino || ''}
                        onChange={(e) => updateNewOcorrenciaField('horaTermino', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Horário de Retorno à SCI *</label>
                      <input
                        type="time"
                        step="60"
                        value={newOcorrencia.horaRetorno || ''}
                        onChange={(e) => updateNewOcorrenciaField('horaRetorno', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2">Tempo Gasto na Ocorrência</label>
                      <div className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl bg-gray-50 text-gray-700 font-medium">
                        {(() => {
                          if (newOcorrencia.horaAcionamento && newOcorrencia.horaRetorno) {
                            const inicio = new Date(`2000-01-01T${newOcorrencia.horaAcionamento}:00`);
                            const fim = new Date(`2000-01-01T${newOcorrencia.horaRetorno}:00`);
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
                        value={Array.isArray(newOcorrencia.equipamentosUtilizados) ? newOcorrencia.equipamentosUtilizados.join(', ') : (newOcorrencia.equipamentosUtilizados || '')}
                        onChange={(e) => updateNewOcorrenciaField('equipamentosUtilizados', e.target.value)}
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
                        value={newOcorrencia.descricaoDetalhada || ''}
                        onChange={(e) => updateNewOcorrenciaField('descricaoDetalhada', e.target.value)}
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