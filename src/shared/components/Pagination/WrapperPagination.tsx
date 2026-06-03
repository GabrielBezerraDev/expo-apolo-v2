import { PropsWithChildren } from "react";
import { View } from "tamagui";

export function WrapperPagination({ children }: PropsWithChildren) {
  return (
    <View
      style={[
        {
          position: "absolute",
          bottom: 0
        },
      ]}
    >
      {children}
    </View>
  );
}
