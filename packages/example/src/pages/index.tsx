import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SharedState } from '../types/sharedState';

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
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    methods: { openAccountModal, openChainModal, openConnectModal },
    state: {
      chainModalOpen,
      accountModalOpen,
      connectModalOpen,
      openAccountModalAvailable,
      openChainModalAvailable,
      openConnectModalAvailable,
      chainName,
    },
  } = usePip((pipRef?.current as any)?.contentWindow as Window);

  const ready = mounted;

  const oneOfModalOpen = chainModalOpen || accountModalOpen || connectModalOpen;

  return (
    <>
      <div
        style={
          {
            // display: 'flex',
            // width: '100%',
            // boxSizing: 'border-box',
            // justifyContent: 'space-between',
          }
        }
        className="demo-header demo-header-spacing"
      >
        <Image src="/TomoConnect.png" alt={''} width={102} height={48} />
        <a
          href="https://docs.tomo.inc/tomo-sdk/tomoevmkit"
          target="_blank"
          rel="noreferrer"
        >
          <button className="secondary-btn">
            Docs
            <Image src="./rightArrow.png" alt="" width={9} height={7.5} />
          </button>
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
        <div className="side-bar side-bar-spec">
          <div id="supported-chains">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 32,
              }}
              className="supported-title"
            >
              Supported Chains
              <button
                disabled={!openChainModalAvailable}
                onClick={openChainModal}
                type="button"
                style={{ height: '100%' }}
                className="secondary-btn"
              >
                {chainName || 'Open chain modal'}
              </button>
            </div>
            <div className="responsive-image-width">
              <Image
                src="./supportedChains.png"
                width={354}
                height={112}
                alt={''}
                layout="responsive"
              />
            </div>
          </div>
          <div id="supported-social-logins">
            <div className="supported-title" style={{ height: 27 }}>
              Supported Social Logins
            </div>
            <div className="responsive-image-width">
              <Image
                src="./supportedSocial.png"
                width={354}
                height={90}
                alt={''}
                layout="responsive"
              />
            </div>
          </div>
          <div id="supported-social-logins">
            <div className="supported-title">Our features</div>
            <div className="responsive-image-width">
              <Image
                src="./features.png"
                width={354}
                height={350}
                alt={''}
                layout="responsive"
              />
            </div>
          </div>
        </div>

        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
          className="main-content"
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
          <div id="frame-operator" className="frame-operator">
            {ready && (
              <div className="frame-operator-hooks">
                <div
                  style={{
                    fontFamily: 'sans-serif',
                    fontSize: 18,
                    marginBottom: 12,
                  }}
                  className="modal-hooks-invisible"
                >
                  Modal hooks
                </div>
                <div
                  style={{ display: 'flex', gap: 12 /* paddingBottom: 12 */ }}
                >
                  <button
                    disabled={!openConnectModalAvailable}
                    onClick={openConnectModal}
                    type="button"
                    className="secondary-btn"
                  >
                    {connectModalOpen
                      ? 'Connect modal opened'
                      : 'Open connect modal'}
                  </button>
                  <button
                    disabled={!openChainModalAvailable}
                    onClick={openChainModal}
                    type="button"
                    className="secondary-btn"
                  >
                    {chainModalOpen ? 'Chain modal opened' : 'Open chain modal'}
                  </button>
                  <button
                    disabled={!openAccountModalAvailable}
                    onClick={openAccountModal}
                    type="button"
                    className="secondary-btn"
                  >
                    {accountModalOpen
                      ? 'Account modal opened'
                      : 'Open account modal'}
                  </button>
                </div>
              </div>
            )}
            <div className="operator-btn-area">
              <button
                disabled={!openConnectModalAvailable}
                onClick={openConnectModal}
                className="mobile-connect-wallet-btn desktop-invisible"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*  */}
    </>
  );
};

export default Example;
