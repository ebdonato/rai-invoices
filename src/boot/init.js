import { boot } from "quasar/wrappers"
import { LocalStorage, Dark, AddressbarColor, getCssVar } from "quasar"

const initPrimary = getCssVar("primary")
const initAccent = getCssVar("accent")

export const updateAddressbarColors = (isDark = false) => {
    AddressbarColor.set(isDark ? initAccent : initPrimary)
}

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(() => {
    const isDark = !!LocalStorage.getItem("isDark")

    Dark.set(isDark)

    updateAddressbarColors(isDark)
})
