export type FloatButtonAction = {
  Icon: React.ComponentType<any>;
  label?: string;
  onPress: () => void;
  disabled?: boolean;
};
