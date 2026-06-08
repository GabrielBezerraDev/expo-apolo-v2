import { TextFilterValue } from "./types";

type UseTextFilterFieldParams = {
  onChange: (value: TextFilterValue | undefined) => void;
};

export function useTextFilterField({ onChange }: UseTextFilterFieldParams) {
  const handleChangeText = (text: string) => {
    const nextValue = text.trimStart();
    onChange(nextValue.trim() ? nextValue : undefined);
  };

  return { handleChangeText };
}
