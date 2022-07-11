<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
        <q-card class="q-dialog-plugin">
            <q-form @submit="onSubmit">
                <q-card-section class="bg-primary text-white">
                    <div class="text-h6">Recibo</div>
                </q-card-section>

                <q-card-section class="q-gutter-sm q-mt-sm">
                    <q-input
                        outlined
                        v-model="receipt.value"
                        label="Valor"
                        class="monetary-items"
                        mask="#.##"
                        fill-mask="0"
                        reverse-fill-mask
                        input-class="text-right"
                        prefix="R$"
                        lazy-rules
                        :rules="[(val) => (!isNaN(val) && val > 0) || 'Valor inválido']"
                        @update:model-value="touched = true"
                    />
                    <q-select
                        outlined
                        v-model="receipt.customer"
                        :options="customerOptions"
                        label="Cliente"
                        class="items"
                        emit-value
                        map-options
                        lazy-rules
                        :rules="[(val) => !!val || 'Campo obrigatório']"
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
                        v-model="receipt.date"
                        label="Data"
                        class="items"
                        lazy-rules
                        :rules="[(val) => !!val || 'Campo obrigatório']"
                        @update:model-value="touched = true"
                    >
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="receipt.date" mask="DD/MM/YYYY">
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="OK" color="primary" flat />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <q-input
                        outlined
                        v-model="receipt.details"
                        label="Detalhes"
                        type="textarea"
                        class="items"
                        lazy-rules
                        :rules="[(val) => !!val || 'Campo Obrigatório']"
                        @update:model-value="touched = true"
                    />
                    <q-select
                        outlined
                        v-model="receipt.state"
                        :options="ufs"
                        label="UF"
                        class="items"
                        emit-value
                        map-options
                        @update:model-value="cities = []"
                        lazy-rules
                        :rules="[(val) => !!val || 'Campo Obrigatório']"
                    />
                    <q-select
                        outlined
                        v-model="receipt.city"
                        :options="citiesFiltered"
                        label="Cidade"
                        class="items"
                        use-input
                        input-debounce="200"
                        @filter="onFilterCities"
                        lazy-rules
                        :rules="[(val) => (val != '' && val != null) || 'Campo Obrigatório', (val) => (!!cities && cities.includes(val)) || 'Escolha uma cidade da lista']"
                    />
                </q-card-section>

                <q-card-actions>
                    <q-btn v-if="!!props.id" color="red" label="Excluir" @click.prevent="onDelete" class="default-button" />
                    <q-space />
                    <q-btn color="primary" label="Cancel" @click.prevent="onCancelClick" class="default-button" />
                    <q-btn color="primary" label="OK" type="submit" class="default-button" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent, useQuasar, date } from "quasar"
import { getFirestore, collection, query, where, orderBy, limit, doc, getDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { ref, onMounted, reactive } from "vue"
import { nanoid } from "nanoid"
import { formatCPForCNPJ } from "assets/customFormatters"

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const $q = useQuasar()

const receipt = reactive({
    customer: null,
    date: date.formatDate(Date.now(), "DD/MM/YYYY"),
    value: 0,
    details: "",
    state: "ES",
    city: "Cachoeiro de Itapemirim",
})

const touched = ref(false)

const db = getFirestore($q.firebaseApp)

const user = getAuth().currentUser

const props = defineProps({
    id: {
        type: String,
        required: false,
        default: null,
    },
})

const customerCollectionRef = collection(db, `users/${user.uid}/customers`)

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

const customerOptions = ref([])

const onFilterCustomer = (inputValue, doneFn, abortFn) => {
    queryCustomers(inputValue)
        .then((customers) => {
            doneFn(() => (customerOptions.value = customers))
        })
        .catch(() => {
            abortFn(() => (customerOptions.value = []))
        })
}

const receiptsPath = `users/${user.uid}/receipts`

const getReceipt = (id) => {
    const docRef = doc(db, receiptsPath, id)

    $q.loading.show()

    getDoc(docRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const { customer = null, date = "", value = 0, details = "", state, city } = docSnap.data()
                Object.assign(receipt, { customer, date, value, details, state, city })
            } else {
                // doc.data() will be undefined in this case
                throw new Error("Documento não encontrado")
            }
        })
        .catch((error) => {
            console.error(error)

            onDialogCancel()

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

    const docRef = doc(db, receiptsPath, props.id ?? nanoid())

    receipt.customerName = receipt.customer.name

    setDoc(docRef, receipt)
        .then(() => {
            onDialogOK()

            $q.notify({
                type: "positive",
                message: props.id ? "Recibo atualizado com sucesso" : "Recibo cadastrado com sucesso",
            })
        })
        .catch((error) => {
            console.error(error)

            $q.notify({
                type: "negative",
                message: "Erro ao enviar dados",
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

        const docRef = doc(db, receiptsPath, props.id)

        deleteDoc(docRef)
            .then(() => {
                onDialogOK()

                $q.notify({
                    type: "positive",
                    message: "Recibo excluído com sucesso",
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

const onCancelClick = () => {
    if (touched.value) {
        $q.dialog({
            title: "Cancelar?",
            message: "Todos as modificações serão perdidas",
            cancel: true,
            persistent: true,
        }).onOk(() => {
            onDialogCancel()
        })
    } else {
        onDialogCancel()
    }
}

onMounted(() => {
    queryCustomers().then((customers) => (customerOptions.value = customers))
    props.id && getReceipt(props.id)
    getCities(receipt.state)
        .then((response) => {
            cities.value = [...response]
            citiesFiltered.value = [...response]
        })
        .catch(() => {
            cities.value = []
            citiesFiltered.value = []
        })
})

const cities = ref([])
const citiesFiltered = ref([])

const ufs = [
    { label: "Espírito Santo (ES)", value: "ES" },
    { label: "Acre (AC)", value: "AC" },
    { label: "Alagoas (AL)", value: "AL" },
    { label: "Amapá (AP)", value: "AP" },
    { label: "Amazonas (AM)", value: "AM" },
    { label: "Bahia (BA)", value: "BA" },
    { label: "Ceará (CE)", value: "CE" },
    { label: "Distrito Federal (DF)", value: "DF" },
    { label: "Goiás (GO)", value: "GO" },
    { label: "Maranhão (MA)", value: "MA" },
    { label: "Mato Grosso (MT)", value: "MT" },
    { label: "Mato Grosso do Sul (MS)", value: "MS" },
    { label: "Minas Gerais (MG)", value: "MG" },
    { label: "Pará (PA)", value: "PA" },
    { label: "Paraíba (PB)", value: "PB" },
    { label: "Paraná (PR)", value: "PR" },
    { label: "Pernambuco (PE)", value: "PE" },
    { label: "Piauí (PI)", value: "PI" },
    { label: "Rio de Janeiro (RJ)", value: "RJ" },
    { label: "Rio Grande do Norte (RN)", value: "RN" },
    { label: "Rio Grande do Sul (RS)", value: "RS" },
    { label: "Rondônia (RO)", value: "RO" },
    { label: "Roraima (RR)", value: "RR" },
    { label: "Santa Catarina (SC)", value: "SC" },
    { label: "São Paulo (SP)", value: "SP" },
    { label: "Sergipe (SE)", value: "SE" },
    { label: "Tocantins (TO)", value: "TO" },
]

const getCities = (uf) =>
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        .then((response) => response.json())
        .then((response) => response.map((item) => item.nome))
        .catch((error) => {
            console.error(error)
            $q.notify({
                type: "negative",
                message: "Erro ao obter cidades",
                caption: error.message,
            })
        })

const filterCities = (cities = [], value = "") => {
    if (value === "") {
        return [...cities]
    } else {
        const needle = value.toLowerCase()
        return cities.filter((city) => city.toLowerCase().indexOf(needle) > -1)
    }
}

const onFilterCities = (val, update, abort) => {
    if (cities.value.length) {
        update(() => {
            citiesFiltered.value = filterCities(cities.value, val)
        })
    } else {
        getCities(receipt.state)
            .then((citiesList) => {
                update(() => {
                    cities.value = [...citiesList]
                    citiesFiltered.value = filterCities([...citiesList], val)
                })
            })
            .catch(() => {
                abort()
                cities.value = []
                citiesFiltered.value = []
            })
    }
}
</script>

<style lang="scss" scoped>
textarea {
    resize: none !important;
}
</style>
