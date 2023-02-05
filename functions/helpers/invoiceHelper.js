const carbone = require("carbone")

const { formatCPForCNPJ, formatReverseDate, formatPhone, formatCurrency } = require("../assets/customFormatters")

module.exports = {
    enhanceUser: function (user) {
        if (user?.nationalRegistration) {
            user.nationalRegistration = formatCPForCNPJ(user.nationalRegistration)
        }

        if (user?.phone) {
            user.phone = formatPhone(user.phone)
        }

        return user
    },
    enhanceInvoice: function (invoice) {
        if (invoice?.customer?.nationalRegistration) {
            invoice.customer.nationalRegistration = formatCPForCNPJ(invoice.customer.nationalRegistration)
        }

        if (invoice?.date) {
            invoice.reverseDate = formatReverseDate(invoice.date)
        } else {
            invoice.reverseDate = "0000.00.00"
        }

        if (invoice?.items) {
            invoice.items = invoice.items.map((item, index) => ({ ...item, index: index + 1, valueTotal: +item.quantity * +item.value }))

            invoice.itemsTotal = formatCurrency(invoice.items.reduce((acc, item) => (acc += +item.valueTotal), 0))

            invoice.items = invoice.items.map((item) => ({ ...item, value: formatCurrency(item.value), valueTotal: formatCurrency(item.valueTotal) }))
        }

        return invoice
    },
    renderInvoice: function (data) {
        const options = {
            reportName: "Invoice_{d.invoice.reverseDate}_{d.invoice.id}.docx",
        }

        return new Promise((resolve, reject) => {
            carbone.render("./assets/invoice.docx", data, options, function (error, result, reportName) {
                if (error) {
                    reject(error)
                }

                resolve({ reportName, result })
            })
        })
    },
}
