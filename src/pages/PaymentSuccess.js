import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../firebase'; // Correct import for the default export

const db = getFirestore(app);

const PaymentSuccess = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('productId');

  useEffect(() => {
    const sendEmailWithDriveLink = async () => {
      if (productId) {
        try {
          const productRef = doc(db, "products", productId);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const productData = productSnap.data();
            const driveLink = productData.driveLink;

            const userEmail = localStorage.getItem('userEmail');

            if (userEmail && driveLink) {
              const sendEmail = async (email, link) => {
                const response = await fetch(`https://your-cloud-function-url.cloudfunctions.net/sendEmail?email=${email}&driveLink=${link}`);
                if (!response.ok) {
                  console.error('Failed to send email:', response.statusText);
                } else {
                  console.log('Email sent successfully!');

                  // Clear the cart after payment confirmation and email sending
                  localStorage.removeItem("cartItems"); // Clear the cart
                  console.log('Cart cleared successfully after payment!'); // Debugging
                }
              };

              await sendEmail(userEmail, driveLink);
            } else {
              console.warn("User email or drive link not available.");
            }
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching product or sending email:", error);
        }
      }
    };

    sendEmailWithDriveLink();
  }, [productId]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center py-20">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h2 className="text-3xl font-semibold text-green-600 mb-4">Payment Successful!</h2>
        <p className="text-gray-700 text-lg mb-6">
          Thank you for your order! Your payment has been processed successfully.
        </p>
        <p className="text-gray-700 text-lg mb-6">
          <b>Your purchase will be delivered via mail.</b>
        </p>
        <a
          href="/"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg transition duration-300"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess;