import { UseWagmiPlugin, configureChains, createConfig } from 'use-wagmi';
import { moonbaseAlpha, moonbeam, astar } from 'use-wagmi/chains';
import { MetaMaskConnector } from 'use-wagmi/connectors/metaMask';
import { CoinbaseWalletConnector } from 'use-wagmi/connectors/coinbaseWallet';
import { WalletConnectConnector } from 'use-wagmi/connectors/walletConnect';
import { publicProvider } from 'use-wagmi/providers/public';
import { Chains } from '~/lib/values/general.values';

export default defineNuxtPlugin(nuxtApp => {
  const nuxtConfig = useRuntimeConfig();
  const chainId = nuxtConfig.public.CHAIN_ID;

  let chain;

  if (chainId === Chains.MOONBASE) {
    chain = moonbaseAlpha;
  } else if (chainId === Chains.ASTAR) {
    chain = astar;
  } else {
    chain = moonbeam;
  }

  const networks = [chain];

  const { chains, publicClient, webSocketPublicClient } = configureChains(networks, [
    publicProvider(),
  ]);

  const config = createConfig({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({
        chains,
      }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: 'Email test',
        },
      }),
      new WalletConnectConnector({
        chains,
        options: {
          projectId: 'fefd3005e5f3b8fd2e73de5333eeccf9',
          qrcode: true,
        },
      }),
      // new InjectedConnector({
      //   chains,
      //   options: {
      //     name: detectedName =>
      //       `Injected (${
      //         typeof detectedName === 'string' ? detectedName : detectedName.join(', ')
      //       })`,
      //     shimDisconnect: true,
      //   },
      // }),
    ],
    publicClient,
    webSocketPublicClient,
  });

  nuxtApp.vueApp.use(UseWagmiPlugin, config);
});
