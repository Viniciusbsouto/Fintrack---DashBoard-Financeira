import { useMutation } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  LOCAL_STORAGE_ACCESS_TOKEN_KEY,
  LOCAL_STORAGE_REFRESH_TOKEN_KEY,
} from '@/constants/local-storage';
import { protectedApi, publicApi } from '@/lib/axios';
import { UserService } from '@/services/user';

export const AuthContext = createContext({
  user: null,
  isInitializing: true,
  login: () => {},
  signup: () => {},
  signOut: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

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
      const response = await UserService.signup(variables);
      return response;
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
      const response = await publicApi.post('/users/login', {
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

  // SignOut Function

  const signOut = () => {
    setUser(null);
    removeTokens();
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
        const response = await protectedApi.get('/users/me');
        setUser(response.data);
      } catch (error) {
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
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
