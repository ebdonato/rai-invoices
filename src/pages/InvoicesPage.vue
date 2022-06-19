<template>
    <q-page padding class="flex justify-center align-center">
        <div class="big">
            <q-scroll-area style="height: 100%; width: 100%">
                <div class="q-mb-sm">
                    <q-banner rounded inline-actions class="full-width text-white bg-primary">
                        Orçamentos
                        <template v-slot:action>
                            <q-input color="secondary" dense v-model="filter" placeholder="Procurar" dark class="q-ml-sm" @keydown.enter="onQueryData">
                                <q-tooltip :delay="1000"> Procurar por Empresa começando com ... </q-tooltip>
                                <template v-slot:append>
                                    <q-icon name="search" @click="onQueryData" />
                                </template>
                                <template v-slot:prepend>
                                    <q-icon v-if="filter" name="cancel" @click="onCancelFilter" />
                                </template>
                            </q-input>
                        </template>
                    </q-banner>
                </div>
                <div class="row justify-between">
                    <q-card v-for="invoice in invoices" :key="invoice.id" class="col-12 col-sm-5 q-mb-sm">
                        <UseMouseInElement v-slot="{ isOutside }">
                            <q-item clickable @click="onEdit(invoice.id)">
                                <q-tooltip :delay="1000"> Clique para editar ou excluir </q-tooltip>
                                <q-item-section avatar>
                                    <q-icon size="xl" :name="!isOutside ? 'edit' : 'money'" color="primary" />
                                </q-item-section>

                                <q-item-section>
                                    <q-item-label> Cliente {{ invoice.customer }}</q-item-label>
                                    <q-item-label caption> Valor Total: R$ {{ totalValue(invoice) }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </UseMouseInElement>

                        <q-item>
                            <q-item-section>
                                <q-item-label>
                                    <span class="text-weight-bold">Data</span> <span>{{ invoice.date }}</span>
                                </q-item-label>
                                <q-item-label>
                                    <span class="text-weight-bold">Vencimento</span> <span>{{ invoice.dueDate }}</span>
                                </q-item-label>
                                <q-item-label>
                                    <span class="text-weight-bold">Qtd. Items</span> <span>{{ invoice.items.length }}</span>
                                </q-item-label>
                            </q-item-section>
                        </q-item>

                        <q-card-actions align="right">
                            <InvoiceAction :invoice-id="invoice.id" :user-id="user.uid" :userInfoName="userInfoName" />
                        </q-card-actions>
                    </q-card>
                </div>

                <div style="min-height: 70px"></div>
            </q-scroll-area>
        </div>
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-btn fab icon="add" color="primary" :to="{ name: 'InvoicePage' }" />
        </q-page-sticky>
    </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useQuasar } from "quasar"
import { UseMouseInElement } from "@vueuse/components"
import { useRouter } from "vue-router"

import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"

import InvoiceAction from "components/InvoiceAction.vue"

const $q = useQuasar()

const router = useRouter()

const db = getFirestore($q.firebaseApp)

const invoices = ref([])
const filter = ref("")
let unsubscribe = null

const user = getAuth().currentUser
const collectionRef = collection(db, `users/${user.uid}/invoices`)
const userInfoRef = doc(db, "users", user.uid)

const totalValue = (invoice) => {
    return invoice.items.reduce((acc, item) => acc + item.quantity * item.value, 0).toFixed(2)
}

const userInfoName = ref("")

const onLoad = () => {
    getDoc(userInfoRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const { name = "", fantasyName = "" } = docSnap.data()
                userInfoName.value = fantasyName || name
            } else {
                // doc.data() will be undefined in this case
                throw new Error("Documento não encontrado!")
            }
        })
        .catch((error) => {
            console.error(error)

            $q.notify({
                type: "negative",
                message: "Erro ao obter dados",
                caption: error.message,
            })
        })
}

const onQueryData = () => {
    $q.loading.show()

    unsubscribe?.()

    const q = query(collectionRef, orderBy("customer.name"), limit(20), where("customer.name", ">=", filter.value), where("customer.name", "<=", filter.value + "~"))

    const querySnapshot = (querySnapshot) => {
        const firestoreData = []
        querySnapshot.forEach((doc) => {
            const { customer, date, dueDate, items } = doc.data()

            firestoreData.push({
                id: doc.id,
                customer: customer.name,
                date,
                dueDate,
                items,
            })
        })

        invoices.value = [...firestoreData]

        $q.loading.hide()
    }

    unsubscribe = onSnapshot(q, querySnapshot)
}

const onCancelFilter = () => {
    filter.value = ""
    onQueryData()
}

const onEdit = (id) => {
    router.push({ name: "InvoicePage", params: { id } })
}

onMounted(() => {
    const invoiceFilterString = $q.localStorage.getItem("invoiceFilterString")

    filter.value = invoiceFilterString?.filter ?? ""

    onQueryData()

    onLoad()
})

onUnmounted(() => {
    unsubscribe?.()
})
</script>

<style lang="scss" scoped></style>
