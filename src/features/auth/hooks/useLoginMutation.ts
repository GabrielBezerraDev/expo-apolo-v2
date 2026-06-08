import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../services/authApi";

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginRequest,
  });
}
