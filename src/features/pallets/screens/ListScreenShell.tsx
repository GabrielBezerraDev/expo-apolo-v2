import React, { PropsWithChildren } from 'react';
import { styled, View } from 'tamagui';
import { AppHeader } from '@shared/components/AppHeader';
import { FloatButton, FloatButtonAction } from '@shared/components/FloatButton';

type Props = PropsWithChildren<{
  title: string;
  floatActions?: FloatButtonAction[];
}>;

const Screen = styled(View, { flex: 1, backgroundColor: '$background' });
const Content = styled(View, { flex: 1, paddingHorizontal: 20,  gap: 14 });

export function ListScreenShell({ title, children, floatActions = [] }: Props) {
  return (
    <Screen>
      <AppHeader title={title} subtitle="Olá, Operador X" />
      <Content>{children}</Content>
      <FloatButton actions={floatActions} bottom={16} />
    </Screen>
  );
}
