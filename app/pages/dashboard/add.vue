<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { toTypedSchema, useForm } from "#imports";

import { InsertLocation } from "~/lib/db/schemas";

const { $csrfFetch } = useNuxtApp();
const router = useRouter();
const submitError = ref("");
const loading = ref(false);
const submitted = ref(false);
const { handleSubmit, errors, meta, setErrors } = useForm(
  { validationSchema: toTypedSchema(InsertLocation) },
);

const onSubmit = handleSubmit(async (values) => {
  try {
    submitError.value = "";
    loading.value = true;
    await $csrfFetch("/api/locations", {
      method: "post",
      body: values,
    });
    submitted.value = true;
    navigateTo("/dashboard");
  }
  catch (error) {
    const e = error as FetchError;
    if (e.data?.data) {
      setErrors(e.data?.data);
    }

    submitError.value = e.statusMessage || "An unknown error occurred.";
  }

  loading.value = false;
});

onBeforeRouteLeave(() => {
  if (!submitted.value && meta.value.dirty) {
    // eslint-disable-next-line no-alert
    const confirm = window.confirm("Are you sure you want to leave? All unsaved changes will be lost.");
    if (!confirm) {
      return false;
    }
  }
  return true;
});
</script>

<template>
  <div class="container max-w-md mx-auto mt-4">
    <div class="my-4">
      <h1 class="text-lg">
        Add location
      </h1>
      <p class="text-sm">
        A location is a place you have traveled or will travel to. It can be a city, country, state or point of interest. You can add specific times you visited this location after adding it.
      </p>
    </div>

    <div v-if="submitError" role="alert" class="alert alert-error">
      <span>{{ submitError }}</span>
    </div>

    <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
      <AppFormField
        type="text"
        name="name"
        label="Name"
        :error="errors.name"
        :disabled="loading"
      />
      <AppFormField
        as="textarea"
        type="textarea"
        name="description"
        label="Description"
        :error="errors.description"
        :disabled="loading"
      />
      <AppFormField
        type="number"
        name="lat"
        label="Latitude"
        :error="errors.lat"
        :disabled="loading"
      />
      <AppFormField
        type="number"
        name="lng"
        label="Longitude"
        :error="errors.lng"
        :disabled="loading"
      />

      <div class="flex justify-end gap-2">
        <button type="button" class="btn btn-outline" @click="router.back">
          <Icon name="tabler:arrow-left" size="24" />
          Cancel
        </button>

        <button type="submit" class="btn btn-primary">
          Add
          <span v-if="loading" class="loading loading-spinner loading-sm" />
          <Icon v-else name="tabler:plus" size="24" />
        </button>
      </div>
    </form>
  </div>
</template>
