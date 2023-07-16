<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="medium">
            <q-card-section>
                <div class="text-h6">Selecione um cliente</div>
            </q-card-section>
            <q-card-section class="q-gutter-sm">
                <q-select outlined v-model="customer" :options="customerOptions" label="Cliente" emit-value map-options lazy-rules use-input @filter="onFilterCustomer">
                    <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                            <q-item-section>
                                <q-item-label>{{ scope.opt.label }}</q-item-label>
                                <q-item-label caption>{{ scope.opt.caption }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                </q-select>
            </q-card-section>
            <q-card-actions class="justify-end">
                <q-btn flat color="primary" label="Cancelar" @click="onCancelClick" class="default-button" style="min-width: 130px" />
                <q-btn :disable="!customer" unelevated color="primary" label="OK" @click="onOKClick" class="default-button" style="min-width: 130px" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent, useQuasar } from "quasar"
import { ref, onMounted } from "vue"
import { getFirestore, collection, query, where, orderBy, limit, getDocs, startAfter } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import removeAccents from "remove-accents"

import { formatCPForCNPJ } from "assets/customFormatters"

const MAX_DOCS = parseInt(process.env.MAX_DOCS) || 10

const $q = useQuasar()

const props = defineProps({
    initialValue: {
        type: String,
        default: "",
    },
})

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

function onOKClick() {
    onDialogOK(customer.value)
}

function onCancelClick() {
    onDialogCancel()
}

const db = getFirestore($q.firebaseApp)

const user = getAuth().currentUser

const customer = ref(null)

const customerOptions = ref([])

const customerCollectionRef = collection(db, `users/${user.uid}/customers`)

function onFilterCustomer(inputValue, doneFn, abortFn) {
    queryCustomers(inputValue)
        .then((customers) => {
            doneFn(() => (customerOptions.value = customers))
        })
        .catch(() => {
            abortFn(() => (customerOptions.value = []))
        })
}

async function queryCustomers(filter = "") {
    const searchBy = removeAccents(filter).toLowerCase()

    const q = query(
        customerCollectionRef,
        orderBy("searchableCustomerName"),
        startAfter(0),
        where("active", "==", true),
        where("searchableCustomerName", ">=", searchBy),
        where("searchableCustomerName", "<=", searchBy + "~"),
        limit(MAX_DOCS)
    )

    const querySnapshot = await getDocs(q)

    const numberOfDocuments = querySnapshot.docs.length

    console.log(`Get ${numberOfDocuments} docs`)

    const customer = []

    querySnapshot.forEach((doc) => {
        const { name, contact, phone, person, nationalRegistration: rawNationalRegistration } = doc.data()

        const nationalRegistration = formatCPForCNPJ(rawNationalRegistration)

        customer.push({
            label: name,
            caption: nationalRegistration || "- - -",
            value: {
                id: doc.id,
                person,
                name,
                nationalRegistration: rawNationalRegistration,
                contact,
                phone,
            },
        })
    })

    return [...customer]
}

onMounted(() => {
    console.log("🚀 ~ file: PickCustomerDialog.vue:119 ~ queryCustomers ~ props.initialValue:", props.initialValue)
    queryCustomers(props.initialValue).then((customers) => {
        console.log("🚀 ~ file: PickCustomerDialog.vue:119 ~ queryCustomers ~ customers:", customers)
        customer.value = customers[0]
        customerOptions.value = customers
    })
})
</script>
