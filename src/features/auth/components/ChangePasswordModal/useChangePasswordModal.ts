import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiError } from "@shared/services/apiClient";
import { useAuthSession } from "@shared/services/authSession";
import { ChangePasswordFormData, normalizeAuthTokens } from "../../protocol";
import { changePasswordSchema } from "../../schemas";
import {
  clearRememberedCredentials,
  saveRememberedCredentials,
} from "../../services";
import { useChangePasswordMutation } from "./useChangePasswordMutation";

const defaultValues: ChangePasswordFormData = {
  confirmPassword: "",
  currentPassword: "",
  newPassword: "",
};

export function useChangePasswordModal(onSuccess: () => void) {
  const [apiError, setApiError] = useState("");
  const {
    logout,
    passwordChangePreference,
    replaceSessionTokens,
  } = useAuthSession();
  const changePasswordMutation = useChangePasswordMutation();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<ChangePasswordFormData>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(changePasswordSchema),
  });

  const submit = handleSubmit(async data => {
    setApiError("");
    let passwordChanged = false;

    try {
      const response = await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordChanged = true;
      const tokens = normalizeAuthTokens(response);

      await replaceSessionTokens(tokens);

      try {
        if (passwordChangePreference?.shouldRemember) {
          await saveRememberedCredentials({
            email: passwordChangePreference.email,
            password: data.newPassword,
          });
        } else {
          await clearRememberedCredentials();
        }
      } catch {
        await clearRememberedCredentials().catch(() => undefined);
      }

      reset(defaultValues);
      changePasswordMutation.reset();
      onSuccess();
    } catch (error) {
      if (passwordChanged) {
        await logout().catch(() => undefined);
        reset(defaultValues);
        changePasswordMutation.reset();
        onSuccess();
        return;
      }

      if (isInvalidSessionError(error)) {
        await logout().catch(() => undefined);
        reset(defaultValues);
        changePasswordMutation.reset();
        onSuccess();
        return;
      }

      changePasswordMutation.reset();
      setApiError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Não foi possível alterar a senha. Tente novamente.",
      );
    }
  });

  return {
    apiError,
    control,
    errors,
    isSubmitting: isSubmitting || changePasswordMutation.isPending,
    submit,
  };
}

function isInvalidSessionError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 404 ||
      (error.status === 401 && error.message !== "Senha atual incorreta"))
  );
}
