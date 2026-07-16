import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../../services";

export function useLoginMutation() {
  return useMutation({
    gcTime: 0,
    mutationFn: loginRequest,
    networkMode: "always",
    retry: false,
  });
}
