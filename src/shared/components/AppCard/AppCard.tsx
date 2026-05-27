import React, { PropsWithChildren, ReactNode } from "react";
import { Alert } from "react-native";
import { Body, Card, CardTitle, Footer, Header } from "./styled";

interface IFooterConfig {
  title: string;
  footerCallback: (...rest: any[]) => any;
}

type Props = PropsWithChildren<{
  header?: ReactNode;
  footerConfig?: IFooterConfig;
  variant?: "default" | "orangeHeader";
}>;

const defaultFooterConfig = {
  title: "Opções",
  footerCallback: () => Alert.alert("Não há Opções para esse Card"),
};

export function AppCard({ header, variant = "default", children, footerConfig = defaultFooterConfig }: Props) {
  return (
    <Card>
      {header ? (
        <Header orange={variant === "orangeHeader"}>
          {typeof header === "string" ? <CardTitle>{header}</CardTitle> : header}
        </Header>
      ) : null}
      <Body>{children}</Body>
      <Footer onPress={footerConfig.footerCallback} orange={variant === "orangeHeader"}>
        <CardTitle>{footerConfig.title}</CardTitle>
      </Footer>
    </Card>
  );
}
