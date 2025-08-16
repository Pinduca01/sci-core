'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Users, UserPlus, Trash2, ShieldCheck, Save, X, Timer, Search, Loader2 } from 'lucide-react';

// --- TIPOS DE DADOS ---
// Vamos assumir um tipo Bombeiro simplificado por enquanto
interface Bombeiro {
  id: number;
  nome: string;
  funcao: string;
}

interface Participante extends Bombeiro {
  tempo_calca_bota?: string;
  tempo_tp_completo?: string;
  tempo_epr_tp_completo?: string;
  tempo_epr_sem_tp?: string;
}

interface FormularioEpiEprProps {
  onClose: () => void;
}

// --- COMPONENTE PRINCIPAL ---
export default function FormularioEpiEpr({ onClose }: FormularioEpiEprProps) {
  const { user } = useAuth();
  
  // --- ESTADOS DO COMPONENTE ---
  const [bombeirosDaEquipe, setBombeirosDaEquipe] = useState<Bombeiro[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [dataExercicio, setDataExercicio] = useState(new Date().toISOString().split('T')[0]);
  const [horaExercicio, setHoraExercicio] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [observacoes, setObservacoes] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar os bombeiros da equipe ao carregar
  useEffect(() => {
    const fetchBombeiros = async () => {
      if (!user) {
        setError("Usuário não identificado.");
        setIsLoading(false);
        return;
      }
      
      console.log("[DEBUG] Formulário: Chamando a função RPC 'get_bombeiros_da_sci'");
      const { data, error } = await supabase
  .rpc('get_bombeiros_da_sci', { p_sci_id: user.sci_id });

      if (error) {
        console.error("[DEBUG] Formulário: Erro ao chamar RPC:", error);
        setError("Falha ao carregar a lista de bombeiros da sua SCI.");
      } else {
        console.log("[DEBUG] Formulário: Bombeiros recebidos:", data);
        setBombeirosDaEquipe(data || []);
      }
      
      setIsLoading(false);
    };
    
    fetchBombeiros();
  }, [user]);
  
  // --- FUNÇÕES DE MANIPULAÇÃO ---
  const handleAdicionarParticipante = (bombeiroIdStr: string) => {
    const bombeiroId = Number(bombeiroIdStr);
    const bombeiro = bombeirosDaEquipe.find(b => b.id === bombeiroId);
    if (bombeiro && !participantes.some(p => p.id === bombeiroId)) {
      setParticipantes([...participantes, bombeiro]);
    }
  };
  
  const handleRemoverParticipante = (bombeiroId: number) => {
    setParticipantes(participantes.filter(p => p.id !== bombeiroId));
  };

  const handleTempoChange = (bombeiroId: number, tomada: keyof Participante, valor: string) => {
    setParticipantes(participantes.map(p => 
      p.id === bombeiroId ? { ...p, [tomada]: valor } : p
    ));
  };
  
  const handleSalvarExercicio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    console.log("Salvando exercício...");
    // A LÓGICA DE SALVAR NO SUPABASE VIRÁ AQUI
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Exercício salvo com sucesso!");
    setIsSaving(false);
    onClose();
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Novo Exercício de EPI/EPR</h2>
              <p className="text-sm text-gray-500">Registre os tempos e participantes do exercício.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4"/>
            <p className="text-lg text-gray-600">Carregando dados da equipe...</p>
          </div>
        ) : (
          <form id="formulario-epi" onSubmit={handleSalvarExercicio} className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="p-6 border rounded-lg bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Informações Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-600 mb-1">Data</label>
                  <input type="date" id="data" value={dataExercicio} onChange={e => setDataExercicio(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="hora" className="block text-sm font-medium text-gray-600 mb-1">Hora</label>
                  <input type="time" id="hora" value={horaExercicio} onChange={e => setHoraExercicio(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>

              </div>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Participantes e Tomadas de Tempo</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase">
                    <tr>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Função</th>
                      <th className="px-4 py-3 text-center">1ª Tomada (Calça+Bota)</th>
                      <th className="px-4 py-3 text-center">2ª Tomada (TP Completo)</th>
                      <th className="px-4 py-3 text-center">3ª Tomada (EPR+TP)</th>
                      <th className="px-4 py-3 text-center">4ª Tomada (EPR)</th>
                      <th className="px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantes.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="px-4 py-2 font-medium text-gray-800">{p.nome}</td>
                        <td className="px-4 py-2 text-gray-600">{p.funcao}</td>
                        <td><input type="text" placeholder="00:00" className="w-20 text-center mx-auto block p-1 border rounded" onChange={e => handleTempoChange(p.id, 'tempo_calca_bota', e.target.value)} /></td>
                        <td><input type="text" placeholder="00:00" className="w-20 text-center mx-auto block p-1 border rounded" onChange={e => handleTempoChange(p.id, 'tempo_tp_completo', e.target.value)} /></td>
                        <td><input type="text" placeholder="00:00" className="w-20 text-center mx-auto block p-1 border rounded" onChange={e => handleTempoChange(p.id, 'tempo_epr_tp_completo', e.target.value)} /></td>
                        <td><input type="text" placeholder="00:00" className="w-20 text-center mx-auto block p-1 border rounded" onChange={e => handleTempoChange(p.id, 'tempo_epr_sem_tp', e.target.value)} /></td>
                        <td className="px-4 py-2 text-center"><button type="button" onClick={() => handleRemoverParticipante(p.id)}><Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-500"/>
                  <select 
    onChange={e => {
      handleAdicionarParticipante(e.target.value);
      e.target.value = ""; // Reseta o select
    }}
    className="flex-grow p-2 border rounded-lg"
    value=""
>
    <option value="" disabled>Adicionar bombeiro ao exercício...</option>
    {(() => {
        // --- INÍCIO DO BLOCO DE DEBUG ---
        console.log('[DEBUG] Lista Completa de Bombeiros:', bombeirosDaEquipe);
        console.log('[DEBUG] Lista de Participantes já adicionados:', participantes);
        const bombeirosDisponiveis = bombeirosDaEquipe.filter(b => !participantes.some(p => p.id === b.id));
        console.log('[DEBUG] Bombeiros Disponíveis (após filtro):', bombeirosDisponiveis);
        // --- FIM DO BLOCO DE DEBUG ---

        return bombeirosDisponiveis.map(b => <option key={b.id} value={b.id}>{b.nome}</option>);
    })()}
</select>
              </div>
            </div>
          </form>
        )}
        
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" form="formulario-epi" disabled={isSaving || isLoading} className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? <><Timer className="w-5 h-5 animate-spin" /> Salvando...</> : <><Save className="w-5 h-5" /> Salvar Exercício</>}
          </button>
        </div>
      </div>
    </div>
  );
}