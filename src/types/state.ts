/**
 * state.ts
 * Discriminated Unions untuk seluruh proses asinkron (mock API).
 *
 * Setiap request ke service wajib mengembalikan/mengonsumsi `AsyncState<T>`.
 * Tidak ada tipe `any`; compiler memaksa penanganan semua kemungkinan status.
 */

export interface IdleState {
  readonly status: 'idle';
}

export interface LoadingState {
  readonly status: 'loading';
  readonly message: string;
}

export interface SuccessState<TData> {
  readonly status: 'success';
  readonly data: TData;
}

export interface ErrorState {
  readonly status: 'error';
  readonly message: string;
  readonly retryable: boolean;
}

export type AsyncState<TData> = IdleState | LoadingState | SuccessState<TData> | ErrorState;

/* ------------------------------------------------------------------ */
/* Constructors                                                        */
/* ------------------------------------------------------------------ */

export const asyncIdle = (): IdleState => ({ status: 'idle' });

export const asyncLoading = (message = 'Memuat data...'): LoadingState => ({
  status: 'loading',
  message,
});

export const asyncSuccess = <TData>(data: TData): SuccessState<TData> => ({
  status: 'success',
  data,
});

export const asyncError = (message: string, retryable = true): ErrorState => ({
  status: 'error',
  message,
  retryable,
});

/* ------------------------------------------------------------------ */
/* Type guards                                                         */
/* ------------------------------------------------------------------ */

export const isIdle = <TData>(state: AsyncState<TData>): state is IdleState =>
  state.status === 'idle';

export const isLoading = <TData>(state: AsyncState<TData>): state is LoadingState =>
  state.status === 'loading';

export const isSuccess = <TData>(state: AsyncState<TData>): state is SuccessState<TData> =>
  state.status === 'success';

export const isError = <TData>(state: AsyncState<TData>): state is ErrorState =>
  state.status === 'error';

/* ------------------------------------------------------------------ */
/* Exhaustive matcher                                                  */
/* ------------------------------------------------------------------ */

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
    case 'idle':
      return handlers.idle();
    case 'loading':
      return handlers.loading(state.message);
    case 'success':
      return handlers.success(state.data);
    case 'error':
      return handlers.error(state.message, state.retryable);
  }
};
