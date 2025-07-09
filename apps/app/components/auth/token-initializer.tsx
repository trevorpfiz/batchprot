'use client';

import { useEffect } from 'react';
import { useBearerTokenStore } from '~/providers/bearer-token-store-provider';

interface TokenInitializerProps {
  sessionToken: string | null;
}

export function TokenInitializer({ sessionToken }: TokenInitializerProps) {
  const fetchAndSetBearerToken = useBearerTokenStore(
    (state) => state.fetchAndSetBearerToken
  );

  useEffect(() => {
    if (sessionToken) {
      fetchAndSetBearerToken(sessionToken);
    }
  }, [sessionToken, fetchAndSetBearerToken]);

  return null;
}
