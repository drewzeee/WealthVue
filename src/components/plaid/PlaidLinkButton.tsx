'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PlaidLinkButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  children?: React.ReactNode;
  onPlaidOpen?: () => void;
  onPlaidExit?: () => void;
}

export function PlaidLinkButton({ variant = 'default', className, children, onPlaidOpen, onPlaidExit }: PlaidLinkButtonProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch link token only when needed or when the component is explicitly active
  // For now, let's keep it simple but ensure it's not pre-fetching if possible.
  // Actually, if we're not sure where it's used, we can add a check.
  useEffect(() => {
    // If we want to be very strict, we could only fetch on hover or click, 
    // but usePlaidLink needs it at mount time if we want 'ready' state.
    // However, if we're in settings, maybe it's in a component that's rendered but not visible?
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
        if (onPlaidExit) onPlaidExit();
      }
    },
    [router, onPlaidExit]
  );

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
    onExit: (error, _metadata) => {
      if (onPlaidExit) onPlaidExit();
      if (error) console.error('Plaid exit with error:', error);
    },
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => {
        open();
        if (onPlaidOpen) onPlaidOpen();
      }}
      disabled={!ready || loading}
    >
      {loading ? 'Linking...' : children || 'Connect Bank Account'}
    </Button>
  );
}
