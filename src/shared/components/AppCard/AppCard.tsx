import React, { PropsWithChildren, ReactNode } from "react";
import { Body, Card, CardTitle, Footer, Header } from "./styled";
import { useModal } from "../Modal";
import { Text } from "tamagui";

interface IFooterConfig {
  title: string;
  footerCallback: (...rest: any[]) => any;
}

type Props = PropsWithChildren<{
  header?: ReactNode;
  footerConfig?: IFooterConfig;
  variant?: "default" | "orangeHeader";
}>;

export function AppCard({
  header,
  variant = "default",
  children,
  footerConfig,
}: Props) {

  const { openModal } = useModal();

  const defaultFooterConfig = {
    title: "Opções",
    footerCallback: () => {
      openModal(<Text>Teste</Text>);
    },
  };

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
        onPress={footerConfig ? footerConfig.footerCallback : defaultFooterConfig.footerCallback}
        orange={variant === "orangeHeader"}
      >
        <CardTitle colorVariant="white">{footerConfig ? footerConfig.title : defaultFooterConfig.title}</CardTitle>
      </Footer>
    </Card>
  );
}
