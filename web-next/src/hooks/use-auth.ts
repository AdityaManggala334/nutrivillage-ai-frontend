"use client";

import { useMutation } from "@tanstack/react-query";
import { apiSend } from "@/lib/api-client";
import {
  AuthSessionSchema,
  type LoginInput,
  type RegisterInput,
} from "@/schemas/auth";

/** FR-02: mutasi login. */
export function useLoginMutation() {
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiSend("/api/auth/login", "POST", input, AuthSessionSchema),
  });
}

/** FR-01: mutasi registrasi. */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiSend("/api/auth/register", "POST", input, AuthSessionSchema),
  });
}

/** FR-03: mode tamu. */
export function useGuestMutation() {
  return useMutation({
    mutationFn: () => apiSend("/api/auth/guest", "POST", {}, AuthSessionSchema),
  });
}
