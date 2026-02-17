import React, { useState, useEffect } from 'react';
import { Tabs } from '@zendeskgarden/react-tabs';
import { Notification, ToastProvider } from '@zendeskgarden/react-notifications';
import RegistroTab from './components/RegistroTab';
import ServicosTab from './components/ServicosTab';
import { AppContainer, ToastWrapper } from './styles/AppStyles';

const App = () => {
  const [selectedTab, setSelectedTab] = useState('registro');
  const [ticketId, setTicketId]       = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await window.zafClient.invoke('resize', { height: '600px', width: '100%' });
        const [ticketData, userData] = await Promise.all([
          window.zafClient.get('ticket.id'),
          window.zafClient.get('currentUser')
        ]);
        setTicketId(ticketData['ticket.id']);
        setCurrentUser(userData['currentUser']);
      } catch (err) {
        console.error('Erro ao inicializar app:', err);
      }
    };
    init();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <ToastProvider placement="top">
      <AppContainer>

        {/* Logo */}
        <img
          src="https://i.imgur.com/ellWfGK.png"
          alt="Casos 99"
          style={{ width: '130px', display: 'block', margin: '0 auto 16px auto' }}
        />

        <Tabs selectedItem={selectedTab} onChange={setSelectedTab}>
          <Tabs.TabList aria-label="Abas do Casos 99">
            <Tabs.Tab item="registro">Registro</Tabs.Tab>
            <Tabs.Tab item="servicos">Serviços</Tabs.Tab>
          </Tabs.TabList>

          <Tabs.TabPanel item="registro">
            <RegistroTab
              ticketId={ticketId}
              currentUser={currentUser}
              showToast={showToast}
            />
          </Tabs.TabPanel>

          <Tabs.TabPanel item="servicos">
            <ServicosTab
              ticketId={ticketId}
              showToast={showToast}
            />
          </Tabs.TabPanel>
        </Tabs>

        {toast && (
          <ToastWrapper>
            <Notification type={toast.type}>
              <Notification.Paragraph>{toast.message}</Notification.Paragraph>
              <Notification.Close aria-label="Fechar" onClick={() => setToast(null)} />
            </Notification>
          </ToastWrapper>
        )}

      </AppContainer>
    </ToastProvider>
  );
};

export default App;
