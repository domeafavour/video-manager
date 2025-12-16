import { MutationCache, QueryClient } from "@tanstack/react-query";

function findQueriesByTag<T extends string = string>(
  tag: T,
  queryClient: QueryClient
) {
  return queryClient.getQueryCache().findAll({
    predicate: (q) => Array.isArray(q.meta?.tags) && q.meta.tags.includes(tag),
  });
}

export const queryClient = new QueryClient({
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