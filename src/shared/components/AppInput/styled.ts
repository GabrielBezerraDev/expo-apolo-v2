import { TextInput } from "react-native";
import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const Wrapper = styled(View, { gap: 7 });

export const Label = styled(Text, { ...typography.label, color: "$text", textTransform: "uppercase" });

export const InputFrame = styled(View, {
  minHeight: 52,
  borderRadius: 14,
  borderWidth: 1,
  backgroundColor: "$background",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 14,
  gap: 10,
  variants: {
    hasError: {
      true: { borderColor: "$error" },
      false: { borderColor: "$border" },
    },
    isFocused: {
      true: { borderColor: "$primary" },
      false: {},
    },
  } as const,
});

export const StyledInput = styled(TextInput, { flex: 1, ...typography.bodyLarge, padding: 0 });

export const ErrorText = styled(Text, { ...typography.bodySmall, color: "$error" });
