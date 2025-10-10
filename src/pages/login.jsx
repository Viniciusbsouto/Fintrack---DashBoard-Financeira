import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import z from 'zod';

import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/axios';

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'E-mail inválido' })
    .trim()
    .min(1, { message: 'O e-mail é obrigatório' }),
  password: z
    .string()
    .trim()
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
});

const LoginPage = () => {
  const [user, setUser] = useState(null);
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

  const handleSubmit = (data) => {
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

  const methods = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!accessToken || !refreshToken) return;
        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

  if (user) {
    return <h1>Olá, {user.first_name}</h1>;
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3">
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Card className="w-[500px]">
            <CardHeader>
              <CardTitle>Faça login</CardTitle>
              <CardDescription>Insira seus dados abaixo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <FormField
                control={methods.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Digite sua senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Senha */}
              {/* Botão de login */}
            </CardContent>
            <CardFooter>
              <Button className="w-full">Fazer Login</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <div className="flex items-center justify-center">
        <p>Ainda não possui uma conta?</p>
        <Button variant="link" asChild>
          <Link to="/signup">Crie agora</Link>
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
