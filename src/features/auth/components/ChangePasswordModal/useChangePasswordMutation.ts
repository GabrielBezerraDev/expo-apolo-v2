import { useMutation } from "@tanstack/react-query";
import { ChangePasswordRequest, ChangePasswordResponse } from "../../protocol";
import { useAuthApi } from "../../services";

export function useChangePasswordMutation() {
  const authApi = useAuthApi();

  return useMutation<ChangePasswordResponse, Error, ChangePasswordRequest>({
    gcTime: 0,
    mutationFn: authApi.changePassword,
    networkMode: "always",
    retry: false,
  });
}
