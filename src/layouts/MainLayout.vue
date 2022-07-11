<template>
    <q-layout view="lHh Lpr lFf">
        <q-header>
            <q-toolbar
                :class="{
                    'bg-secondary': !isDark,
                    'bg-accent': isDark,
                }"
            >
                <q-btn v-if="isHome" flat dense round icon="favorite" aria-label="Feito por" @click="onMadeBy" class="text-yellow">
                    <q-tooltip :delay="1000"> Feito por </q-tooltip>
                </q-btn>

                <q-btn v-else flat dense round icon="home" aria-label="Início" :to="{ name: 'IndexPage' }">
                    <q-tooltip :delay="1000"> Início </q-tooltip>
                </q-btn>

                <q-toolbar-title> Recibos e Orçamentos do Rainério </q-toolbar-title>

                <div class="q-gutter-sm">
                    <q-btn flat dense round :icon="themeIcon" aria-label="Tema" @click="toggleTheme">
                        <q-tooltip :delay="1000">{{ themeLabel }} </q-tooltip>
                    </q-btn>

                    <q-btn flat dense round icon="store" aria-label="Clientes" :to="{ name: 'CustomersPage' }">
                        <q-tooltip :delay="1000"> Clientes </q-tooltip>
                    </q-btn>

                    <q-btn flat dense round icon="receipt_long" aria-label="Orçamentos" :to="{ name: 'InvoicesPage' }">
                        <q-tooltip :delay="1000"> Orçamentos </q-tooltip>
                    </q-btn>

                    <q-btn flat dense round icon="receipt" aria-label="Recibos" :to="{ name: 'ReceiptsPage' }">
                        <q-tooltip :delay="1000"> Recibos </q-tooltip>
                    </q-btn>

                    <q-btn flat dense round icon="logout" aria-label="Sair" @click="logout">
                        <q-tooltip :delay="1000"> Sair </q-tooltip>
                    </q-btn>
                </div>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <div
                :class="{
                    'bg-light': !isDark,
                    'bg-dark': isDark,
                }"
            >
                <router-view v-slot="{ Component, route }">
                    <transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" :duration="300">
                        <component :is="Component" :key="route.path" />
                    </transition>
                </router-view>
            </div>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref, computed } from "vue"
import { useQuasar } from "quasar"
import { useRouter } from "vue-router"
import { getAuth, signOut } from "firebase/auth"
import { updateAddressbarColors } from "assets/utils"

import MadeByDialog from "components/MadeByDialog.vue"

const $q = useQuasar()

const router = useRouter()
const isHome = computed(() => router.currentRoute.value.name == "IndexPage")

const auth = getAuth()
const logout = () => {
    signOut(auth)
        .then(() => {
            $q.notify({
                type: "info",
                message: "Tchau!",
                caption: "Até brave",
            })
        })
        .catch((error) => {
            console.error(error)

            $q.notify({
                type: "negative",
                message: "Erro ao sair",
                caption: error.message,
            })
        })
}

const isDark = ref($q.dark.isActive)
const toggleTheme = () => {
    isDark.value = !isDark.value
    $q.dark.set(isDark.value)
    $q.localStorage.set("isDark", isDark.value)
    updateAddressbarColors(isDark.value)
}
const themeIcon = computed(() => (isDark.value ? "light_mode" : "dark_mode"))
const themeLabel = computed(() => (isDark.value ? "Usar tema claro" : "Usar tema escuro"))

const onMadeBy = () => {
    $q.dialog({
        component: MadeByDialog,
    })
}
</script>
