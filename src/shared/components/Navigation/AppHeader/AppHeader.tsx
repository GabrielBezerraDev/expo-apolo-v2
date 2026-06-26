import React from "react";
import { ArrowLeft, Menu } from "lucide-react-native";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Image, View } from "tamagui";
import { AppDrawer } from "@shared/components/Navigation/AppDrawer";
import { ThemeToggle } from "@shared/components/Actions/ThemeToggle";
import { Actions, HeaderIconButton, Left, Logo, Root, Subtitle, Title } from "./styled";
import { fontScale } from "@shared/typography";
import { useAppHeader } from "./useAppHeader";

export function AppHeader({ navigation }: NativeStackHeaderProps) {
  const {
    closeDrawer,
    drawerVisible,
    handleBackPress,
    handleMenuPress,
    headerConfig,
    theme,
  } = useAppHeader({ navigation });

  if (!headerConfig.visible) return null;

  return (
    <>
      <Root>
        <Left>
          {headerConfig.showBack ? (
            <HeaderIconButton onPress={handleBackPress} hitSlop={10}>
              <ArrowLeft size={24} color={theme.text} />
            </HeaderIconButton>
          ) : (
            <Logo>
              <Image
                source={require("@assets/svg/Varlog_logo_2.png")}
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />
            </Logo>
          )}
          <View>
            <Title>{headerConfig.title}</Title>
            {headerConfig.subtitle ? <Subtitle>{headerConfig.subtitle}</Subtitle> : null}
          </View>
        </Left>
        {headerConfig.showMenu ? (
          <Actions>
            <ThemeToggle />
            <HeaderIconButton onPress={handleMenuPress} hitSlop={10}>
              <Menu size={24 * fontScale} color={theme.text} />
            </HeaderIconButton>
          </Actions>
        ) : null}
      </Root>

      <AppDrawer visible={drawerVisible} onClose={closeDrawer} />
    </>
  );
}
