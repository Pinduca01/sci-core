'use client';

import Header from '@/components/ui/header';
import { SidebarDemo } from '@/components/ui/sidebar-demo';
import { useState } from 'react';
import { Search, Filter, FileText, AlertTriangle, Car, Flame, Users, Edit, X, Phone, Mail, MapPin, Calendar, DollarSign, Plus, Upload, Trash2, UserPlus, Eye, Clock, CheckCircle, XCircle, AlertCircle, Brain, Send, Loader2, Download, Wrench, Fuel, Settings } from 'lucide-react';

// Tipos para os dados
interface Viatura {
  id: number;
  codigo: string;
  nomeCCI: string;
  registroAeroporto: string;
  tipo: 'ABT' | 'ABM' | 'ABQT' | 'ASE' | 'UTR' | 'VE' | 'Outros';
  modelo: string;
  ano: number;
  status: 'em linha' | 'manutencao' | 'reserva tecnica' | 'baixada';
  quilometragem: number;
  combustivel: number;
  ultimaManutencao: string;
  proximaManutencao: string;
  responsavel: string;
  observacoes?: string;
}

interface NewViatura {
  codigo?: string;
  nomeCCI?: string;
  registroAeroporto?: string;
  tipo?: 'ABT' | 'ABM' | 'ABQT' | 'ASE' | 'UTR' | 'VE' | 'Outros';
  modelo?: string;
  ano?: number;
  status?: 'em linha' | 'manutencao' | 'reserva tecnica' | 'baixada';
  quilometragem?: number;
  combustivel?: number;
  ultimaManutencao?: string;
  proximaManutencao?: string;
  responsavel?: string;
  observacoes?: string;
}

// Dados mockados
const viaturasMock: Viatura[] = [
  {
    id: 1,
    codigo: 'ABT-01',
    nomeCCI: 'Faisca 1',
    registroAeroporto: 'SBGR-001',
    tipo: 'ABT',
    modelo: 'Mercedes-Benz Atego',
    ano: 2020,
    status: 'em linha',
    quilometragem: 45000,
    combustivel: 85,
    ultimaManutencao: '15/02/2024',
    proximaManutencao: '15/05/2024',
    responsavel: 'Joao Silva Santos'
  },
  {
    id: 2,
    codigo: 'ABM-02',
    nomeCCI: 'Faisca 2',
    registroAeroporto: 'SBGR-002',
    tipo: 'ABM',
    modelo: 'Iveco Daily',
    ano: 2019,
    status: 'em linha',
    quilometragem: 62000,
    combustivel: 45,
    ultimaManutencao: '10/01/2024',
    proximaManutencao: '10/04/2024',
    responsavel: 'Maria Oliveira Costa'
  },
  {
    id: 3,
    codigo: 'UTR-03',
    nomeCCI: 'Raio 1',
    registroAeroporto: 'SBGR-003',
    tipo: 'UTR',
    modelo: 'Ford Transit',
    ano: 2021,
    status: 'manutencao',
    quilometragem: 28000,
    combustivel: 0,
    ultimaManutencao: '01/03/2024',
    proximaManutencao: '01/06/2024',
    responsavel: 'Carlos Roberto Lima'
  }
];

export default function ViaturasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [responsavelFilter, setResponsavelFilter] = useState('Todos');
  const [anoFilter, setAnoFilter] = useState('');
  const [selectedViatura, setSelectedViatura] = useState<Viatura | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showChecklistMainModal, setShowChecklistMainModal] = useState(false);
  const [showDetailedChecklistModal, setShowDetailedChecklistModal] = useState(false);
  const [checklistItems, setChecklistItems] = useState<Record<string, {status: 'conforme' | 'nao_conforme' | 'nao_existente', observacao?: string, imagem?: File}>>({});
  const [isAddOSModalOpen, setIsAddOSModalOpen] = useState(false);
  const [newOS, setNewOS] = useState({
    codigo: '',
    dataSolicitacao: '',
    tipoChamado: '',
    nomeSolicitante: '',
    numeroChamado: '',
    veiculoEquipamento: '',
    descricao: '',
    status: 'Pendente',
    itemConforme: 'SIM',
    observacoesManutencao: ''
  });

  const checklistItemsList = [
    'NÍVEL DO LIQUIDO DE ARREFECIMENTO',
    'NÍVEL LIQUIDO DE ARREFECIMENTO DO MOTOR ESTACIONÁRIO',
    'ÓLEO DA DIREÇÃO HIDRÁULICA',
    'NÍVEL ÓLEO DE MOTOR',
    'NÍVEL ÓLEO DO MOTOR ESTACIONÁRIO',
    'VAZAMENTOS EM GERAL',
    'NÍVEL ÓLEO BOMBA INCÊNDIO',
    'NÍVEL DA BOMBA DE ESCORVA',
    'NÍVEL DA ÁGUA LIMPADOR PARABRISA',
    'FILTRO DE AR DO MOTOR',
    'FREIO ESTACIONÁRIO',
    'SISTEMA DE FRENAGEM',
    'SISTEMA SUSPENSÃO',
    'CHAVE DE EMERGENCIA',
    'SILENCIOSO/ESCAPAMENTO',
    'DRENOS E REGISTROS',
    'FILTRO DE AR',
    'BATERIA /POLOS E TERMINAIS',
    'CONDIÇÃO GERAL DOS PNEUS',
    'LATARIA E PINTURA'
  ];
  const [showChecklistDetailModal, setShowChecklistDetailModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedViaturaForChecklist, setSelectedViaturaForChecklist] = useState<Viatura | null>(null);
  const [viaturas, setViaturas] = useState<Viatura[]>(viaturasMock);
  const [newViatura, setNewViatura] = useState<NewViatura>({
    codigo: '',
    tipo: 'ABT',
    modelo: '',
    ano: new Date().getFullYear(),
    status: 'em linha',
    quilometragem: 0,
    combustivel: 100,
    ultimaManutencao: '',
    proximaManutencao: '',
    responsavel: ''
  });

  // Dados mockados do usuario
  const userData = {
    userName: 'Usuario',
    userEmail: 'usuario@empresa.com'
  };

  // Funcao para obter icone do tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ABT': return <Flame className="w-5 h-5 text-red-600" />;
      case 'ABM': return <Users className="w-5 h-5 text-blue-600" />;
      case 'ABQT': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'ASE': return <Car className="w-5 h-5 text-green-600" />;
      case 'UTR': return <Wrench className="w-5 h-5 text-purple-600" />;
      case 'VE': return <Settings className="w-5 h-5 text-orange-600" />;
      default: return <Car className="w-5 h-5 text-gray-600" />;
    }
  };

  // Funcao para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em linha': return 'bg-green-100 text-green-800 border-green-200';
      case 'manutencao': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reserva tecnica': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baixada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Funcao para obter cor do combustivel
  const getCombustivelColor = (combustivel: number) => {
    if (combustivel >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (combustivel >= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Filtrar viaturas
  const filteredViaturas = viaturas.filter(viatura => {
    const matchesSearch = viatura.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         viatura.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         viatura.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || viatura.status === statusFilter;
    const matchesTipo = tipoFilter === 'Todos' || viatura.tipo === tipoFilter;
    const matchesResponsavel = responsavelFilter === 'Todos' || viatura.responsavel === responsavelFilter;
    
    // Filtro de ano
    let matchesAno = true;
    if (anoFilter) {
      matchesAno = viatura.ano.toString() === anoFilter;
    }
    
    return matchesSearch && matchesStatus && matchesTipo && matchesResponsavel && matchesAno;
   });

  // Abrir modal com detalhes
  const openModal = (viatura: Viatura) => {
    setSelectedViatura(viatura);
    setIsModalOpen(true);
  };

  // Fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedViatura(null);
  };

  // Abrir modal de adicionar
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Fechar modal de adicionar
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewViatura({
      codigo: '',
      tipo: 'ABT',
      modelo: '',
      ano: new Date().getFullYear(),
      status: 'em linha',
      quilometragem: 0,
      combustivel: 100,
      ultimaManutencao: '',
      proximaManutencao: '',
      responsavel: ''
    });
  };

  // Atualizar campo da nova viatura
  const updateNewViaturaField = (field: keyof Viatura, value: any) => {
    setNewViatura(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Adicionar nova viatura
  const addViatura = () => {
    // Validacao dos campos obrigatorios
    if (!newViatura.codigo || !newViatura.tipo || !newViatura.modelo) {
      alert('Por favor, preencha todos os campos obrigatorios (Codigo, Tipo e Modelo).');
      return;
    }

    // Verificar se o codigo ja existe
    const codigoExiste = viaturas.some(v => v.codigo.toLowerCase() === newViatura.codigo!.toLowerCase());
    if (codigoExiste) {
      alert('Ja existe uma viatura com este codigo. Por favor, escolha um codigo diferente.');
      return;
    }

    const viatura: Viatura = {
      id: viaturas.length + 1,
      codigo: newViatura.codigo!,
      nomeCCI: newViatura.nomeCCI || 'Não informado',
      registroAeroporto: newViatura.registroAeroporto || 'Não informado',
// Remove duplicate id property since it's already defined above
// Remove duplicate codigo property since it's already defined above
      tipo: newViatura.tipo!,
      modelo: newViatura.modelo!,
      ano: newViatura.ano || new Date().getFullYear(),
      status: newViatura.status || 'em linha',
      quilometragem: newViatura.quilometragem || 0,
      combustivel: newViatura.combustivel || 100,
      ultimaManutencao: newViatura.ultimaManutencao || '',
      proximaManutencao: newViatura.proximaManutencao || '',
      responsavel: 'Nao informado',
      observacoes: newViatura.observacoes
    };
    
    setViaturas([...viaturas, viatura]);
    alert('Viatura registrada com sucesso!');
    closeAddModal();
  };

  // Abrir modal de adicionar OS
  const openAddOSModal = () => {
    setIsAddOSModalOpen(true);
  };

  // Fechar modal de adicionar OS
  const closeAddOSModal = () => {
    setIsAddOSModalOpen(false);
    setNewOS({
      codigo: '',
      dataSolicitacao: '',
      tipoChamado: '',
      nomeSolicitante: '',
      numeroChamado: '',
      veiculoEquipamento: '',
      descricao: '',
      status: 'Pendente',
      itemConforme: 'SIM',
      observacoesManutencao: ''
    });
  };

  // Atualizar campo da nova OS
  const updateNewOSField = (field: string, value: any) => {
    setNewOS(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Adicionar nova OS
  const addOS = () => {
    // Validacao dos campos obrigatorios
    if (!newOS.codigo || !newOS.dataSolicitacao || !newOS.tipoChamado || !newOS.nomeSolicitante) {
      alert('Por favor, preencha todos os campos obrigatorios.');
      return;
    }

    // Aqui você pode adicionar a lógica para salvar a OS
    console.log('Nova OS:', newOS);
    alert('Ordem de Serviço criada com sucesso!');
    closeAddOSModal();
  };

  return (
    <SidebarDemo>
      <div className="flex flex-col h-full">
        <Header userName={userData.userName} userEmail={userData.userEmail} />
        
        <div className="flex-1 bg-fog-gray/30 overflow-auto min-h-screen">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-coal-black mb-2">Controle de Viaturas</h1>
              <p className="text-coal-black/70">Controle completo da frota.</p>
            </div>
            
            <div className="mb-6 flex gap-4">
              <button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-radiant-orange to-radiant-orange/80 hover:from-radiant-orange/90 hover:to-radiant-orange/70 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nova viatura
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {viaturas.map((viatura) => {
                const getStatusColors = (status: string) => {
                  switch (status) {
                    case 'em linha':
                      return {
                        bg: 'from-green-50 to-green-100',
                        border: 'border-green-500',
                        text: 'text-green-800',
                        accent: 'text-green-600',
                        icon: 'bg-green-500 group-hover:bg-green-600'
                      };
                    case 'manutencao':
                      return {
                        bg: 'from-yellow-50 to-yellow-100',
                        border: 'border-yellow-500',
                        text: 'text-yellow-800',
                        accent: 'text-yellow-600',
                        icon: 'bg-yellow-500 group-hover:bg-yellow-600'
                      };
                    case 'reserva tecnica':
                      return {
                        bg: 'from-blue-50 to-blue-100',
                        border: 'border-blue-500',
                        text: 'text-blue-800',
                        accent: 'text-blue-600',
                        icon: 'bg-blue-500 group-hover:bg-blue-600'
                      };
                    case 'baixada':
                      return {
                        bg: 'from-red-50 to-red-100',
                        border: 'border-red-500',
                        text: 'text-red-800',
                        accent: 'text-red-600',
                        icon: 'bg-red-500 group-hover:bg-red-600'
                      };
                    default:
                      return {
                        bg: 'from-gray-50 to-gray-100',
                        border: 'border-gray-500',
                        text: 'text-gray-800',
                        accent: 'text-gray-600',
                        icon: 'bg-gray-500 group-hover:bg-gray-600'
                      };
                  }
                };

                const colors = getStatusColors(viatura.status);
                // Usando valores determinísticos baseados no ID para evitar problemas de hidratação
                const checklistFeito = viatura.id % 2 === 0; // Simulação determinística
                const itensNaoConformes = viatura.id % 4; // Simulação determinística (0-3)

                return (
                  <div key={viatura.id} className={`bg-gradient-to-br ${colors.bg} border-l-4 ${colors.border} rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 group hover:scale-105`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${colors.text} mb-1 truncate`}>{viatura.nomeCCI} - {viatura.registroAeroporto}</h3>
                        <p className={`text-sm ${colors.accent} mb-2`}>{viatura.modelo}</p>
                        <div className="space-y-1">
                          <p className={`text-xs ${colors.text} flex items-center gap-1`}>
                             <Fuel className="w-3 h-3" />
                             {viatura.combustivel}%
                           </p>
                           <p className={`text-xs ${colors.text} flex items-center gap-1`}>
                             <AlertTriangle className="w-3 h-3" />
                             {itensNaoConformes} não conformes
                           </p>
                        </div>
                      </div>
                      <div className={`w-10 h-10 ${colors.icon} rounded-full flex items-center justify-center transition-colors`}>
                        {viatura.status === 'em linha' && (
                           <CheckCircle className="w-5 h-5 text-white" />
                         )}
                         {viatura.status === 'manutencao' && (
                           <Settings className="w-5 h-5 text-white" />
                         )}
                         {viatura.status === 'reserva tecnica' && (
                           <Clock className="w-5 h-5 text-white" />
                         )}
                         {viatura.status === 'baixada' && (
                           <XCircle className="w-5 h-5 text-white" />
                         )}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${checklistFeito ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-xs font-medium ${checklistFeito ? colors.accent : 'text-red-600'}`}>
                            {checklistFeito ? 'Checklist OK' : 'Pendente'}
                          </span>
                        </div>
                        <span className={`text-xs ${colors.accent} font-medium capitalize`}>{viatura.status}</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedViatura(viatura);
                          setShowDetailedChecklistModal(true);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Checklist Viatura
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seção de Controle de OS */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-white p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-gray-900">Controle de Chamados</h2>
                    </div>
                    <button 
                      onClick={openAddOSModal}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Nova OS
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cód</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data Solicitação</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo de Chamado</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome Solicitante</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nº do Chamado</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Veículo/Equipamento</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descrição</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item está Conforme</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Observações de Manutenção</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Exemplo de dados mockados */}
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">16/04/25</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Viatura</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">JOSE ALVES DA SILVA</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">-</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">PANTHER 01 - CCI 01</td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">Vazamento de óleo motor no carter</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            Pendente
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            SIM
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">Completa do chamado</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                            Iniciar
                          </button>
                        </td>
                      </tr>
                      
                      {/* Linha adicional de exemplo */}
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">3</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">15/04/25</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Manutenção</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">MARIA SANTOS</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">OS-001</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">ABT-02 - FAISCA 2</td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">Revisão preventiva dos 10.000 km</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            Em Andamento
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            PARCIAL
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">Aguardando peças de reposição</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                            Finalizar
                          </button>
                        </td>
                      </tr>
                      
                      {/* Linha concluída */}
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">14/04/25</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Reparo</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">CARLOS OLIVEIRA</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">REP-045</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">UTR-01 - RESGATE 1</td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">Troca de pneus dianteiros</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Concluído
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            SIM
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">Serviço executado conforme especificação</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button className="bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium cursor-not-allowed" disabled>
                            Concluído
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Rodapé da tabela com estatísticas */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600">Pendente: <span className="font-semibold text-gray-900">1</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600">Em Andamento: <span className="font-semibold text-gray-900">1</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Concluído: <span className="font-semibold text-gray-900">1</span></span>
                    </div>
                    <div className="ml-auto text-gray-600">
                      Total de OS: <span className="font-semibold text-gray-900">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showStatusModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold text-coal-black capitalize">Viaturas - {selectedStatus}</h2>
                      <button
                        onClick={() => setShowStatusModal(false)}
                        className="text-coal-black/60 hover:text-coal-black transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {viaturas.filter(v => v.status === selectedStatus).map((viatura) => (
                        <div key={viatura.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getTipoIcon(viatura.tipo)}
                                <span className="font-semibold text-coal-black">{viatura.codigo}</span>
                              </div>
                              <span className="text-coal-black/70">{viatura.modelo}</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(viatura.status)}`}>
                                {viatura.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Fuel className="w-4 h-4 text-coal-black/60" />
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCombustivelColor(viatura.combustivel)}`}>
                                  {viatura.combustivel}%
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedViaturaForChecklist(viatura)
                                  setShowChecklistModal(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver ultimo checklist"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Detalhado do Checklist - Responsivo para Mobile */}
            {showDetailedChecklistModal && selectedViatura && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                  {/* Header fixo */}
                  <div className="bg-gradient-to-r from-radiant-orange to-radiant-orange/80 text-white p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">Checklist de Viatura</h2>
                        <p className="text-orange-100 text-sm sm:text-base">{selectedViatura.nomeCCI} - {selectedViatura.registroAeroporto}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowDetailedChecklistModal(false);
                          setSelectedViatura(null);
                          setChecklistItems({});
                        }}
                        className="text-white/80 hover:text-white transition-colors p-1 ml-2"
                      >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Conteúdo scrollável */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {checklistItemsList.map((item, index) => {
                        const itemKey = `item_${index}`;
                        const currentItem = checklistItems[itemKey];
                        
                        return (
                          <div key={index} className="border border-gray-200 rounded-xl p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm">
                            <div className="mb-3">
                              <h3 className="font-semibold text-coal-black mb-3 text-sm sm:text-base leading-tight">{item}</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                  onClick={() => {
                                    setChecklistItems(prev => ({
                                      ...prev,
                                      [itemKey]: { status: 'conforme' }
                                    }));
                                  }}
                                  className={`w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                                    currentItem?.status === 'conforme'
                                      ? 'bg-green-600 text-white shadow-lg transform scale-105'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Conforme
                                </button>
                                <button
                                  onClick={() => {
                                    setChecklistItems(prev => ({
                                      ...prev,
                                      [itemKey]: { status: 'nao_conforme', observacao: prev[itemKey]?.observacao || '' }
                                    }));
                                  }}
                                  className={`w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                                    currentItem?.status === 'nao_conforme'
                                      ? 'bg-red-600 text-white shadow-lg transform scale-105'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md'
                                  }`}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Não Conforme
                                </button>
                                <button
                                  onClick={() => {
                                    setChecklistItems(prev => ({
                                      ...prev,
                                      [itemKey]: { status: 'nao_existente' }
                                    }));
                                  }}
                                  className={`w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                                    currentItem?.status === 'nao_existente'
                                      ? 'bg-gray-600 text-white shadow-lg transform scale-105'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                  }`}
                                >
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Não Existente
                                </button>
                              </div>
                            </div>
                            
                            {/* Campos obrigatórios para "Não Conforme" */}
                            {currentItem?.status === 'nao_conforme' && (
                              <div className="mt-4 space-y-3 border-t border-red-200 pt-4 bg-red-50 rounded-lg p-3">
                                <div>
                                  <label className="block text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Observação (obrigatória) *
                                  </label>
                                  <textarea
                                    value={currentItem.observacao || ''}
                                    onChange={(e) => {
                                      setChecklistItems(prev => ({
                                        ...prev,
                                        [itemKey]: { ...prev[itemKey], observacao: e.target.value }
                                      }));
                                    }}
                                    className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                                    rows={3}
                                    placeholder="Descreva detalhadamente a não conformidade encontrada..."
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Upload de Imagem (Evidência)
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setChecklistItems(prev => ({
                                          ...prev,
                                          [itemKey]: { ...prev[itemKey], imagem: file }
                                        }));
                                      }
                                    }}
                                    className="w-full p-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                  />
                                  {currentItem.imagem && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Imagem selecionada: {currentItem.imagem.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Campo de observações gerais */}
                      <div className="border border-blue-200 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
                        <label className="block text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Observações Gerais do Checklist
                        </label>
                        <textarea
                          className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                          rows={3}
                          placeholder="Observações adicionais, comentários gerais ou informações relevantes sobre o checklist..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer fixo com botões */}
                  <div className="border-t bg-gray-50 p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          setShowDetailedChecklistModal(false);
                          setSelectedViatura(null);
                          setChecklistItems({});
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          // Verificar se todos os itens não conformes têm observação
                          const naoConformesIncompletos = Object.entries(checklistItems)
                            .filter(([_, item]) => item.status === 'nao_conforme' && (!item.observacao || item.observacao.trim() === ''));
                          
                          if (naoConformesIncompletos.length > 0) {
                            alert('Por favor, preencha as observações obrigatórias para todos os itens não conformes.');
                            return;
                          }
                          
                          alert('Checklist finalizado com sucesso!');
                          setShowDetailedChecklistModal(false);
                          setSelectedViatura(null);
                          setChecklistItems({});
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Finalizar Checklist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showChecklistMainModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold text-coal-black">Selecionar Viatura para Checklist</h2>
                      <button
                        onClick={() => setShowChecklistMainModal(false)}
                        className="text-coal-black/60 hover:text-coal-black transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {viaturas.map((viatura) => (
                        <div key={viatura.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-coal-black">{viatura.codigo}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                viatura.status === 'em linha' ? 'bg-green-100 text-green-800' :
                                viatura.status === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {viatura.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{viatura.modelo}</p>
                            <p className="text-sm text-gray-500">Tipo: {viatura.tipo}</p>
                            <p className="text-sm text-gray-500">Combustível: {viatura.combustivel}</p>
                            <button
                               onClick={() => {
                                 setSelectedViatura(viatura);
                                 setShowChecklistMainModal(false);
                                 setShowDetailedChecklistModal(true);
                               }}
                               className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                             >
                               Iniciar Checklist
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end pt-4 mt-4 border-t">
                      <button
                        onClick={() => setShowChecklistMainModal(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Adicionar Nova Viatura */}
            {isAddModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Cadastrar Nova Viatura</h2>
                        <p className="text-orange-100 text-sm mt-1">Adicione uma nova viatura à frota</p>
                      </div>
                      <button
                        onClick={closeAddModal}
                        className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Código */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Código *
                        </label>
                        <input
                          type="text"
                          value={newViatura.codigo || ''}
                          onChange={(e) => updateNewViaturaField('codigo', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          placeholder="Ex: ABT-01"
                          required
                        />
                      </div>

                      {/* Nome CCI */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Nome CCI</label>
                        <input
                          type="text"
                          value={newViatura.nomeCCI || ''}
                          onChange={(e) => updateNewViaturaField('nomeCCI', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          placeholder="Ex: Faisca 1"
                        />
                      </div>

                      {/* Registro Aeroporto */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Registro Aeroporto</label>
                        <input
                          type="text"
                          value={newViatura.registroAeroporto || ''}
                          onChange={(e) => updateNewViaturaField('registroAeroporto', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          placeholder="Ex: SBGR-001"
                        />
                      </div>

                      {/* Tipo */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Tipo *
                        </label>
                        <select
                          value={newViatura.tipo || 'ABT'}
                          onChange={(e) => updateNewViaturaField('tipo', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          required
                        >
                          <option value="ABT">ABT - Auto Bomba Tanque</option>
                          <option value="ABM">ABM - Auto Bomba Mista</option>
                          <option value="ABQT">ABQT - Auto Bomba Química</option>
                          <option value="ASE">ASE - Auto Socorro de Emergência</option>
                          <option value="UTR">UTR - Unidade de Transporte</option>
                          <option value="VE">VE - Viatura Especial</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>

                      {/* Modelo */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Modelo *
                        </label>
                        <input
                          type="text"
                          value={newViatura.modelo || ''}
                          onChange={(e) => updateNewViaturaField('modelo', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          placeholder="Ex: Mercedes-Benz Atego"
                          required
                        />
                      </div>

                      {/* Ano */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Ano</label>
                        <input
                          type="number"
                          value={newViatura.ano || new Date().getFullYear()}
                          onChange={(e) => updateNewViaturaField('ano', parseInt(e.target.value))}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                        />
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select
                          value={newViatura.status || 'em linha'}
                          onChange={(e) => updateNewViaturaField('status', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                        >
                          <option value="em linha">Em Linha</option>
                          <option value="manutencao">Manutenção</option>
                          <option value="reserva tecnica">Reserva Técnica</option>
                          <option value="baixada">Baixada</option>
                        </select>
                      </div>

                      {/* Quilometragem */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Quilometragem</label>
                        <input
                          type="number"
                          value={newViatura.quilometragem || 0}
                          onChange={(e) => updateNewViaturaField('quilometragem', parseInt(e.target.value))}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          min="0"
                          placeholder="0"
                        />
                      </div>

                      {/* Combustível */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Combustível (%)</label>
                        <input
                          type="number"
                          value={newViatura.combustivel || 100}
                          onChange={(e) => updateNewViaturaField('combustivel', parseInt(e.target.value))}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          min="0"
                          max="100"
                          placeholder="100"
                        />
                      </div>

                      {/* Última Manutenção */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Última Manutenção</label>
                        <input
                          type="date"
                          value={newViatura.ultimaManutencao || ''}
                          onChange={(e) => updateNewViaturaField('ultimaManutencao', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                        />
                      </div>

                      {/* Próxima Manutenção */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Próxima Manutenção</label>
                        <input
                          type="date"
                          value={newViatura.proximaManutencao || ''}
                          onChange={(e) => updateNewViaturaField('proximaManutencao', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                        />
                      </div>

                      {/* Observações */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Observações</label>
                        <textarea
                          value={newViatura.observacoes || ''}
                          onChange={(e) => updateNewViaturaField('observacoes', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white resize-none"
                          rows={4}
                          placeholder="Observações adicionais sobre a viatura..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                      <button
                        onClick={closeAddModal}
                        className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={addViatura}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        Cadastrar Viatura
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Nova OS */}
            {isAddOSModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">Nova Ordem de Serviço</h2>
                        <p className="text-orange-100">Cadastro de nova OS para viatura</p>
                      </div>
                      <button
                        onClick={closeAddOSModal}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Código */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Código *
                        </label>
                        <input
                          type="text"
                          value={newOS.codigo}
                          onChange={(e) => updateNewOSField('codigo', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          placeholder="Ex: OS-001"
                          required
                        />
                      </div>

                      {/* Data Solicitação */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Data Solicitação *
                        </label>
                        <input
                          type="date"
                          value={newOS.dataSolicitacao}
                          onChange={(e) => updateNewOSField('dataSolicitacao', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          required
                        />
                      </div>

                      {/* Tipo de Chamado */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Tipo de Chamado *
                        </label>
                        <select
                          value={newOS.tipoChamado}
                          onChange={(e) => updateNewOSField('tipoChamado', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          required
                        >
                          <option value="">Selecione o tipo</option>
                          <option value="Viatura">Viatura</option>
                          <option value="Manutenção">Manutenção</option>
                          <option value="Reparo">Reparo</option>
                          <option value="Inspeção">Inspeção</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>

                      {/* Nome Solicitante */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Nome Solicitante *
                        </label>
                        <input
                          type="text"
                          value={newOS.nomeSolicitante}
                          onChange={(e) => updateNewOSField('nomeSolicitante', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          placeholder="Ex: João Silva"
                          required
                        />
                      </div>

                      {/* Número do Chamado */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Nº do Chamado</label>
                        <input
                          type="text"
                          value={newOS.numeroChamado}
                          onChange={(e) => updateNewOSField('numeroChamado', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          placeholder="Ex: CH-001"
                        />
                      </div>

                      {/* Veículo/Equipamento */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Veículo/Equipamento</label>
                        <input
                          type="text"
                          value={newOS.veiculoEquipamento}
                          onChange={(e) => updateNewOSField('veiculoEquipamento', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                          placeholder="Ex: ABT-01 - FAISCA 1"
                        />
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select
                          value={newOS.status}
                          onChange={(e) => updateNewOSField('status', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Em Andamento">Em Andamento</option>
                          <option value="Concluído">Concluído</option>
                        </select>
                      </div>

                      {/* Item está Conforme */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Item está Conforme</label>
                        <select
                          value={newOS.itemConforme}
                          onChange={(e) => updateNewOSField('itemConforme', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white"
                        >
                          <option value="SIM">SIM</option>
                          <option value="NÃO">NÃO</option>
                          <option value="PARCIAL">PARCIAL</option>
                        </select>
                      </div>

                      {/* Descrição */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Descrição</label>
                        <textarea
                          value={newOS.descricao}
                          onChange={(e) => updateNewOSField('descricao', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white resize-none"
                          rows={3}
                          placeholder="Descreva o problema ou serviço solicitado..."
                        />
                      </div>

                      {/* Observações de Manutenção */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Observações de Manutenção</label>
                        <textarea
                          value={newOS.observacoesManutencao}
                          onChange={(e) => updateNewOSField('observacoesManutencao', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white resize-none"
                          rows={3}
                          placeholder="Observações sobre a manutenção realizada..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                      <button
                        onClick={closeAddOSModal}
                        className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={addOS}
                        className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        Criar OS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarDemo>
  );
}