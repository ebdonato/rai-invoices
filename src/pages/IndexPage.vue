<template>
    <q-page class="flex flex-center">
        <div class="column q-ma-sm q-gutter-sm justify-center">
            <q-btn unelevated color="primary" :to="{ name: 'CustomersPage' }" class="button">
                <q-icon left size="3em" name="store" />
                <div class="col-grow">Clientes</div>
            </q-btn>
            <q-btn unelevated color="primary" :to="{ name: 'InvoicesPage' }" class="button">
                <q-icon left size="3em" name="receipt" />
                <div class="col-grow">Orçamentos</div>
            </q-btn>
            <q-btn unelevated color="primary" :to="{ name: 'InfoPage' }" class="button">
                <q-icon left size="3em" name="alternate_email" />
                <div class="col-grow">Info</div>
            </q-btn>
        </div>
    </q-page>
</template>

<style lang="scss" scoped>
.button {
    width: 250px;
}
</style>
