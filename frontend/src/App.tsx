import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthProvider } from '@/modules/authentication/context/AuthContext';
import { AppRoutes } from '@/app/router/AppRoutes';

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
};

export default App;
