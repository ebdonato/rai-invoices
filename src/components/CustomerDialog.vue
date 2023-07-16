<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
        <q-card class="q-dialog-plugin">
            <q-form @submit="onSubmit">
                <q-card-section class="bg-primary text-white">
                    <div class="text-h6">Cliente</div>
                </q-card-section>

                <q-card-section class="q-gutter-sm q-mt-sm">
                    <q-input outlined v-model="customer.name" label="Nome" :rules="[(val) => !!val || 'Campo Obrigatório']" @update:model-value="touched = true" />
                    <q-select
                        outlined
                        v-model="customer.person"
                        :options="personOptions"
                        label="Pessoa"
                        :rules="[(val) => !!val || 'Campo Obrigatório']"
                        emit-value
                        map-options
                        @update:model-value="touched = true"
                    />
                    <q-input
                        outlined
                        v-model="customer.nationalRegistration"
                        :label="customer.person == 'legal' ? 'CNPJ' : 'CPF'"
                        :rules="[(val) => !val || cpf.isValid(val) || cnpj.isValid(val) || 'Número Inválido']"
                        :mask="customer.person == 'legal' ? '##.###.###/####-##' : '###.###.###-##'"
                        unmasked-value
                        @update:model-value="touched = true"
                    />
                    <q-input outlined v-model="customer.contact" label="Contato" :rules="[() => true]" @update:model-value="touched = true" />
                    <q-input outlined v-model="customer.phone" label="Telefone" :rules="[() => true]" mask="(##) #####-####" unmasked-value @update:model-value="touched = true" />
                </q-card-section>

                <q-card-actions>
                    <q-toggle v-model="customer.active" :label="customer.active ? 'Ativo' : 'Inativo'" />
                    <q-space />
                    <q-btn color="primary" label="Cancel" @click.prevent="onCancelClick" class="default-button" />
                    <q-btn color="primary" label="OK" type="submit" class="default-button" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent, useQuasar } from "quasar"
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { ref, onMounted, reactive } from "vue"
import { nanoid } from "nanoid"
import { cpf, cnpj } from "cpf-cnpj-validator"
import removeAccents from "remove-accents"

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const $q = useQuasar()

const personOptions = [
    {
        label: "Física",
        value: "natural",
    },
    {
        label: "Jurídica",
        value: "legal",
    },
]

const customer = reactive({ name: "", contact: "", phone: "", person: "legal", nationalRegistration: "", active: true })

const touched = ref(false)

const db = getFirestore($q.firebaseApp)

const user = getAuth().currentUser

const customersPath = `users/${user.uid}/customers`

const props = defineProps({
    id: {
        type: String,
        required: false,
        default: null,
    },
})

const getCustomer = (id) => {
    const docRef = doc(db, customersPath, id)

    $q.loading.show()

    getDoc(docRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const { name = "", contact = "", phone = "", person = "legal", nationalRegistration = "", active = true } = docSnap.data()
                Object.assign(customer, { name, contact, phone, person, nationalRegistration, active })
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

    const docRef = doc(db, customersPath, props.id ?? nanoid())

    const document = {
        name: customer.name,
        searchableCustomerName: removeAccents(customer.name).toLowerCase(),
        contact: customer.contact,
        phone: customer.phone,
        person: customer.person,
        nationalRegistration: customer.nationalRegistration,
        active: customer.active,
        ...(!props.id && { createdAt: serverTimestamp() }),
    }

    const promise = props.id ? updateDoc : setDoc

    promise(docRef, document)
        .then(() => {
            onDialogOK()

            $q.notify({
                type: "positive",
                message: props.id ? "Cliente atualizado com sucesso" : "Cliente cadastrado com sucesso",
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
    props.id && getCustomer(props.id)
})
</script>
