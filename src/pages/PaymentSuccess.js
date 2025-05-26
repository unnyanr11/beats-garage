import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../firebase';

const db = getFirestore(app);

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isValidPayment, setIsValidPayment] = useState(false);
  const paymentId = new URLSearchParams(location.search).get('paymentId');

  useEffect(() => {
    const validatePayment = async () => {
      if (paymentId) {
        try {
          // Reference to the payment document in Firestore
          const paymentRef = doc(db, "payments", paymentId);
          const paymentSnap = await getDoc(paymentRef);

          if (paymentSnap.exists()) {
            // Payment ID is valid, proceed to display success message
            setIsValidPayment(true);

            const paymentData = paymentSnap.data();
            const productId = paymentData.productId;

            // Fetch product details
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
                    localStorage.removeItem("cartItems");
                    console.log('Cart cleared successfully after payment!');
                  }
                };

                await sendEmail(userEmail, driveLink);
              } else {
                console.warn("User email or drive link not available.");
              }
            } else {
              console.log("No such product!");
            }
          } else {
            // Payment ID is invalid, redirect to error page or home page
            console.warn("Invalid payment ID. Redirecting...");
            navigate('/'); // Redirect to home page or error page
          }
        } catch (error) {
          console.error("Error validating payment:", error);
          navigate('/'); // Redirect to home page or error page
        }
      } else {
        // No payment ID, redirect to error page or home page
        console.warn("No payment ID. Redirecting...");
        navigate('/'); // Redirect to home page or error page
      }
    };

    validatePayment();
  }, [paymentId, navigate]);

  if (!isValidPayment) {
    return null; // Optionally display a loading indicator while validating
  }

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