'use client';

import { useAuth } from '@/contexts/AuthContext';
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
  const { user, loading } = useAuth(); // PRIMEIRO: useAuth
  
  // SEGUNDO: Proteções (antes de outros hooks)
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

  // TERCEIRO: Outros hooks (sempre executados na mesma ordem)
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState([]);
  const [equipeFilter, setEquipeFilter] = useState([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showEquipeDropdown, setShowEquipeDropdown] = useState(false);
  const [areaFilter, setAreaFilter] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  // RESTO DO CÓDIGO CONTINUA IGUAL...
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
  }, [data, dateFilter, typeFilter, equipeFilter, areaFilter]); // Adicionei equipeFilter e areaFilter nas dependências

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
        {/* Header com props do usuário */}
      <Header />
        
        <div className="flex-1 bg-gradient-to-br from-white via-orange-50/30 to-gray-50 p-8 min-h-screen">
          {/* Título */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl -z-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-gray-800 bg-clip-text text-transparent mb-3 flex items-center gap-3">
                  <BarChart3 className="w-10 h-10 text-orange-600" />
                  Dashboard Inteligência Operacional
                </h1>
                <p className="text-gray-600 text-lg font-medium">Análise avançada de ocorrências e performance operacional</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  Tempo Real
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
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
                           'Incêndio em Vegetação',
                           'Acidentes de Trânsito',
                           'Vazamento de Gás',
                           'Incêndio Estrutural',
                           'Artigos Perigosos',
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
                         <path strokeLinecap="round" stro
