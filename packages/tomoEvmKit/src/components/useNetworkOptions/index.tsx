import { useMemo } from 'react';
import { useRainbowKitChains } from '../RainbowKitProvider/RainbowKitChainContext';
import { AsyncImage } from '../AsyncImage/AsyncImage';
import { Box } from '../Box/Box';
import React from 'react';
import { useSwitchChain } from 'wagmi';

export function useNetworkOptions() {
  const { switchChainAsync } = useSwitchChain();
  const rainbowKitChains = useRainbowKitChains();
  const networkOptions = useMemo(() => {
    return rainbowKitChains.map((rc) => ({
      id: rc.id,
      name: rc.name,
      logo: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 32,
            height: 32,
          }}
        >
          {rc?.iconUrl ? (
            <AsyncImage src={rc?.iconUrl || ''} fullWidth fullHeight />
          ) : (
            <Box
              style={{
                color: '#8989AB',
                backgroundColor: '#EBEBF4',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {rc.name.slice(0, 1).toUpperCase()}
            </Box>
          )}
        </div>
      ),
      onClick: async () => {
        await switchChainAsync({ chainId: rc.id });
      },
    }));
  }, [rainbowKitChains, switchChainAsync]);

  return networkOptions;
}
