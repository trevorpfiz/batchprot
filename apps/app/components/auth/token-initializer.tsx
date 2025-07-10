'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useBearerTokenStore } from '~/providers/bearer-token-store-provider';

interface TokenInitializerProps {
  sessionToken: string | null;
}

export function TokenInitializer({ sessionToken }: TokenInitializerProps) {
  const { fetchAndSetBearerToken, setSessionToken } = useBearerTokenStore(
    useShallow((state) => ({
      fetchAndSetBearerToken: state.fetchAndSetBearerToken,
      setSessionToken: state.setSessionToken,
    }))
  );

  useEffect(() => {
    if (sessionToken) {
      setSessionToken(sessionToken);
      fetchAndSetBearerToken(sessionToken);
    }
  }, [sessionToken, fetchAndSetBearerToken, setSessionToken]);

  return null;
}
