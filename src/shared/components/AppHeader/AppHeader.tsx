import React, { useState } from "react";
import { Pressable } from "react-native";
import { ArrowLeft, Menu } from "lucide-react-native";
import { View } from "tamagui";
import { useThemeMode } from "@hooks/useThemeMode";
import ValorlogLogo from "@shared/assets/svg/varlog_transparent.svg";
import { AppHeaderDrawer } from "./AppHeaderDrawer";
import { ThemeToggle } from "../ThemeToggle";
import { Actions, Left, Logo, Root, Subtitle, Title } from "./styled";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onMenu?: () => void;
};

export function AppHeader({ title, subtitle, onBack, onMenu }: Props) {
  const { theme } = useThemeMode();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleMenuPress = () => {
    if (onMenu) {
      onMenu();
      return;
    }

    setDrawerVisible(true);
  };

  return (
    <>
      <Root>
        <Left>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={10}>
              <ArrowLeft size={24} color={theme.text} />
            </Pressable>
          ) : (
            <Logo>
              <ValorlogLogo width={80} height={80} />
            </Logo>
          )}
          <View>
            <Title>{title}</Title>
            {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
          </View>
        </Left>
        <Actions>
          <ThemeToggle />
          <Pressable onPress={handleMenuPress} hitSlop={10}>
            <Menu size={24} color={theme.text} />
          </Pressable>
        </Actions>
      </Root>

      <AppHeaderDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </>
  );
}
