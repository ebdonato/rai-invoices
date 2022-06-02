<template>
    <!-- notice dialogRef here -->
    <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
        <q-card class="q-dialog-plugin">
            <q-form @submit="onSubmit">
                <q-card-section class="bg-primary text-white">
                    <div class="text-h6">Cliente</div>
                </q-card-section>

                <q-card-section class="q-mt-sm">
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
                        :rules="[() => true]"
                        :mask="customer.person == 'legal' ? '##.###.###/####-##' : '###.###.###-##'"
                        unmasked-value
                        @update:model-value="touched = true"
                    />
                    <q-input outlined v-model="customer.contact" label="Contato" :rules="[() => true]" @update:model-value="touched = true" />
                    <q-input outlined v-model="customer.phone" label="Telefone" :rules="[() => true]" mask="(##) #####-####" unmasked-value @update:model-value="touched = true" />
                </q-card-section>

                <!-- buttons example -->
                <q-card-actions align="right">
                    <q-btn v-if="isUpdatingCustomer" color="red" label="Excluir" @click.prevent="onDelete" />
                    <q-space />
                    <q-btn color="primary" label="Cancel" @click.prevent="onCancelClick" />
                    <q-btn color="primary" label="OK" type="submit" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script>
import { useDialogPluginComponent, useQuasar } from "quasar"
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { ref, onMounted } from "vue"
import { nanoid } from "nanoid"

export default {
    name: "CustomerDialog",

    props: {
        id: {
            type: String,
            required: false,
            default: null,
        },
    },

    emits: [
        // REQUIRED; need to specify some events that your
        // component will emit through useDialogPluginComponent()
        ...useDialogPluginComponent.emits,
    ],

    setup(props) {
        // REQUIRED; must be called inside of setup()
        const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
        // dialogRef      - Vue ref to be applied to QDialog
        // onDialogHide   - Function to be used as handler for @hide on QDialog
        // onDialogOK     - Function to call to settle dialog with "ok" outcome
        //                    example: onDialogOK() - no payload
        //                    example: onDialogOK({ /*.../* }) - with payload
        // onDialogCancel - Function to call to settle dialog with "cancel" outcome
        const $q = useQuasar()

        const customer = ref({ name: "", contact: "", phone: "", person: "legal", nationalRegistration: "" })

        const touched = ref(false)

        const db = getFirestore($q.firebaseApp)

        const user = getAuth().currentUser

        const customersPath = `users/${user.uid}/customers`

        const getCustomer = (id) => {
            const docRef = doc(db, customersPath, id)

            $q.loading.show()

            getDoc(docRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const { name, contact, phone, person, nationalRegistration } = docSnap.data()
                        customer.value = {
                            name,
                            contact,
                            phone,
                            person,
                            nationalRegistration,
                        }
                    } else {
                        // doc.data() will be undefined in this case
                        throw new Error("Documento não encontrado!")
                    }
                })
                .catch((error) => {
                    $q.notify({
                        type: "negative",
                        message: "Erro ao obter dados",
                        caption: error.message,
                    })
                    onDialogCancel()
                })
                .finally(() => {
                    $q.loading.hide()
                })
        }

        const onSubmit = () => {
            $q.loading.show()

            const docRef = doc(db, customersPath, props.id ?? nanoid())

            const document = {
                name: customer.value.name,
                contact: customer.value.contact,
                phone: customer.value.phone,
                person: customer.value.person,
                nationalRegistration: customer.value.nationalRegistration,
            }

            setDoc(docRef, document)
                .then(() => {
                    $q.notify({
                        type: "positive",
                        message: props.id ? "Cliente atualizado com sucesso" : "Cliente cadastrado com sucesso",
                    })
                    onDialogOK()
                })
                .catch((error) => {
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

                const docRef = doc(db, customersPath, props.id)

                deleteDoc(docRef)
                    .then(() => {
                        $q.notify({
                            type: "positive",
                            message: "Cliente excluído com sucesso",
                        })
                        onDialogOK()
                    })
                    .catch((error) => {
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

        onMounted(() => {
            props.id && getCustomer(props.id)
        })

        return {
            touched,
            personOptions: [
                {
                    label: "Física",
                    value: "natural",
                },
                {
                    label: "Jurídica",
                    value: "legal",
                },
            ],

            customer,
            onSubmit,
            onDelete,
            isUpdatingCustomer: !!props.id,
            // This is REQUIRED;
            // Need to inject these (from useDialogPluginComponent() call)
            // into the vue scope for the vue html template
            dialogRef,
            onDialogHide,

            // other methods that we used in our vue html template;
            // these are part of our example (so not required)
            onOKClick() {
                // on OK, it is REQUIRED to
                // call onDialogOK (with optional payload)
                onDialogOK()
                // or with payload: onDialogOK({ ... })
                // ...and it will also hide the dialog automatically
            },

            // we can passthrough onDialogCancel directly
            onCancelClick() {
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
            },
        }
    },
}
</script>
