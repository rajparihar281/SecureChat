import { GraphQLError } from 'graphql';
import {
  formatError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
  ErrorCode,
} from './errors';

describe('formatError and custom errors', () => {
  it('formats AuthenticationError with UNAUTHENTICATED code', () => {
    const err = new AuthenticationError('Token expired');
    const formatted = formatError(err, err);

    expect(formatted.message).toBe('Token expired');
    expect(formatted.extensions?.code).toBe(ErrorCode.UNAUTHENTICATED);
    expect(formatted.extensions?.timestamp).toBeDefined();
  });

  it('formats ForbiddenError with FORBIDDEN code', () => {
    const err = new ForbiddenError('Not allowed');
    const formatted = formatError(err, err);

    expect(formatted.extensions?.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('formats UserInputError with BAD_USER_INPUT code and invalidArgs', () => {
    const err = new UserInputError('Invalid email', { field: 'email' });
    const formatted = formatError(err, err);

    expect(formatted.extensions?.code).toBe(ErrorCode.BAD_USER_INPUT);
    expect(formatted.extensions?.invalidArgs).toEqual({ field: 'email' });
  });

  it('defaults generic errors to INTERNAL_SERVER_ERROR', () => {
    const err = new GraphQLError('Database connection died');
    const formatted = formatError(err, err);

    expect(formatted.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
  });
});
