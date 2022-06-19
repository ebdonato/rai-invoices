<template>
    <q-page class="flex flex-center">
        <div class="row q-ma-sm q-gutter-sm justify-center">
            <q-btn class="button" no-caps color="primary" icon="store" label="Clientes" size="xl" :to="{ name: 'CustomersPage' }" />
            <q-btn class="button" no-caps color="primary" icon="receipt" label="Orçamentos" size="xl" :to="{ name: 'InvoicesPage' }" />
            <q-btn class="button" no-caps color="primary" icon="alternate_email" label="Info" size="xl" :to="{ name: 'InfoPage' }" />
        </div>
    </q-page>
</template>

<style lang="scss" scoped>
.button {
    width: 250px;
    height: 250px;
}
</style>
