import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  remember: z.boolean(),
});
