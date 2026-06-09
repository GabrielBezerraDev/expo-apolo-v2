import React from "react";
import { ArrowLeft, Menu } from "lucide-react-native";
import { Image, View } from "tamagui";
import { AppDrawer } from "@shared/components/Navigation/AppDrawer";
import { ThemeToggle } from "@shared/components/Actions/ThemeToggle";
import { Actions, HeaderIconButton, Left, Logo, Root, Subtitle, Title } from "./styled";
import { fontScale } from "@shared/typography";
import { useAppHeader } from "./useAppHeader";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onMenu?: () => void;
};

export function AppHeader({ title, subtitle, onBack, onMenu }: Props) {
  const { closeDrawer, drawerVisible, handleMenuPress, theme } = useAppHeader({ onMenu });

  return (
    <>
      <Root>
        <Left>
          {onBack ? (
            <HeaderIconButton onPress={onBack} hitSlop={10}>
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
            <Title>{title}</Title>
            {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
          </View>
        </Left>
        <Actions>
          <ThemeToggle />
          <HeaderIconButton onPress={handleMenuPress} hitSlop={10}>
            <Menu size={24 * fontScale} color={theme.text} />
          </HeaderIconButton>
        </Actions>
      </Root>

      <AppDrawer visible={drawerVisible} onClose={closeDrawer} />
    </>
  );
}
