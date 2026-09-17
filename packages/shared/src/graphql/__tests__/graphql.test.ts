import {
  GET_ME_QUERY,
  GET_CONVERSATIONS_QUERY,
  GET_MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION,
  LOGIN_MUTATION,
  ON_MESSAGE_SENT_SUBSCRIPTION,
} from '../documents.js';

describe('Shared GraphQL Documents', () => {
  it('parses valid GraphQL operations', () => {
    expect(GET_ME_QUERY.kind).toBe('Document');
    expect(GET_CONVERSATIONS_QUERY.kind).toBe('Document');
    expect(GET_MESSAGES_QUERY.kind).toBe('Document');
    expect(SEND_MESSAGE_MUTATION.kind).toBe('Document');
    expect(LOGIN_MUTATION.kind).toBe('Document');
    expect(ON_MESSAGE_SENT_SUBSCRIPTION.kind).toBe('Document');
  });
});
