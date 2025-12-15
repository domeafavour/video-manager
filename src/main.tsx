import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { routeTree } from "./routeTree.gen";

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
    mutations: {
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
    },
  },
});

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
