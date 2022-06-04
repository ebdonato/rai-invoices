<template>
    <q-page class="flex flex-center">
        <div class="q-gutter-sm">
            <q-btn color="primary" class="button" :to="{ name: 'CustomersPage' }">
                <q-icon left size="3em" name="store" />
                <div>Clientes</div>
            </q-btn>
            <q-btn color="primary" class="button" :to="{ name: 'InvoicesPage' }">
                <q-icon left size="3em" name="receipt" />
                <div>Recibos</div>
            </q-btn>
        </div>
    </q-page>
</template>

<style lang="scss" scoped>
.button {
    width: 170px;
}
</style>
