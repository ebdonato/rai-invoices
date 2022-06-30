<template>
    <q-page class="text-black bg-white">
        <div v-if="!receipt.customerName || errorMessage" class="column full-width content-center">
            <q-banner v-if="errorMessage" class="print-card text-white bg-red q-ma-xl" rounded> {{ errorMessage }} </q-banner>
            <div v-else class="column content-center q-ma-xl">
                <q-img src="logo.svg" spinner-color="white" style="height: 140px; max-width: 150px" />
            </div>
            <div class="column content-center">Orçamento: {{ receiptId }}</div>
        </div>
        <div v-else class="column content-center q-pa-xs q-gutter-xs public-view">
            <InfoPublicHeader :userId="userId" @error="(message) => (errorMessage = message)" @username="(name) => (username = name)" />
            <q-card flat bordered :dark="false" class="print-card q-py-xs q-px-md" :style="{ 'flex-grow': '1' }">
                <div class="text-center text-h3">Recibo</div>
                <div class="text-center text-h3 q-mb-md">Valor {{ formatCurrency(receipt.value) }}</div>
                <div class="text-left q-mb-md">
                    Recebemos de <strong>{{ receipt.customerName }}</strong> a importância de {{ valueInWords(receipt.value) }}.
                </div>
                <div v-if="receipt.details" class="text-left">
                    <div>Referente a:</div>
                    <div>
                        {{ receipt.details }}
                    </div>
                </div>
            </q-card>
            <q-card flat bordered :dark="false" class="print-card">
                <div class="row">
                    <div class="col column text-center justify-end">{{ formatLocal(receipt.city, receipt.state) }}</div>
                    <div class="col text-center text-white text-h6" :style="{ opacity: 0 }">Assine Aqui</div>
                </div>
                <div class="row">
                    <div class="col text-center">{{ receipt.date }}</div>
                    <div class="col text-center text-h6 sign-placeholder q-mx-sm">{{ username }}</div>
                </div>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
import { reactive, ref } from "vue"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { useQuasar } from "quasar"
import { formatLocal, formatCurrency } from "assets/customFormatters"

import InfoPublicHeader from "components/InfoPublicHeader.vue"

import n2wordsPT from "n2words/lib/i18n/PT.mjs"

const $q = useQuasar()

const props = defineProps({
    receiptId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
})

const errorMessage = ref("")

const username = ref("")

const db = getFirestore($q.firebaseApp)

const receipt = reactive({})

const capitalize = (sentence) => sentence.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()).replace(/\sE\s/g, " e ")

const valueInWords = (value) => {
    const inWords = n2wordsPT(value)

    const [integer, cents] = inWords.split(" vírgula ")

    return capitalize(cents ? `${integer} Reais e ${cents} centavos` : `${integer} Reais`)
}

const getReceipt = async () => {
    const docRef = doc(db, "users", props.userId, "receipts", props.receiptId)

    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        Object.assign(receipt, docSnap.data())
        if (!receipt.customerName) {
            throw new Error("Recibo inválido")
        }
    } else {
        // doc.data() will be undefined in this case
        throw new Error("Recibo não encontrado")
    }
}

const loadData = async () => {
    $q.loading.show()

    try {
        await getReceipt()
    } catch (error) {
        console.error(error)
        errorMessage.value = error.message
        $q.notify({
            type: "negative",
            message: "Erro ao obter dados",
            caption: error.message,
        })
    } finally {
        $q.loading.hide()
    }
}

loadData()
</script>

<style lang="scss" scoped>
.q-card--bordered {
    border: 2px solid #000000;
}

.q-table th,
.q-table td {
    border-color: rgba($color: #000000, $alpha: 0.5);
}

.table-main-column {
    width: 70%;
}

.sign-placeholder {
    border-top: 1px solid black;
}
</style>
