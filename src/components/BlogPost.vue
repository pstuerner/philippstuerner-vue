<template>
  <component :is="component" v-if="component" />
</template>
  
<script>
  export default {
    data() {
      return {
        component: null,
      };
    },
    async created() {
      const { name } = this.$route.params;

      try {
        const module = await import(`./posts/${name}.vue`);
        this.component = module.default;
      } catch (error) {
        const module = await import(`./NotFound.vue`);
        this.component = module.default;
      }
    },
  };
</script>
  