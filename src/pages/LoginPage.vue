<template>
    <q-page
        class="flex flex-center column justify-between"
        :class="{
            'bg-light': !isDark,
            'bg-dark': isDark,
        }"
        padding=""
    >
        <div class="text-h4 text-white">Recibos do Rainério</div>
        <div class="column align-center medium">
            <div v-if="isCreatingUser" class="q-gutter-sm column">
                <CreateUserCard />
                <q-btn flat no-caps size="md" label="Já tenho conta" @click="isCreatingUser = !isCreatingUser" color="white" />
            </div>
            <div v-else class="q-gutter-sm column">
                <LoginCard />
                <q-btn color="primary" icon="fa-brands fa-google" label="Entrar com Google" @click="signIn" />
                <q-btn flat no-caps size="md" label="Ainda não tenho conta" @click="isCreatingUser = !isCreatingUser" color="white" />
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
import { useRouter } from "vue-router"
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"

import CreateUserCard from "components/CreateUserCard.vue"
import LoginCard from "components/LoginCard.vue"

const $q = useQuasar()

const router = useRouter()

const isDark = ref($q.dark.isActive)

const isCreatingUser = ref(false)

const provider = new GoogleAuthProvider()

const signIn = () => {
    signInWithPopup(getAuth(), provider)
        .then(() => {
            router.push({ name: "IndexPage" })
        })
        .catch((error) => {
            console.error(error)
            $q.notify({
                type: "negative",
                message: "Erro ao entrar",
                caption: error.message,
            })
        })
}
</script>
