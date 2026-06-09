import { View } from "tamagui";

type OutlinedTabIconProps = {
  Icon: React.ComponentType<any>;
  color: string;
  outlineColor: string;
  size?: number;
  focused: boolean;
};

export function OutlinedTabIcon({
  Icon,
  color,
  outlineColor,
  size = 24,
  focused = false,
}: OutlinedTabIconProps) {
  return (
    <View style={{ position: "relative", width: size + 4, height: size + 4 }}>
      {focused && (
        <Icon
          size={size}
          color={outlineColor}
          strokeWidth={4.2}
          style={{ position: "absolute", left: 2, top: 2 }}
        />
      )}
      <Icon
        size={size}
        color={color}
        strokeWidth={2}
        style={{ position: "absolute", left: 2, top: 2 }}
      />
    </View>
  );
}
