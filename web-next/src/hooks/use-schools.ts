"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiDelete, apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  BeneficiaryGroupSchema,
  BudgetPolicyListSchema,
  SchoolListSchema,
  SchoolSchema,
  type BeneficiaryLevel,
} from "@/schemas/school";

const OkSchema = z.object({ ok: z.boolean() });

export interface SchoolInput {
  readonly name: string;
  readonly npsn?: string;
  readonly address?: string;
  readonly region: string;
  readonly isActive?: boolean;
  readonly groups?: ReadonlyArray<{
    readonly level: BeneficiaryLevel;
    readonly studentCount: number;
    readonly budgetPerPortion?: number | null;
  }>;
}

export interface GroupInput {
  readonly level: BeneficiaryLevel;
  readonly label?: string | null;
  readonly studentCount: number;
  readonly budgetPerPortion?: number | null;
}

/** FR-11: daftar sekolah pada lingkup sesi (Server State). */
export function useSchools() {
  return useQuery({
    queryKey: queryKeys.schools.list(),
    queryFn: ({ signal }) => apiGet("/api/schools", SchoolListSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

export function useCreateSchoolMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SchoolInput) =>
      apiSend("/api/schools", "POST", input, SchoolSchema),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.schools.all });
    },
  });
}

export function useUpdateSchoolMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<SchoolInput> }) =>
      apiSend(`/api/schools/${id}`, "PATCH", input, SchoolSchema),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.schools.all });
    },
  });
}

export function useDeleteSchoolMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/api/schools/${id}`, OkSchema),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.schools.all });
    },
  });
}

export function useCreateGroupMutation(schoolId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupInput) =>
      apiSend(
        `/api/schools/${schoolId}/groups`,
        "POST",
        input,
        BeneficiaryGroupSchema,
      ),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.schools.all });
    },
  });
}

export function useUpdateGroupMutation(schoolId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, input }: { groupId: number; input: Partial<GroupInput> }) =>
      apiSend(
        `/api/schools/${schoolId}/groups/${groupId}`,
        "PATCH",
        input,
        BeneficiaryGroupSchema,
      ),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.schools.all });
    },
  });
}

export function useDeleteGroupMutation(schoolId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) =>
      apiDelete(`/api/schools/${schoolId}/groups/${groupId}`, OkSchema),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.schools.all });
    },
  });
}

/** Kebijakan anggaran bahan pangan per porsi (bisa berstatus belum dikonfigurasi). */
export function useBudgetPolicies() {
  return useQuery({
    queryKey: queryKeys.budgetPolicies.list(),
    queryFn: ({ signal }) => apiGet("/api/budget-policies", BudgetPolicyListSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}
