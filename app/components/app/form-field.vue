<script lang="ts" setup>
const props = defineProps<{
  error?: string;
  label: string;
  name: string;
  type: string;
  as?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>
    <Field
      :as="props.as"
      :type="props.type"
      :name="props.name"
      :disabled="disabled"
      class="w-full"
      :class="{ 'input-error': props.error,
                'input': type === 'text' || 'number',
                'textarea': type === 'textarea',
      }"
    />
    <p v-if="props.error" class="label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
