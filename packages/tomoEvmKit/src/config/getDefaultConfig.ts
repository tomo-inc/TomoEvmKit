import type { Transport } from 'viem';
import { createConnector, http, type CreateConfigParameters } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { createConfig } from 'wagmi';
import type { RainbowKitChain } from '../components/RainbowKitProvider/RainbowKitChainContext';
import type { Wallet, WalletList } from '../wallets/Wallet';
import { computeWalletConnectMetaData } from '../wallets/computeWalletConnectMetaData';
import { connectorsForWallets } from '../wallets/connectorsForWallets';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '../wallets/walletConnectors';

export type _chains = readonly [RainbowKitChain, ...RainbowKitChain[]];

// Define the '_transports' type as a Record
// It maps each 'Chain' id to a 'Transport'
export type _transports = Record<_chains[number]['id'], Transport>;

interface GetDefaultConfigParameters<
  chains extends _chains,
  transports extends _transports,
> extends Omit<
    CreateConfigParameters<chains, transports>,
    // If you use 'client' you can't use 'transports' (we force to use 'transports')
    // More info here https://wagmi.sh/core/api/createConfig#client
    // We will also use our own 'connectors' instead of letting user specifying it
    'client' | 'connectors'
  > {
  appName: string;
  appDescription?: string;
  appUrl?: string;
  appIcon?: string;
  wallets?: WalletList;
  projectId: string;
  clientId?: string;
  devOption?: {
    connect?: string;
    relayBase?: string;
  };
}

const createDefaultTransports = <
  chains extends _chains,
  transports extends _transports,
>(
  chains: chains,
): transports => {
  const transportsObject = chains.reduce((acc: transports, chain) => {
    const key = chain.id as keyof transports;
    acc[key] = http() as transports[keyof transports]; // Type assertion here
    return acc;
  }, {} as transports);

  return transportsObject;
};

const logoUrl = 'https://d13t1x9bdoguib.cloudfront.net/static/logo.svg';
function makeTomoWalletFn({
  clientId = '',
  connect,
  relayBase,
}: {
  clientId: string;
  connect?: string;
  relayBase?: string;
}): () => Wallet {
  return () => {
    let provider: unknown;
    return {
      id: 'TomoWallet',
      name: 'Tomo Wallet',
      iconUrl: logoUrl,
      installed: true,
      iconBackground: '#000000',
      createConnector: (walletDetails) => {
        return createConnector((config) => ({
          ...injected({
            // shimDisconnect: false
          })(config),
          ...walletDetails.rkDetails,
          getProvider: async () => {
            if (provider) return provider;
            //@ts-ignore
            const socialSdk = await import('@tomo-inc/social-wallet-sdk');
            const { TomoSDK, EthereumProvider } = socialSdk;
            const tomoSDK = new TomoSDK({
              clientId: clientId,
              ethereumProvider: new EthereumProvider(),
              connect,
              relayBase,
            });
            const ethereum = tomoSDK.ethereumProvider;
            return ethereum;
          },
        }));
      },
    };
  };
}

export const getDefaultConfig = <
  chains extends _chains,
  transports extends _transports,
>({
  appName,
  appDescription,
  appUrl,
  appIcon,
  wallets,
  projectId,
  clientId,
  devOption: { connect, relayBase } = {},
  ...wagmiParameters
}: GetDefaultConfigParameters<chains, transports>) => {
  const { transports, chains, ...restWagmiParameters } = wagmiParameters;

  const metadata = computeWalletConnectMetaData({
    appName,
    appDescription,
    appUrl,
    appIcon,
  });

  if (!clientId) console.error('please enter your tomo client id');

  const tomoWallet = makeTomoWalletFn({
    clientId: clientId || '',
    connect,
    relayBase,
  });

  const connectors = connectorsForWallets(
    wallets
      ? [
          {
            groupName: 'Default',
            wallets: [tomoWallet],
          },
          ...wallets,
        ]
      : [
          {
            groupName: 'Popular',
            wallets: [
              tomoWallet,
              safeWallet,
              rainbowWallet,
              coinbaseWallet,
              metaMaskWallet,
              walletConnectWallet,
            ],
          },
        ],
    {
      projectId,
      appName,
      appDescription,
      appUrl,
      appIcon,
      walletConnectParameters: { metadata },
    },
  );

  return createConfig({
    connectors,
    chains,
    transports:
      transports || createDefaultTransports<chains, transports>(chains),
    ...restWagmiParameters,
  });
};
