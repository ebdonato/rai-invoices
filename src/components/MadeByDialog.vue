<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card>
            <q-card-section class="row justify-between">
                <div class="text-h6">Feito com 💛 por:</div>
                <div class="row text-caption content-center">{{ version }}</div>
            </q-card-section>
            <q-card-section>
                <q-item>
                    <q-item-section avatar>
                        <q-avatar size="100px">
                            <img src="~assets/eu.jpg" />
                        </q-avatar>
                    </q-item-section>

                    <q-item-section>
                        <q-item-label class="text-h5">Eduardo DONATO</q-item-label>
                        <q-item-label caption>Desenvolvedor Full Stack</q-item-label>
                    </q-item-section>
                </q-item>
            </q-card-section>

            <q-separator inset />

            <q-card-actions align="right">
                <q-btn color="primary" icon="eva-linkedin" aria-label="LinkedIn" type="a" href="https://www.linkedin.com/in/ebdonato/" target="_blank">
                    <q-tooltip :delay="1000"> linkedin.com/in/ebdonato </q-tooltip>
                </q-btn>
                <q-btn color="primary" icon="eva-github" aria-label="Github" type="a" href="https://www.github.com/ebdonato/" target="_blank">
                    <q-tooltip :delay="1000"> github.com/ebdonato </q-tooltip>
                </q-btn>
                <q-btn color="primary" icon="eva-globe" aria-label="Site Pessoal" type="a" href="https://mono.direct/ebdonato" target="_blank">
                    <q-tooltip :delay="1000"> Contatos </q-tooltip>
                </q-btn>
                <q-space />
                <q-btn color="primary" label="OK" @click="onOKClick" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import { useDialogPluginComponent } from "quasar"
import pkg from "../../package.json"

export default {
    emits: [...useDialogPluginComponent.emits],

    setup() {
        const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

        return {
            version: `v${pkg.version}`,
            dialogRef,
            onDialogHide,
            onOKClick() {
                onDialogOK()
            },
        }
    },
}
</script>
