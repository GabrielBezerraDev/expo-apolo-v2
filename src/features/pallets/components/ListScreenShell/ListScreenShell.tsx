import React, { PropsWithChildren, ReactNode } from "react";
import { styled, View } from "tamagui";
import { FloatButton, FloatButtonAction } from "@shared/components/Actions/FloatButton";
import { useAppHeaderConfig } from "@shared/components/Navigation/AppHeader";

type Props = PropsWithChildren<{
  title: string;
  floatActions?: FloatButtonAction[];
  topRightAction?: ReactNode;
}>;

const Screen = styled(View, { flex: 1, backgroundColor: "$background" });
const Content = styled(View, { flex: 1, paddingHorizontal: 12, gap: 14,   position: "relative" });
const TopRightActionSlot = styled(View, {
  position: "absolute",
  right: 12,
  top: 8,
  zIndex: 20,
});


export function ListScreenShell({ title, children, floatActions = [], topRightAction }: Props) {
  useAppHeaderConfig({ title });

  return (
    <Screen>
      <Content>
        {children}
        {topRightAction ? <TopRightActionSlot>{topRightAction}</TopRightActionSlot> : null}
      </Content>
      <FloatButton actions={floatActions} bottom={86} />
    </Screen>
  );
}
