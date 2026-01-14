'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PlaidLinkButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  children?: React.ReactNode;
}

export function PlaidLinkButton({ variant = 'default', className, children }: PlaidLinkButtonProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch link token on mount
  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });
        const data = await response.json();
        setToken(data.link_token);
      } catch (error) {
        console.error('Error fetching link token:', error);
      }
    };

    createLinkToken();
  }, []);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, _metadata) => {
      setLoading(true);
      try {
        await fetch('/api/plaid/exchange-public-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicToken }),
        });
        
        // Refresh the page or invalidate queries to show new accounts
        router.refresh();
      } catch (error) {
        console.error('Error exchanging public token:', error);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => open()}
      disabled={!ready || loading}
    >
      {loading ? 'Linking...' : children || 'Connect Bank Account'}
    </Button>
  );
}
