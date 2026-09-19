/**
 * async-state.ts
 * Discriminated Union untuk seluruh proses asinkron (idle/loading/success/error).
 * Compiler memaksa penanganan semua kemungkinan status (tanpa `any`).
 */

export type AsyncState<TData> =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly message: string }
  | { readonly status: "success"; readonly data: TData }
  | { readonly status: "error"; readonly message: string; readonly retryable: boolean };

export const asyncIdle = (): AsyncState<never> => ({ status: "idle" });

export const asyncLoading = <TData>(message = "Memuat data..."): AsyncState<TData> => ({
  status: "loading",
  message,
});

export const asyncSuccess = <TData>(data: TData): AsyncState<TData> => ({
  status: "success",
  data,
});

export const asyncError = <TData>(message: string, retryable = true): AsyncState<TData> => ({
  status: "error",
  message,
  retryable,
});

export interface AsyncStateHandlers<TData, TResult> {
  readonly idle: () => TResult;
  readonly loading: (message: string) => TResult;
  readonly success: (data: TData) => TResult;
  readonly error: (message: string, retryable: boolean) => TResult;
}

/** Menangani semua status secara exhaustive (tanpa `default` yang menelan error). */
export const matchAsyncState = <TData, TResult>(
  state: AsyncState<TData>,
  handlers: AsyncStateHandlers<TData, TResult>,
): TResult => {
  switch (state.status) {
    case "idle":
      return handlers.idle();
    case "loading":
      return handlers.loading(state.message);
    case "success":
      return handlers.success(state.data);
    case "error":
      return handlers.error(state.message, state.retryable);
  }
};
