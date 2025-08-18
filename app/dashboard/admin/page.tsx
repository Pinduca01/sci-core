'use client';

import { useAuth } from '@/contexts/AuthContext';
import { SidebarDemo } from '@/components/ui/sidebar-demo';
import Header from '@/components/ui/header';
import { AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useAuth();

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

  // Verificar se é DIRETOR
  if (user.role !== 'DIRETOR') {
    return (
      <SidebarDemo>
        <div className="flex flex-col h-full">
          <Header />
          <div className="flex-1 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
              <p className="text-gray-600">Área exclusiva para Diretores.</p>
            </div>
          </div>
        </div>
      </SidebarDemo>
    );
  }

  return (
    <SidebarDemo>
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 bg-gray-50 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
            <p className="text-gray-600">Área administrativa exclusiva para diretores</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Funcionalidades Administrativas</h2>
            <p className="text-gray-600">Esta área está em desenvolvimento...</p>
          </div>
        </div>
      </div>
    </SidebarDemo>
  );
}
