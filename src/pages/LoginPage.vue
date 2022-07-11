<template>
    <q-page
        class="flex flex-center column justify-between"
        :class="{
            'bg-light': !isDark,
            'bg-dark': isDark,
        }"
        padding=""
    >
        <div class="text-h4 text-white">Orçamentos do Rainério</div>
        <div class="column align-center medium">
            <div v-if="isCreatingUser" class="q-gutter-sm column">
                <CreateUserCard />
                <q-btn flat no-caps size="md" label="Já tenho conta" @click="isCreatingUser = !isCreatingUser" color="white" />
            </div>
            <div v-else class="q-gutter-sm column">
                <LoginCard />
                <q-btn color="primary" icon="fa-brands fa-google" label="Entrar com Google" @click="signIn" />
                <q-btn flat no-caps size="md" label="Ainda não tenho conta" @click="isCreatingUser = !isCreatingUser" color="white" />
                <q-btn flat no-caps size="md" label="Esqueci a senha" @click="passwordReset" color="white" />
            </div>
        </div>
        <q-btn
            flat
            no-caps
            size="sm"
            aria-label="Logo por Iconpacks"
            label="Logo por Iconpacks"
            type="a"
            href="https://iconpacks.net/?utm_source=link-attribution&utm_content=8846"
            target="_blank"
            color="white"
        />
    </q-page>
</template>

<script setup>
import { ref } from "vue"
import { useQuasar } from "quasar"
import { GoogleAuthProvider, getAuth, signInWithPopup, sendPasswordResetEmail } from "firebase/auth"

import CreateUserCard from "components/CreateUserCard.vue"
import LoginCard from "components/LoginCard.vue"

const $q = useQuasar()

const isDark = ref($q.dark.isActive)

const isCreatingUser = ref(false)

const provider = new GoogleAuthProvider()

const signIn = () => {
    $q.loading.show()

    signInWithPopup(getAuth(), provider)
        .catch((error) => {
            console.error(error)

            $q.notify({
                type: "negative",
                message: "Erro ao entrar",
                caption: error.message,
            })
        })
        .finally(() => {
            $q.loading.hide()
        })
}

const passwordReset = () => {
    $q.dialog({
        title: "Esqueci a senha",
        message: "Enviar e-mail de recuperação para qual endereço?",
        prompt: {
            model: "",
            isValid: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            type: "text",
        },
        cancel: true,
        persistent: true,
    }).onOk((email) => {
        $q.loading.show()
        sendPasswordResetEmail(getAuth(), email)
            .then(() => {
                $q.notify({
                    type: "positive",
                    message: "E-mail de recuperação enviado",
                })
            })
            .catch((error) => {
                console.error(error)

                $q.notify({
                    type: "negative",
                    message: "Erro ao enviar e-mail de recuperação",
                    caption: error.message,
                })
            })
            .finally(() => {
                $q.loading.hide()
            })
    })
}
</script>
