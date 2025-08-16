import React from 'react';

// Interface para as props do Header
interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  userName = 'Usuário', 
  userEmail = 'usuario@exemplo.com' 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard SCI</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
