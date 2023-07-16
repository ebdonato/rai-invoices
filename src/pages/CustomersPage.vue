<template>
    <q-page padding class="flex justify-center align-center">
        <div class="big">
            <q-scroll-area style="height: 100%; width: 100%">
                <div class="q-mb-sm">
                    <q-banner rounded inline-actions class="full-width text-white bg-primary">
                        Clientes
                        <template v-slot:avatar>
                            <q-icon name="store" />
                        </template>
                        <template v-slot:action>
                            <q-input color="secondary" dense v-model="filter" placeholder="Procurar" dark class="q-ml-sm" @keydown.enter="onQueryData">
                                <q-tooltip :delay="1000"> Procurar por Nome começando com ... </q-tooltip>
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
                    <q-card v-for="customer in customers" :key="customer.id" class="col-12 col-sm-5 q-mb-sm">
                        <UseMouseInElement v-slot="{ isOutside }">
                            <q-item clickable @click="onEdit(customer.id)">
                                <q-tooltip :delay="1000"> Clique para editar ou excluir </q-tooltip>
                                <q-item-section avatar>
                                    <q-icon
                                        size="xl"
                                        :name="!isOutside ? 'edit' : customer.person == 'legal' ? 'business' : 'account_circle'"
                                        :color="customer.active ? 'primary' : 'grey'"
                                    />
                                </q-item-section>

                                <q-item-section>
                                    <q-item-label>
                                        <span class="text-weight-bold">{{ customer.name }}</span>
                                    </q-item-label>
                                    <q-item-label caption> Pessoa {{ customer.person == "legal" ? "Jurídica" : "Física" }} </q-item-label>
                                </q-item-section>
                            </q-item>
                        </UseMouseInElement>

                        <q-card-section class="q-pa-sm">
                            <div class="row">
                                <div class="column q-mr-md">
                                    <div class="col text-weight-bold">{{ customer.person == "legal" ? "CNPJ " : "CPF " }}</div>
                                    <div class="text-weight-bold">Contato</div>
                                    <div class="text-weight-bold">Telefone</div>
                                </div>
                                <div class="column">
                                    <div class="col">{{ formatCPForCNPJ(customer.nationalRegistration) }}</div>
                                    <div>{{ customer.contact }}</div>
                                    <div>{{ customer.phone }}</div>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                    <q-banner v-if="customers.length === 0" rounded inline-actions class="full-width">Nenhum item {{ filter ? "encontrado" : "cadastrado" }}</q-banner>
                </div>

                <div style="min-height: 70px" class="flex column justify-center align-center">
                    <div class="text-center" v-if="showLoadMoreButton">
                        <q-btn color="primary" @click="onLoadMore"> Carregar mais itens </q-btn>
                    </div>
                </div>
            </q-scroll-area>
        </div>
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <div class="q-gutter-sm">
                <q-btn fab icon="arrow_back" color="primary" :to="{ name: 'IndexPage' }" />
                <q-btn fab icon="add" color="primary" @click="onNew" />
            </div>
        </q-page-sticky>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useQuasar } from "quasar"
import { UseMouseInElement } from "@vueuse/components"

import { getFirestore, collection, query, where, orderBy, limit, getDocs, startAfter } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import removeAccents from "remove-accents"

import { formatCPForCNPJ, formatPhone } from "assets/customFormatters"

import CustomerDialog from "components/CustomerDialog.vue"

const $q = useQuasar()

const db = getFirestore($q.firebaseApp)

const customers = ref([])
const filter = ref("")

const user = getAuth().currentUser
const collectionRef = collection(db, `users/${user.uid}/customers`)

const MAX_DOCS = parseInt(process.env.MAX_DOCS) || 10
let lastVisible = null
const showLoadMoreButton = ref(false)
const queryData = async () => {
    $q.loading.show()

    const searchBy = removeAccents(filter.value).toLowerCase()

    const q = query(
        collectionRef,
        orderBy("searchableCustomerName"),
        startAfter(lastVisible ?? 0),
        where("searchableCustomerName", ">=", searchBy),
        where("searchableCustomerName", "<=", searchBy + "~"),
        limit(MAX_DOCS)
    )

    try {
        const documentSnapshots = await getDocs(q)

        const numberOfDocuments = documentSnapshots.docs.length

        showLoadMoreButton.value = numberOfDocuments >= MAX_DOCS

        console.log(`Get ${numberOfDocuments} docs`)

        const firestoreData = []

        documentSnapshots.docs.forEach((doc) => {
            const { name, contact, phone, person, nationalRegistration, active = true } = doc.data()

            firestoreData.push({
                id: doc.id,
                person,
                name,
                nationalRegistration: formatCPForCNPJ(nationalRegistration),
                contact,
                phone: formatPhone(phone),
                active,
            })
        })

        lastVisible = documentSnapshots.docs.at(-1)

        customers.value.push(...firestoreData)
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

const onLoadMore = () => {
    queryData()
}

const onQueryData = () => {
    lastVisible = null
    customers.value = []
    queryData()
}

const onCancelFilter = () => {
    filter.value = ""
    onQueryData()
}

const onEdit = (id) => {
    $q.dialog({
        component: CustomerDialog,
        componentProps: {
            id,
        },
    }).onOk(() => {
        onQueryData()
    })
}

const onNew = () => {
    $q.dialog({
        component: CustomerDialog,
    }).onOk(() => {
        onQueryData()
    })
}

onMounted(() => {
    const customerFilterString = $q.localStorage.getItem("customerFilterString")

    filter.value = customerFilterString?.filter ?? ""

    onQueryData()
})
</script>
