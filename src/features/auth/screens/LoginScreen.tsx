import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react-native';
import { styled, Text, View } from 'tamagui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../../shared/components/AppButton';
import { AppInput } from '../../../shared/components/AppInput';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { AuthStackParamList } from '../../../config/navigation.protocol';
import { typography } from '../../../shared/typography';
import { useThemeMode } from '../../../hooks/useThemeMode';
import { loginSchema } from '../schemas/loginSchema';
import { LoginFormData } from '../types/loginTypes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'> & { onSuccess?: () => void };

const Screen = styled(View, { flex: 1, backgroundColor: '$background', paddingTop: 28, paddingHorizontal: 24, paddingBottom: 18 });
const TopActions = styled(View, { alignItems: 'flex-end' });
const Hero = styled(View, { alignItems: 'center', marginTop: 16, marginBottom: 30 });
const LogoBox = styled(View, {
  width: 150,
  height: 112,
  borderRadius: 28,
  backgroundColor: '$primary',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
});
const Logo = styled(Text, { color: '$white', fontSize: 24, fontWeight: '900', letterSpacing: 1 });
const Title = styled(Text, { ...typography.headingLarge, color: '$text' });
const Subtitle = styled(Text, { ...typography.bodyMedium, color: '$mutedText', marginTop: 6 });
const Form = styled(View, { gap: 16 });
const Inline = styled(View, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' });
const Remember = styled(Pressable, { flexDirection: 'row', alignItems: 'center', gap: 8 });
const Checkbox = styled(View, {
  width: 20,
  height: 20,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: '$primary',
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    checked: {
      true: { backgroundColor: '$primary' },
      false: { backgroundColor: 'transparent' },
    },
  } as const,
});
const SmallText = styled(Text, { ...typography.bodySmall, color: '$mutedText' });
const LinkText = styled(Text, { ...typography.bodySmall, color: '$primary', fontWeight: '700' });
const Version = styled(Text, { ...typography.bodySmall, color: '$mutedText', textAlign: 'center', marginTop: 'auto' });

export function LoginScreen({ onSuccess }: Props) {
  const { theme } = useThemeMode();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
    mode: 'onChange',
  });

  const submit = () => {
    onSuccess?.();
  };

  return (
    <Screen>
      <TopActions><ThemeToggle /></TopActions>
      <Hero>
        <LogoBox><Logo>VALORLOG</Logo></LogoBox>
        <Title>Saída de Material</Title>
        <Subtitle>Expedição de produto acabado</Subtitle>
      </Hero>
      <Form>
        <Controller control={control} name="email" render={({ field }) => (
          <AppInput label="E-mail" placeholder="operador@valorlog.com" autoCapitalize="none" keyboardType="email-address" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />
        )} />
        <Controller control={control} name="password" render={({ field }) => (
          <AppInput label="Senha" placeholder="Digite sua senha" isPassword value={field.value} onChangeText={field.onChange} error={errors.password?.message} />
        )} />
        <Controller control={control} name="remember" render={({ field }) => (
          <Inline>
            <Remember onPress={() => field.onChange(!field.value)}>
              <Checkbox checked={field.value}>{field.value ? <Check size={14} color={theme.white} /> : null}</Checkbox>
              <SmallText>Lembrar de mim</SmallText>
            </Remember>
            <LinkText>Esqueci minha senha</LinkText>
          </Inline>
        )} />
        <AppButton title="ENTRAR" loading={isSubmitting} onPress={handleSubmit(submit)} />
      </Form>
      <Version>Versão Atual: 1.0.0</Version>
    </Screen>
  );
}
