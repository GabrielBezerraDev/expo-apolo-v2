import React, { PropsWithChildren } from 'react';
import { styled, View } from 'tamagui';
import { AppHeader } from '@shared/components/AppHeader';

type Props = PropsWithChildren<{
  title: string;
}>;

const Screen = styled(View, { flex: 1, backgroundColor: '$background' });
const Content = styled(View, { flex: 1, paddingHorizontal: 20,  gap: 14 });

export function ListScreenShell({ title, children }: Props) {
  return (
    <Screen>
      <AppHeader title={title} subtitle="Olá, Operador X" />
      <Content>{children}</Content>
    </Screen>
  );
}
