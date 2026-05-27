import { Pressable } from "react-native";
import { styled, Text, View } from "tamagui";
import { typography } from "../../typography";

export const Card = styled(View, {
  backgroundColor: "$card",
  borderRadius: 18,
  overflow: "hidden",
  shadowColor: "#000000",
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
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

export const Footer = styled(Pressable, {
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
