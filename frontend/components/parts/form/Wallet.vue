<script lang="ts" setup>
import WalletSVG from '~/assets/images/wallet.svg';
import { useConnect } from 'use-wagmi';

const { fullPath } = useRoute();
const { connect, connectors, pendingConnector } = useConnect();
</script>

<template>
  <div class="max-w-md w-full md:px-6 my-12 mx-auto">
    <img :src="WalletSVG" class="mx-auto" width="241" height="240" alt="wallet" />

    <div class="my-8 text-center">
      <h3 class="mb-6">Choose a wallet</h3>
      <p>
        To proceed to claiming your MENT token, choose your preferred wallet and connect it by
        clicking below.
      </p>
    </div>

    <n-space size="large" vertical>
      <template v-for="connector in connectors">
        <Btn
          v-if="!connector.ready && connector.id === 'metaMask'"
          type="secondary"
          size="large"
          :href="`https://metamask.app.link/dapp/nft.ment.si${fullPath}`"
        >
          <span class="inline-flex gap-2 items-center">
            <NuxtIcon :name="connector.id" class="text-xl" filled />
            <span class="text-black">{{ connector.name }}</span>
          </span>
        </Btn>
        <Btn
          v-else
          type="secondary"
          size="large"
          :loading="connector.id === pendingConnector?.id"
          :disabled="!connector.ready"
          @click="connect({ connector })"
        >
          <span class="inline-flex gap-2 items-center">
            <NuxtIcon :name="connector.id" class="text-xl" filled />
            <span class="text-black">{{ connector.name }}</span>
          </span>
        </Btn>
      </template>
      <p class="text-xs italic lg:hidden">
        *If a wallet is not installed on your mobile device, return to this page after installation
        to proceed with the claim process.
      </p>
    </n-space>
  </div>
</template>
