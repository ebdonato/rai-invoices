<template>
    <q-btn v-if="props.docType == 'receipt'" flat dense round color="primary" icon="control_point_duplicate" aria-label="Duplicar" @click="$emit('duplicate')">
        <q-tooltip :delay="1000"> Duplicar </q-tooltip>
    </q-btn>

    <q-space />

    <q-btn flat dense round color="primary" icon="edit" aria-label="Editar" @click="$emit('edit')">
        <q-tooltip :delay="1000"> Editar </q-tooltip>
    </q-btn>

    <q-btn flat dense round color="primary" icon="fa-solid fa-arrow-up-right-from-square" aria-label="Abrir" @click="openLink">
        <q-tooltip :delay="1000"> Abrir </q-tooltip>
    </q-btn>

    <q-btn flat dense round color="primary" icon="fa-solid fa-copy" aria-label="Copiar link" @click="copyLink">
        <q-tooltip :delay="1000"> Copiar link </q-tooltip>
    </q-btn>

    <q-btn v-if="props.docType == 'invoice'" flat dense round color="primary" icon="fa-solid fa-file-word" aria-label="Download" type="a" :href="downloadUrl" target="_blank">
        <q-tooltip :delay="1000"> Download (docx) </q-tooltip>
    </q-btn>

    <q-btn v-if="isSupported" flat dense round color="primary" icon="fa-solid fa-share-nodes" aria-label="Compartilhar" @click="startShare">
        <q-tooltip :delay="1000"> Compartilhar </q-tooltip>
    </q-btn>
</template>

<script setup>
import { computed } from "vue"
import { useShare } from "@vueuse/core"
import { copyToClipboard, openURL, useQuasar } from "quasar"

const { share, isSupported } = useShare()

const $q = useQuasar()

defineEmits(["edit", "duplicate"])

function startShare() {
    const title = `${docName.value} ${props.userInfoName ? "de" : ""} ${props.userInfoName}`

    share({
        title,
        text: `${docName.value} ID: ${props.docId}`,
        url: viewUrl.value,
    })
}

function openLink() {
    openURL(viewUrl.value)
}

function copyLink() {
    copyToClipboard(viewUrl.value)
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
    docId: {
        type: String,
        required: true,
    },
    docType: {
        type: String,
        required: false,
        default: "invoice",
        validator(value) {
            return ["invoice", "receipt"].includes(value)
        },
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

const docName = computed(() => {
    const docTypeTranslateToName = {
        invoice: "Orçamento",
        receipt: "Recibo",
    }

    return docTypeTranslateToName[props.docType] ?? "Orçamento"
})

const viewUrl = computed(() => {
    const docTypeTranslateToUrlPart = {
        invoice: "i",
        receipt: "r",
    }

    return `${location.protocol}//${location.host}/#/pub/u/${props.userId}/${docTypeTranslateToUrlPart[props.docType] ?? "i"}/${props.docId}`
})

const downloadUrl = computed(() => {
    return `${process.env.FUNCTIONS_BASE_URL}/${props.docType}?userId=${props.userId}&docId=${props.docId}`
})
</script>

<style lang="scss" scoped></style>
