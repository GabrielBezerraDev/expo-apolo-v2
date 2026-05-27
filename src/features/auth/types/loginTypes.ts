import { z } from 'zod';
import { loginSchema } from '../schemas/loginSchema';

export type LoginFormData = z.infer<typeof loginSchema>;
