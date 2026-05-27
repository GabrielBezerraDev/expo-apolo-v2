import React, { PropsWithChildren } from 'react';
import { styled, View } from 'tamagui';
import { AppHeader } from '../../../components/AppHeader';

type Props = PropsWithChildren<{
  title: string;
}>;

const Screen = styled(View, { flex: 1, backgroundColor: '$background' });
const Content = styled(View, { flex: 1, paddingTop: 10, paddingHorizontal: 20, paddingBottom: 110, gap: 14 });

export function ListScreenShell({ title, children }: Props) {
  return (
    <Screen>
      <AppHeader title={title} subtitle="Olá, Operador X" />
      <Content>{children}</Content>
    </Screen>
  );
}
