import { toast } from '@repo/design-system/components/ui/sonner';
import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query';
import SuperJSON from 'superjson';
import { bearerTokenStore } from '~/stores/bearer-token-store';

export const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: () => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false;
        },
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
    queryCache: new QueryCache({
      onError: async (error, query) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const errorResponse = (error as any)?.meta?.response as Response;
        if (errorResponse?.status === 401) {
          try {
            await bearerTokenStore.getState().refreshBearerToken();
            // Invalidate and refetch the failed query
            await queryClient.invalidateQueries({ queryKey: query.queryKey });
          } catch (_refreshError) {
            toast.error('Session expired. Please log in again.');
            bearerTokenStore.getState().clearBearerToken();
          }
        } else {
          toast.error(`API Error: ${error.message}`);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (_error, _, __, mutation) => {
        // cache-level mutations error handler
        const { mutationKey } = mutation.options;
        toast.error(`API Mutation Error ${mutationKey ? `: ${mutation}` : ''}`);
      },
    }),
  });
  return queryClient;
};
