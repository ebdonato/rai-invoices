<template>
    <q-page padding class="flex flex-center">
        <q-card class="big">
            <q-form @submit="onSubmit">
                <q-card-section class="bg-primary text-white">
                    <div class="text-h6">Orçamento</div>
                    <div class="text-subtitle2">ID: {{ props.id ? props.id : "NOVO" }}</div>
                </q-card-section>

                <div class="q-pa-md row items-start justify-center q-gutter-md">
                    <q-select
                        outlined
                        v-model="invoice.customer"
                        :options="customerOptions"
                        label="Cliente"
                        class="items"
                        emit-value
                        map-options
                        lazy-rules
                        :rules="[(val) => !!val || 'Campo obrigatório.']"
                        use-input
                        @filter="onFilterCustomer"
                        @update:model-value="touched = true"
                    >
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                                <q-item-section>
                                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.caption }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                    <q-input
                        outlined
                        v-model="invoice.date"
                        label="Data"
                        class="items"
                        lazy-rules
                        :rules="[(val) => !!val || 'Campo obrigatório.']"
                        @update:model-value="touched = true"
                    >
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="invoice.date" mask="DD/MM/YYYY">
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="OK" color="primary" flat />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <q-input outlined v-model="invoice.dueDate" label="Data de Vencimento" class="items" @update:model-value="touched = true">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="invoice.dueDate" mask="DD/MM/YYYY">
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="OK" color="primary" flat />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>
                <q-separator />

                <q-card-section class="row bg-secondary text-white q-py-sm">
                    <q-btn dense round icon="add" aria-label="Adicionar" color="primary" @click="onAddItem">
                        <q-tooltip :delay="1000"> Adicionar Item </q-tooltip>
                    </q-btn>
                    <div class="flex flex-center text-h6 q-mx-md">Itens</div>
                    <q-space />
                    <div class="flex flex-center q-mx-md">Valor Total: R$ {{ totalValue() }}</div>
                </q-card-section>

                <q-banner v-if="!invoice.items.length" class="text-center text-black bg-grey-3 q-mt-sm q-mx-xl" rounded> Nenhum item adicionado. </q-banner>

                <div v-for="(item, index) in invoice.items" :key="index" class="q-ma-xs">
                    <div class="row flex justify-center items-start col-grow q-gutter-sm q-my-xs">
                        <div class="column items-center">
                            <div class="text-center"># {{ (index + 1).toString().padStart(2, "0") }}</div>
                            <q-btn flat round color="red" icon="delete" @click="onRemoveItem(index)">
                                <q-tooltip :delay="1000"> Excluir Item </q-tooltip>
                            </q-btn>
                        </div>
                        <q-input
                            outlined
                            v-model="item.description"
                            label="Descrição"
                            class="items"
                            lazy-rules
                            :rules="[(val) => !!val || 'Campo obrigatório.']"
                            @update:model-value="touched = true"
                        />
                        <q-input
                            outlined
                            v-model="item.quantity"
                            label="Quant."
                            class="monetary-items"
                            mask="#.##"
                            fill-mask="0"
                            reverse-fill-mask
                            input-class="text-right"
                            lazy-rules
                            :rules="[(val) => (!isNaN(val) && val > 0) || 'Valor inválido.']"
                            @update:model-value="touched = true"
                        />
                        <q-input
                            outlined
                            v-model="item.value"
                            label="Valor"
                            class="monetary-items"
                            mask="#.##"
                            fill-mask="0"
                            reverse-fill-mask
                            input-class="text-right"
                            prefix="R$"
                            lazy-rules
                            :rules="[(val) => (!isNaN(val) && val > 0) || 'Valor inválido.']"
                            @update:model-value="touched = true"
                        />
                        <q-field outlined label="Valor Total" stack-label class="monetary-items" prefix="R$">
                            <template v-slot:control>
                                <div class="self-center full-width no-outline text-right" tabindex="0">{{ (+item.quantity * +item.value).toFixed(2) }}</div>
                            </template>
                        </q-field>
                    </div>
                    <q-separator inset v-show="invoice.items.length != index + 1" />
                </div>

                <q-card-section class="row bg-secondary text-white q-my-sm q-py-sm">
                    <div class="text-h6">Observações</div>
                </q-card-section>

                <q-card-section> <q-editor v-model="invoice.note" placeholder="Sem Observações" min-height="5rem" @update:model-value="touched = true" /> </q-card-section>

                <q-card-actions>
                    <q-btn v-if="!!props.id" color="red" label="Excluir" @click.prevent="onDelete" class="default-button" />
                    <q-space />
                    <q-btn color="primary" class="default-button" :to="{ name: 'InvoicesPage' }">Cancelar</q-btn>
                    <q-btn color="primary" class="default-button" type="submit" :disable="!touched">OK</q-btn>
                </q-card-actions>
            </q-form>
        </q-card>
    </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { useQuasar, date } from "quasar"
import { onBeforeRouteLeave, useRouter } from "vue-router"

import { getFirestore, collection, query, where, orderBy, limit, doc, getDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"

import { nanoid } from "nanoid"

import { formatCPForCNPJ, formatPhone } from "assets/customFormatters"

const $q = useQuasar()

const router = useRouter()

const db = getFirestore($q.firebaseApp)

const user = getAuth().currentUser

const touched = ref(false)

const props = defineProps({
    id: {
        type: String,
        required: false,
        default: null,
    },
})

const invoice = reactive({
    customer: null,
    date: date.formatDate(Date.now(), "DD/MM/YYYY"),
    dueDate: null,
    items: [],
    note: "",
})

const customerOptions = ref([])

const customerCollectionRef = collection(db, `users/${user.uid}/customers`)

const invoicePath = `users/${user.uid}/invoices`

const totalValue = () => {
    return invoice.items.reduce((acc, item) => acc + item.quantity * item.value, 0).toFixed(2)
}

const queryCustomers = async (filter = "") => {
    const q = query(customerCollectionRef, orderBy("name"), limit(20), where("name", ">=", filter), where("name", "<=", filter + "~"))

    const querySnapshot = await getDocs(q)

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

const onAddItem = () => {
    touched.value = true

    invoice.items.push({
        description: "",
        quantity: "0",
        value: "0",
    })
}

const onRemoveItem = (index) => {
    touched.value = true

    invoice.items.splice(index, 1)
}

const getInvoice = (id) => {
    const docRef = doc(db, invoicePath, id)

    $q.loading.show()

    getDoc(docRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const { customer, date, dueDate, items = [], note = "" } = docSnap.data()

                invoice.customer = customer
                invoice.date = date
                invoice.dueDate = dueDate
                invoice.items = items
                invoice.note = note
            } else {
                // doc.data() will be undefined in this case
                throw new Error("Documento não encontrado!")
            }
        })
        .catch((error) => {
            console.error(error)

            router.push({ name: "InvoicesPage" })

            $q.notify({
                type: "negative",
                message: "Erro ao obter dados",
                caption: error.message,
            })
        })
        .finally(() => {
            $q.loading.hide()
        })
}

const onSubmit = () => {
    $q.loading.show()

    const docRef = doc(db, invoicePath, props.id ?? nanoid())

    invoice.customerName = invoice.customer.name

    setDoc(docRef, invoice)
        .then(() => {
            touched.value = false

            router.push({ name: "InvoicesPage" })

            $q.notify({
                type: "positive",
                message: props.id ? "Orçamento atualizado com sucesso" : "Orçamento cadastrado com sucesso",
            })
        })
        .catch((error) => {
            console.error(error)

            $q.notify({
                type: "negative",
                message: "Erro ao obter dados",
                caption: error.message,
            })
        })
        .finally(() => {
            $q.loading.hide()
        })
}

const onDelete = () => {
    if (!props.id) return

    $q.dialog({
        title: "Excluir?",
        message: "A exclusão não poderá ser desfeita",
        cancel: true,
        persistent: true,
    }).onOk(() => {
        $q.loading.show()

        const docRef = doc(db, invoicePath, props.id)

        deleteDoc(docRef)
            .then(() => {
                touched.value = false

                router.push({ name: "InvoicesPage" })

                $q.notify({
                    type: "positive",
                    message: "Orçamento excluído com sucesso",
                })
            })
            .catch((error) => {
                console.error(error)

                $q.notify({
                    type: "negative",
                    message: "Erro ao excluir dados",
                    caption: error.message,
                })
            })
            .finally(() => {
                $q.loading.hide()
            })
    })
}

const onFilterCustomer = (inputValue, doneFn, abortFn) => {
    queryCustomers(inputValue)
        .then((customers) => {
            doneFn(() => (customerOptions.value = customers))
        })
        .catch(() => {
            abortFn(() => (customerOptions.value = []))
        })
}

onMounted(() => {
    queryCustomers().then((customers) => (customerOptions.value = customers))
    props.id && getInvoice(props.id)
})

onBeforeRouteLeave((to, from, next) => {
    if (!touched.value) {
        next()
    } else {
        $q.dialog({
            title: `Tem certeza que deseja sair?`,
            message: "Alterações não salvas serão perdidas.",
            cancel: true,
            persistent: true,
        })
            .onOk(() => {
                next()
            })
            .onCancel(() => {
                next(false)
            })
    }
})
</script>

<style lang="scss" scoped>
.items {
    width: 100%;
    max-width: 250px;
}

.monetary-items {
    width: 100%;
    max-width: 100px;
}
</style>
