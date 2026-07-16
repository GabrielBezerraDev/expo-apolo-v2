import { z } from "zod";
import { changePasswordSchema } from "../schemas";

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export type ChangePasswordRequest = Pick<
  ChangePasswordFormData,
  "currentPassword" | "newPassword"
>;

export type ChangePasswordResponse = {
  accessToken?: string;
  refreshToken: string;
  token: string;
};
