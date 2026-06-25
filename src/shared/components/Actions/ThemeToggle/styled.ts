import { Button, styled } from "tamagui";
import { buttonPressStyle } from "@shared/styles/pressFeedback";

export const ToggleButton = styled(Button, {
  unstyled: true,
  pressStyle: buttonPressStyle,
});
