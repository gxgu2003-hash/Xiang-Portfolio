import React, { createContext, useContext, useState, useCallback } from 'react';

interface EditModeContextType {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  showPasswordModal: boolean;
  setShowPasswordModal: (value: boolean) => void;
  verifyPassword: (password: string) => boolean;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

const CORRECT_PASSWORD = 'life2024';

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
