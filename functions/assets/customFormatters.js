const cleanText = (text = "") => text.toString().replace(/[^0-9]+/g, "")

const formatCPF = (text) => text.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "CPF: $1.$2.$3-$4")

const formatCNPJ = (text) => text.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "CNPJ: $1.$2.$3/$4-$5")

const formatCPForCNPJ = (text) => {
    const cleanedText = cleanText(text)
    const isCPF = cleanedText.length <= 11

    return isCPF ? formatCPF(cleanedText) : formatCNPJ(cleanedText)
}

const formatPhone8Digits = (text) => text.replace(/(\d{2})(\d{4})(\d{4})/g, "($1) $2-$3")

const formatPhone9Digits = (text) => text.replace(/(\d{2})(\d{5})(\d{4})/g, "($1) $2-$3")

const formatPhone = (text) => {
    const cleanedText = cleanText(text)

    return cleanedText.length >= 11 ? formatPhone9Digits(cleanedText) : formatPhone8Digits(cleanedText)
}

const numberCurrencyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

const formatCurrency = (value) => numberCurrencyFormat.format(value)

const numberFormat = new Intl.NumberFormat("pt-BR")

const formatNumber = (value) => numberFormat.format(value)

const formatReverseDate = (value) => {
    const [day, month, year] = value.split("/")

    return `${year}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`
}

module.exports = {
    formatCPForCNPJ,
    formatPhone,
    formatCurrency,
    formatNumber,
    formatReverseDate,
}
