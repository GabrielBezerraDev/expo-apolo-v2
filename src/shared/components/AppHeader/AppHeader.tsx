import React from "react";
import { Pressable } from "react-native";
import { ArrowLeft, Menu } from "lucide-react-native";
import { View } from "tamagui";
import { useThemeMode } from "@hooks/useThemeMode";
import { ThemeToggle } from "../ThemeToggle";
import { Actions, Left, Logo, LogoText, Root, Subtitle, Title } from "./styled";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onMenu?: () => void;
};

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
          <Logo>
            <LogoText>VL</LogoText>
          </Logo>
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
