<script lang="ts" setup>
const props = defineProps<{
  label: string;
  icon: string;
  href: string;
  showLabel: boolean;
}>();

const route = useRoute();
</script>

<template>
  <div class="tooltip-right" :data-tip="showLabel ? undefined : props.label" :class="{ tooltip: !showLabel }">
    <Navlink :to="props.href" :class="{ 'bg-base-200': route.path === props.href, 'justify-center': !showLabel, 'justify-start': showLabel }" class="flex gap-2 btn p-2 bg-base-300 hover:cursor-pointer flex-nowrap">
      <Icon :name="props.icon" size="24" />

      <Transition name="grow">
        <span v-if="showLabel">{{ props.label }}</span>
      </Transition>
    </Navlink>
  </div>
</template>

<style scoped>
.grow-enter-active {
  animation: grow 0.1s;
}
.grow-leave-active {
  animation: grow 0.1s reverse;
}
@keyframes grow {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
