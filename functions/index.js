
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();
const db = admin.firestore();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL ||
  "https://api-m.sandbox.paypal.com";

/**
 * Test authentication function
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.testAuthV2 = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    console.log("=== TEST AUTH FUNCTION ===");
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
    try {
      // Get Authorization header
      const authHeader = req.headers.authorization;
      let decodedToken = null;
      let hasAuth = false;
      let authError = null;
      // Try to verify Firebase Auth token if present
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const idToken = authHeader.split("Bearer ")[1];
          console.log("Attempting to verify token...");
          decodedToken = await admin.auth().verifyIdToken(idToken);
          hasAuth = true;
          console.log(
              "✅ Token verified successfully for user:",
              decodedToken.uid);
        } catch (error) {
          console.log("❌ Token verification failed:", error.message);
          authError = error.message;
        }
      } else {
        console.log("No Authorization header found");
      }
      // Build response object
      const response = {
        success: true,
        hasAuth: hasAuth,
        timestamp: new Date().toISOString(),
        method: req.method,
        origin: req.headers.origin || "direct-access",
        userAgent: req.headers["user-agent"] || "unknown",
      };
      // Add authentication info if available
      if (hasAuth && decodedToken) {
        response.user = {
          userId: decodedToken.uid,
          email: decodedToken.email || null,
          displayName: decodedToken.name || null,
          emailVerified: decodedToken.email_verified || false,
          provider: (decodedToken.firebase &&
            decodedToken.firebase.sign_in_provider) || "unknown",
        };
        response.tokenInfo = {
          issuer: decodedToken.iss,
          audience: decodedToken.aud,
          issuedAt: new Date(decodedToken.iat * 1000).toISOString(),
          expiresAt: new Date(decodedToken.exp * 1000).toISOString(),
        };
        response.message = "🎉 Authentication working perfectly!";
      } else {
        response.user = null;
        response.message = authError ?
          `❌ Authentication failed: ${authError}` :
          "ℹ️ No authentication token provided";
        if (authError) {
          response.authError = authError;
        }
      }
      // Add request details for debugging
      response.requestDetails = {
        hasAuthHeader: !!authHeader,
        authHeaderFormat: authHeader ?
          (authHeader.startsWith("Bearer ") ?
            "Bearer format" : "Invalid format") :
          "None",
        contentType: req.headers["content-type"] || "none",
        host: req.headers.host,
      };
      console.log("Sending response:", JSON.stringify(response, null, 2));
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Unexpected error in testAuth:", error);
      const errorResponse = {
        success: false,
        error: error.message,
        message: "Internal server error in testAuth function",
        timestamp: new Date().toISOString(),
        hasAuth: false,
        user: null,
      };
      res.status(500).json(errorResponse);
    }
  });
});

/**
 * PayPal webhook handler
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.paypalWebhookV2 = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      console.log("PayPal Webhook received:", req.body);

      const event = req.body;
      const eventType = event.event_type;

      switch (eventType) {
        case "PAYMENT.CAPTURE.COMPLETED":
          await handlePayPalPaymentCompleted(event);
          break;
        case "CHECKOUT.ORDER.APPROVED":
          await handlePayPalOrderApproved(event);
          break;
        default:
          console.log("Unhandled PayPal event type:", eventType);
      }

      res.status(200).send("Webhook processed");
    } catch (error) {
      console.error("Error processing PayPal webhook:", error);
      res.status(500).send("Internal server error");
    }
  });
});

/**
 * Handle PayPal order approved event
 * @param {Object} event - PayPal webhook event
 */
async function handlePayPalOrderApproved(event) {
  try {
    const orderId = event.resource.id;
    const amount = event.resource.purchase_units[0].amount.value;
    const currency = event.resource.purchase_units[0].amount.currency_code;

    console.log("PayPal order approved:", orderId);

    const paymentsRef = db.collection("payments");
    const query = await paymentsRef
        .where("paypalOrderId", "==", orderId).get();

    if (query.empty) {
      console.log("No matching payment record found");
      return;
    }

    const batch = db.batch();
    query.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "approved",
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        amount: parseFloat(amount),
        currency: currency,
      });
    });

    await batch.commit();
    console.log("Payment records updated to approved status");
  } catch (error) {
    console.error("Error handling PayPal order approved:", error);
  }
}

/**
 * Handle PayPal payment completed event
 * @param {Object} event - PayPal webhook event
 */
async function handlePayPalPaymentCompleted(event) {
  try {
    const captureId = event.resource.id;
    const orderId = event.resource.supplementary_data &&
      event.resource.supplementary_data.related_ids ?
      event.resource.supplementary_data.related_ids.order_id : null;
    const amount = event.resource.amount.value;
    const currency = event.resource.amount.currency_code;

    console.log("PayPal payment completed:", captureId);

    const paymentsRef = db.collection("payments");
    const query = await paymentsRef
        .where("paypalOrderId", "==", orderId).get();

    if (query.empty) {
      console.log("No matching payment record found");
      return;
    }

    const batch = db.batch();
    query.docs.forEach((doc) => {
      const docData = doc.data();
      batch.update(doc.ref, {
        status: "completed",
        paypalCaptureId: captureId,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        amount: parseFloat(amount),
        currency: currency,
      });

      if (docData.beatId && docData.userId) {
        const userBeatRef = db.collection("userPurchases")
            .doc(docData.userId + "_" + docData.beatId);
        batch.set(userBeatRef, {
          userId: docData.userId,
          beatId: docData.beatId,
          paymentId: doc.id,
          purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
          paymentMethod: "paypal",
          amount: parseFloat(amount),
          currency: currency,
        });
      }
    });

    await batch.commit();
    console.log("Payment records updated successfully");
  } catch (error) {
    console.error("Error handling PayPal payment completed:", error);
  }
}

/**
 * Create payment record for beat purchase
 * @param {Object} data - Request data
 * @param {Object} context - Function context
 * @return {Object} Payment result
 */
exports.purchaseBeatV2 = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated");
    }

    const {beatId, paypalOrderId, customerInfo} = data;
    const userId = context.auth.uid;

    if (!beatId || !paypalOrderId) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Beat ID and PayPal Order ID are required");
    }

    const beatDoc = await db.collection("beats").doc(beatId).get();
    if (!beatDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Beat not found");
    }

    const existingPurchase = await db.collection("userPurchases")
        .doc(userId + "_" + beatId).get();
    if (existingPurchase.exists) {
      throw new functions.https.HttpsError(
          "already-exists",
          "Beat already purchased");
    }

    const paymentData = {
      userId: userId,
      beatId: beatId,
      customerInfo: customerInfo,
      paymentMethod: "paypal",
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paypalOrderId: paypalOrderId,
    };

    const paymentRef = await db.collection("payments").add(paymentData);

    return {
      success: true,
      paymentId: paymentRef.id,
      status: "pending",
    };
  } catch (error) {
    console.error("Error creating payment record:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to process purchase");
  }
});

/**
 * Health check endpoint
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.healthCheckV2 = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "beat-store-webhooks",
      environment: {
        hasClientId: !!PAYPAL_CLIENT_ID,
        hasClientSecret: !!PAYPAL_CLIENT_SECRET,
        hasWebhookId: !!PAYPAL_WEBHOOK_ID,
        baseUrl: PAYPAL_BASE_URL,
      },
    });
  });
});
