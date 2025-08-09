'use client';

import Header from '@/components/ui/header';
import { SidebarDemo } from '@/components/ui/sidebar-demo';

export default function UserDashboard() {
  // Dados mockados do usuário - em produção viriam da autenticação
  const userData = {
    userName: 'Usuário',
    userEmail: 'usuario@empresa.com'
  };

  return (
    <SidebarDemo>
      <div className="flex flex-col h-full">
        <Header userName={userData.userName} userEmail={userData.userEmail} />
        
        <div className="flex-1 bg-gradient-to-br from-pure-white to-fog-gray/20 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard do Usuário
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Painel pessoal do usuário
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card de Perfil */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Meu Perfil
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Informações pessoais
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Tarefas */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Minhas Tarefas
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Atividades pendentes
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Notificações */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Notificações
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Mensagens e avisos
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Seção de Atividades */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Atividades Recentes
                </h3>
                <div className="text-sm text-gray-500">
                  <p>• Login realizado com sucesso</p>
                  <p>• Perfil carregado corretamente</p>
                  <p>• Sistema funcionando normalmente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Atividades Recentes */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Atividades Recentes
                </h3>
                <div className="text-sm text-gray-500">
                  <p>• Perfil atualizado com sucesso</p>
                  <p>• Nova tarefa atribuída</p>
                  <p>• Notificação lida</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </SidebarDemo>
  )
}