import { createAuthLink, AuthOptions } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";

type Params = {
  url: string;
  region: string;
  auth: AuthOptions;
};

export function createClient(params: Params) {
  const link = ApolloLink.from([
    createAuthLink(params),
    createSubscriptionHandshakeLink(params),
  ]);

  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
  return apolloClient;
}
