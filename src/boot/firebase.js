import { boot } from "quasar/wrappers"
import { Notify } from "quasar"
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged } from "firebase/auth"
// import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
    apiKey: "AIzaSyC-Xsenp_zJsVgp01LZsTnJDGa-jWnnOyY",
    authDomain: "rainerio-invoices.firebaseapp.com",
    projectId: "rainerio-invoices",
    storageBucket: "rainerio-invoices.appspot.com",
    messagingSenderId: "586721007682",
    appId: "1:586721007682:web:8c0dc7e991f4aa8434f5db",
    measurementId: "G-X1MNYGDXN4",
}

const publicRoutesName = ["InvoicePublicPage", "ReceiptPublicPage"]

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app, router }) => {
    router.beforeEach((to, from, next) => {
        const user = firebaseAuth.currentUser

        if (publicRoutesName.includes(to.name)) {
            next()
            return
        }

        // acessar rota Login quando tem usuário, é cancelada a navegação
        // caso seja a rota de entrada, é redirecionado para Index
        if (user && to.name == "LoginPage") {
            next({ name: "IndexPage" })
            return
        }

        // acessar rota privada quando não tem usuário, é redirecionado para Login
        if (!user && to.name != "LoginPage") {
            app.redirectTo = to.fullPath ?? "/main"
            next({ name: "LoginPage" })
            return
        }

        // demais situações, navega normalmente
        next()
    })

    app.firebaseApp = initializeApp(firebaseConfig)
    // getAnalytics(firebaseApp)

    const firebaseAuth = getAuth()

    onAuthStateChanged(firebaseAuth, (user) => {
        const atPublicRoute = publicRoutesName.includes(router.currentRoute.value.name)

        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            Notify.create({
                type: "info",
                message: `Olá ${user.displayName ?? user.email}`,
            })

            !atPublicRoute &&
                router.push(app.redirectTo ?? "/main").then(() => {
                    app.redirectTo = null
                })
        } else {
            !atPublicRoute && router.push("/")
        }
    })
})
