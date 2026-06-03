import React, { PropsWithChildren } from "react";
import { styled, View } from "tamagui";
import { AppHeader } from "@shared/components/AppHeader";
import { FloatButton, FloatButtonAction } from "@shared/components/FloatButton";
import { PaginationComponent } from "@shared/components/Pagination";

type Props = PropsWithChildren<{
  title: string;
  floatActions?: FloatButtonAction[];
}>;

const Screen = styled(View, { flex: 1, backgroundColor: "$background" });
const Content = styled(View, { flex: 1, paddingHorizontal: 12, gap: 14, position: "relative" });


export function ListScreenShell({ title, children, floatActions = [] }: Props) {
  return (
    <Screen>
      <AppHeader title={title} subtitle="Olá, Operador X" />
      <Content>
        {children}
      </Content>
      <FloatButton actions={floatActions} bottom={86} />
    </Screen>
  );
}
