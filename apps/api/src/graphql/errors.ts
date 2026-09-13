import { GraphQLError, GraphQLFormattedError } from 'graphql';

export enum ErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export class AuthenticationError extends GraphQLError {
  constructor(message = 'Authentication required') {
    super(message, {
      extensions: {
        code: ErrorCode.UNAUTHENTICATED,
        http: { status: 401 },
      },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message = 'Access forbidden') {
    super(message, {
      extensions: {
        code: ErrorCode.FORBIDDEN,
        http: { status: 403 },
      },
    });
  }
}

export class UserInputError extends GraphQLError {
  constructor(message: string, invalidArgs?: Record<string, unknown>) {
    super(message, {
      extensions: {
        code: ErrorCode.BAD_USER_INPUT,
        http: { status: 400 },
        invalidArgs,
      },
    });
  }
}

export class NotFoundError extends GraphQLError {
  constructor(message = 'Resource not found') {
    super(message, {
      extensions: {
        code: ErrorCode.NOT_FOUND,
        http: { status: 404 },
      },
    });
  }
}

export class ConflictError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: ErrorCode.CONFLICT,
        http: { status: 409 },
      },
    });
  }
}

/**
 * Apollo Server formatError function that standardizes error payloads
 * and strips internal stack traces in production.
 */
export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const isDev = process.env.NODE_ENV !== 'production';
  const original = (error as { originalError?: Error })?.originalError;

  return {
    ...formattedError,
    message: formattedError.message,
    extensions: {
      ...formattedError.extensions,
      code: formattedError.extensions?.code || ErrorCode.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      ...(isDev && original?.stack ? { stack: original.stack } : {}),
    },
  };
}
