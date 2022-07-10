<template>
    <q-card flat bordered :dark="false" class="print-card">
        <div v-if="isLoading" class="text-center">
            <q-circular-progress indeterminate size="50px" :thickness="0.22" color="grey-6" track-color="grey-3" class="q-ma-md" />
        </div>
        <q-card-section v-else class="row q-pa-none">
            <div v-if="info.logoUrl" class="column q-mx-xs justify-center" style="min-width: 70px; max-height: 95px" :class="{ 'col-grow': isLogoWider }">
                <q-img :src="info.logoUrl" fit="contain" class="rounded-borders" @load="onLoad"></q-img>
            </div>
            <div class="col-grow row q-mx-xs">
                <div class="column col justify-between">
                    <div class="text-h5">{{ info.fantasyName || info.name }}</div>
                    <div class="row no-wrap" v-if="info.addressLine1 || info.addressLine2">
                        <div class="q-mr-sm">
                            <q-icon name="business" />
                        </div>
                        <div>
                            <div>{{ info.addressLine1 }}</div>
                            <div>{{ info.addressLine2 }}</div>
                        </div>
                    </div>
                    <div class="row no-wrap" v-if="info.city || info.state">
                        <div class="q-mr-sm">
                            <q-icon name="map" />
                        </div>
                        <div>
                            <div>{{ info.city }}<span v-if="info.city && info.state"> - </span>{{ info.state }}</div>
                        </div>
                    </div>
                </div>
                <div class="column col justify-between">
                    <div class="text-right" v-if="info.nationalRegistration">{{ info.person == "legal" ? "CNPJ" : "CPF" }}: {{ formatCPForCNPJ(info.nationalRegistration) }}</div>
                    <div class="text-right" v-if="info.fantasyName">{{ info.name }}</div>
                    <div class="text-right" v-if="info.email"><q-icon name="mail" class="q-mr-sm" /> {{ info.email }}</div>
                    <div class="text-right" v-if="info.phone"><q-icon name="perm_phone_msg" class="q-mr-sm" /> {{ formatPhone(info.phone) }}</div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { reactive, ref } from "vue"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { formatCPForCNPJ, formatPhone } from "assets/customFormatters"
import { useQuasar } from "quasar"

const $q = useQuasar()

const props = defineProps({
    userId: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(["error", "username"])

const isLoading = ref(true)

const db = getFirestore($q.firebaseApp)

const info = reactive({})

const getInfo = async () => {
    const docRef = doc(db, "users", props.userId)

    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        Object.assign(info, docSnap.data())

        info.logoUrl ||= "logo.svg"

        if (!info.name) {
            throw new Error("Informações não encontradas")
        }

        emit("username", info.fantasyName || info.name)
    } else {
        // doc.data() will be undefined in this case
        throw new Error("Informações não existem")
    }
}

const loadData = async () => {
    try {
        await getInfo()
    } catch (error) {
        console.error(error)
        emit("error", error.message)
        $q.notify({
            type: "negative",
            message: "Erro ao obter dados",
            caption: error.message,
        })
    } finally {
        isLoading.value = false
    }
}

loadData()

const isLogoWider = ref(true)

const onLoad = (src) => {
    const img = new Image()
    img.src = src
    img.onload = function () {
        isLogoWider.value = this.width > this.height
    }
}
</script>
