'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Se não há usuário logado, não renderizar header
  if (!user) {
    return null;
  }

  // Função para exibir role de forma amigável
  const getRoleDisplay = (role: string) => {
    const roleMap = {
      'DIRETOR': 'Diretor',
      'GS': 'Gerente de Seção',
      'BA-CE': 'Chefe de Equipe',
      'BA-LR': 'Bombeiro LR',
      'BA-MC': 'Motorista',
      'BA-2': 'Bombeiro'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return (
    <header className="bg-pure-white border-b border-fog-gray/20 shadow-sm sticky top-0 z-50">
      <div className="w-full px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Espaço vazio à esquerda */}
          <div></div>

          {/* Área do usuário à direita */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Informações do usuário - ocultas em telas pequenas */}
            <div className="hidden lg:block text-right">
              <p className="text-sm font-poppins font-semibold text-coal-black truncate max-w-32 xl:max-w-none">
                {user.nome}
              </p>
              <div className="flex items-center justify-end gap-2">
                <p className="text-xs font-poppins text-coal-black/70 truncate max-w-24 xl:max-w-none">
                  {user.email}
                </p>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  {getRoleDisplay(user.role)}
                </span>
              </div>
            </div>

            {/* Avatar do usuário */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-radiant-orange/10 border border-radiant-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-radiant-orange" />
            </div>

            {/* Dropdown do usuário */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center p-1.5 sm:p-2 text-coal-black/70 hover:text-radiant-orange hover:bg-radiant-orange/10 rounded-lg transition-colors duration-200 border border-transparent hover:border-radiant-orange/20"
                aria-label="Menu do usuário"
              >
                <ChevronDownIcon className="w-4 h-4 text-coal-black" />
              </button>

              {/* Menu dropdown - responsivo */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 sm:w-56 bg-pure-white rounded-lg shadow-lg border border-fog-gray/20 py-1 z-50">
                  {/* Informações do usuário no mobile */}
                  <div className="lg:hidden px-4 py-3 border-b border-fog-gray/20">
                    <p className="text-sm font-poppins font-semibold text-coal-black truncate">
                      {user.nome}
                    </p>
                    <p className="text-xs font-poppins text-coal-black/70 truncate mb-2">
                      {user.email}
                    </p>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                      {getRoleDisplay(user.role)}
                    </span>
                  </div>

                  {/* Informações adicionais */}
                  <div className="px-4 py-2 border-b border-fog-gray/20">
                    <div className="text-xs text-coal-black/60 space-y-1">
                      {user.sci_id && (
                        <p><span className="font-medium">SCI:</span> {user.sci_id}</p>
                      )}
                      {user.equipe_id && (
                        <p><span className="font-medium">Equipe:</span> {user.equipe_id}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full px-4 py-2 text-sm font-poppins text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-500" />
                    {isLoggingOut ? 'Saindo...' : 'Sair'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}