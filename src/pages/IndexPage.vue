<template>
    <q-page class="flex flex-center">
        <div class="column wrap big q-gutter-sm">
            <div class="column justify-center items-center q-gutter-sm">
                <div v-if="uploadLogo" class="column justify-center">
                    <LogoUploader
                        ref="uploader"
                        label="Enviar Logo"
                        flat
                        bordered
                        auto-upload
                        class="button"
                        accept=".jpg, image/*"
                        max-file-size="500000"
                        :directory="`logos/${user.uid}`"
                        @rejected="onRejected"
                        @uploaded="onUploaded"
                        @finish="uploadLogo = false"
                        @removed="uploadLogo = false"
                    />
                    <div class="row justify-center q-mt-sm">
                        <q-btn color="primary" class="default-button" @click="onCancel">Cancelar</q-btn>
                    </div>
                </div>
                <div v-else class="column button">
                    <q-img :src="logo || 'logo.png'" fit="contain" style="max-width: 300px; max-height: 300px" class="rounded-borders">
                        <div class="absolute-bottom text-center" style="padding: 0">
                            <q-btn icon="file_upload" flat @click="onChangeLogo"> </q-btn>
                            <q-btn v-if="logo" icon="delete" flat @click="onDelete"> </q-btn>
                        </div>
                        <template v-slot:error>
                            <div class="absolute-full flex column flex-center bg-negative text-center text-white">
                                <span> Não foi possível carregar a imagem </span>
                                <q-btn outline @click="onChangeLogo"> Alterar Logo </q-btn>
                            </div>
                        </template>
                    </q-img>
                </div>
            </div>

            <div class="column justify-center items-center q-gutter-sm">
                <q-btn v-for="({ name, label, icon }, key) in options" :key="key" unelevated color="primary" :to="{ name }" class="button">
                    <q-icon left size="3em" :name="icon" />
                    <div class="col-grow">{{ label }}</div>
                </q-btn>
            </div>

            <div class="column justify-center items-center text-primary text-overline">{{ version }}</div>
        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { getAuth } from "firebase/auth"
import { useQuasar } from "quasar"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"

import LogoUploader from "components/LogoUploader"
import pkg from "../../package.json"

const version = `v${pkg.version}`

const options = [
    {
        name: "CustomersPage",
        label: "Clientes",
        icon: "store",
    },
    {
        name: "InvoicesPage",
        label: "Orçamentos",
        icon: "receipt_long",
    },
    {
        name: "ReceiptsPage",
        label: "Recibos",
        icon: "receipt",
    },
    {
        name: "InfoPage",
        label: "Informações",
        icon: "alternate_email",
    },
    {
        name: "UserPage",
        label: "Usuário",
        icon: "account_circle",
    },
]

const $q = useQuasar()

const user = getAuth().currentUser

const uploader = ref(null)

const defaultLogo = $q.localStorage.getItem(`${user.uid}-logoUrl`)

const logo = ref(defaultLogo)

const uploadLogo = ref(false)

const updateInfoLogoUrl = (logoUrl = "") => {
    return setDoc(userInfoRef, { logoUrl }, { merge: true })
}

const onUploaded = (uploadedFiles) => {
    const uploadedFile = uploadedFiles.value[0]

    if (!uploadedFile) return

    const logoUrl = uploadedFile.uploadUrl

    updateInfoLogoUrl(logoUrl)
        .then(() => {
            logo.value = logoUrl
            $q.localStorage.set(`${user.uid}-logoUrl`, logoUrl)
        })
        .catch((error) => {
            console.error(error)

            $q.notify({
                type: "negative",
                message: "Erro ao atualizar logo",
                caption: error.message,
            })
        })
}

const onDelete = () => {
    $q.dialog({
        title: "Excluir logo?",
        message: "A exclusão não poderá ser desfeita",
        cancel: true,
        persistent: true,
    }).onOk(() => {
        updateInfoLogoUrl()
            .then(() => {
                logo.value = ""
                $q.localStorage.remove(`${user.uid}-logoUrl`)
            })
            .catch((error) => {
                console.error(error)

                $q.notify({
                    type: "negative",
                    message: "Erro ao excluir logo",
                    caption: error.message,
                })
            })
    })
}

const onChangeLogo = () => {
    uploadLogo.value = true
}

const onRejected = (rejectedEntries) => {
    const errorTranslate = {
        "max-file-size": "Tamanho máximo: 500Kb",
        accept: "Formato inválido (apenas imagens)",
    }

    $q.notify({
        type: "negative",
        message: "Arquivo inválido",
        caption: errorTranslate[rejectedEntries[0].failedPropValidation] ?? rejectedEntries[0].failedPropValidation,
    })
}

const onCancel = () => {
    uploader.value.abort()
    uploadLogo.value = false
}

const db = getFirestore($q.firebaseApp)

const userInfoRef = doc(db, "users", user.uid)

onMounted(() => {
    getDoc(userInfoRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const { logoUrl } = docSnap.data()

                if (logoUrl) {
                    logo.value = logoUrl
                    $q.localStorage.set(`${user.uid}-logoUrl`, logoUrl)
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
                message: "Erro ao obter informações",
                caption: error.message,
            })
        })
})
</script>

<style lang="scss" scoped>
.button {
    width: 250px;
}
</style>
