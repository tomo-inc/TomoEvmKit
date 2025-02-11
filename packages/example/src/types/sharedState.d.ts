import type { Config } from 'wagmi';

export interface SharedState {
  accountModalOpen: boolean;
  openAccountModalAvailable: boolean;
  chainModalOpen: boolean;
  openChainModalAvailable: boolean;
  connectModalOpen: boolean;
  openConnectModalAvailable: boolean;
  chainName: string | undefined;
}
