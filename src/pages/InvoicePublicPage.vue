<template>
    <q-page class="text-black bg-white">
        <div v-if="!invoice.customerName || !info.name" class="column full-width content-center">
            <q-banner v-if="errorMessage" class="invoice-card text-white bg-red q-ma-xl" rounded=""> {{ errorMessage }} </q-banner>
            <div v-else class="column content-center q-ma-xl">
                <q-img src="logo.svg" spinner-color="white" style="height: 140px; max-width: 150px" />
            </div>
            <div class="column content-center">Orçamento: {{ invoiceId }}</div>
        </div>
        <div v-else class="column content-center q-pa-xs q-gutter-xs">
            <q-card flat bordered :dark="false" class="invoice-card text-black bg-white">
                <q-card-section class="q-pa-xs">
                    <div class="row q-gutter-sm">
                        <div class="col-grow text-h5">{{ info.fantasyName || info.name }}</div>
                        <div class="self-end" v-if="info.fantasyName">{{ info.name }}</div>
                        <div class="self-end" v-if="info.nationalRegistration">{{ info.person == "legal" ? "CNPJ" : "CPF" }}: {{ formatCPForCNPJ(info.nationalRegistration) }}</div>
                    </div>
                    <div class="row q-gutter-sm">
                        <div class="row col" v-if="info.addressLine1 || info.addressLine2 || info.city || info.state">
                            <div class="q-mr-sm">
                                <q-icon name="business" />
                            </div>
                            <div>
                                <div>{{ info.addressLine1 }}<span v-if="info.addressLine1 && info.addressLine2"> - </span>{{ info.addressLine2 }}</div>
                                <div>{{ info.city }}<span v-if="info.city && info.state"> - </span>{{ info.state }}</div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="text-right" v-if="info.phone"><q-icon name="perm_phone_msg" class="q-mr-sm" /> {{ formatPhone(info.phone) }}</div>
                            <div class="text-right" v-if="info.email"><q-icon name="mail" class="q-mr-sm" /> {{ info.email }}</div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
            <q-card flat bordered :dark="false" class="invoice-card text-black bg-white">
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
            <q-card flat bordered :dark="false" class="invoice-card text-black bg-white">
                <q-markup-table :dark="false" separator="cell" dense>
                    <thead>
                        <tr>
                            <th class="text-center">#</th>
                            <th class="table-main-column text-left">Descrição</th>
                            <th class="text-right">Quantidade</th>
                            <th class="text-right">Valor (R$)</th>
                            <th class="text-right">Valor Total (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) of invoice.items" :key="index">
                            <td class="text-center">{{ index + 1 }}</td>
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
            <q-card flat bordered :dark="false" class="invoice-card text-black bg-white">
                <q-card-section class="row q-pa-xs align-start">
                    <div class="text-weight-medium q-mr-xs">Observações:</div>
                    <div v-if="!!invoice.note" v-html="$sanitize(invoice.note)" />
                    <div v-else>Sem Observações</div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
import { reactive, ref } from "vue"
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

        if (!info.name) {
            throw new Error("Informações não encontradas")
        }
    } else {
        // doc.data() will be undefined in this case
        throw new Error("Informações não existem")
    }
}

const loadData = async () => {
    $q.loading.show()

    try {
        await getInvoice()
        await getInfo()
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
.invoice-card {
    width: 100%;
    max-width: 800px;
}
</style>
