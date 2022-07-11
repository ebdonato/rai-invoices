import { AddressbarColor, getCssVar } from "quasar"

const initSecondary = getCssVar("secondary")
const initAccent = getCssVar("accent")

export const updateAddressbarColors = (isDark = false) => {
    AddressbarColor.set(isDark ? initAccent : initSecondary)
}
