import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SharedState } from './Pip';

function usePip(iframe: Window) {
  const [pipState, setPipState] = useState<Partial<SharedState>>({});

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
        iframe?.postMessage({ type: 'openAccountModal' });
      },
      openChainModal() {
        iframe?.postMessage({ type: 'openChainModal' });
      },
      openConnectModal() {
        iframe?.postMessage({ type: 'openConnectModal' });
      },
    };
  }, [iframe]);

  return {
    state: pipState,
    methods,
  };
}

const Example = () => {
  const pipRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    methods: { openAccountModal, openChainModal, openConnectModal },
    state: {
      chainModalOpen,
      accountModalOpen,
      connectModalOpen,
      openAccountModalAvailable,
      openChainModalAvailable,
      openConnectModalAvailable,
    },
  } = usePip((pipRef?.current as any)?.contentWindow as Window);

  const ready = mounted;
  // const connected = isWagmiConnected;

  const oneOfModalOpen = chainModalOpen || accountModalOpen || connectModalOpen;

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
        <a
          href="https://docs.tomo.inc/tomo-sdk/tomoevmkit"
          target="_blank"
          rel="noreferrer"
        >
          {/* biome-ignore lint/a11y/useValidAriaRole: not important */}
          <div role="btn" className="doc-btn">
            Docs
          </div>
        </a>
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
                disabled={!openChainModalAvailable}
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
          <div
            className={`modal-frame ${oneOfModalOpen ? 'modal-frame-mobile-visible' : ''}`}
          >
            {ready && (
              <iframe
                style={{
                  height: '100%',
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
                  disabled={!openConnectModalAvailable}
                  onClick={openConnectModal}
                  type="button"
                >
                  {connectModalOpen
                    ? 'Connect modal opened'
                    : 'Open connect modal'}
                </button>
                <button
                  disabled={!openChainModalAvailable}
                  onClick={openChainModal}
                  type="button"
                >
                  {chainModalOpen ? 'Chain modal opened' : 'Open chain modal'}
                </button>
                <button
                  disabled={!openAccountModalAvailable}
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
          <a
            href="http://t.me/tomowalletbot/tomo_sdk_demo"
            target="_blank"
            rel="noreferrer"
          >
            <div className="tg-demo-link-btn">
              See our Telegram SDK Demo{' '}
              <Image width={22} height={22} alt="" src="./tgIcon.png" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Example;
