import Header from '@/components/ui/header';
import { SidebarDemo } from '@/components/ui/sidebar-demo';

export default function DashboardPage() {
  // Dados mockados do usuário - em produção viriam da autenticação
  const userData = {
    userName: 'João Silva',
    userEmail: 'joao.silva@empresa.com'
  };

  return (
    <SidebarDemo>
      <div className="flex flex-col h-full">
        <Header userName={userData.userName} userEmail={userData.userEmail} />
        
        <div className="flex-1 bg-gradient-to-br from-pure-white to-fog-gray/20 p-8">
        </div>
      </div>
    </SidebarDemo>
  );
}