<template>
  <div class="bg-bg text-info">
    <nav class="container py-1 flex gap-8 justify-center items-center">
      <div class="py-1 text-center">
        <div class="text-xs leading-5 font-bold mb-2">
          <span class="block">Want to run your own NFT Airdrop?</span>
          <span class="block">A matter of minutes. And zero developing costs.</span>
          <a href="https://app.apillon.io/" target="_blank" class="underline">Build with Apillon</a>
        </div>
        <a class="inline-block" href="https://apillon.io/" target="_blank">
          <img src="/images/logo/apillon.png" :width="width" :height="height" :alt="alt" />
        </a>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  alt: { type: String, default: 'Apillon logo' },
  height: { type: Number, default: 24 },
  width: { type: Number, default: 110 },
});
</script>
