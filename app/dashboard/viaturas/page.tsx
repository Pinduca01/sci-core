'use client';

import Header from '@/components/ui/header';
import { SidebarDemo } from '@/components/ui/sidebar-demo';
import { useState } from 'react';
import { Search, Filter, FileText, AlertTriangle, Car, Flame, Users, Edit, X, Phone, Mail, MapPin, Calendar, DollarSign, Plus, Upload, Trash2, UserPlus, Eye, Clock, CheckCircle, XCircle, AlertCircle, Brain, Send, Loader2, Download, Wrench, Fuel, Settings } from 'lucide-react';

// Tipos para os dados
interface Viatura {
  id: number;
  codigo: string;
  tipo: 'ABT' | 'ABM' | 'ABQT' | 'ASE' | 'UTR' | 'VE' | 'Outros';
  modelo: string;
  ano: number;
  status: 'em linha' | 'manutenção' | 'reserva técnica' | 'baixada';
  quilometragem: number;
  combustivel: number;
  ultimaManutencao: string;
  proximaManutencao: string;
  responsavel: string;
  observacoes?: string;
}

// Dados mockados
const viaturasMock: Viatura[] = [
  {
    id: 1,
    codigo: 'ABT-01',
    tipo: 'ABT',
    modelo: 'Mercedes-Benz Atego',
    ano: 2020,
    status: 'em linha',
    quilometragem: 45000,
    combustivel: 85,
    ultimaManutencao: '15/02/2024',
    proximaManutencao: '15/05/2024',
    responsavel: 'João Silva Santos'
  },
  {
    id: 2,
    codigo: 'ABM-02',
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
    tipo: 'UTR',
    modelo: 'Ford Transit',
    ano: 2021,
    status: 'manutenção',
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
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedViaturaForChecklist, setSelectedViaturaForChecklist] = useState<Viatura | null>(null);
  const [viaturas, setViaturas] = useState<Viatura[]>(viaturasMock);
  const [newViatura, setNewViatura] = useState<Partial<Viatura>>({
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

  // Dados mockados do usuário
  const userData = {
    userName: 'Usuário',
    userEmail: 'usuario@empresa.com'
  };

  // Função para obter ícone do tipo
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

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em linha': return 'bg-green-100 text-green-800 border-green-200';
      case 'manutenção': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reserva técnica': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baixada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para obter cor do combustível
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
      proximaManutencao: ''
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
    // Validação dos campos obrigatórios
    if (!newViatura.codigo || !newViatura.tipo || !newViatura.modelo) {
      alert('Por favor, preencha todos os campos obrigatórios (Código, Tipo e Modelo).');
      return;
    }

    // Verificar se o código já existe
    const codigoExiste = viaturas.some(v => v.codigo.toLowerCase() === newViatura.codigo!.toLowerCase());
    if (codigoExiste) {
      alert('Já existe uma viatura com este código. Por favor, escolha um código diferente.');
      return;
    }

    const viatura: Viatura = {
      id: viaturas.length + 1,
      codigo: newViatura.codigo!,
      tipo: newViatura.tipo!,
      modelo: newViatura.modelo!,
      ano: newViatura.ano || new Date().getFullYear(),
      status: newViatura.status || 'em linha',
      quilometragem: newViatura.quilometragem || 0,
      combustivel: newViatura.combustivel || 100,
      ultimaManutencao: newViatura.ultimaManutencao || '',
      proximaManutencao: newViatura.proximaManutencao || '',
      responsavel: 'Não informado',
      observacoes: newViatura.observacoes
    };
    
    setViaturas([...viaturas, viatura]);
    alert('Viatura registrada com sucesso!');
    closeAddModal();
  };

  return (
    <SidebarDemo>
      <div className="flex flex-col h-full">
        <Header userName={userData.userName} userEmail={userData.userEmail} />
        
        <div className="flex-1 bg-fog-gray/30 overflow-auto min-h-screen transition-colors duration-300">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Cabeçalho */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-coal-black mb-2 transition-colors duration-300">Gestão das Viaturas</h1>
              <p className="text-coal-black/70 transition-colors duration-300">Controle completo da frota da corporação</p>
            </div>
            
            {/* Botão Adicionar */}
            <div className="mb-6">
              <button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-radiant-orange to-radiant-orange/80 hover:from-radiant-orange/90 hover:to-radiant-orange/70 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nova viatura
                </button>
            </div>
            
            {/* Cards Informativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card Em Linha */}
              <button 
                onClick={() => {
                  setSelectedStatus('em linha')
                  setShowStatusModal(true)
                }}
                className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full group hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">Em Linha</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {viaturas.filter(v => v.status === 'em linha').length}
                    </p>
                    <p className="text-sm text-green-700 mt-1">Viaturas operacionais</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-green-600 font-medium">Clique para ver detalhes</span>
                </div>
              </button>

              {/* Card Manutenção */}
              <button 
                onClick={() => {
                  setSelectedStatus('manutenção')
                  setShowStatusModal(true)
                }}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full group hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-1">Manutenção</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                      {viaturas.filter(v => v.status === 'manutenção').length}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">Em manutenção</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-yellow-600 font-medium">Clique para ver detalhes</span>
                </div>
              </button>

              {/* Card Reserva Técnica */}
              <button 
                onClick={() => {
                  setSelectedStatus('reserva técnica')
                  setShowStatusModal(true)
                }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full group hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-1">Reserva Técnica</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {viaturas.filter(v => v.status === 'reserva técnica').length}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">Em reserva</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-blue-600 font-medium">Clique para ver detalhes</span>
                </div>
              </button>

              {/* Card Viatura Baixada */}
              <button 
                onClick={() => {
                  setSelectedStatus('baixada')
                  setShowStatusModal(true)
                }}
                className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full group hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-1">Viatura Baixada</h3>
                    <p className="text-3xl font-bold text-red-600">
                      {viaturas.filter(v => v.status === 'baixada').length}
                    </p>
                    <p className="text-sm text-red-700 mt-1">Fora de operação</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-red-600 font-medium">Clique para ver detalhes</span>
                </div>
              </button>
            </div>

            {/* Modal de Status */}
            {showStatusModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold text-coal-black capitalize transition-colors duration-300">Viaturas - {selectedStatus}</h2>
                      <button
                        onClick={() => setShowStatusModal(false)}
                        className="text-coal-black/60 hover:text-coal-black:text-dark-text transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {viaturas.filter(v => v.status === selectedStatus).map((viatura) => (
                        <div key={viatura.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-colors duration-300">
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
                                className="p-2 text-blue-600 hover:bg-blue-50:bg-blue-900/20 rounded-lg transition-colors"
                                title="Ver último checklist"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openModal(viatura)}
                                className="p-2 text-coal-black/60 hover:bg-gray-100:bg-dark-bg/50 rounded-lg transition-colors"
                                title="Ver detalhes"
                              >
                                <FileText className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {viaturas.filter(v => v.status === selectedStatus).length === 0 && (
                        <p className="text-coal-black/60 text-center py-8">Nenhuma viatura encontrada com este status.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Checklist */}
            {showChecklistModal && selectedViaturaForChecklist && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold text-coal-black">Último Checklist - {selectedViaturaForChecklist.codigo}</h2>
                      <button
                        onClick={() => setShowChecklistModal(false)}
                        className="text-coal-black/60 hover:text-coal-black:text-dark-text transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Informações do Checklist */}
                      <div className="bg-gray-50 rounded-lg p-4 transition-colors duration-300">
                        <h3 className="text-lg font-semibold text-coal-black mb-3">Informações do Checklist</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-coal-black/60">Data do Checklist</label>
                            <p className="font-medium text-coal-black">15/03/2024 - 08:30</p>
                          </div>
                          <div>
                            <label className="text-sm text-coal-black/60">Responsável</label>
                            <p className="font-medium text-coal-black">{selectedViaturaForChecklist.responsavel}</p>
                          </div>
                        </div>
                      </div>

                      {/* Itens de Verificação */}
                      <div>
                        <h3 className="text-lg font-semibold text-coal-black mb-4">Itens Verificados</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 transition-colors duration-300">
                            <span className="text-coal-black">Nível de óleo do motor</span>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-green-600 font-medium">Conforme</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 transition-colors duration-300">
                            <span className="text-coal-black">Pressão dos pneus</span>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-green-600 font-medium">Conforme</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 transition-colors duration-300">
                            <span className="text-coal-black">Funcionamento das luzes</span>
                            <div className="flex items-center gap-2">
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span className="text-red-600 font-medium">Não Conforme</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 transition-colors duration-300">
                            <span className="text-coal-black">Nível do fluido de freio</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-yellow-600" />
                              <span className="text-yellow-600 font-medium">Atenção</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 transition-colors duration-300">
                            <span className="text-coal-black">Equipamentos de segurança</span>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-green-600 font-medium">Conforme</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Observações */}
                      <div>
                        <h3 className="text-lg font-semibold text-coal-black mb-3">Observações</h3>
                        <div className="bg-gray-50 rounded-lg p-4 transition-colors duration-300">
                          <p className="text-coal-black">Luz de freio traseira direita não está funcionando. Necessário substituição da lâmpada. Fluido de freio próximo ao nível mínimo, recomenda-se completar.</p>
                        </div>
                      </div>

                      {/* Resumo */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 transition-colors duration-300">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Resumo do Checklist</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">3</p>
                            <p className="text-sm text-green-700">Conformes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">1</p>
                            <p className="text-sm text-yellow-700">Atenção</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">1</p>
                            <p className="text-sm text-red-700">Não Conformes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
        
        {/* Modal de Detalhes */}
        {isModalOpen && selectedViatura && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border transition-colors duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-coal-black transition-colors duration-300">Detalhes da Viatura</h2>
                  <button
                    onClick={closeModal}
                    className="text-coal-black/60 hover:text-coal-black:text-dark-text transition-colors duration-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-coal-black/60 transition-colors duration-300">Código</label>
                      <p className="font-medium text-coal-black transition-colors duration-300">{selectedViatura.codigo}</p>
                    </div>
                    <div>
                      <label className="text-sm text-coal-black/60 transition-colors duration-300">Tipo</label>
                      <p className="font-medium text-coal-black transition-colors duration-300">{selectedViatura.tipo}</p>
                    </div>
                    <div>
                      <label className="text-sm text-coal-black/60 transition-colors duration-300">Modelo</label>
                      <p className="font-medium text-coal-black transition-colors duration-300">{selectedViatura.modelo}</p>
                    </div>
                    <div>
                      <label className="text-sm text-coal-black/60 transition-colors duration-300">Ano</label>
                      <p className="font-medium text-coal-black transition-colors duration-300">{selectedViatura.ano}</p>
                    </div>
                    <div>
                      <label className="text-sm text-coal-black/60 transition-colors duration-300">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedViatura.status)}`}>
                        {selectedViatura.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm text-coal-black/60 transition-colors duration-300">Responsável</label>
                      <p className="font-medium text-coal-black transition-colors duration-300">{selectedViatura.responsavel}</p>
                    </div>
                  </div>
                  
                  {/* Informações Operacionais */}
                  <div className="border-t pt-6 transition-colors duration-300">
                    <h3 className="text-lg font-semibold text-coal-black mb-4 transition-colors duration-300">Informações Operacionais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-coal-black/60 transition-colors duration-300">Quilometragem</label>
                        <p className="font-medium text-coal-black transition-colors duration-300">{selectedViatura.quilometragem.toLocaleString()} km</p>
                      </div>
                      <div>
                        <label className="text-sm text-coal-black/60 transition-colors duration-300">Nível de Combustível</label>
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-coal-black/60 transition-colors duration-300" />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCombustivelColor(selectedViatura.combustivel)}`}>
                            {selectedViatura.combustivel}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-coal-black/60 transition-colors duration-300">Última Manutenção</label>
                        <p className="font-medium text-coal-black transition-colors duration-300">{selectedViatura.ultimaManutencao}</p>
                      </div>
                      <div>
                        <label className="text-sm text-coal-black/60 transition-colors duration-300">Próxima Manutenção</label>
                        <p className="font-medium text-coal-black transition-colors duration-300">{selectedViatura.proximaManutencao}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Observações */}
                  {selectedViatura.observacoes && (
                    <div className="border-t pt-6 transition-colors duration-300">
                      <h3 className="text-lg font-semibold text-coal-black mb-4 transition-colors duration-300">Observações</h3>
                      <p className="text-coal-black transition-colors duration-300">{selectedViatura.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de Adicionar Nova Viatura */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-coal-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-pure-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-fog-gray/20 flex flex-col transition-colors duration-300">
              <div className="bg-gradient-to-r from-radiant-orange to-radiant-orange/80 p-6 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pure-white/10 to-transparent transform -skew-x-12"></div>
                <div className="relative w-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-pure-white leading-tight mb-2">Adicionar Nova Viatura</h2>
                    <p className="text-pure-white/80 text-sm leading-relaxed">Preencha os dados da nova viatura</p>
                  </div>
                  <button
                    onClick={closeAddModal}
                    className="absolute -top-2 -right-4 p-1 text-pure-white/70 hover:text-pure-white transition-all duration-200 z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-pure-white to-fog-gray/5 scrollbar-thin scrollbar-thumb-radiant-orange/30 scrollbar-track-fog-gray/10 transition-colors duration-300">
                
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-6 mb-6 shadow-sm transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2 transition-colors duration-300">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Dados Básicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">Código *</label>
                      <input
                        type="text"
                        value={newViatura.codigo || ''}
                        onChange={(e) => updateNewViaturaField('codigo', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 text-coal-black"
                        placeholder="Ex: ABT-04"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">Tipo *</label>
                      <select
                        value={newViatura.tipo || ''}
                        onChange={(e) => updateNewViaturaField('tipo', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 text-coal-black"
                      >
                      <option value="">Selecione o tipo</option>
                      <option value="cci">Carro Contra Incêndio-CCI</option>
                    <option value="crs">Carro De Resgate E Salvamento-CRS</option>
                    <option value="rt">Carro Contra Incêndio-RT</option>
                    <option value="ca">Carro De Apoio-CA</option>
                    </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">Modelo *</label>
                      <input
                        type="text"
                        value={newViatura.modelo || ''}
                        onChange={(e) => updateNewViaturaField('modelo', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 text-coal-black"
                        placeholder="Ex: Mercedes-Benz Atego"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">ATIV *</label>
                      <input
                        type="date"
                        value={newViatura.ano || new Date().getFullYear()}
                        onChange={(e) => updateNewViaturaField('ano', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 text-coal-black"
                        placeholder="dd/mm/aaaa"
                        lang="pt-BR"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">Status</label>
                      <select 
                      value={newViatura.status} 
                      onChange={(e) => updateNewViaturaField('status', e.target.value)}
                      className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 text-coal-black"
                    >
                      <option value="">Selecione o status</option>
                      <option value="em linha">Em Linha</option>
                      <option value="reserva técnica">Reserva Técnica</option>
                      <option value="manutenção">Manutenção</option>
                      <option value="baixada">Baixada</option>
                    </select>
                    </div>

                  </div>
                </div>
                  
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-6 mb-6 shadow-sm transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2 transition-colors duration-300">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Informações Operacionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">Quilometragem</label>
                      <input
                        type="number"
                        value={newViatura.quilometragem || 0}
                        onChange={(e) => updateNewViaturaField('quilometragem', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 text-coal-black"
                        placeholder="Ex: 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">Combustível (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newViatura.combustivel || 100}
                        onChange={(e) => updateNewViaturaField('combustivel', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 text-coal-black"
                        placeholder="Ex: 85"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">Última Manutenção</label>
                      <input
                        type="date"
                        value={newViatura.ultimaManutencao || ''}
                        onChange={(e) => updateNewViaturaField('ultimaManutencao', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 text-coal-black"
                        placeholder="dd/mm/aaaa"
                        lang="pt-BR"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">Próxima Manutenção Preventiva</label>
                      <input
                        type="date"
                        value={newViatura.proximaManutencao || ''}
                        onChange={(e) => updateNewViaturaField('proximaManutencao', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 text-coal-black"
                        placeholder="dd/mm/aaaa"
                        lang="pt-BR"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-pure-white rounded-xl border border-fog-gray/20 p-6 mb-6 shadow-sm transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-coal-black mb-4 flex items-center gap-2 transition-colors duration-300">
                    <div className="w-2 h-2 bg-radiant-orange rounded-full"></div>
                    Observações
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-coal-black mb-2 transition-colors duration-300">Observações</label>
                      <textarea
                        value={newViatura.observacoes || ''}
                        onChange={(e) => updateNewViaturaField('observacoes', e.target.value)}
                        className="w-full px-4 py-3 border border-fog-gray/30 rounded-xl focus:ring-2 focus:ring-radiant-orange focus:border-radiant-orange transition-all duration-200 bg-pure-white hover:border-radiant-orange/50 resize-none text-coal-black"
                        placeholder="Observações adicionais sobre a viatura"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                  

              </div>
              <div className="border-t border-fog-gray/20 bg-pure-white p-6 flex justify-end gap-4 rounded-b-2xl transition-colors duration-300">
                <button
                  onClick={closeAddModal}
                  className="px-8 py-3 border-2 border-fog-gray/30 text-coal-black rounded-xl hover:bg-fog-gray/10:bg-dark-bg hover:border-fog-gray/50:border-dark-border transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={addViatura}
                  type="button"
                  className="bg-gradient-to-r from-radiant-orange to-radiant-orange/90 hover:from-radiant-orange/90 hover:to-radiant-orange text-pure-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Registrar Viatura
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarDemo>
  );
}
