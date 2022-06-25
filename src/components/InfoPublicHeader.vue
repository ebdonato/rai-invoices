<template>
    <q-card flat bordered :dark="false" class="print-card">
        <div v-if="isLoading" class="text-center">
            <q-circular-progress indeterminate size="50px" :thickness="0.22" color="grey-6" track-color="grey-3" class="q-ma-md" />
        </div>
        <q-card-section v-else class="q-pa-xs">
            <div class="row q-gutter-sm">
                <div class="col-grow text-h5">{{ info.fantasyName || info.name }}</div>
                <div class="self-end" v-if="info.fantasyName">{{ info.name }}</div>
                <div class="self-end" v-if="info.nationalRegistration">{{ info.person == "legal" ? "CNPJ" : "CPF" }}: {{ formatCPForCNPJ(info.nationalRegistration) }}</div>
            </div>
            <div class="row q-gutter-sm">
                <div class="row col" v-if="info.addressLine1 || info.addressLine2 || info.city || info.state">
                    <div class="q-mr-sm">
                        <q-icon name="business" />
                    </div>
                    <div>
                        <div>{{ info.addressLine1 }}<span v-if="info.addressLine1 && info.addressLine2"> - </span>{{ info.addressLine2 }}</div>
                        <div>{{ info.city }}<span v-if="info.city && info.state"> - </span>{{ info.state }}</div>
                    </div>
                </div>
                <div class="col">
                    <div class="text-right" v-if="info.phone"><q-icon name="perm_phone_msg" class="q-mr-sm" /> {{ formatPhone(info.phone) }}</div>
                    <div class="text-right" v-if="info.email"><q-icon name="mail" class="q-mr-sm" /> {{ info.email }}</div>
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

const emit = defineEmits(["error"])

const isLoading = ref(true)

const db = getFirestore($q.firebaseApp)

const info = reactive({})

const getInfo = async () => {
    const docRef = doc(db, "users", props.userId)

    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        Object.assign(info, docSnap.data())

        if (!info.name) {
            throw new Error("Informações não encontradas")
        }
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
</script>
