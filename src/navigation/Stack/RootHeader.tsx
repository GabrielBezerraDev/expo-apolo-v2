import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
} from "@react-navigation/native-stack";
import { AppHeader } from "@shared/components/Navigation";
import { PropsWithChildren } from "react";

export const RootHeader = ({
  Stack,
  children,
}: PropsWithChildren<{
  Stack: ReturnType<typeof createNativeStackNavigator>;
}>) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      header: (props: NativeStackHeaderProps) => <AppHeader {...props} />,
    }}
  >
    {children}
  </Stack.Navigator>
);
