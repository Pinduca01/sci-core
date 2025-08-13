'use client';

import Header from '@/components/ui/header';
import { SidebarDemo } from '@/components/ui/sidebar-demo';
import { useState, useEffect } from 'react';
import { Calendar, Filter, BarChart3, TrendingUp, Activity, AlertTriangle, CheckCircle, Clock, Eye, Users, MapPin, X, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Dados mockados para demonstração
const generateMockData = () => {
  const tipos = ['Remoção de Animais', 'Emergências Médicas', 'Incêndio em Vegetação', 'Acidentes de Trânsito', 'Vazamento de Gás', 'Incêndio Estrutural', 'Artigos Perigosos', 'Outros'];
  const locais = ['Setor Central', 'Bairro Norte', 'Zona Leste', 'Centro Sul'];
  const status = ['Resolvido', 'Em andamento', 'Pendente'];
  const equipes = ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA'];
  
  const data = [];
  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const tipo = tipos[i % tipos.length];
    let duracao, deslocamento;
    
    // Duração baseada no tipo de ocorrência
    switch (tipo) {
      case 'Remoção de Animais':
        duracao = 25 + Math.floor(Math.random() * 15);
        deslocamento = 6 + Math.floor(Math.random() * 5);
        break;
      case 'Emergências Médicas':
        duracao = 35 + Math.floor(Math.random() * 20);
        deslocamento = 10 + Math.floor(Math.random() * 6);
        break;
      case 'Incêndio em Vegetação':
        duracao = 80 + Math.floor(Math.random() * 40);
        deslocamento = 12 + Math.floor(Math.random() * 8);
        break;
      case 'Acidentes de Trânsito':
        duracao = 40 + Math.floor(Math.random() * 20);
        deslocamento = 8 + Math.floor(Math.random() * 6);
        break;
      case 'Vazamento de Gás':
        duracao = 55 + Math.floor(Math.random() * 20);
        deslocamento = 7 + Math.floor(Math.random() * 5);
        break;
      default:
        duracao = 30 + Math.floor(Math.random() * 30);
        deslocamento = 8 + Math.floor(Math.random() * 8);
    }
    
    data.push({
      id: i + 1,
      data: date.toISOString().split('T')[0],
      tipo: tipo,
      local: locais[i % locais.length],
      status: status[i % status.length],
      equipe: equipes[i % equipes.length],
      duracao: duracao,
      deslocamento: deslocamento,
      qtd: 1
    });
  }
  return data.reverse();
};

// Dados para gráficos Recharts
const dadosGraficoBarras = [
  { tipo: 'Incêndio', quantidade: 15, cor: '#ef4444' },
  { tipo: 'Assalto', quantidade: 12, cor: '#f97316' },
  { tipo: 'Acidente', quantidade: 8, cor: '#eab308' },
  { tipo: 'Outros', quantidade: 6, cor: '#22c55e' },
];

const dadosGraficoLinha = [
  { mes: 'Jan', ocorrencias: 25 },
  { mes: 'Fev', ocorrencias: 30 },
  { mes: 'Mar', ocorrencias: 28 },
  { mes: 'Abr', ocorrencias: 35 },
  { mes: 'Mai', ocorrencias: 32 },
  { mes: 'Jun', ocorrencias: 40 },
];

const dadosGraficoPizza = [
  { name: 'Resolvido', value: 65, color: '#22c55e' },
  { name: 'Em andamento', value: 25, color: '#eab308' },
  { name: 'Pendente', value: 10, color: '#ef4444' },
];

const CORES = ['#22c55e', '#eab308', '#ef4444'];

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState([]);
  const [equipeFilter, setEquipeFilter] = useState([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showEquipeDropdown, setShowEquipeDropdown] = useState(false);
  const [areaFilter, setAreaFilter] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Dados mockados do usuário
  const userData = {
    userName: 'João Silva',
    userEmail: 'joao.silva@empresa.com'
  };

  useEffect(() => {
    const mockData = generateMockData();
    setData(mockData);
    setFilteredData(mockData);
    
    // Definir datas padrão
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setDateFilter({
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    let filtered = data;
    
    // Filtro por data
    if (dateFilter.start && dateFilter.end) {
      filtered = filtered.filter(item => 
        item.data >= dateFilter.start && item.data <= dateFilter.end
      );
    }
    
    // Filtro por tipo
    if (typeFilter.length > 0) {
      filtered = filtered.filter(item => typeFilter.includes(item.tipo));
    }
    
    // Filtro por equipe
    if (equipeFilter.length > 0) {
      filtered = filtered.filter(item => equipeFilter.includes(item.equipe || 'ALFA'));
    }
    
    // Filtro por área
    if (areaFilter) {
      filtered = filtered.filter(item => 
        item.local && item.local.toLowerCase().includes(areaFilter.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  }, [data, dateFilter, typeFilter]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowTypeDropdown(false);
        setShowEquipeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cálculos dos indicadores baseados nos dados filtrados
  const totalOcorrencias = filteredData.length;
  const duracaoMedia = totalOcorrencias > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + (curr.duracao || 45), 0) / totalOcorrencias) : 45;
  const deslocamentoMedio = totalOcorrencias > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + (curr.deslocamento || 11), 0) / totalOcorrencias) : 11;
  
  // Tipo mais frequente
  const tipoCount = filteredData.reduce((acc, curr) => {
    acc[curr.tipo] = (acc[curr.tipo] || 0) + 1;
    return acc;
  }, {});
  
  const principalTipo = Object.entries(tipoCount).sort(([,a], [,b]) => b - a)[0];
  const principalIncidente = principalTipo ? principalTipo[0] : 'Remoção de Animais';
  const principalPercentual = principalTipo && totalOcorrencias > 0 ? Math.round((principalTipo[1] / totalOcorrencias) * 100) : 35;

  // Dados para gráficos baseados nos filtros aplicados
  const getChartData = () => {
    // Ocorrências mais frequentes
    const ocorrenciasFrequentes = Object.entries(tipoCount)
      .map(([tipo, count]) => ({ 
        tipo, 
        count, 
        percentage: totalOcorrencias > 0 ? (count / totalOcorrencias) * 100 : 0,
        color: {
          'Remoção de Animais': 'bg-red-500',
          'Emergências Médicas': 'bg-blue-500',
          'Incêndio em Vegetação': 'bg-orange-500',
          'Acidentes de Trânsito': 'bg-yellow-500',
          'Vazamento de Gás': 'bg-green-500',
          'Incêndio Estrutural': 'bg-purple-500',
          'Artigos Perigosos': 'bg-gray-500'
        }[tipo] || 'bg-gray-500'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
    
    // Análise de duração por tipo
    const duracaoPorTipo = Object.entries(tipoCount).map(([tipo, count]) => {
      const ocorrenciasTipo = filteredData.filter(o => o.tipo === tipo);
      const duracaoTotal = ocorrenciasTipo.reduce((acc, curr) => acc + (curr.duracao || 45), 0) / count;
      const deslocamentoMedio = ocorrenciasTipo.reduce((acc, curr) => acc + (curr.deslocamento || 11), 0) / count;
      
      return {
        tipo,
        total: Math.round(duracaoTotal),
        deslocamento: Math.round(deslocamentoMedio),
        atendimento: Math.round(duracaoTotal - deslocamentoMedio)
      };
    }).sort((a, b) => b.total - a.total).slice(0, 5);
    
    return { ocorrenciasFrequentes, duracaoPorTipo };
  };

  const chartData = getChartData();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolvido': return 'text-green-600 bg-green-100';
      case 'Em andamento': return 'text-blue-600 bg-blue-100';
      case 'Pendente': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Incêndio': return 'bg-red-500';
      case 'Assalto': return 'bg-orange-500';
      case 'Acidente': return 'bg-blue-500';
      case 'Outros': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <SidebarDemo>
      <div className="flex flex-col h-full">
        <Header userName={userData.userName} userEmail={userData.userEmail} />
        
        <div className="flex-1 bg-gradient-to-br from-pure-white to-fog-gray/20 p-8">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard - Módulo de Ocorrências</h1>
            <p className="text-gray-600">Visão geral das ocorrências registradas no sistema</p>
          </div>

          {/* Sistema de Filtros Avançado */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="space-y-6">
              {/* Filtro de Período (Obrigatório) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Período de Análise
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">Obrigatório</span>
                </label>
                
                {/* Botões de Atalho */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { label: 'Hoje', days: 0 },
                    { label: 'Últimos 7 dias', days: 7 },
                    { label: 'Este mês', days: 30 },
                    { label: 'Últimos 30 dias', days: 30 },
                    { label: 'Este ano', days: 365 }
                  ].map((period) => (
                    <button
                      key={period.label}
                      onClick={() => {
                        const today = new Date();
                        const startDate = new Date(today);
                        if (period.days > 0) {
                          startDate.setDate(today.getDate() - period.days);
                        }
                        setDateFilter({
                          start: startDate.toISOString().split('T')[0],
                          end: today.toISOString().split('T')[0]
                        });
                        setShowCustomDate(false);
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                    >
                      {period.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCustomDate(!showCustomDate)}
                    className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                      showCustomDate 
                        ? 'border-orange-500 bg-orange-50 text-orange-600' 
                        : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                    }`}
                  >
                    Intervalo Personalizado
                  </button>
                </div>
                
                {/* Seletor de Data Personalizado */}
                {showCustomDate && (
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                      <input
                        type="date"
                        value={dateFilter.start}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                      <input
                        type="date"
                        value={dateFilter.end}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Linha de Filtros Secundários */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Filtro por Tipo de Ocorrência */}
                 <div className="relative dropdown-container">
                   <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                     <Filter className="w-4 h-4 text-gray-600" />
                     Tipo de Ocorrência
                   </label>
                   <div className="relative">
                     <button
                       onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-left flex items-center justify-between hover:border-orange-400"
                     >
                       <span className="text-gray-700">
                         {typeFilter.length === 0 
                           ? 'Selecionar tipos...' 
                           : `${typeFilter.length} tipo(s) selecionado(s)`
                         }
                       </span>
                       <svg className={`w-5 h-5 text-gray-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </button>
                     
                     {showTypeDropdown && (
                       <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                         {[
                           'Remoção de Animais',
                           'Emergências Médicas', 
                           'Incêndio',
                           'Vazamento de Combustível',
                           'Pouso de Emergência',
                           'Condições de Baixa Visibilidade',
                           'Atendimento à Aeronave Presidencial',
                           'Outros'
                         ].map((tipo) => (
                           <label key={tipo} className="flex items-center px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                             <input
                               type="checkbox"
                               checked={typeFilter.includes(tipo)}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setTypeFilter([...typeFilter, tipo]);
                                 } else {
                                   setTypeFilter(typeFilter.filter(t => t !== tipo));
                                 }
                               }}
                               className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                             />
                             <span className="ml-3 text-sm text-gray-700">{tipo}</span>
                           </label>
                         ))}
                       </div>
                     )}
                   </div>
                   {typeFilter.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-2">
                       {typeFilter.map((tipo) => (
                         <span key={tipo} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                           {tipo.length > 20 ? tipo.substring(0, 20) + '...' : tipo}
                           <button
                             onClick={() => setTypeFilter(typeFilter.filter(t => t !== tipo))}
                             className="ml-1 text-orange-600 hover:text-orange-800"
                           >
                             ×
                           </button>
                         </span>
                       ))}
                     </div>
                   )}
                 </div>
                
                {/* Filtro por Equipe */}
                 <div className="relative dropdown-container">
                   <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                     <Users className="w-4 h-4 text-gray-600" />
                     Equipe
                   </label>
                   <div className="relative">
                     <button
                       onClick={() => setShowEquipeDropdown(!showEquipeDropdown)}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-left flex items-center justify-between hover:border-orange-400"
                     >
                       <span className="text-gray-700">
                         {equipeFilter.length === 0 
                           ? 'Selecionar equipes...' 
                           : `${equipeFilter.length} equipe(s) selecionada(s)`
                         }
                       </span>
                       <svg className={`w-5 h-5 text-gray-400 transition-transform ${showEquipeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </button>
                     
                     {showEquipeDropdown && (
                       <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                         {['ALFA', 'BRAVO', 'CHARLIE', 'DELTA'].map((equipe) => (
                           <label key={equipe} className="flex items-center px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                             <input
                               type="checkbox"
                               checked={equipeFilter.includes(equipe)}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                   setEquipeFilter([...equipeFilter, equipe]);
                                 } else {
                                   setEquipeFilter(equipeFilter.filter(eq => eq !== equipe));
                                 }
                               }}
                               className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                             />
                             <span className="ml-3 text-sm text-gray-700 font-medium">{equipe}</span>
                           </label>
                         ))}
                       </div>
                     )}
                   </div>
                   {equipeFilter.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-2">
                       {equipeFilter.map((equipe) => (
                         <span key={equipe} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                           {equipe}
                           <button
                             onClick={() => setEquipeFilter(equipeFilter.filter(eq => eq !== equipe))}
                             className="ml-1 text-blue-600 hover:text-blue-800"
                           >
                             ×
                           </button>
                         </span>
                       ))}
                     </div>
                   )}
                 </div>
                
                {/* Filtro por Área */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    Área
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: V-13, T-11, BOX 23..."
                      value={areaFilter}
                      onChange={(e) => setAreaFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                      list="areas-list"
                    />
                    <datalist id="areas-list">
                      <option value="V-13" />
                      <option value="V-14" />
                      <option value="T-11" />
                      <option value="T-12" />
                      <option value="BOX 23" />
                      <option value="BOX 24" />
                      <option value="PÁTIO A" />
                      <option value="PÁTIO B" />
                      <option value="TERMINAL 1" />
                      <option value="TERMINAL 2" />
                    </datalist>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Digite para buscar ou selecionar</p>
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {(typeFilter.length > 0 || equipeFilter.length > 0 || areaFilter || dateFilter.start || dateFilter.end) && (
                    <span>Filtros ativos: {[
                      typeFilter.length > 0 && `${typeFilter.length} tipo(s)`,
                      equipeFilter.length > 0 && `${equipeFilter.length} equipe(s)`,
                      areaFilter && 'área',
                      (dateFilter.start || dateFilter.end) && 'período'
                    ].filter(Boolean).join(', ')}</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {(typeFilter.length > 0 || equipeFilter.length > 0 || areaFilter || dateFilter.start || dateFilter.end) && (
                    <button
                      onClick={() => {
                        setTypeFilter([]);
                        setEquipeFilter([]);
                        setAreaFilter('');
                        setDateFilter({ start: '', end: '' });
                        setShowCustomDate(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors border border-gray-300 rounded-lg hover:border-orange-300"
                    >
                      <X className="w-4 h-4" />
                      Limpar Filtros
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      // Aqui você pode implementar a lógica de aplicar filtros
                      console.log('Aplicando filtros:', { dateFilter, typeFilter, equipeFilter, areaFilter });
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 1: Resumo Executivo - KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* KPI 1: Total de Ocorrências */}
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total de Ocorrências</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{totalOcorrencias}</p>
                  <p className="text-sm text-green-600 font-medium flex items-center">
                    <span className="mr-1">▲</span> 15% vs. Período Anterior
                  </p>
                </div>
                <div className="h-14 w-14 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">📊</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Duração Total Média */}
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Duração Total Média</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{duracaoMedia} min</p>
                  <p className="text-xs text-gray-500">Do acionamento à finalização</p>
                </div>
                <div className="h-14 w-14 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-2xl">⏱️</span>
                </div>
              </div>
            </div>

            {/* KPI 3: Deslocamento Médio */}
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Deslocamento Médio</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{deslocamentoMedio} min</p>
                  <p className="text-xs text-gray-500">Do acionamento à chegada</p>
                </div>
                <div className="h-14 w-14 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-2xl">🚑</span>
                </div>
              </div>
            </div>

            {/* KPI 4: Principal Incidente */}
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Principal Incidente</p>
                  <p className="text-xl font-bold text-gray-900 mb-1">{principalIncidente}</p>
                  <p className="text-sm text-blue-600 font-medium">{principalPercentual}% do Total</p>
                </div>
                <div className="h-14 w-14 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Análise Visual Detalhada */}
          <div className="space-y-6 mb-8">
            {/* Gráfico 1: Ocorrências Mais Frequentes */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ocorrências Mais Frequentes</h3>
                <p className="text-sm text-gray-600">Quais são nossos maiores e mais recorrentes problemas operacionais?</p>
              </div>
              <div className="space-y-3">
                {chartData.ocorrenciasFrequentes.length > 0 ? chartData.ocorrenciasFrequentes.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-40 text-sm font-medium text-gray-700 text-right">
                      {item.tipo}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} transition-all duration-500 ease-out`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm font-semibold text-gray-900 text-center">
                      {item.count}
                    </div>
                    <div className="w-12 text-xs text-gray-500 text-right">
                      {item.percentage}%
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma ocorrência encontrada para os filtros aplicados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico 2: Análise de Duração e Eficiência */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Análise de Duração e Eficiência por Tipo</h3>
                <p className="text-sm text-gray-600">Onde estamos gastando mais tempo: no deslocamento ou no atendimento?</p>
                <div className="flex items-center space-x-6 mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-400 rounded"></div>
                    <span className="text-sm text-gray-600">Tempo de Deslocamento</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-sm text-gray-600">Tempo de Atendimento</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {chartData.duracaoPorTipo.length > 0 ? chartData.duracaoPorTipo.map((item, index) => (
                  <div key={index} className="">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.tipo}</span>
                      <span className="text-sm text-gray-500">{item.total} min total</span>
                    </div>
                    <div className="flex h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-400 transition-all duration-500"
                        style={{ width: `${(item.deslocamento / item.total) * 100}%` }}
                        title={`Deslocamento: ${item.deslocamento} min`}
                      ></div>
                      <div 
                        className="bg-blue-600 transition-all duration-500"
                        style={{ width: `${(item.atendimento / item.total) * 100}%` }}
                        title={`Atendimento: ${item.atendimento} min`}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>{item.deslocamento} min</span>
                      <span>{item.atendimento} min</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum dado de duração disponível para os filtros aplicados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gráficos em Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico 3: Evolução das Ocorrências */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                      Evolução das Ocorrências
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      {(() => {
                        const evolutionData = (() => {
                          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
                          const baseData = [35, 42, 38, 45, 41, 48];
                          const filterRatio = totalOcorrencias > 0 ? totalOcorrencias / 31 : 1;
                          return months.map((mes, index) => {
                            const ocorrencias = Math.round(baseData[index] * filterRatio);
                            const tendencia = Math.round((baseData[index] + 3) * filterRatio);
                            return { mes, ocorrencias, tendencia };
                          });
                        })();
                        const currentMonth = evolutionData[evolutionData.length - 1];
                        const previousMonth = evolutionData[evolutionData.length - 2];
                        const trend = currentMonth.ocorrencias > previousMonth.ocorrencias ? 'up' : 'down';
                        const percentage = Math.abs(((currentMonth.ocorrencias - previousMonth.ocorrencias) / previousMonth.ocorrencias) * 100).toFixed(1);
                        
                        return (
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            trend === 'up' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            <span>{trend === 'up' ? '↗' : '↘'}</span>
                            <span>{percentage}%</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <p className="text-base text-gray-600 leading-relaxed">Análise temporal do comportamento das ocorrências e identificação de tendências</p>
                </div>
                
                <div className="h-80 relative bg-white rounded-lg p-4 border border-gray-100">
                  {/* Grid de fundo */}
                  <div className="absolute inset-4 opacity-20">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="absolute w-full border-t border-gray-200" style={{ top: `${i * 25}%` }}></div>
                    ))}
                  </div>
                  
                  {/* Escala Y */}
                  <div className="absolute left-0 top-4 bottom-4 w-8 flex flex-col justify-between text-xs text-gray-500">
                    {(() => {
                      const evolutionData = (() => {
                        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
                        const baseData = [35, 42, 38, 45, 41, 48];
                        const filterRatio = totalOcorrencias > 0 ? totalOcorrencias / 31 : 1;
                        return months.map((mes, index) => {
                          const ocorrencias = Math.round(baseData[index] * filterRatio);
                          const tendencia = Math.round((baseData[index] + 3) * filterRatio);
                          return { mes, ocorrencias, tendencia };
                        });
                      })();
                      const maxValue = Math.max(...evolutionData.map(d => Math.max(d.ocorrencias, d.tendencia)));
                      return [...Array(5)].map((_, i) => (
                        <span key={i} className="text-right pr-1">{Math.round(maxValue - (i * maxValue / 4))}</span>
                      ));
                    })()}
                  </div>
                  
                  {(() => {
                    // Gerar dados de evolução baseados nos filtros
                    const getEvolutionData = () => {
                      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
                      const baseData = [35, 42, 38, 45, 41, 48];
                      
                      // Se há filtros aplicados, ajustar os dados proporcionalmente
                      const filterRatio = totalOcorrencias > 0 ? totalOcorrencias / 31 : 1;
                      
                      return months.map((mes, index) => {
                        const ocorrencias = Math.round(baseData[index] * filterRatio);
                        const tendencia = Math.round((baseData[index] + 3) * filterRatio);
                        return { mes, ocorrencias, tendencia };
                      });
                    };
                    
                    const evolutionData = getEvolutionData();
                    const maxValue = Math.max(...evolutionData.map(d => Math.max(d.ocorrencias, d.tendencia)));
                    
                    return (
                      <div className="absolute inset-0 ml-10 mr-4 mt-4 mb-12 flex items-end justify-between">
                        {evolutionData.map((item, index) => {
                          const maxHeight = 240;
                          const barHeight = maxValue > 0 ? (item.ocorrencias / maxValue) * maxHeight : 0;
                          const trendHeight = maxValue > 0 ? (item.tendencia / maxValue) * maxHeight : 0;
                          
                          return (
                            <div key={index} className="flex flex-col items-center space-y-3 group">
                              <div className="relative">
                                {/* Valor no topo da barra */}
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                                    {item.ocorrencias}
                                  </div>
                                </div>
                                
                                {/* Barra principal com gradiente */}
                                <div 
                                  className="w-12 rounded-t-lg transition-all duration-700 hover:scale-105 cursor-pointer shadow-sm" 
                                  style={{ 
                                    height: `${barHeight}px`,
                                    background: 'linear-gradient(180deg, #3B82F6 0%, #1E40AF 100%)'
                                  }}
                                  title={`${item.ocorrencias} ocorrências em ${item.mes}`}
                                />
                                
                                {/* Linha de tendência */}
                                <div 
                                  className="absolute top-0 w-2 bg-gradient-to-b from-red-400 to-red-600 rounded-full shadow-sm" 
                                  style={{ 
                                    height: `${trendHeight}px`,
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                  }}
                                  title={`Tendência: ${item.tendencia}`}
                                />
                                
                                {/* Ponto na linha de tendência */}
                                <div 
                                  className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md" 
                                  style={{ 
                                    top: `${trendHeight - 6}px`,
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                  }}
                                />
                              </div>
                              
                              {/* Label do mês */}
                              <div className="text-center">
                                <span className="text-sm font-semibold text-gray-700">{item.mes}</span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.ocorrencias} ocorr.
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                
                {/* Legenda aprimorada */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-lg" style={{ background: 'linear-gradient(180deg, #3B82F6 0%, #1E40AF 100%)' }}></div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Ocorrências Reais</span>
                          <p className="text-xs text-gray-500">Volume mensal de incidentes</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-2 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Linha de Tendência</span>
                          <p className="text-xs text-gray-500">Projeção estatística</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Período de análise</p>
                      <p className="text-sm font-semibold text-gray-700">Jan - Jun 2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico 4: Mapa de Calor de Incidentes */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Mapa de Calor - Horários de Pico</h3>
                  <p className="text-sm text-gray-600">Quando estamos mais ocupados?</p>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-9 gap-1 text-xs text-gray-500 mb-2">
                    <div></div>
                    <div className="text-center">00-03</div>
                    <div className="text-center">03-06</div>
                    <div className="text-center">06-09</div>
                    <div className="text-center">09-12</div>
                    <div className="text-center">12-15</div>
                    <div className="text-center">15-18</div>
                    <div className="text-center">18-21</div>
                    <div className="text-center">21-24</div>
                  </div>
                  {(() => {
                    // Gerar dados do mapa de calor baseados nos filtros
                    const getHeatmapData = () => {
                      const baseData = [
                        { dia: 'Dom', valores: [2, 1, 3, 8, 12, 15, 18, 14] },
                        { dia: 'Seg', valores: [1, 2, 5, 15, 22, 25, 20, 12] },
                        { dia: 'Ter', valores: [2, 1, 6, 18, 24, 28, 22, 15] },
                        { dia: 'Qua', valores: [1, 3, 7, 20, 26, 30, 25, 16] },
                        { dia: 'Qui', valores: [2, 2, 8, 22, 28, 32, 28, 18] },
                        { dia: 'Sex', valores: [3, 4, 10, 25, 30, 35, 32, 22] },
                        { dia: 'Sáb', valores: [4, 3, 8, 18, 25, 28, 30, 20] }
                      ];
                      
                      // Ajustar dados baseado nos filtros aplicados
                      const filterRatio = totalOcorrencias > 0 ? totalOcorrencias / 250 : 1;
                      
                      return baseData.map(linha => ({
                        ...linha,
                        valores: linha.valores.map(valor => Math.round(valor * filterRatio))
                      }));
                    };
                    
                    const heatmapData = getHeatmapData();
                    const maxValue = Math.max(...heatmapData.flatMap(linha => linha.valores));
                    
                    return heatmapData.map((linha, index) => (
                      <div key={index} className="grid grid-cols-9 gap-1">
                        <div className="text-xs text-gray-600 font-medium py-2 text-right pr-2">
                          {linha.dia}
                        </div>
                        {linha.valores.map((valor, cellIndex) => {
                          const intensity = maxValue > 0 ? Math.min(valor / maxValue, 1) : 0;
                          return (
                            <div
                              key={cellIndex}
                              className="h-8 rounded transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                                color: intensity > 0.5 ? 'white' : '#374151'
                              }}
                              title={`${linha.dia} ${cellIndex * 3}-${(cellIndex + 1) * 3}h: ${valor} ocorrências`}
                            >
                              {valor > 0 ? valor : ''}
                            </div>
                          );
                        })}
                      </div>
                    ));
                  })()}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                  <span>Menos atividade</span>
                  <div className="flex items-center space-x-1">
                    {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: `rgba(59, 130, 246, ${intensity})` }}
                      ></div>
                    ))}
                  </div>
                  <span>Mais atividade</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Detalhes */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                📋 Detalhes das Ocorrências
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.slice(0, 10).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getTipoColor(item.tipo)}`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.local}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status === 'Resolvido' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {item.status === 'Em andamento' && <Clock className="w-3 h-3 mr-1" />}
                          {item.status === 'Pendente' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredData.length > 10 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Mostrando 10 de {filteredData.length} ocorrências
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarDemo>
  );
}