import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export class ApiError {
  code: number;
  message: string;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }
}

export const UNEXPECTED_ERROR = { code: 500, message: "unexpected error" };

function addAuthHeader(
  session: Session | null,
  init: RequestInit | undefined,
): RequestInit {
  const headers = new Headers(init?.headers);

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  return {
    ...init,
    headers,
  };
}

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { data: session } = useSession();

  const request = useCallback(
    async <T>(
      input: RequestInfo,
      init?: RequestInit,
      responseAs: "json" | "text" | "void" = "json",
    ): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        init = addAuthHeader(session, init);

        const response = await fetch(input, {
          credentials: "same-origin",
          ...init,
        });

        if (!response.ok) {
          throw { code: response.status, message: response.statusText };
        }

        if (responseAs === "void") {
          return undefined as unknown as T;
        }

        if (responseAs === "text") {
          return (await response.text()) as T;
        }

        return (await response.json()) as T;
      } catch (err: unknown) {
        let apiError: ApiError;

        if (err instanceof ApiError) {
          apiError = err;
        } else if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          "message" in err
        ) {
          apiError = new ApiError(err.code as number, err.message as string);
        } else {
          apiError = new ApiError(
            UNEXPECTED_ERROR.code,
            UNEXPECTED_ERROR.message,
          );
        }

        setError(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [session],
  );

  return { isLoading, error, request };
};
