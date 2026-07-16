import { z } from "zod";

const passwordPolicy = z
  .string()
  .min(8, "A nova senha deve ter no mínimo 8 caracteres")
  .max(64, "A nova senha deve ter no máximo 64 caracteres")
  .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Inclua pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Inclua pelo menos um número")
  .regex(/[!@#$%^&*]/, "Inclua pelo menos um caractere especial (!@#$%^&*)");

export const changePasswordSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
    currentPassword: z
      .string()
      .min(6, "A senha atual deve ter no mínimo 6 caracteres")
      .max(64, "A senha atual deve ter no máximo 64 caracteres"),
    newPassword: passwordPolicy,
  })
  .superRefine((data, context) => {
    if (data.newPassword === data.currentPassword) {
      context.addIssue({
        code: "custom",
        message: "A nova senha deve ser diferente da senha atual",
        path: ["newPassword"],
      });
    }

    if (data.confirmPassword !== data.newPassword) {
      context.addIssue({
        code: "custom",
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
      });
    }
  });
