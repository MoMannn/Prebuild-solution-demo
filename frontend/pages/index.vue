<script lang="ts" setup>
useHead({
  title: 'Apillon email airdrop prebuilt solution',
});

const registered = ref<boolean>(false);
</script>

<template>
  <div v-if="registered" class="max-w-sm mx-auto">
    <h3 class="my-8">You have successfully signed up for NFT Airdrop.</h3>
    <p>You will receive an email with a claim link. Open the link and follow the instructions.</p>
  </div>
  <div v-else class="max-w-sm w-full mx-auto">
    <h3 class="my-8">Sign up for airdrop</h3>

    <FormSighUp @submit-success="registered = true" />
  </div>
</template>
