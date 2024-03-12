<template>
  <n-layout class="relative h-screen" :native-scrollbar="false">
    <div class="fixed right-0 h-screen hidden lg:block" id="grill"></div>
    <div ref="headerRef">
      <Header logo-center hide-login />
    </div>
    <div
      class="container max-w-6xl py-8 flex flex-col justify-center box-border"
      :style="containerStyle"
    >
      <slot />
    </div>
    <div ref="footerRef" class="justify-center">
      <Footer></Footer>
    </div>
  </n-layout>
</template>

<script lang="ts" setup>
import grill from '@subsocial/grill-widget';
const { width } = useWindowSize();

/** Heading height */
const height = ref<number>(0);
const headerRef = ref<HTMLElement>();
const footerRef = ref<HTMLElement>();

const containerStyle = computed(() => {
  return {
    minHeight: `calc(100vh - ${height.value}px)`,
  };
});

onMounted(() => {
  setHeight();

  const config = {
    theme: 'dark',
    widgetElementId: 'grill',
    hub: {
      id: '20728',
    },
    channel: {
      type: 'channel',
      id: '92312',
      settings: {
        enableBackButton: false,
        enableLoginButton: true,
        enableInputAutofocus: true,
      },
    },
  };

  grill.init(config);
});

watch(
  () => width.value,
  _ => {
    setHeight();
  }
);
function setHeight() {
  height.value = (headerRef.value?.clientHeight || 0) + (footerRef.value?.clientHeight || 0) + 20;
}
</script>
