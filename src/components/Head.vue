<template>
  <Head>
    <title>{{ title }}</title>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="author" content="Philipp Stuerner" />
  </Head>
</template>

<script setup>
import { Head } from "@vueuse/head"

const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  }
})
</script>