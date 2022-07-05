<template>
    <q-page padding class="flex flex-center">
        <q-card class="big">
            <q-form @submit="onSubmit">
                <q-card-section class="bg-primary text-white">
                    <div class="text-h6">Informações</div>
                </q-card-section>

                <q-card-section class="row q-gutter-md justify-center">
                    <q-input
                        outlined
                        v-model="info.name"
                        label="Nome"
                        :rules="[(val) => !!val || 'Campo Obrigatório']"
                        @update:model-value="touched = true"
                        class="col-sm-5 col-11"
                    />
                    <q-input outlined v-model="info.fantasyName" label="Nome Fantasia" @update:model-value="touched = true" class="col-sm-5 col-11" />
                    <q-select
                        outlined
                        v-model="info.person"
                        :options="personOptions"
                        label="Pessoa"
                        emit-value
                        map-options
                        @update:model-value="touched = true"
                        class="col-sm-5 col-11"
                    />
                    <q-input
                        outlined
                        v-model="info.nationalRegistration"
                        :label="info.person == 'legal' ? 'CNPJ' : 'CPF'"
                        :rules="[(val) => !val || cpf.isValid(val) || cnpj.isValid(val) || 'Número Inválido']"
                        :mask="info.person == 'legal' ? '##.###.###/####-##' : '###.###.###-##'"
                        unmasked-value
                        @update:model-value="touched = true"
                        class="col-sm-5 col-11"
                    />
                    <q-input
                        outlined
                        v-model="info.zipCode"
                        label="CEP"
                        @update:model-value="touched = true"
                        mask="##.###-###"
                        unmasked-value
                        :loading="loadingCEP"
                        :disable="loadingCEP"
                        @blur="getAddressFromCEP"
                        class="col-sm-5 col-11"
                    />
                    <q-input outlined v-model="info.addressLine1" label="Endereço Linha 1" @update:model-value="touched = true" class="col-sm-5 col-11" />
                    <q-input outlined v-model="info.addressLine2" label="Endereço Linha 2" @update:model-value="touched = true" class="col-sm-5 col-11" />
                    <q-input outlined v-model="info.city" label="Cidade" @update:model-value="touched = true" class="col-sm-5 col-11" />
                    <q-select
                        v-model="info.state"
                        outlined
                        :options="stateOptions"
                        label="UF"
                        @update:model-value="touched = true"
                        clearable
                        emit-value
                        map-options
                        class="col-sm-5 col-11"
                    />
                    <div class="gt-xs col-5"></div>
                    <q-input outlined v-model="info.phone" label="Telefone" mask="(##) #####-####" unmasked-value @update:model-value="touched = true" class="col-sm-5 col-11" />
                    <q-input
                        outlined
                        v-model="info.email"
                        label="E-mail"
                        :rules="[(val) => val == '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'E-mail Inválido']"
                        @update:model-value="touched = true"
                        class="col-sm-5 col-11"
                    />
                </q-card-section>

                <q-separator dark />

                <q-card-actions align="right">
                    <q-btn color="primary" class="default-button" :to="{ name: 'IndexPage' }">Cancelar</q-btn>
                    <q-btn color="primary" class="default-button" :disable="!touched" type="submit">OK</q-btn>
                </q-card-actions>
            </q-form>
        </q-card>
    </q-page>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue"
import { useQuasar } from "quasar"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { cpf, cnpj } from "cpf-cnpj-validator"

const $q = useQuasar()

const router = useRouter()

const db = getFirestore($q.firebaseApp)

const user = getAuth().currentUser

const info = reactive({
    name: "",
    fantasyName: "",
    zipCode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    person: "legal",
    nationalRegistration: "",
    phone: "",
    email: "",
})
const touched = ref(false)

const loadingCEP = ref(false)

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

const stateOptions = [
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

const getAddressFromCEP = (event) => {
    const value = event.target.value
    if (value.length >= 8) {
        loadingCEP.value = true

        fetch(`https://brasilapi.com.br/api/cep/v1/${value}`)
            .then((response) => response.json())
            .then((data) => {
                info.addressLine2 = data.neighborhood
                info.addressLine1 = data.street
                info.state = data.state
                info.city = data.city
            })
            .catch((error) => {
                console.error(error)
                $q.notify({
                    type: "negative",
                    message: "CEP não encontrado",
                    caption: error.message,
                })
            })
            .finally(() => {
                loadingCEP.value = false
            })
    }
}

const docRef = doc(db, "users", user.uid)

const onLoad = () => {
    $q.loading.show()

    getDoc(docRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const {
                    name = "",
                    fantasyName = "",
                    zipCode = "",
                    addressLine1 = "",
                    addressLine2 = "",
                    city = "",
                    state = "",
                    person = "legal",
                    nationalRegistration = "",
                    phone = "",
                    email = "",
                } = docSnap.data()

                Object.assign(info, { name, fantasyName, zipCode, addressLine1, addressLine2, city, state, person, nationalRegistration, phone, email })
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
                message: "Erro ao obter informações",
                caption: error.message,
            })
        })
        .finally(() => {
            $q.loading.hide()
        })
}

const onSubmit = () => {
    $q.loading.show()

    setDoc(docRef, info)
        .then(() => {
            touched.value = false

            router.push({ name: "IndexPage" })

            $q.notify({
                type: "positive",
                message: "Informações atualizada com sucesso",
            })
        })
        .catch((error) => {
            console.error(error)

            $q.notify({
                type: "negative",
                message: "Erro ao atualizar informações",
                caption: error.message,
            })
        })
        .finally(() => {
            $q.loading.hide()
        })
}

onMounted(() => {
    onLoad()
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
