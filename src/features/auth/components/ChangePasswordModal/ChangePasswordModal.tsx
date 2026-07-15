import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { AppButton } from "@shared/components/Forms/AppButton";
import { AppInput } from "@shared/components/Forms/AppInput";
import { ChangePasswordFormData } from "../../protocol";
import { ApiErrorText, Description, FormRoot, Title } from "./styled";
import { useChangePasswordModal } from "./useChangePasswordModal";

type ChangePasswordModalProps = {
  onSuccess: () => void;
};

export function ChangePasswordModal({ onSuccess }: ChangePasswordModalProps) {
  const { apiError, control, errors, isSubmitting, submit } =
    useChangePasswordModal(onSuccess);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={keyboardAvoidingStyle}
    >
      <FormRoot>
        <Title>Crie uma nova senha</Title>
        <Description>
          Use de 8 a 64 caracteres, incluindo letra maiúscula, letra minúscula,
          número e um dos caracteres !@#$%^&amp;*.
        </Description>

        <AppInput<ChangePasswordFormData>
          autoCapitalize="none"
          autoComplete="current-password"
          autoCorrect={false}
          controllerReactFormsProps={{ control, name: "currentPassword" }}
          disabled={isSubmitting}
          error={errors.currentPassword?.message}
          isPassword
          label="Senha atual"
          placeholder="Digite sua senha atual"
          textContentType="password"
        />
        <AppInput<ChangePasswordFormData>
          autoCapitalize="none"
          autoComplete="new-password"
          autoCorrect={false}
          controllerReactFormsProps={{ control, name: "newPassword" }}
          disabled={isSubmitting}
          error={errors.newPassword?.message}
          isPassword
          label="Nova senha"
          placeholder="Digite a nova senha"
          textContentType="newPassword"
        />
        <AppInput<ChangePasswordFormData>
          autoCapitalize="none"
          autoComplete="new-password"
          autoCorrect={false}
          controllerReactFormsProps={{ control, name: "confirmPassword" }}
          disabled={isSubmitting}
          error={errors.confirmPassword?.message}
          isPassword
          label="Confirmar nova senha"
          placeholder="Repita a nova senha"
          textContentType="newPassword"
        />

        {apiError ? <ApiErrorText>{apiError}</ApiErrorText> : null}

        <AppButton
          loading={isSubmitting}
          onPress={submit}
          style={{ width: "100%" }}
          title="ALTERAR SENHA"
        />
      </FormRoot>
    </KeyboardAvoidingView>
  );
}

const keyboardAvoidingStyle = {
  width: "100%" as const,
};
