const cleanText = (text = "") => text.toString().replace(/[^0-9]+/g, "")

export const formatCPF = (text) => text.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4")

export const formatCNPJ = (text) => text.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5")

export const formatCPForCNPJ = (text) => {
    const cleanedText = cleanText(text)
    return cleanedText.length <= 11 ? formatCPF(cleanedText) : formatCNPJ(cleanedText)
}

export const formatPhone8Digits = (text) => text.replace(/(\d{2})(\d{4})(\d{4})/g, "($1) $2-$3")

export const formatPhone9Digits = (text) => text.replace(/(\d{2})(\d{5})(\d{4})/g, "($1) $2-$3")

export const formatPhone = (text) => {
    const cleanedText = cleanText(text)
    return cleanedText.length >= 11 ? formatPhone9Digits(cleanedText) : formatPhone8Digits(cleanedText)
}

export const formatLocal = (city, state) => (city && state ? `${city}/${state}` : "")

const numberCurrencyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

const numberFormat = new Intl.NumberFormat("pt-BR")

export const formatCurrency = (value) => numberCurrencyFormat.format(value)

export const formatNumber = (value) => numberFormat.format(value)
