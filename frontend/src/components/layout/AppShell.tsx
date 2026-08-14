import React from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <>
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
        },
      }}
    />
  </>
);
