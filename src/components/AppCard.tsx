import React, { PropsWithChildren, ReactNode } from 'react';
import { styled, Text, View } from 'tamagui';
import { typography } from '../config/typography';

type Props = PropsWithChildren<{
  header?: ReactNode;
  variant?: 'default' | 'orangeHeader';
}>;

const Card = styled(View, {
  backgroundColor: '$card',
  borderRadius: 18,
  overflow: 'hidden',
  shadowColor: '#000000',
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
});

const Header = styled(View, {
  paddingVertical: 14,
  paddingHorizontal: 16,
  variants: {
    orange: {
      true: { backgroundColor: '$primary' },
      false: { backgroundColor: '$surface' },
    },
  } as const,
});

const Body = styled(View, { padding: 16 });

export const CardTitle = styled(Text, { ...typography.headingSmall, color: '$white' });

export function AppCard({ header, variant = 'default', children }: Props) {
  return (
    <Card>
      {header ? <Header orange={variant === 'orangeHeader'}>{typeof header === 'string' ? <CardTitle>{header}</CardTitle> : header}</Header> : null}
      <Body>{children}</Body>
    </Card>
  );
}
