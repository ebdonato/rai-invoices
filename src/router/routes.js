const routes = [
    {
        path: "/",
        component: () => import("layouts/LandingLayout.vue"),
        children: [
            {
                path: "",
                component: () => import("pages/LoginPage.vue"),
                name: "LoginPage",
            },
        ],
    },

    {
        path: "/main",
        component: () => import("layouts/MainLayout.vue"),
        children: [
            {
                path: "",
                component: () => import("pages/IndexPage.vue"),
                name: "IndexPage",
            },
            {
                path: "customers",
                component: () => import("pages/CustomersPage.vue"),
                name: "CustomersPage",
            },
            {
                path: "invoices",
                component: () => import("pages/InvoicesPage.vue"),
                name: "InvoicesPage",
            },
            {
                path: "invoice/:id?",
                component: () => import("pages/InvoicePage.vue"),
                name: "InvoicePage",
                props: true,
            },
        ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: "/:catchAll(.*)*",
        component: () => import("pages/ErrorNotFound.vue"),
    },
]

export default routes
