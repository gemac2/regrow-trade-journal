'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAccounts, createAccount, getStats } from '@/app/actions';
import { useAuth } from '@/app/hooks/useAuth';

interface Account {
  id: number;
  name: string;
  initialBalance: string;
}

interface AccountContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  currentBalance: string;
  isLoading: boolean;
  switchAccount: (accountId: number) => void;
  createNewAccount: (name: string, balance: string) => Promise<boolean>;
  refreshCurrentBalance: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [currentBalance, setCurrentBalance] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState(true);

  const loadBalance = useCallback(async (userId: string, accountId: number) => {
    try {
      const res = await getStats(userId, accountId);
      if (res.success && res.data) {
        const statsData = res.data as { currentBalance?: string };
        if (statsData.currentBalance) {
          setCurrentBalance(statsData.currentBalance);
        }
      }
    } catch (err) {
      console.error('Error loading current balance:', err);
    }
  }, []);

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
      if (data.length > 0) {
        setSelectedAccount(data[0]);
        setCurrentBalance(data[0].initialBalance);
        loadBalance(userId, data[0].id);
      }
    }
    setIsLoading(false);
  }

  const switchAccount = (accountId: number) => {
    const acc = accounts.find(a => a.id === accountId);
    if (acc) {
      setSelectedAccount(acc);
      setCurrentBalance(acc.initialBalance);
      if (user) {
        loadBalance(user.id, acc.id);
      }
    }
  };

  const refreshCurrentBalance = useCallback(async () => {
    if (user && selectedAccount) {
      await loadBalance(user.id, selectedAccount.id);
    }
  }, [user, selectedAccount, loadBalance]);

  const createNewAccount = async (name: string, balance: string) => {
    if (!user) return false;
    const { success, data } = await createAccount(user.id, name, balance);
    
    if (success && data) {
      const newAcc = data as Account;
      setAccounts(prev => [...prev, newAcc]);
      setSelectedAccount(newAcc);
      setCurrentBalance(newAcc.initialBalance);
      return true;
    }
    return false;
  };

  return (
    <AccountContext.Provider value={{ 
      accounts, 
      selectedAccount, 
      currentBalance, 
      isLoading, 
      switchAccount, 
      createNewAccount,
      refreshCurrentBalance 
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount must be used within AccountProvider');
  return context;
}