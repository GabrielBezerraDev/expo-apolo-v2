import React, { PropsWithChildren, ReactNode } from "react";
import { Body, Card, CardTitle, Footer, Header } from "./styled";
import { AppCardFooterConfig, useAppCard } from "./useAppCard";

type Props = PropsWithChildren<{
  header?: ReactNode;
  footerConfig?: AppCardFooterConfig;
  variant?: "default" | "orangeHeader";
}>;

export function AppCard({
  header,
  variant = "default",
  children,
  footerConfig,
}: Props) {
  const { footerCallback, footerTitle } = useAppCard({ footerConfig });

  return (
    <Card>
      {header ? (
        <Header orange={variant === "orangeHeader"}>
          {typeof header === "string" ? (
            <CardTitle colorVariant="white">{header}</CardTitle>
          ) : (
            header
          )}
        </Header>
      ) : null}
      <Body>{children}</Body>
      <Footer
        onPress={footerCallback}
        orange={variant === "orangeHeader"}
      >
        <CardTitle colorVariant="white">{footerTitle}</CardTitle>
      </Footer>
    </Card>
  );
}
