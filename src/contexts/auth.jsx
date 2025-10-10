import { useMutation } from '@tanstack/react-query';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { api } from '@/lib/axios';

export const AuthContext = createContext({
  user: null,
  login: () => {},
  signup: () => {},
});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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
        const accessToken = createdUser.tokens.accessToken;
        const refreshToken = createdUser.tokens.refreshToken;
        setUser(createdUser);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
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
        const accessToken = loggedUser.tokens.accessToken;
        const refreshToken = loggedUser.tokens.refreshToken;
        setUser(loggedUser);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
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
        const acessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!acessToken || !refreshToken) return;
        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${acessToken}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.log(error);
        setUser(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
