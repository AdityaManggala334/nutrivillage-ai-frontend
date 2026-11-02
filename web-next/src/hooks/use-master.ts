"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Baris data master (bentuk bebas, divalidasi di sisi backend). */
export type MasterRow = Record<string, unknown>;

export type MasterResource =
  | "ingredients"
  | "nutrition"
  | "recipes"
  | "seasons"
  | "local"
  | "regions"
  | "prices"
  | "food-safety"
  | "articles";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!response.ok) {
    let message = `Permintaan gagal (HTTP ${response.status})`;
    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null && "message" in body) {
        const m = (body as { message?: unknown }).message;
        if (typeof m === "string") message = m;
      }
    } catch {
      // biarkan pesan default
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const key = (resource: MasterResource) => ["admin-master", resource] as const;

export function useMasterList(resource: MasterResource) {
  return useQuery({
    queryKey: key(resource),
    queryFn: ({ signal }) => request<MasterRow[]>(`/api/admin/${resource}`, { signal }),
    staleTime: 1000 * 60,
  });
}

export function useMasterCreate(resource: MasterResource, upsertId?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) =>
      request<MasterRow>(
        upsertId ? `/api/admin/${resource}/${upsertId}` : `/api/admin/${resource}`,
        { method: upsertId ? "PUT" : "POST", body: JSON.stringify(body) },
      ),
    onSuccess: () => void client.invalidateQueries({ queryKey: key(resource) }),
  });
}

export function useMasterUpdate(resource: MasterResource, upsert = false) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: unknown }) =>
      request<MasterRow>(`/api/admin/${resource}/${id}`, {
        method: upsert ? "PUT" : "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => void client.invalidateQueries({ queryKey: key(resource) }),
  });
}

export function useMasterDelete(resource: MasterResource) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      request<undefined>(`/api/admin/${resource}/${id}`, { method: "DELETE" }),
    onSuccess: () => void client.invalidateQueries({ queryKey: key(resource) }),
  });
}
