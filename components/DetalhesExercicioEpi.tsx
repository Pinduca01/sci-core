'use client';

import React from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, X, Loader2, AlertTriangle, Calendar, Clock, User, Users, Timer } from 'lucide-react';

// --- TIPOS DE DADOS ---
interface ParticipanteDetalhes {
  nome: string;
  funcao: string;
  tempo_calca_bota: string | null;
  tempo_tp_completo: string | null;
  tempo_epr_tp_completo: string | null;
  tempo_epr_sem_tp: string | null;
}
interface DetalhesExercicio {
  id: string;
  data_exercicio: string;
  hora_exercicio: string;
  equipe: string;
  chefe_equipe_nome: string;
  gerente_sci_nome: string;
  observacoes: string | null;
  participantes: ParticipanteDetalhes[];
}
interface DetalhesExercicioEpiProps {
  exercicioId: string;
  onClose: () => void;
}

// Função para formatar o tempo
const formatInterval = (interval: string | null) => {
  if (!interval) return '--:--';
  const parts = interval.split(':');
  return `${parts[1]}:${parts[2].split('.')[0]}`;
};

// --- COMPONENTE PRINCIPAL ---
export default function DetalhesExercicioEpi({ exercicioId, onClose }: DetalhesExercicioEpiProps) {
  const [detalhes, setDetalhes] = React.useState<DetalhesExercicio | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDetalhes = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase.rpc('get_detalhes_exercicio_epi', { p_exercicio_id: exercicioId });

      if (error) {
        console.error("Erro ao buscar detalhes:", error);
        setError("Não foi possível carregar os detalhes do exercício.");
      } else {
        const fullDetails = {
          ...data.detalhes,
          participantes: data.participantes || []
        };
        setDetalhes(fullDetails);
      }
      setIsLoading(false);
    };

    if (exercicioId) {
      fetchDetalhes();
    }
  }, [exercicioId]);

  const renderContent = () => {
    if (isLoading) return <div className="text-center p-12"><Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-500" /><p className="mt-4">Carregando detalhes...</p></div>;
    if (error) return <div className="text-center p-12 text-red-600"><AlertTriangle className="mx-auto w-10 h-10"/><p>{error}</p></div>;
    if (!detalhes) return <div className="text-center p-12"><p>Nenhum detalhe encontrado.</p></div>;

    return (
      <div className="p-8 space-y-8">
        <div className="p-6 border rounded-lg bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Informações Gerais</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500"/><strong>Data:</strong> {new Date(detalhes.data_exercicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500"/><strong>Hora:</strong> {detalhes.hora_exercicio}</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-500"/><strong>Equipe:</strong> {detalhes.equipe}</div>
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500"/><strong>Chefe:</strong> {detalhes.chefe_equipe_nome}</div>
          </div>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Participantes e Tempos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Função</th>
                  <th className="px-4 py-3 text-center">1ª Tomada</th>
                  <th className="px-4 py-3 text-center">2ª Tomada</th>
                  <th className="px-4 py-3 text-center">3ª Tomada</th>
                  <th className="px-4 py-3 text-center">4ª Tomada</th>
                </tr>
              </thead>
              <tbody>
                {detalhes.participantes.map((p, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-medium text-gray-800">{p.nome}</td>
                    <td className="px-4 py-2 text-gray-600">{p.funcao}</td>
                    <td className="px-4 py-2 text-center">{formatInterval(p.tempo_calca_bota)}</td>
                    <td className="px-4 py-2 text-center">{formatInterval(p.tempo_tp_completo)}</td>
                    <td className="px-4 py-2 text-center">{formatInterval(p.tempo_epr_tp_completo)}</td>
                    <td className="px-4 py-2 text-center">{formatInterval(p.tempo_epr_sem_tp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b"><h2 className="text-2xl font-bold">Detalhes do Exercício</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X /></button></div>
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
}