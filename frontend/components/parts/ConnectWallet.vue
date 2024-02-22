<template>
  <div>
    <span v-if="address && (!admin || userStore.jwt)" class="mr-4">{{ shortHash(address) }}</span>
    <Btn
      v-if="isConnected && (!admin || userStore.jwt)"
      v-bind="$attrs"
      class="text-black"
      :color="colors.blue"
      :size="size"
      :loading="loading || isLoading"
      @click="disconnectWallet()"
    >
      <span class="text-black">Disconnect</span>
    </Btn>
    <Btn
      v-else-if="isConnected"
      v-bind="$attrs"
      class="text-black"
      :color="colors.blue"
      :size="size"
      :loading="loading || isLoading"
      @click="login()"
    >
      <span class="text-black">Login</span>
    </Btn>
    <Btn
      v-else
      v-bind="$attrs"
      class="text-black"
      :color="colors.blue"
      :size="size"
      :loading="loading || isLoading"
      @click="modalWalletVisible = true"
    >
      <span class="text-black">Connect your wallet</span>
    </Btn>
  </div>

  <modal
    :show="modalWalletVisible"
    @close="() => (modalWalletVisible = false)"
    @update:show="modalWalletVisible = false"
  >
    <FormWallet />
  </modal>
</template>

<script lang="ts" setup>
import colors from '~/tailwind.colors';
import type { Size } from 'naive-ui/es/button/src/interface';
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'use-wagmi';

type LoginInterface = {
  jwt: string;
};
type LoginResponse = GeneralResponse<LoginInterface>;

const props = defineProps({
  admin: { type: Boolean, default: false },
  size: { type: String as PropType<Size>, default: 'small' },
});

const { error } = useMessage();
const userStore = useUserStore();
const { handleError } = useErrors();

const { connect, connectors, isLoading } = useConnect();
const { data: walletClient, refetch } = useWalletClient();
const { address, isConnected } = useAccount({ onConnect: loginDelay });
const { disconnect } = useDisconnect();

const loading = ref<boolean>(false);
const modalWalletVisible = ref<boolean>(false);

watch(
  () => isConnected.value,
  async _ => {
    if (isConnected.value) {
      loginDelay();
    }
  }
);

async function login() {
  if (loading.value) return;
  loading.value = true;

  try {
    await refetch();
    await sleep(200);

    if (!walletClient.value) {
      await connect({ connector: connectors.value[0] });
      await sleep(200);

      if (!walletClient.value) {
        error('Could not connect with wallet');
        loading.value = false;
        return;
      }
    }

    if (!props.admin) {
      loading.value = false;
      modalWalletVisible.value = false;
      return;
    }

    const timestamp = new Date().getTime();
    const message = 'Sign to verify and mint your free Ment NFT!';

    const signature = await walletClient.value.signMessage({
      message: `${message}\n${timestamp}`,
    });
    const res = await $api.post<LoginResponse>('/login', {
      signature,
      timestamp,
      address: walletClient.value.account.address,
    });
    if (res.data.jwt) {
      userStore.jwt = res.data.jwt;
      $api.setToken(res.data.jwt);
    }
    modalWalletVisible.value = false;
  } catch (e) {
    handleError(e);
  }
  loading.value = false;
}

function loginDelay() {
  setTimeout(() => login(), 100);
}

function disconnectWallet() {
  userStore.jwt = '';
  disconnect();
}
</script>
