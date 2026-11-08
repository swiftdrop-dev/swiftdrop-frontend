import React, { useState } from 'react';
import { Sidebar, Header } from './SidebarAndHeader';
import { ChatbotWidget } from '../../features/chatbot';
import { useAuth } from '../../features/auth/context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Header onMenuToggle={() => setSidebarOpen(p => !p)} title={title} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
      {user && (
        <ChatbotWidget userId={user.id} userName={user.name} />
      )}
    </div>
  );
};

export default DashboardLayout;
