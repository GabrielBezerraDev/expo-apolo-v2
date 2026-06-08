import { Pressable, ScrollView } from "react-native";
import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export const FilterModalRoot = styled(View, {
  gap: 16,
  paddingBottom: 8,
});

export const FilterFieldRoot = styled(View, {
  gap: 12,
});

export const FilterPickerRoot = styled(View, {
  gap: 8,
});

export const FilterPickerButton = styled(Pressable, {
  minHeight: 50,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "$border",
  backgroundColor: "$card",
  justifyContent: "center",
  paddingHorizontal: 14,
});

export const FilterPickerText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "700",
});

export const FilterOptionList = styled(View, {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "$border",
  overflow: "hidden",
  backgroundColor: "$card",
});

export const FilterOptionButton = styled(Pressable, {
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderBottomWidth: 1,
  borderBottomColor: "$border",
  variants: {
    selected: {
      true: { backgroundColor: "$primaryLight" },
      false: { backgroundColor: "transparent" },
    },
  } as const,
});

export const FilterOptionText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
});

export const FilterHelpText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

export const FilterErrorText = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
});

export const FilterButtonRow = styled(View, {
  flexDirection: "row",
  gap: 10,
});

export const FilterButtonSlot = styled(View, {
  flex: 1,
});

export const FilterChipScroll = styled(ScrollView, {
  maxHeight: 58,
  width: "100%",
});

export const FilterChipList = styled(View, {
  flexDirection: "row",
  flexWrap: "nowrap",
  gap: 8,
  paddingVertical: 6,
});

export const FilterChipRoot = styled(View, {
  minHeight: 34,
  borderRadius: 999,
  backgroundColor: "$primaryLight",
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  paddingLeft: 12,
  paddingRight: 6,
});

export const FilterChipText = styled(Text, {
  ...typography.label,
  color: "$black",
  maxWidth: 240,
});

export const FilterChipRemoveButton = styled(Pressable, {
  width: 24,
  height: 24,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "$primary",
});

export const FilterChipRemoveText = styled(Text, {
  ...typography.label,
  color: "$white",
  lineHeight: 18,
});

export const SelectedOptionsRoot = styled(View, {
  gap: 8,
});

export const SelectedOptionRow = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "$border",
  backgroundColor: "$surface",
  paddingVertical: 10,
  paddingHorizontal: 12,
});

export const SelectedOptionText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  flex: 1,
});
