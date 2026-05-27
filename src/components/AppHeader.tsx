import React from 'react';
import { Pressable } from 'react-native';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { styled, Text, View } from 'tamagui';
import { typography } from '../config/typography';
import { useThemeMode } from '../hooks/useThemeMode';
import { ThemeToggle } from './ThemeToggle';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onMenu?: () => void;
};

const Root = styled(View, {
  backgroundColor: '$background',
  paddingTop: 14,
  paddingHorizontal: 20,
  paddingBottom: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const Left = styled(View, { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 });

const Logo = styled(View, {
  width: 44,
  height: 44,
  borderRadius: 12,
  backgroundColor: '$primary',
  alignItems: 'center',
  justifyContent: 'center',
});

const LogoText = styled(Text, { color: '$white', fontWeight: '800', fontSize: 11 });

const Title = styled(Text, { ...typography.headingSmall, color: '$text' });

const Subtitle = styled(Text, { ...typography.bodySmall, color: '$mutedText' });

const Actions = styled(View, { flexDirection: 'row', alignItems: 'center', gap: 10 });

export function AppHeader({ title, subtitle, onBack, onMenu }: Props) {
  const { theme } = useThemeMode();

  return (
    <Root>
      <Left>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={10}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
        ) : (
          <Logo><LogoText>VL</LogoText></Logo>
        )}
        <View>
          <Title>{title}</Title>
          {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
        </View>
      </Left>
      <Actions>
        <ThemeToggle />
        <Pressable onPress={onMenu} hitSlop={10}>
          <Menu size={24} color={theme.text} />
        </Pressable>
      </Actions>
    </Root>
  );
}
