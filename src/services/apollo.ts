import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const API_URL = 'http://localhost:3001/graphql';

const httpLink = createHttpLink({
  uri: API_URL,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
