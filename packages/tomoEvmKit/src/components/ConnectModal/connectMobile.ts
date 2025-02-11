import type { WalletConnector } from '../../wallets/useWalletConnectors';
import { setWalletConnectDeepLink } from '../RainbowKitProvider/walletConnectDeepLink';

export const connectMobile = async (wallet: WalletConnector) => {
  const { connect, id, name, getMobileUri, showWalletConnectModal } = wallet;
  const onMobileUri = async () => {
    const mobileUri = await getMobileUri?.();

    if (!mobileUri) return;

    if (mobileUri) {
      setWalletConnectDeepLink({ mobileUri, name });
    }

    if (mobileUri.startsWith('http')) {
      // Workaround for https://github.com/rainbow-me/rainbowkit/issues/524.
      // Using 'window.open' causes issues on iOS in non-Safari browsers and
      // WebViews where a blank tab is left behind after connecting.
      // This is especially bad in some WebView scenarios (e.g. following a
      // link from Twitter) where the user doesn't have any mechanism for
      // closing the blank tab.
      // For whatever reason, links with a target of "_blank" don't suffer
      // from this problem, and programmatically clicking a detached link
      // element with the same attributes also avoids the issue.
      const link = document.createElement('a');
      link.href = mobileUri;
      link.target = '_blank';
      link.rel = 'noreferrer noopener';
      link.click();
    } else {
      window.location.href = mobileUri;
    }
  };

  if (id !== 'walletConnect') onMobileUri();

  // If the id is "walletConnect" then "showWalletConnectModal" will always be true
  if (showWalletConnectModal) {
    showWalletConnectModal();
    // onClose?.();
    return;
  }

  connect?.();
};
