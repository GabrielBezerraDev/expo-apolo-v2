import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../../services";

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginRequest,
    networkMode: "always",
  });
}
