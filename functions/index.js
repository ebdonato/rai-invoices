const functions = require("firebase-functions")
const admin = require("firebase-admin")

const { enhanceInvoice, enhanceUser, renderInvoice } = require("./helpers/invoiceHelper")

admin.initializeApp()

const store = admin.firestore()

const getDocData = async (collectionPath, docId) => {
    functions.logger.info({ collectionPath, docId }, { structuredData: true })
    try {
        const docSnap = await store.collection(collectionPath).doc(docId).get()

        if (docSnap.exists) {
            functions.logger.info(docSnap.data(), { structuredData: true })

            return { ...docSnap.data(), id: docId }
        } else {
            functions.logger.warn("Doc not found", { structuredData: true })

            return null
        }
    } catch (error) {
        functions.logger.error(error)

        throw error
    }
}

exports.invoice = functions.https.onRequest(async (request, response) => {
    functions.logger.info("Render invoice", { structuredData: true })

    const { userId, docId: invoiceId } = request.query

    functions.logger.info({ userId, invoiceId }, { structuredData: true })

    try {
        functions.logger.info("Retrieving User Info", { structuredData: true })

        const user = await getDocData("users", userId)

        if (!user) {
            response.status(404).send({ message: "User not found" })

            return
        }

        functions.logger.info("Retrieving Invoice Info", { structuredData: true })

        const invoice = await getDocData(`users/${userId}/invoices`, invoiceId)

        if (!invoice) {
            response.status(404).send({ message: "Invoice not found" })

            return
        }

        enhanceUser(user)

        enhanceInvoice(invoice)

        const { reportName, result } = await renderInvoice({ user, invoice })

        functions.logger.info(`Send file: ${reportName} `, { structuredData: true })

        response.writeHead(200, {
            "Content-Length": Buffer.byteLength(result),
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename=${reportName}`,
        })

        response.write(result, "binary")

        response.end(null, "binary")
    } catch (error) {
        functions.logger.error(error)

        response.status(500).send(error.message)
    }
})
