import { boot } from "quasar/wrappers"
import { LocalStorage, Dark, AddressbarColor, getCssVar } from "quasar"
import Vue3Sanitize from "vue-3-sanitize"

const initSecondary = getCssVar("secondary")
const initAccent = getCssVar("accent")

export const updateAddressbarColors = (isDark = false) => {
    AddressbarColor.set(isDark ? initAccent : initSecondary)
}

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }) => {
    app.use(Vue3Sanitize)

    const isDark = !!LocalStorage.getItem("isDark")

    Dark.set(isDark)

    updateAddressbarColors(isDark)
})
