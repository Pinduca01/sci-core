'use client';

import { SidebarDemo } from '@/components/ui/sidebar-demo';
import Header from '@/components/ui/header';
import { useState, useEffect } from 'react';
import { Search, Filter, FileText, AlertTriangle, Plus, LayoutGrid, List, MoreHorizontal, Eye, Edit, Trash2, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Dados mock de ocorrências para demonstração
const ocorrenciasMock = [
  {
    id: 1,
    titulo: "Fogo em vegetação",
    tipo: "Incêndio Florestal",
    status: "Aberta",
    prioridade: "Alta",
    endereco: "próximo a cabeceira 32",
    dataOcorrencia: "12/08/2025",
    horaOcorrencia: "00:32:00",
    equipe: "Charlie",
    responsavel: "Sgt. Silva",
    descricao: "PEGOU FOGO EM ÁREA DE VEGETAÇÃO"
  },
  {
    id: 2,
    titulo: "Fogo em trem de pouso de Aeronave",
    tipo: "Emergência Aeronáutica",
    status: "Em Andamento", 
    prioridade: "Crítica",
    endereco: "Taxway Alfa",
    dataOcorrencia: "11/08/2025",
    horaOcorrencia: "09:36:00",
    equipe: "Alpha",
    responsavel: "Cap. Santos",
    descricao: "Ocorrência aeronáutica"
  },
  {
    id: 3,
    titulo: "Atendimento médico",
    tipo: "Emergência Médica",
    status: "Resolvida",
    prioridade: "Média",
    endereco: "Terminal de Passageiros",
    dataOcorrencia: "10/08/2025", 
    horaOcorrencia: "14:15:00",
    equipe: "Bravo",
    responsavel: "Cb. Lima",
    descricao: "Atendimento a passageiro"
  }
];

export default function OcorrenciasPage() {
  const { user, loading } = useAuth();
  const [ocorrencias, setOcorrencias] = useState(ocorrenciasMock);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  // Proteção de rota
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Acesso negado</div>
      </div>
    );
  }

  // Verificar permissões - apenas DIRETOR, GS e BA-CE podem acessar
  const canAccess = ['DIRETOR', 'GS', 'BA-CE'].includes(user.role);
  
  if (!canAccess) {
    return (
      <SidebarDemo>
        <div className="flex flex-col h-full">
          <Header />
          <div className="flex-1 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
              <p className="text-gray-600">Seu nível de acesso não permite visualizar ocorrências.</p>
              <p className="text-sm text-gray-500 mt-2">Contate seu supervisor para mais informações.</p>
            </div>
          </div>
        </div>
      </SidebarDemo>
    );
  }

  // Filtrar ocorrências
  const filteredOcorrencias = ocorrencias.filter(ocorrencia => {
    const matchSearch = searchTerm === '' || 
      ocorrencia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ocorrencia.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ocorrencia.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = statusFilter === '' || ocorrencia.status === statusFilter;
    const matchTipo = tipoFilter === '' || ocorrencia.tipo === tipoFilter;
    
    return matchSearch && matchStatus && matchTipo;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberta': return 'bg-red-100 text-red-800';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Resolvida': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Crítica': return 'bg-red-500 text-white';
      case 'Alta': return 'bg-orange-500 text-white';
      case 'Média': return 'bg-yellow-500 text-white';
      case 'Baixa': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <SidebarDemo>
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 bg-gray-50 overflow-auto min-h-screen">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Cabeçalho */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Ocorrências</h1>
              <p className="text-gray-600">Controle completo das ocorrências da corporação</p>
            </div>

            {/* Barra de ações */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova ocorrência
                </button>
                
                {/* Toggle de visualização */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por título, endereço ou responsável"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">Todos os status</option>
                  <option value="Aberta">Aberta</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Resolvida">Resolvida</option>
                </select>

                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">Todos os tipos</option>
                  <option value="Incêndio Florestal">Incêndio Florestal</option>
                  <option value="Emergência Aeronáutica">Emergência Aeronáutica</option>
                  <option value="Emergência Médica">Emergência Médica</option>
                </select>

                <input
                  type="date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Histórico de ocorrências */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Histórico de ocorrências da SCI
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Registro completo de todas as ocorrências atendidas pela Seção Contra Incêndio
                </p>
              </div>

              {/* Visualização em Cards */}
              {viewMode === 'cards' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOcorrencias.map((ocorrencia) => (
                      <div key={ocorrencia.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <h4 className="font-semibold text-gray-900">{ocorrencia.titulo}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ocorrencia.status)}`}>
                              {ocorrencia.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ocorrencia.prioridade)}`}>
                              {ocorrencia.prioridade}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {ocorrencia.endereco}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {ocorrencia.dataOcorrencia} às {ocorrencia.horaOcorrencia}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            Equipe {ocorrencia.equipe}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">{ocorrencia.descricao}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Resp.: {ocorrencia.responsavel}</span>
                          <div className="flex items-center gap-1">
                            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visualização em Lista */}
              {viewMode === 'list' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOcorrencias.map((ocorrencia) => (
                        <tr key={ocorrencia.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {ocorrencia.tipo}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{ocorrencia.titulo}</div>
                            <div className="text-sm text-gray-500">{ocorrencia.endereco}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ocorrencia.status)}`}>
                              {ocorrencia.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Equipe {ocorrencia.equipe}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ocorrencia.dataOcorrencia}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredOcorrencias.length === 0 && (
                <div className="p-12 text-center">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ocorrência encontrada</h3>
                  <p className="text-gray-500">Ajuste os filtros ou adicione uma nova ocorrência.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarDemo>
  );
}