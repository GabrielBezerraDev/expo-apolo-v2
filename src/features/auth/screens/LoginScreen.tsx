import React from "react";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react-native";
import { styled, Text, useWindowDimensions, View } from "tamagui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "@navigation/navigation.protocol";
import { useThemeMode } from "@shared/components/ThemeToggle";
import { AppButton } from "@shared/components/AppButton";
import { AppInput } from "@shared/components/AppInput";
import { ThemeToggle } from "@shared/components/ThemeToggle";
import { typography } from "@shared/typography";
import { loginSchema } from "../schemas/loginSchema";
import { LoginFormData } from "../types/loginTypes";
import { LoginAnimatedHeader, ShinyConecthus } from "../components/LoginAnimatedHeader";

type Props = NativeStackScreenProps<AuthStackParamList, "Login"> & {
  onSuccess?: () => void;
};

const Screen = styled(View, {
  flex: 1,
  backgroundColor: "$background",
  paddingHorizontal: 24,
  paddingBottom: 18,
});
const TopActions = styled(View, { alignItems: "flex-end", paddingTop:20 });
const Form = styled(View, { gap: 16, flex: 4, alignItems: 'center', justifyContent: 'center', width: '100%' });
const Inline = styled(View, {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: '100%'
});
const Remember = styled(Pressable, {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
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
const Version = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  textAlign: "center",
  marginTop: "auto",
  fontWeight: "bold",
});

export function LoginScreen({ onSuccess }: Props) {
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

  const submit = () => {
    onSuccess?.();
  };
  const remember = watch("remember");

  return (
    <Screen>
      <TopActions>
        <ThemeToggle />
      </TopActions>
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
        <Inline>
          <Remember
            onPress={() =>
              setValue("remember", !remember, {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
          >
            <Checkbox checked={remember}>
              {remember ? <Check size={14} color={theme.white} /> : null}
            </Checkbox>
            <SmallText>Lembrar de mim</SmallText>
          </Remember>
          <LinkText>Esqueci minha senha</LinkText>
        </Inline>
        <AppButton
          style={{width:'100%', height: height * 0.06}}
          title="ENTRAR"
          loading={isSubmitting}
          onPress={handleSubmit(submit)}
        />
      </Form>
      <View
        style={{
          flexDirection: "row",
          borderRadius: 5,
          paddingHorizontal: 6,
          paddingVertical: 4,
          alignSelf: "center",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flex: 1,
          width: "100%",
        }}
      >
        <Version>Versão Atual: 1.0.0</Version>
        <View style={[{ flexDirection: "row", alignItems: "center", paddingHorizontal: height * 0.0001 }]}> 
          <Text style={[styles.powered, { color: theme.mutedText, fontWeight: "bold" }]}> 
            powered by
          </Text>
          <Text> </Text>
          <ShinyConecthus />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  powered: {
    ...typography.bodySmall,
    marginTop: 4,
    fontWeight: "bold",
  },
});
