<template>
    <div class="q-gutter-sm">
        <q-btn flat dense round color="primary" icon="fa-solid fa-arrow-up-right-from-square" aria-label="Abrir" @click="openLink">
            <q-tooltip :delay="1000"> Abrir </q-tooltip>
        </q-btn>

        <q-btn flat dense round color="primary" icon="fa-solid fa-copy" aria-label="Copiar link" @click="copyLink">
            <q-tooltip :delay="1000"> Copiar link </q-tooltip>
        </q-btn>

        <q-btn v-if="isSupported" flat dense round color="primary" icon="fa-solid fa-share-nodes" aria-label="Compartilhar" @click="startShare">
            <q-tooltip :delay="1000"> Compartilhar </q-tooltip>
        </q-btn>
    </div>
</template>

<script setup>
import { useShare } from "@vueuse/core"
import { copyToClipboard, openURL, useQuasar } from "quasar"

const { share, isSupported } = useShare()

const $q = useQuasar()

const url = `${location.protocol}//${location.host}/#/pub/u/${props.userId}/i/${props.invoiceId}`

function startShare() {
    const title = `Orçamento ${props.userInfoName ? "de" : ""} ${props.userInfoName}`

    share({
        title,
        text: `Orçamento ID: ${props.invoiceId}`,
        url,
    })
}

function openLink() {
    openURL(url)
}

function copyLink() {
    copyToClipboard(url)
        .then(() => {
            $q.notify({
                type: "positive",
                message: "Endereço (URL) copiado para a área de transferência com sucesso",
            })
        })
        .catch(() => {
            $q.notify({
                type: "negative",
                message: "Erro ao copiar endereço (URL) para a área de transferência",
            })
        })
}

const props = defineProps({
    invoiceId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    userInfoName: {
        type: String,
        required: false,
        default: "",
    },
})
</script>

<style lang="scss" scoped></style>
