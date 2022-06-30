<template>
    <router-view />
</template>

<script setup>
import { useQuasar } from "quasar"

const $q = useQuasar()

const vh = !!$q.platform.is.mobile ? 35 : 50

document.documentElement.style.setProperty("--vh", `${vh}vh`)
</script>
