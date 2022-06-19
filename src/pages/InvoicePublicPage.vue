<template>
    <q-page class="text-black bg-white" :dark="false">
        <div v-if="!invoice.customerName || !info.name" class="column full-width">
            <div class="column content-center">
                <q-img src="logo.svg" spinner-color="white" style="height: 140px; max-width: 150px" />
            </div>
            <div class="column content-center">Orçamento: {{ invoiceId }}</div>
        </div>
        <div v-else class="column content-center q-pa-xs q-gutter-xs">
            <q-card flat bordered :dark="false" class="invoice-card">
                <q-card-section>
                    <div class="text-h2">{{ info.fantasyName || info.name }}</div>
                    <div class="row q-gutter-md">
                        <div v-if="info.fantasyName" class="text-h6">{{ info.name }}</div>
                        <div v-if="info.nationalRegistration" class="text-h6">{{ info.person == "legal" ? "CNPJ" : "CPF" }}: {{ formatCPForCNPJ(info.nationalRegistration) }}</div>
                    </div>
                    <div class="row">
                        <div class="q-mr-md text-h5">
                            <q-icon name="business" />
                        </div>
                        <div>
                            <div>{{ info.addressLine1 }}<span v-show="info.addressLine1 && info.addressLine2"> - </span>{{ info.addressLine2 }}</div>
                            <div>{{ info.city }}<span v-show="info.city && info.state"> - </span>{{ info.state }}</div>
                        </div>
                    </div>
                    <div class="row q-gutter-md">
                        <div v-show="info.phone" class="text-h5"><q-icon name="perm_phone_msg" class="q-mr-sm" /> {{ formatPhone(info.phone) }}</div>
                        <div v-show="info.email" class="text-h5"><q-icon name="mail" class="q-mr-sm" /> {{ info.email }}</div>
                    </div>
                </q-card-section>
            </q-card>
            <q-card flat bordered :dark="false" class="invoice-card">
                <q-card-section>
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
            <q-card flat bordered :dark="false" class="invoice-card">
                <q-markup-table :dark="false" separator="cell">
                    <thead>
                        <tr>
                            <th class="text-right">#</th>
                            <th class="table-main-column text-left">Descrição</th>
                            <th class="text-right">Quantidade</th>
                            <th class="text-right">Valor (R$)</th>
                            <th class="text-right">Valor Total (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) of invoice.items" :key="index">
                            <td class="text-right">{{ index + 1 }}</td>
                            <td class="table-main-column text-left">{{ item.description }}</td>
                            <td class="text-right">{{ item.quantity }}</td>
                            <td class="text-right">{{ item.value }}</td>
                            <td class="text-right">{{ (+item.quantity * +item.value).toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="text-right">{{ totalValue() }}</td>
                        </tr>
                    </tbody>
                </q-markup-table>
            </q-card>
            <q-card flat bordered :dark="false" class="invoice-card">
                <q-card-section class="q-pb-none">
                    <div class="text-weight-medium">Observações</div>
                </q-card-section>
                <q-card-section v-if="!!invoice.note" v-html="$sanitize(invoice.note)" />
                <q-card-section v-else>Sem Observações</q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
import { reactive } from "vue"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { formatCPForCNPJ, formatPhone } from "assets/customFormatters"
import { useQuasar, date } from "quasar"

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

const db = getFirestore($q.firebaseApp)

const invoice = reactive({})

const getInvoice = async () => {
    const docRef = doc(db, "users", props.userId, "invoices", props.invoiceId)

    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        Object.assign(invoice, docSnap.data())
        invoice.dueDate = invoice.dueDate ?? defaultDueDate()
    } else {
        // doc.data() will be undefined in this case
        throw new Error("Orçamento não encontrado!")
    }
}

const totalValue = () => {
    return invoice.items?.reduce((acc, item) => acc + item.quantity * item.value, 0).toFixed(2) ?? 0
}

const defaultDueDate = () => {
    const [day, month, year] = invoice.date.split("/")
    const invoiceDate = new Date(+year, +month - 1, +day)
    const dueDate = date.addToDate(invoiceDate, { days: 7 })
    return date.formatDate(dueDate, "DD/MM/YYYY")
}

const info = reactive({})

const getInfo = async () => {
    const docRef = doc(db, "users", props.userId)

    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        Object.assign(info, docSnap.data())
    } else {
        // doc.data() will be undefined in this case
        throw new Error("Informações não encontradas!")
    }
}

const loadData = async () => {
    $q.loading.show()

    try {
        await getInvoice()
        await getInfo()
    } catch (error) {
        console.error(error)

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

.table-main-column {
    width: 70%;
}
.invoice-card {
    width: 80%;
    max-width: 800px;
}

@media print {
    .q-table th,
    .q-table td {
        border-color: rgba($color: #000000, $alpha: 0.5);
    }
    .invoice-card {
        width: 100%;
    }
}
</style>
