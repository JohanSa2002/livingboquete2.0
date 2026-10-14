<script setup lang="ts">
// Honeypot for lead forms (see useLeadGuard). Off-screen rather than
// display:none, since some bots skip fields that are hidden that way; kept out
// of the tab order, autofill and the accessibility tree so people never meet it.
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="lead-trap" aria-hidden="true">
    <label>
      Website
      <input v-model="model" type="text" name="website" tabindex="-1" autocomplete="off">
    </label>
  </div>
</template>

<style scoped>
.lead-trap {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
