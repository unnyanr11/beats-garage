const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onPaymentCreate = functions.firestore
  .document('payments/{paymentId}')
  .onCreate(async (snap) => {
    const paymentData = snap.data();
    const id = paymentData.id;

    try {
      const beatRef = admin.firestore().collection('beats').doc(id);
      await beatRef.update({ isAvailable: false });
      console.log(`Successfully updated isAvailable to false for beat ${id}`);
    } catch (error) {
      console.error(`Error updating isAvailable for beat ${id}:`, error);
    }
  });