import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EditModeContextType } from '@/types';

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

const CORRECT_PASSWORD = 'life2024'; // In production, this should be hashed

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const verifyPassword = useCallback((password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsEditMode(true);
      setShowPasswordModal(false);
      return true;
    }
    return false;
  }, []);

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        showPasswordModal,
        setShowPasswordModal,
        verifyPassword,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}
