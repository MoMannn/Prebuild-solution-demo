<script lang="ts" setup>
import { useAccount, useConnect, useWalletClient } from 'use-wagmi';
import SuccessSVG from '~/assets/images/success.svg';

type Address = `0x${string}`;

definePageMeta({
  layout: 'claim',
});
useHead({
  title: 'Apillon email airdrop prebuild solution',
});

const config = useRuntimeConfig();
const { query } = useRoute();
const router = useRouter();
const message = useMessage();
const txWait = useTxWait();
const { handleError } = useErrors();

const { address, isConnected } = useAccount();
const { data: walletClient, refetch } = useWalletClient();
const { connect, connectors } = useConnect();
const { initContract, getTokenOfOwner, getTokenUri } = useContract();

const loading = ref<boolean>(false);

onBeforeMount(() => {
  if (!query.token) {
    router.push('/');
  }
});

async function claimAirdrop() {
  loading.value = true;
  try {
    await refetch();
    await sleep(200);
    const timestamp = new Date().getTime();

    if (!walletClient.value) {
      await connect({ connector: connectors.value[0] });
      await sleep(200);

      if (!walletClient.value) {
        message.error('Could not connect with your wallet.');
        loading.value = false;
        return;
      }
    }

    const signature = await walletClient.value.signMessage({
      message: `Sign to verify you wallet.\n${timestamp}`,
    });

    const res = await $api.post<ClaimResponse>('/users/claim', {
      jwt: query.token?.toString() || '',
      signature,
      address: address.value,
      timestamp,
    });
    if (res.data && res.data.success) {
      txWait.hash.value = res.data.transactionHash as Address;

      console.debug('Transaction', txWait.hash.value);
      message.info('Minting of your NFT has begun.');

      const receipt = await txWait.wait();
      console.debug(receipt);
      message.success('You successfully claimed NFT');

      if (
        config.public.METADATA_BASE_URI &&
        config.public.METADATA_TOKEN &&
        receipt.data?.logs[0].topics[3]
      ) {
        getMetadata(Number(receipt.data?.logs[0].topics[3]), res.data.transactionHash);
      } else if (receipt.data?.to && receipt.data?.logs[0].topics[3]) {
        const nftId = Number(receipt.data?.logs[0].topics[3]);

        await loadNft(receipt.data.to, nftId, res.data.transactionHash);
      } else {
        message.error('Mint failed, missing NFT ID!');
      }
    }
  } catch (e) {
    if (
      !config.public.CONTRACT_ADDRESS ||
      !(await getMyNFT(config.public.CONTRACT_ADDRESS as Address))
    ) {
      handleError(e);
    }
  }
  loading.value = false;
}

async function loadNft(contractAddress: Address, id: number, transactionHash: string) {
  try {
    await initContract(contractAddress);
    const url = await getTokenUri(id);

    const metadata = await fetch(url).then(response => {
      return response.json();
    });
    router.push({ name: 'share', query: { ...metadata, nftId: id, txHash: transactionHash } });
  } catch (e) {
    console.error(e);
    message.error('Fetch failed, missing NFT metadata!');
  }
}

async function getMyNFT(contract: Address) {
  try {
    await initContract(contract);
    const id = await getTokenOfOwner(0);
    const url = await getTokenUri(Number(id));

    const metadata = await fetch(url).then(response => {
      return response.json();
    });

    if (metadata) {
      message.success('You already claimed NFT');
      router.push({ name: 'share', query: { ...metadata } });
    } else {
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function getMetadata(id: number, transactionHash: string) {
  try {
    const url = `${config.public.METADATA_BASE_URI}${id}.json?token=${config.public.METADATA_TOKEN}`;

    const metadata = await fetch(url).then(response => {
      return response.json();
    });
    router.push({ name: 'share', query: { ...metadata, nftId: id, txHash: transactionHash } });
  } catch (e) {
    console.error(e);
    message.error('Fetch failed, missing NFT metadata!');
  }
}
</script>

<template>
  <div class="max-w-md w-full md:px-6 my-12 mx-auto">
    <img :src="SuccessSVG" class="mx-auto" width="165" height="169" alt="airdrop" />

    <div v-if="!isConnected" class="my-8 text-center">
      <h3 class="mb-6">Almost there!</h3>
      <p>
        But first, connect compatible digital wallet. This step is crucial for securely receiving
        and managing the token you’ll about to receive.
      </p>
    </div>

    <div v-else class="my-8 text-center">
      <h3 class="mb-6">Great success!</h3>
      <p>
        To join this NFT airdrop, you need to connect your EVM compatible wallet. This step is
        crucial for securely receiving and managing the airdropped NFTs.
      </p>
    </div>

    <ConnectWallet v-if="!isConnected" size="large" />
    <Btn v-else size="large" :loading="loading" @click="claimAirdrop()">Claim airdrop</Btn>
  </div>
</template>
