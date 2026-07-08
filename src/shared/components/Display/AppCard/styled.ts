import { Button, styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const Card = styled(View, {
  backgroundColor: "$card",
  overflow: "hidden",
  borderColor: '$primary',
  borderRadius: 20,
  borderWidth: 0.1,
  shadowColor: "#000000",
  shadowOpacity: 0.6,
  shadowRadius: 8,
  shadowOffset: { width: 2, height: 6 },
});

export const Header = styled(View, {
  paddingVertical: 14,
  paddingHorizontal: 16,
  minHeight: 50,
  variants: {
    orange: {
      true: { backgroundColor: "$primary" },
      false: { backgroundColor: "$surface" },
    },
  } as const,
});

export const Footer = styled(Button, {
  unstyled: true,
  paddingVertical: 14,
  paddingHorizontal: 16,
  minHeight: 50,
  variants: {
    orange: {
      true: { backgroundColor: "$primary" },
      false: { backgroundColor: "$surface" },
    },
  } as const,
});

export const Body = styled(View, { padding: 16 });

export const CardTitle = styled(Text, {
  ...typography.headingSmall,
  textAlign: "center",
  margin: 0,
  padding: 0,
  variants: {
    colorVariant: {
      black: { color: "$black" },
      white: { color: "$white" },
    },
  } as const,
  defaultVariants: {
    colorVariant: "black",
  },
});
