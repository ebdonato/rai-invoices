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
        path: "/pub/",
        component: () => import("layouts/LandingLayout.vue"),
        children: [
            {
                path: "u/:userId/i/:invoiceId",
                component: () => import("pages/InvoicePublicPage.vue"),
                name: "InvoicePublicPage",
                props: true,
            },
            {
                path: "u/:userId/r/:receiptId",
                component: () => import("pages/ReceiptPublicPage.vue"),
                name: "ReceiptPublicPage",
                props: true,
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
                path: "info",
                component: () => import("pages/InfoPage.vue"),
                name: "InfoPage",
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
            {
                path: "receipts",
                component: () => import("pages/ReceiptsPage.vue"),
                name: "ReceiptsPage",
            },
            {
                path: "user",
                component: () => import("pages/UserPage.vue"),
                name: "UserPage",
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
