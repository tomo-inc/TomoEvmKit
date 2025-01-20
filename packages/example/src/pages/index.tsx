import {
  type ConnectButton,
  useAccountModal,
  useAddRecentTransaction,
  useChainModal,
  useConnectModal,
} from '@tomo-inc/tomo-evm-kit';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

function usePip(iframe: Window) {
  const [isMobile, setIsMobile] = useState(false);
  const [pipState, setPipState] = useState<{
    chainModalOpen?: boolean;
    accountModalOpen?: boolean;
    connectModalOpen?: boolean;
  }>({});

  useEffect(() => {
    // Check the screen width on component mount
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // 768px is a common breakpoint for mobile
    };

    // Call the function initially
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    openAccountModal: openAccountModalLocal,
    accountModalOpen: accountModalOpenLocal,
  } = useAccountModal();
  const {
    openChainModal: openChainModalLocal,
    chainModalOpen: chainModalOpenLocal,
  } = useChainModal();
  const {
    openConnectModal: openConnectModalLocal,
    connectModalOpen: connectModalOpenLocal,
  } = useConnectModal();

  useEffect(() => {
    const listener = ({ data }: any) => {
      console.log('args', data);
      console.log('iframe event', data.type);
      const { type, state: stateFromPip } = data;
      if (type === 'iframe-state-change') setPipState({ ...stateFromPip });
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  const methods = useMemo(() => {
    return {
      openAccountModal() {
        return isMobile
          ? openAccountModalLocal?.()
          : iframe?.postMessage({ type: 'openAccountModal' });
      },
      openChainModal() {
        return isMobile
          ? openChainModalLocal?.()
          : iframe?.postMessage({ type: 'openChainModal' });
      },
      openConnectModal() {
        return isMobile
          ? openConnectModalLocal?.()
          : iframe?.postMessage({ type: 'openConnectModal' });
      },
    };
  }, [
    isMobile,
    openAccountModalLocal,
    openChainModalLocal,
    openConnectModalLocal,
    iframe,
  ]);

  return {
    state: !isMobile
      ? pipState
      : {
          accountModalOpen: accountModalOpenLocal,
          connectModalOpen: connectModalOpenLocal,
          chainModalOpen: chainModalOpenLocal,
        },
    methods,
  };
}

const Example = () => {
  // const { address, isConnected: isWagmiConnected } = useAccount();
  const pipRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    methods: { openAccountModal, openChainModal, openConnectModal },
    state: { chainModalOpen, accountModalOpen, connectModalOpen },
  } = usePip((pipRef?.current as any)?.contentWindow as Window);

  const ready = mounted;
  // const connected = isWagmiConnected;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        paddingBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          boxSizing: 'border-box',
          justifyContent: 'space-between',
        }}
        className="demo-header"
      >
        <Image src="/TomoConnect.png" alt={''} width={102} height={48} />
        <div className="doc-btn">Docs</div>
      </div>
      {/* <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          position: 'sticky',
          top: 8,
        }}
      >
        <ConnectButton
          accountStatus={{
            largeScreen: accountStatusLargeScreen,
            smallScreen: accountStatusSmallScreen,
          }}
          chainStatus={{
            largeScreen: chainStatusLargeScreen,
            smallScreen: chainStatusSmallScreen,
          }}
          showBalance={{
            largeScreen: showBalanceLargeScreen,
            smallScreen: showBalanceSmallScreen,
          }}
        />
      </div> */}

      <div className="demo-index-layout">
        <div
          style={{
            width: 375,
          }}
        >
          <div
            id="supported-chains"
            className="supported-title"
            style={{
              height: 261,
              maxWidth: '100%',
            }}
          >
            <div
              style={{
                padding: '0 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              Supported Chains
              <button
                disabled={!openChainModal}
                onClick={openChainModal}
                type="button"
                style={{ height: '100%' }}
              >
                {chainModalOpen ? 'Chain modal opened' : 'Open chain modal'}
              </button>
            </div>
            <Image
              src="./supportedChains.png"
              width={375}
              height={213}
              alt={''}
            />
          </div>
          <div
            id="supported-social-logins"
            className="supported-title"
            style={{
              height: 261,
            }}
          >
            <div
              style={{
                padding: '0 14px',
              }}
            >
              Supported Social Logins
            </div>
            <Image
              src="./supportedSocial.png"
              width={375}
              height={213}
              alt={''}
            />
          </div>
          <div
            id="supported-social-logins"
            className="supported-title"
            style={{
              height: 261,
              padding: '0 14px',
            }}
          >
            <div>Our features</div>
            <Image src="./features.png" width={347} height={120} alt={''} />
          </div>
        </div>

        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div className="modal-frame">
            {ready && (
              <iframe
                style={{
                  height: '100vh',
                  width: '100%',
                }}
                title="modal-picture-in-picture"
                src="/pip"
                ref={pipRef}
              />
            )}
          </div>
          {ready && (
            <div>
              <h3 style={{ fontFamily: 'sans-serif' }}>Modal hooks</h3>
              <div style={{ display: 'flex', gap: 12, paddingBottom: 12 }}>
                <button
                  disabled={!openConnectModal}
                  onClick={openConnectModal}
                  type="button"
                >
                  {connectModalOpen
                    ? 'Connect modal opened'
                    : 'Open connect modal'}
                </button>
                <button
                  disabled={!openChainModal}
                  onClick={openChainModal}
                  type="button"
                >
                  {chainModalOpen ? 'Chain modal opened' : 'Open chain modal'}
                </button>
                <button
                  disabled={!openAccountModal}
                  onClick={openAccountModal}
                  type="button"
                >
                  {accountModalOpen
                    ? 'Account modal opened'
                    : 'Open account modal'}
                </button>
              </div>
            </div>
          )}
          <div className="tg-demo-link-btn">
            See our Telegram SDK Demo{' '}
            <Image width={22} height={22} alt="" src="./tgIcon.png" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Example;
