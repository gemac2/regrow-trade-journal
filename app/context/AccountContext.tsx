'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAccounts, createAccount } from '@/app/actions';
import { useAuth } from '@/app/hooks/useAuth';

interface Account {
  id: number;
  name: string;
  initialBalance: string;
}

interface AccountContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  switchAccount: (accountId: number) => void;
  createNewAccount: (name: string, balance: string) => Promise<boolean>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAccounts(user.id);
    }
  }, [user]);

  async function loadAccounts(userId: string) {
    setIsLoading(true);
    const { success, data } = await getAccounts(userId);
    
    if (success && data) {
      setAccounts(data);
      // Si hay cuentas, seleccionamos la primera (o podriamos guardar la ultima en localStorage)
      if (data.length > 0) {
        setSelectedAccount(data[0]);
      }
    }
    setIsLoading(false);
  }

  const switchAccount = (accountId: number) => {
    const acc = accounts.find(a => a.id === accountId);
    if (acc) setSelectedAccount(acc);
  };

  const createNewAccount = async (name: string, balance: string) => {
    if (!user) return false;
    const { success, data } = await createAccount(user.id, name, balance);
    
    if (success && data) {
      const newAcc = data as Account;
      setAccounts(prev => [...prev, newAcc]);
      setSelectedAccount(newAcc); // Seleccionamos la nueva automaticamente
      return true;
    }
    return false;
  };

  return (
    <AccountContext.Provider value={{ accounts, selectedAccount, isLoading, switchAccount, createNewAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount must be used within AccountProvider');
  return context;
}