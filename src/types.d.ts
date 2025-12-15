import "@tanstack/react-query";

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
