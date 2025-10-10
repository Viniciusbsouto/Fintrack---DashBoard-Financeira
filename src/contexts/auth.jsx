import { useMutation } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { api } from '@/lib/axios';

export const AuthContext = createContext({
  user: null,
  isInitializing: true,
  login: () => {},
  signup: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

const LOCAL_STORAGE_ACCESS_TOKEN_KEY = 'accessToken';
const LOCAL_STORAGE_REFRESH_TOKEN_KEY = 'refreshToken';

const setTokens = (tokens) => {
  localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, tokens.refreshToken);
};

const removeTokens = () => {
  localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  // Signup mutation
  const signupMutation = useMutation({
    mutationKey: ['signup'],
    mutationFn: async (variables) => {
      const response = await api.post('/users', {
        first_name: variables.firstName,
        last_name: variables.lastName,
        email: variables.email,
        password: variables.password,
      });
      return response.data;
    },
  });
  // Signup function
  const signup = (data) => {
    signupMutation.mutate(data, {
      onSuccess: (createdUser) => {
        setUser(createdUser);
        setTokens(createdUser.tokens);
        toast.success('Conta criada com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao criar conta. Tente novamente.');
      },
    });
  };

  // Login Mutation
  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async (data) => {
      const response = await api.post('/users/login', {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
  });

  // Login Function
  const login = (data) => {
    loginMutation.mutate(data, {
      onSuccess: (loggedUser) => {
        setUser(loggedUser);
        setTokens(loggedUser.tokens);
        toast.success('Login realizado com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao fazer login. Verifique suas credenciais.');
      },
    });
  };

  // Check for existing tokens on local storage

  useEffect(() => {
    const init = async () => {
      try {
        setIsInitializing(true);
        const acessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(
          LOCAL_STORAGE_REFRESH_TOKEN_KEY
        );
        if (!acessToken || !refreshToken) return;
        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${acessToken}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        removeTokens();
        console.log(error);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
