'use client';

import { SidebarDemo } from '@/components/ui/sidebar-demo';
import Header from '@/components/ui/header';
import { useState, useEffect } from 'react';
import { 
  Shield, Timer, Target, Plus, Eye, Edit, Trash2, Loader2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FormularioEpiEpr from '@/components/FormularioEpiEpr';
import DetalhesExercicioEpi from '@/components/DetalhesExercicioEpi'; // Importa o novo modal
import { supabase } from '@/lib/supabase';

// --- TIPO DE DADO PARA O HISTÓRICO ---
interface ExercicioHistorico {
  id: string;
  data_exercicio: string;
  hora_exercicio: string;
  equipe: string;
  chefe_equipe_nome: string;
  gerente_sci_nome: string;
}

type TipoExercicio = 'epi-epr' | 'tempo-resposta' | 'posicionamento';

export default function ExerciciosPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TipoExercicio>('epi-epr');
  const [isFormEpiOpen, setIsFormEpiOpen] = useState(false);
  const [selectedExercicioId, setSelectedExercicioId] = useState<string | null>(null); // Estado para o modal de detalhes

  // --- ESTADOS PARA O HISTÓRICO ---
  const [exercicios, setExercicios] = useState<ExercicioHistorico[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // --- EFEITO PARA BUSCAR O HISTÓRICO ---
  useEffect(() => {
    const fetchHistory = async () => {
      if (activeTab === 'epi-epr' && user) {
        setIsLoadingHistory(true);
        setHistoryError(null);
        const { data, error } = await supabase.rpc('get_exercicios_epi_historico');

        if (error) {
          setHistoryError("Não foi possível carregar o histórico.");
        } else {
          setExercicios(data || []);
        }
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [activeTab, user, isFormEpiOpen]); // Recarrega quando o form fecha

  // Proteção de rota
  if (authLoading) {
    return ( <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div> );
  }
  if (!user) {
    return ( <div className="flex items-center justify-center min-h-screen"><p className="text-lg">Acesso negado</p></div> );
  }

  // --- RENDERIZAÇÃO DA TABELA DE HISTÓRICO ---
  const renderEpiHistory = () => {
    if (isLoadingHistory) {
      return (
        <div className="text-center p-12"><Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-500" /><p className="mt-4 text-gray-600">Carregando histórico...</p></div>
      );
    }
    if (historyError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"><AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-red-900 mb-2">Erro ao Carregar</h3><p className="text-red-700">{historyError}</p></div>
      );
    }
    if (exercicios.length === 0) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"><Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-blue-900 mb-2">Nenhum Exercício Registrado</h3><p className="text-blue-700">Clique em "Novo Exercício EPI" para começar.</p></div>
      );
    }
    return (
      <div className="overflow-x-auto bg-white rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Data</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Equipe</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Chefe de Equipe</th>
              <th className="px-6 py-3 text-center font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exercicios.map((ex) => (
              <tr key={ex.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(ex.data_exercicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 font-semibold leading-tight text-blue-700 bg-blue-100 rounded-full">{ex.equipe}</span></td>
                <td className="px-6 py-4 whitespace-nowrap">{ex.chefe_equipe_nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-4">
                    <button onClick={() => setSelectedExercicioId(ex.id)} className="text-blue-600 hover:text-blue-900" title="Visualizar Detalhes"><Eye className="w-5 h-5"/></button>
                    <button className="text-yellow-600 hover:text-yellow-900" title="Editar"><Edit className="w-5 h-5"/></button>
                    <button className="text-red-600 hover:text-red-900" title="Excluir"><Trash2 className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Configuração das tabs
  const tabs = [
    { id: 'epi-epr' as TipoExercicio, name: 'EPI/EPR', icon: Shield, description: 'Equipamentos de Proteção', color: 'blue' },
    { id: 'tempo-resposta' as TipoExercicio, name: 'Tempo de Resposta', icon: Timer, description: 'Cronometragem', color: 'green' },
    { id: 'posicionamento' as TipoExercicio, name: 'Posicionamento', icon: Target, description: 'Intervenção Tática', color: 'orange' }
  ];

  const getTabStyles = (tabId: TipoExercicio, color: string) => {
    const isActive = activeTab === tabId;
    const colorMap = {
      blue: isActive ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-blue-50',
      green: isActive ? 'bg-green-500 text-white' : 'text-green-600 hover:bg-green-50',
      orange: isActive ? 'bg-orange-500 text-white' : 'text-orange-600 hover:bg-orange-50'
    };
    return colorMap[color as keyof typeof colorMap];
  };

  // --- CÓDIGO JSX PRINCIPAL ---
  return (
    <>
      {isFormEpiOpen && <FormularioEpiEpr onClose={() => setIsFormEpiOpen(false)} />}
      {selectedExercicioId && <DetalhesExercicioEpi exercicioId={selectedExercicioId} onClose={() => setSelectedExercicioId(null)} />}
      <SidebarDemo>
        <div className="flex flex-col h-full">
          <Header />
          <div className="flex-1 bg-gray-50 overflow-auto min-h-screen">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Exercícios</h1>
                <p className="text-gray-600">Gerenciamento completo dos exercícios operacionais da SCI</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                          className={`${getTabStyles(tab.id, tab.color)} group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${ activeTab === tab.id ? 'border-current' : 'border-transparent hover:border-gray-300'}`}>
                          <Icon className="w-5 h-5 mr-2" />
                          <div className="text-left">
                            <div className="font-semibold">{tab.name}</div>
                            <div className={`text-xs mt-1 ${activeTab === tab.id ? 'text-white/80' : 'text-gray-500'}`}>
                              {tab.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>
                <div className="p-6">
                  {activeTab === 'epi-epr' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Shield className="w-6 h-6 text-blue-500" />Exercícios EPI/EPR</h2>
                          <p className="text-gray-600 mt-1">Histórico de exercícios de equipamentos de proteção</p>
                        </div>
                        <button onClick={() => setIsFormEpiOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />Novo Exercício EPI
                        </button>
                      </div>
                      {renderEpiHistory()}
                    </div>
                  )}

                  {activeTab === 'tempo-resposta' && (
                     <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <Timer className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Módulo em Construção</h3>
                      <p className="text-green-700">A funcionalidade de Tempo de Resposta será implementada em breve.</p>
                    </div>
                  )}
                  
                  {activeTab === 'posicionamento' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                      <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-orange-900 mb-2">Módulo em Construção</h3>
                      <p className="text-orange-700">A funcionalidade de Posicionamento será implementada em breve.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarDemo>
    </>
  );
}