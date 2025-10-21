import z from 'zod';

export const loginFormSchema = z.object({
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

export const signupFormSchema = z
  .object({
    firstName: z.string().trim().min(2, { message: 'O nome é obrigatório' }),
    lastName: z
      .string()
      .trim()
      .min(2, { message: 'O sobrenome é obrigatório' }),
    email: z
      .string()
      .email({ message: 'E-mail inválido' })
      .trim()
      .min(1, { message: 'O e-mail é obrigatório' }),
    password: z
      .string()
      .trim()
      .min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
    passwordConfirmation: z
      .string()
      .trim()
      .min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
    // Terms must be true
    terms: z.boolean().refine((value) => value === true),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirmation'],
  });
