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
        <div class="column align-center">
            <div class="text-center q-mb-sm">
                <img alt="Logo" src="logo.png" style="width: 100px; height: 100px" />
            </div>
            <q-btn color="primary" icon="login" label="Entrar" @click="signIn" />
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
        />
    </q-page>
</template>

<script>
import { defineComponent, ref } from "vue"
import { useQuasar } from "quasar"
import { useRouter } from "vue-router"
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"

export default defineComponent({
    name: "LoginPage",
    setup() {
        const $q = useQuasar()

        const router = useRouter()

        const isDark = ref($q.dark.isActive)

        const provider = new GoogleAuthProvider()
        const auth = getAuth()
        const signIn = () => {
            signInWithPopup(auth, provider)
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

        return {
            isDark,

            signIn,
        }
    },
})
</script>
