<template>
    <q-page class="text-black bg-white">
        <div v-if="!invoice.customerName || errorMessage" class="column full-width content-center">
            <q-banner v-if="errorMessage" class="print-card text-white bg-red q-ma-xl" rounded> {{ errorMessage }} </q-banner>
            <div v-else class="column content-center q-ma-xl">
                <q-img src="logo.svg" spinner-color="white" style="height: 140px; max-width: 150px" />
            </div>
            <div class="column content-center">Orçamento: {{ invoiceId }}</div>
        </div>
        <div v-else class="column content-center q-pa-xs q-gutter-xs public-view" id="invoice">
            <InfoPublicHeader :userId="userId" @error="(message) => (errorMessage = message)" />
            <q-card flat bordered :dark="false" class="print-card">
                <q-card-section class="q-pa-xs">
                    <div>Orçamento: {{ invoiceId }}</div>
                    <div class="row">
                        <div class="col">Data: {{ invoice.date }}</div>
                        <div class="col">Validade: {{ invoice.dueDate }}</div>
                    </div>
                    <div class="row">
                        <div class="col">Cliente: {{ invoice.customer?.name }}</div>
                        <div class="col">{{ invoice.customer?.person == "legal" ? "CNPJ" : "CPF" }}: {{ formatCPForCNPJ(invoice.customer?.nationalRegistration) }}</div>
                    </div>
                </q-card-section>
            </q-card>
            <q-card flat bordered :dark="false" class="print-card" :style="{ 'flex-grow': '1' }">
                <q-markup-table :dark="false" separator="cell" dense>
                    <thead>
                        <tr>
                            <th class="text-center">#</th>
                            <th class="table-main-column text-left">Descrição</th>
                            <th class="text-right">Quantidade</th>
                            <th class="text-right">Valor</th>
                            <th class="text-right">Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) of invoice.items" :key="index">
                            <td class="text-center">{{ index + 1 }}</td>
                            <td class="table-main-column text-left">{{ item.description }}</td>
                            <td class="text-right">{{ formatNumber(item.quantity) }}</td>
                            <td class="text-right">{{ formatCurrency(item.value) }}</td>
                            <td class="text-right">{{ formatCurrency(+item.quantity * +item.value) }}</td>
                        </tr>
                        <tr>
                            <td v-if="invoice.items.length > 1" colspan="5" class="text-right">{{ totalValue() }}</td>
                        </tr>
                    </tbody>
                </q-markup-table>
            </q-card>
            <q-card flat bordered :dark="false" class="print-card">
                <q-card-section class="row q-pa-xs align-start">
                    <div v-if="!!invoice.note">
                        <div class="text-weight-medium q-mr-xs">Observações:</div>
                        <div v-html="$sanitize(invoice.note)" />
                    </div>
                    <div v-else class="text-weight-regular q-mr-xs">Sem Observações</div>
                </q-card-section>
            </q-card>
        </div>
        <q-page-sticky position="bottom-right" :offset="[18, 18]" class="no-print">
            <div class="q-gutter-sm">
                <q-btn fab icon="print" color="primary" @click="print" />
                <q-btn fab icon="file_download" color="primary" @click="saveAsPDF" />
            </div>
        </q-page-sticky>
    </q-page>
</template>

<script setup>
import { reactive, ref } from "vue"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { formatCPForCNPJ, formatCurrency, formatNumber } from "assets/customFormatters"
import { useQuasar, date } from "quasar"
import html2pdf from "html2pdf.js"

import InfoPublicHeader from "components/InfoPublicHeader.vue"

const $q = useQuasar()

const props = defineProps({
    invoiceId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
})

const errorMessage = ref("")

const db = getFirestore($q.firebaseApp)

const invoice = reactive({})

const getInvoice = async () => {
    const docRef = doc(db, "users", props.userId, "invoices", props.invoiceId)

    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        Object.assign(invoice, docSnap.data())
        invoice.dueDate = invoice.dueDate ?? defaultDueDate()
        if (!invoice.customerName) {
            throw new Error("Orçamento inválido")
        }
    } else {
        // doc.data() will be undefined in this case
        throw new Error("Orçamento não encontrado")
    }
}

const totalValue = () => {
    return formatCurrency(invoice.items?.reduce((acc, item) => acc + item.quantity * item.value, 0).toFixed(2) ?? 0)
}

const defaultDueDate = () => {
    const [day, month, year] = invoice.date.split("/")
    const invoiceDate = new Date(+year, +month - 1, +day)
    const dueDate = date.addToDate(invoiceDate, { days: 7 })
    return date.formatDate(dueDate, "DD/MM/YYYY")
}

const reverseDate = () => {
    const [day, month, year] = invoice.date.split("/")
    const invoiceDate = new Date(+year, +month - 1, +day)
    return date.formatDate(invoiceDate, "YYYY-MM-DD")
}

const loadData = async () => {
    $q.loading.show()

    try {
        await getInvoice()
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

const saveAsPDF = () => {
    const element = document.getElementById("invoice")

    const options = {
        margin: 4,
    }

    const filename = `Orçamento ${reverseDate()} ID ${props.invoiceId}`

    html2pdf().set(options).from(element).save(filename)
}

const print = () => {
    window.print()
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
</style>
