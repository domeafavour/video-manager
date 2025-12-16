import { MutationCache, QueryClient } from "@tanstack/react-query";

interface MyQueryMeta extends Record<string, unknown> {
  /**
   * Tags associated with the query for invalidation purposes
   */
  tags?: string[];
}

interface MyMutationMeta extends Record<string, unknown> {
  /**
   * Tags to invalidate upon successful mutation
   */
  invalidatesTags?: string[];
}

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: MyQueryMeta;
    mutationMeta: MyMutationMeta;
  }
}

function findQueriesByTag<T extends string = string>(
  tag: T,
  queryClient: QueryClient
) {
  return queryClient.getQueryCache().findAll({
    predicate: (q) => Array.isArray(q.meta?.tags) && q.meta.tags.includes(tag),
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // do not retry on error
      retry: false,
    },
    mutations: {
      // do not retry on error
      retry: false,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _result, context) => {
      const invalidatesTags = context.meta?.invalidatesTags;
      if (!invalidatesTags || !Array.isArray(invalidatesTags)) {
        return;
      }
      invalidatesTags.forEach((invalidatesTag) => {
        findQueriesByTag(invalidatesTag, queryClient).forEach((q) => {
          queryClient.invalidateQueries({
            queryKey: q.queryKey,
            type: "active",
          });
        });
      });
    },
  }),
});
