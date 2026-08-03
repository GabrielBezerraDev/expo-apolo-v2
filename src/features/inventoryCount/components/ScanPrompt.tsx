import React from "react";
import { useWindowDimensions } from "react-native";
import { styled, Text, View } from "tamagui";
import ScanQrCodeIllustration from "@assets/svg/scan-qrcode-svgrepo-com.svg";
import { typography } from "@shared/typography";

type Props = {
  description?: string;
  title: string;
};

export function ScanPrompt({ description, title }: Props) {
  const { height, width } = useWindowDimensions();
  const illustrationSize = Math.min(Math.max(Math.min(width, height) * 0.34, 130), 210);

  return (
    <PromptRoot>
      <ScanQrCodeIllustration
        width={illustrationSize}
        height={illustrationSize}
      />
      <PromptTitle>{title}</PromptTitle>
      {description ? <PromptDescription>{description}</PromptDescription> : null}
    </PromptRoot>
  );
}

const PromptRoot = styled(View, {
  alignItems: "center",
  backgroundColor: "$surface",
  borderColor: "$border",
  borderRadius: 24,
  borderWidth: 1,
  gap: 10,
  justifyContent: "center",
  minHeight: 300,
  padding: 24,
});

const PromptTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
  textAlign: "center",
});

const PromptDescription = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
  textAlign: "center",
});
