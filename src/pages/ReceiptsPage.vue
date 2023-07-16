<template>
    <q-page padding class="flex justify-center align-center">
        <div class="big">
            <q-scroll-area style="height: 100%; width: 100%">
                <div class="q-mb-sm">
                    <q-banner rounded inline-actions class="full-width text-white bg-primary">
                        Recibos
                        <template v-slot:avatar>
                            <q-icon name="receipt" />
                        </template>
                        <template v-slot:action>
                            <q-input color="secondary" dense v-model="filter" placeholder="Procurar" dark class="q-ml-sm" @keydown.enter="onQueryData">
                                <q-tooltip :delay="1000"> Procurar por Cliente começando com ... </q-tooltip>
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
                    <q-card v-for="receipt in receipts" :key="receipt.id" class="col-12 col-sm-5 q-mb-sm">
                        <UseMouseInElement v-slot="{ isOutside }">
                            <q-item clickable @click="onEdit(receipt.id)">
                                <q-tooltip :delay="1000"> Clique para editar ou excluir </q-tooltip>
                                <q-item-section avatar>
                                    <q-icon size="xl" :name="!isOutside ? 'edit' : 'price_check'" color="primary" />
                                </q-item-section>

                                <q-item-section>
                                    <q-item-label>
                                        <span class="text-weight-bold">{{ receipt.customerName }}</span>
                                    </q-item-label>
                                    <q-item-label caption> Valor: {{ formatCurrency(receipt.value) }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </UseMouseInElement>

                        <q-card-section class="q-pa-sm">
                            <div class="row">
                                <div class="column q-mr-md">
                                    <div class="col text-weight-bold">Data</div>
                                    <div class="col text-weight-bold">Local</div>
                                </div>
                                <div class="column">
                                    <div class="col">{{ receipt.date }}</div>
                                    <div class="col">{{ formatLocal(receipt.city, receipt.state) }}</div>
                                </div>
                            </div>
                        </q-card-section>
                        <q-card-actions align="right" class="q-pa-sm">
                            <DocumentAction :doc-id="receipt.id" :user-id="user.uid" :userInfoName="userInfoName" doc-type="receipt" @edit="onEdit(receipt.id)" />
                        </q-card-actions>
                    </q-card>
                    <q-banner v-if="receipts.length === 0" rounded inline-actions class="full-width">Nenhum item {{ filter ? "encontrado" : "cadastrado" }}</q-banner>
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
import removeAccents from "remove-accents"

import { getFirestore, collection, query, where, orderBy, limit, startAfter, doc, getDoc, getDocs, endBefore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

import DocumentAction from "components/DocumentAction.vue"
import ReceiptDialog from "components/ReceiptDialog.vue"

import { formatLocal, formatCurrency } from "assets/customFormatters"

const MAX_DOCS = parseInt(process.env.MAX_DOCS) || 10

const $q = useQuasar()

const db = getFirestore($q.firebaseApp)

const receipts = ref([])
const filter = ref("")

const user = getAuth().currentUser
const collectionRef = collection(db, `users/${user.uid}/receipts`)
const userInfoRef = doc(db, "users", user.uid)

const userInfoName = ref("")

const onLoad = () => {
    getDoc(userInfoRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const { name = "", fantasyName = "" } = docSnap.data()
                userInfoName.value = fantasyName || name

                if (!userInfoName.value) {
                    throw new Error("Informações não encontradas")
                }
            } else {
                // doc.data() will be undefined in this case
                $q.notify({
                    type: "warning",
                    message: "Informações não existem",
                })
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

let firstVisible = null
let lastVisible = null
const showLoadMoreButton = ref(false)
const queryData = async () => {
    $q.loading.show()

    const searchBy = removeAccents(filter.value).toLowerCase()

    const q = filter.value
        ? query(
              collectionRef,
              orderBy("searchableCustomerName"),
              startAfter(lastVisible ?? 0),
              where("searchableCustomerName", ">=", searchBy),
              where("searchableCustomerName", "<=", searchBy + "~"),
              limit(MAX_DOCS)
          )
        : query(collectionRef, orderBy("createdAt", "desc"), endBefore(firstVisible ?? 0), limit(MAX_DOCS))

    try {
        const documentSnapshots = await getDocs(q)

        const numberOfDocuments = documentSnapshots.docs.length

        showLoadMoreButton.value = numberOfDocuments >= MAX_DOCS

        console.log(`Get ${numberOfDocuments} docs`)

        const firestoreData = []

        documentSnapshots.docs.forEach((doc) => {
            const { customerName, date, details, value, city, state } = doc.data()

            firestoreData.push({
                id: doc.id,
                customerName,
                date,
                details,
                value,
                city,
                state,
            })
        })

        firstVisible = documentSnapshots.docs.at(0)
        lastVisible = documentSnapshots.docs.at(-1)

        receipts.value.push(...firestoreData)
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
    firstVisible = null
    lastVisible = null
    receipts.value = []
    queryData()
}

const onCancelFilter = () => {
    filter.value = ""
    onQueryData()
}

const onEdit = (id) => {
    $q.dialog({
        component: ReceiptDialog,
        componentProps: {
            id,
        },
    }).onOk(() => {
        onQueryData()
    })
}

const onNew = () => {
    $q.dialog({
        component: ReceiptDialog,
    }).onOk(() => {
        onQueryData()
    })
}

onMounted(() => {
    const receiptFilterString = $q.localStorage.getItem("receiptFilterString")

    filter.value = receiptFilterString?.filter ?? ""

    onQueryData()

    onLoad()
})
</script>
