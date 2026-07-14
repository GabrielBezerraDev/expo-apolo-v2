import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react-native";
import { Button, styled, Text, useWindowDimensions, View } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "@navigation/navigation.protocol";
import { ApiError } from "@shared/services/apiClient";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { AppButton } from "@shared/components/Forms/AppButton";
import { AppInput } from "@shared/components/Forms/AppInput";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";
import { LoginAnimatedHeader, ShinyConecthus } from "../../components/LoginAnimatedHeader";
import { loginSchema } from "../../schemas";
import { LoginFormData } from "../../protocol";
import {
  clearRememberedCredentials,
  getRememberedCredentials,
  OfflineAuthError,
} from "../../services";
import { useOfflineAwareLogin } from "./useOfflineAwareLogin";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const Screen = styled(View, {
  flex: 1,
  backgroundColor: "$background",
  paddingHorizontal: 24,
  paddingBottom: 18,
  paddingTop: 18
});
const TopActions = styled(View, { alignItems: "flex-end", paddingTop:20 });
const Form = styled(View, { gap: 16, flex: 4, alignItems: 'center', justifyContent: 'center', width: '100%' });
const Inline = styled(View, {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: '100%'
});
const Remember = styled(Button, {
  unstyled: true,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  pressStyle: buttonPressStyle,
});
const Checkbox = styled(View, {
  width: 20,
  height: 20,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: "$primary",
  alignItems: "center",
  justifyContent: "center",
  variants: {
    checked: {
      true: { backgroundColor: "$primary" },
      false: { backgroundColor: "transparent" },
    },
  } as const,
});
const SmallText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});
const LinkText = styled(Text, {
  ...typography.bodySmall,
  color: "$primary",
  fontWeight: "700",
});
const AuthErrorText = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
  textAlign: "center",
  width: "100%",
});
const Version = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  textAlign: "center",
  marginTop: "auto",
  fontWeight: "bold",
});
const FooterRow = styled(View, {
  alignItems: "flex-end",
  alignSelf: "center",
  borderRadius: 5,
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 6,
  paddingVertical: 4,
  width: "100%",
});
const PoweredRow = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  gap: 4,
});
const PoweredText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "bold",
  marginTop: 4,
});

export function LoginScreen(_props: Props) {
  const [loginError, setLoginError] = useState("");
  const {
    authenticate,
    isPending,
    revalidationEmail,
    revalidationReason,
  } = useOfflineAwareLogin();
  const { theme } = useThemeMode();
  const { height } = useWindowDimensions();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
    mode: "onChange",
  });

  useEffect(() => {
    let active = true;

    getRememberedCredentials()
      .then((credentials) => {
        if (!active || !credentials) return;

        const email = revalidationEmail ?? credentials.email;
        setValue("email", email, { shouldValidate: true });

        if (
          credentials.password &&
          credentials.email.trim().toLowerCase() === email.trim().toLowerCase()
        ) {
          setValue("password", credentials.password, { shouldValidate: true });
          setValue("remember", true, { shouldValidate: true });
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [revalidationEmail, setValue]);

  useEffect(() => {
    if (revalidationEmail) {
      setValue("email", revalidationEmail, { shouldValidate: true });
    }

    if (revalidationReason === "offline_access_expired") {
      setLoginError("Seu acesso offline expirou. Conecte-se à internet para validar o usuário novamente.");
    } else if (revalidationReason === "server_rejected_session") {
      setLoginError("Sua sessão foi recusada pelo servidor. Faça login online novamente.");
    }
  }, [revalidationEmail, revalidationReason, setValue]);

  const submit = async (data: LoginFormData) => {
    setLoginError("");

    try {
      await authenticate(data);
    } catch (error) {
      setLoginError(
        error instanceof ApiError || error instanceof OfflineAuthError
          ? error.message
          : "Não foi possível entrar. Verifique seus dados e tente novamente.",
      );
    }
  };
  const remember = watch("remember");

  const toggleRemember = () => {
    const nextRemember = !remember;

    setValue("remember", nextRemember, {
      shouldDirty: true,
      shouldTouch: true,
    });

    if (!nextRemember) {
      void clearRememberedCredentials();
    }
  };

  return (
    <Screen>
      <LoginAnimatedHeader />
      <Form>
        <AppInput<LoginFormData>
          controllerReactFormsProps={{
            control,
            name: "email",
          }}
          label="E-mail"
          placeholder="operador@valorlog.com"
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email?.message}
        />
        <AppInput<LoginFormData>
          controllerReactFormsProps={{
            control,
            name: "password",
          }}
          label="Senha"
          placeholder="Digite sua senha"
          isPassword
          error={errors.password?.message}
        />
        {loginError ? <AuthErrorText>{loginError}</AuthErrorText> : null}
        <Inline>
          <Remember onPress={toggleRemember}>
            <Checkbox checked={remember}>
              {remember ? <Check size={14} color={theme.white} /> : null}
            </Checkbox>
            <SmallText>Lembrar e-mail e senha</SmallText>
          </Remember>
          <LinkText>Esqueci minha senha</LinkText>
        </Inline>
        <AppButton
          style={{ width: "100%", height: height * 0.06 }}
          title="ENTRAR"
          loading={isSubmitting || isPending}
          onPress={handleSubmit(submit)}
        />
      </Form>
      <FooterRow>
        <Version>Versão Atual: 1.0.0</Version>
        <PoweredRow paddingHorizontal={height * 0.0001}>
          <PoweredText>powered by</PoweredText>
          <ShinyConecthus />
        </PoweredRow>
      </FooterRow>
    </Screen>
  );
}
