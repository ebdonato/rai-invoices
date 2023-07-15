const { initializeApp, cert } = require("firebase-admin/app")
const { getFirestore, FieldValue } = require("firebase-admin/firestore")
const removeAccents = require("remove-accents")

const serviceAccount = require("./serviceAccountKey.json")

initializeApp({
    credential: cert(serviceAccount),
})

const db = getFirestore()

const usersCollectionRef = db.collection("users")

const updateCustomersForUser = async (userId) => {
    const userRef = usersCollectionRef.doc(userId)
    const customersCollectionRef = userRef.collection("customers")
    const customersQuerySnapshot = await customersCollectionRef.get()

    const batch = db.batch()

    customersQuerySnapshot.forEach((customerDoc) => {
        const customerName = customerDoc.get("name")
        const createdAt = customerDoc.get("createdAt")

        batch.update(customerDoc.ref, { searchableCustomerName: removeAccents(customerName).toLowerCase(), createdAt: createdAt || FieldValue.serverTimestamp() })
    })

    await batch.commit()

    console.log(`Customers updated for user ${userId}`)
}

const updateInvoicesForUser = async (userId) => {
    const userRef = usersCollectionRef.doc(userId)
    const invoicesCollectionRef = userRef.collection("invoices")
    const invoicesQuerySnapshot = await invoicesCollectionRef.get()

    const batch = db.batch()

    invoicesQuerySnapshot.forEach((invoiceDoc) => {
        const invoiceName = invoiceDoc.get("customer.name")
        const createdAt = invoiceDoc.get("createdAt")

        batch.update(invoiceDoc.ref, { searchableCustomerName: removeAccents(invoiceName).toLowerCase(), createdAt: createdAt || FieldValue.serverTimestamp() })
    })

    await batch.commit()

    console.log(`Invoices updated for user ${userId}`)
}

const updateReceiptsForUser = async (userId) => {
    const userRef = usersCollectionRef.doc(userId)
    const receiptsCollectionRef = userRef.collection("receipts")
    const receiptsQuerySnapshot = await receiptsCollectionRef.get()

    const batch = db.batch()

    receiptsQuerySnapshot.forEach((receiptDoc) => {
        const receiptName = receiptDoc.get("customer.name")
        const createdAt = receiptDoc.get("createdAt")

        batch.update(receiptDoc.ref, { searchableCustomerName: removeAccents(receiptName).toLowerCase(), createdAt: createdAt || FieldValue.serverTimestamp() })
    })

    await batch.commit()

    console.log(`Receipts updated for user ${userId}`)
}

// Function to update all users
const updateAllUsers = async () => {
    try {
        const usersQuerySnapshot = await usersCollectionRef.get()

        usersQuerySnapshot.forEach((userDoc) => {
            console.log("🚀 userDoc:", userDoc.id)
            updateCustomersForUser(userDoc.id)
            updateInvoicesForUser(userDoc.id)
            updateReceiptsForUser(userDoc.id)
        })
    } catch (error) {
        console.error("Error updating invoices:", error)
    }
}

// Call the update function for all users
updateAllUsers()
