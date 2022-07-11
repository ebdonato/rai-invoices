<template>
    <q-page padding class="column justify-center content-center q-gutter-sm">
        <q-card class="big">
            <q-card-section class="row justify-between bg-primary text-white">
                <div class="text-h6">Perfil</div>
                <q-avatar v-if="photoURL">
                    <img :src="photoURL" referrerpolicy="no-referrer" />
                </q-avatar>
            </q-card-section>
            <q-card-section class="row q-gutter-md justify-center">
                <q-field v-if="displayName" outlined label="Nome" stack-label class="col-sm-5 col-11" disable>
                    <template v-slot:control>
                        <div class="self-center full-width no-outline" tabindex="0">{{ displayName }}</div>
                    </template>
                </q-field>
                <q-field outlined label="E-mail" stack-label class="col-sm-5 col-11" disable>
                    <template v-slot:control>
                        <div class="self-center full-width no-outline" tabindex="0">{{ email }}</div>
                    </template>
                </q-field>
            </q-card-section>
        </q-card>

        <q-card class="big" v-if="isPasswordProvider">
            <q-form @submit="onSubmit">
                <q-card-section class="bg-primary text-white">
                    <div class="text-h6">Alterar Senha</div>
                </q-card-section>

                <q-card-section class="row q-gutter-md justify-center">
                    <q-input
                        outlined
                        v-model="password"
                        label="Senha"
                        :type="isPwd ? 'password' : 'text'"
                        :rules="[(val) => !!val || 'Campo Obrigatório', (val) => val.length >= 6 || 'Mínimo 6 caracteres']"
                        class="col-sm-5 col-11"
                        @update:model-value="touched = true"
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
                        class="col-sm-5 col-11"
                        @update:model-value="touched = true"
                    >
                        <template v-slot:append>
                            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
                        </template>
                    </q-input>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn color="primary" class="default-button" :disable="!touched" type="submit">Alterar</q-btn>
                </q-card-actions>
            </q-form>
        </q-card>
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <div class="q-gutter-sm">
                <q-btn fab icon="arrow_back" color="primary" :to="{ name: 'IndexPage' }" />
            </div>
        </q-page-sticky>
    </q-page>
</template>

<script setup>
import { ref } from "vue"
import { useQuasar } from "quasar"
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"

const $q = useQuasar()

const password = ref("")
const passwordConfirmation = ref("")
const isPwd = ref(true)
const touched = ref(false)
const isPasswordProvider = ref(false)

const user = getAuth().currentUser
const { email, displayName, photoURL } = user

user.getIdTokenResult().then((idTokenResult) => {
    const currentProvider = idTokenResult.signInProvider
    isPasswordProvider.value = currentProvider === "password"
})

const onSubmit = () => {
    $q.dialog({
        title: "Altera Senha",
        message: "Senha atual?",
        prompt: {
            model: "",
            isValid: (val) => val.length >= 6,
            type: "password",
        },
        cancel: true,
        persistent: true,
    }).onOk((currentPassword) => {
        const credential = EmailAuthProvider.credential(email, currentPassword)

        $q.loading.show()

        reauthenticateWithCredential(user, credential)
            .then(() => updatePassword(user, password.value))
            .then(() => {
                $q.notify({
                    type: "positive",
                    message: "Senha alterada",
                })
                reset()
            })
            .catch((error) => {
                console.error(error)
                $q.notify({
                    type: "negative",
                    message: "Erro ao atualizar senha",
                    caption: error.message,
                })
            })
            .finally(() => {
                $q.loading.hide()
            })
    })
}

const reset = () => {
    password.value = ""
    passwordConfirmation.value = ""
    touched.value = false
}
</script>
