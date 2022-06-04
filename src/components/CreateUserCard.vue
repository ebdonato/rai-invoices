<template>
    <q-form @submit="onSubmit" @reset="onReset">
        <q-card>
            <q-card-section class="bg-primary text-white">
                <div class="text-h6">Registrar</div>
            </q-card-section>

            <q-card-section class="q-gutter-sm">
                <q-input
                    outlined
                    v-model="email"
                    label="E-mail"
                    :rules="[(val) => !!val || 'Campo Obrigatório', (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'E-mail Inválido']"
                />
                <q-input
                    outlined
                    v-model="password"
                    label="Senha"
                    :type="isPwd ? 'password' : 'text'"
                    :rules="[(val) => !!val || 'Campo Obrigatório', (val) => val.length >= 6 || 'Mínimo 6 caracteres']"
                >
                    <template v-slot:append>
                        <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
                    </template>
                </q-input>
                <q-input
                    outlined
                    v-model="passwordConfirmation"
                    label="Confirmação de Senha"
                    :type="isPwd ? 'password' : 'text'"
                    :rules="[(val) => val === password || 'Senha e Confirmação não batem']"
                >
                    <template v-slot:append>
                        <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
                    </template>
                </q-input>
            </q-card-section>

            <q-separator />

            <q-card-actions>
                <q-btn type="reset" color="primary" class="default-button">Limpar</q-btn>
                <q-space />
                <q-btn type="submit" color="primary" class="default-button">Criar</q-btn>
            </q-card-actions>
        </q-card>
    </q-form>
</template>

<script setup>
import { ref } from "vue"
import { useQuasar } from "quasar"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"

const $q = useQuasar()

const email = ref("")
const password = ref("")
const passwordConfirmation = ref("")
const isPwd = ref(true)

const onSubmit = () => {
    createUserWithEmailAndPassword(getAuth(), email.value, password.value).catch((error) => {
        console.error(error)
        $q.notify({
            type: "negative",
            message: "Erro ao criar usuário",
            caption: error.message,
        })
    })
}

const onReset = () => {
    email.value = ""
    password.value = ""
    passwordConfirmation.value = ""
}
</script>
