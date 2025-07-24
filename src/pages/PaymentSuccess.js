
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../firebaseConfig';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get PayPal order ID from URL (PayPal returns this as 'token')
  const paypalOrderId = searchParams.get('token') || searchParams.get('paymentId');
  
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [beatDetails, setBeatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Initialize Cloud Functions
  const functions = getFunctions();
  const getTransactionStatus = httpsCallable(functions, 'getTransactionStatus');

  useEffect(() => {
    if (!paypalOrderId) {
      setError("No payment ID provided. This may be an invalid URL.");
      setLoading(false);
      return;
    }

    checkTransactionStatus();
    
    // Set up polling to check status every 3 seconds for up to 2 minutes
    const pollInterval = setInterval(() => {
      if (!transactionStatus?.status) {
        checkTransactionStatus();
      }
    }, 3000);

    // Clear polling after 2 minutes
    const pollTimeout = setTimeout(() => {
      clearInterval(pollInterval);
    }, 120000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(pollTimeout);
    };
  }, [paypalOrderId]);

  const checkTransactionStatus = async () => {
    if (checkingStatus) return; // Prevent multiple simultaneous calls
    
    try {
      setCheckingStatus(true);
      
      const result = await getTransactionStatus({
        paypalOrderId: paypalOrderId
      });
      
      const transaction = result.data.transaction;
      setTransactionStatus(transaction);
      
      if (transaction) {
        setBeatDetails(transaction.beatInfo);
        
        // If payment is successful and we haven't sent email yet
        if (transaction.status && !emailSent && auth.currentUser?.email) {
          await sendDownloadEmail(auth.currentUser.email, transaction.beatInfo, transaction);
        }
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error("Error checking transaction status:", err);
      setError(err.message || "Unable to verify payment status. Please contact support.");
      setLoading(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const sendDownloadEmail = async (email, beatData, transactionData) => {
    if (sendingEmail) return;
    
    setSendingEmail(true);
    
    try {
      // You can implement this as another Cloud Function or use your existing email service
      const response = await fetch(`https://your-cloud-function-url.cloudfunctions.net/sendDownloadEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          beatName: beatData.title || beatData.name,
          beatArtist: beatData.artist,
          audioUrl: beatData.audioUrl,
          driveLink: beatData.driveLink || beatData.audioUrl,
          transactionId: transactionData.id,
          paypalOrderId: paypalOrderId,
          customerInfo: transactionData.customerInfo
        })
      });

      if (response.ok) {
        setEmailSent(true);
        console.log('Download email sent successfully!');
        
        // Clear cart items since purchase is complete
        localStorage.removeItem("cart");
        localStorage.removeItem("cartItems");
        localStorage.removeItem("totalAmount");
        console.log('Cart cleared after successful payment!');
      } else {
        console.error('Failed to send download email:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending download email:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleManualEmailSend = async () => {
    if (auth.currentUser?.email && beatDetails && transactionStatus) {
      await sendDownloadEmail(auth.currentUser.email, beatDetails, transactionStatus);
    }
  };

  const handleDownload = () => {
    if (beatDetails?.audioUrl) {
      const link = document.createElement('a');
      link.href = beatDetails.audioUrl;
      link.download = `${beatDetails.title || beatDetails.name} - ${beatDetails.artist}.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRefreshStatus = () => {
    setLoading(true);
    checkTransactionStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <h2 className="text-xl">Verifying your payment with PayPal...</h2>
          <p className="text-gray-400 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="bg-gray-900 p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-4">Payment Verification Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleRefreshStatus}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-300"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition duration-300"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment is still processing
  if (!transactionStatus?.status) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="bg-gray-900 p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-yellow-500 mb-4">Payment Processing</h2>
          <p className="text-gray-300 mb-6">
            Your payment is being processed by PayPal. This usually takes a few moments.
          </p>
          
          {transactionStatus && (
            <div className="bg-gray-800 p-4 rounded-lg mb-6 text-left">
              <p><span className="text-gray-400">Transaction ID:</span> <span className="text-white font-mono text-sm">{transactionStatus.id}</span></p>
              <p><span className="text-gray-400">PayPal Order:</span> <span className="text-white font-mono text-sm">{paypalOrderId}</span></p>
              <p><span className="text-gray-400">Status:</span> <span className="text-yellow-500">Processing...</span></p>
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleRefreshStatus}
              disabled={checkingStatus}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-md transition duration-300"
            >
              {checkingStatus ? 'Checking...' : 'Refresh Status'}
            </button>
            <p className="text-sm text-gray-400">
              Status updates automatically every few seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Payment successful
  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center py-10">
      <div className="bg-gray-900 p-8 rounded-lg shadow-md text-center max-w-2xl w-full mx-4">
        <div className="text-green-500 text-6xl mb-6">✅</div>
        
        <h2 className="text-3xl font-bold text-green-500 mb-4">Payment Successful!</h2>
        <p className="text-gray-300 text-lg mb-6">
          Thank you for your purchase! Your payment has been processed successfully.
        </p>

        {/* Transaction Details */}
        {transactionStatus && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6 text-left">
            <h3 className="text-xl font-semibold text-white mb-4">Transaction Details</h3>
            <div className="space-y-2">
              <p><span className="text-gray-400">Transaction ID:</span> <span className="text-white font-mono text-sm">{transactionStatus.id}</span></p>
              <p><span className="text-gray-400">PayPal Order ID:</span> <span className="text-white font-mono text-sm">{paypalOrderId}</span></p>
              <p><span className="text-gray-400">Date:</span> <span className="text-white">{transactionStatus.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}</span></p>
              <p><span className="text-gray-400">Status:</span> <span className="text-green-500 font-semibold">Completed</span></p>
              {transactionStatus.userEmail && (
                <p><span className="text-gray-400">Email:</span> <span className="text-white">{transactionStatus.userEmail}</span></p>
              )}
            </div>
          </div>
        )}

        {/* Beat Details */}
        {beatDetails && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6 text-left">
            <h3 className="text-xl font-semibold text-white mb-4">Your Purchase</h3>
            <div className="flex items-center space-x-4">
              {beatDetails.imageUrl && (
                <img 
                  src={beatDetails.imageUrl} 
                  alt={beatDetails.title || beatDetails.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="text-white font-semibold text-lg">{beatDetails.title || beatDetails.name}</p>
                <p className="text-gray-400">by {beatDetails.artist}</p>
                <p className="text-green-500 font-semibold">${beatDetails.price}</p>
              </div>
            </div>
          </div>
        )}

        {/* Download Section */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Download Your Beat</h3>
          
          {emailSent ? (
            <div className="text-green-500 mb-4">
              ✅ Download link has been sent to your email!
            </div>
          ) : sendingEmail ? (
            <div className="text-blue-500 mb-4">
              📧 Sending download link to your email...
            </div>
          ) : (
            <div className="text-yellow-500 mb-4">
              📧 Click below to send download link to your email.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
            >
              <span className="mr-2">⬇️</span> Download Now
            </button>

            {auth.currentUser?.email && (
              <button
                onClick={handleManualEmailSend}
                disabled={sendingEmail}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">📧</span> 
                {sendingEmail ? 'Sending...' : 'Send to Email'}
              </button>
            )}
          </div>

          <p className="text-gray-400 text-sm mt-4">
            <b>Note:</b> Your purchase receipt and download links will be sent to your email.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/beats')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Back to Home
          </button>
        </div>

        {/* Support Information */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm">
            Having trouble? Contact support with your transaction ID: 
            <span className="text-white font-mono ml-1">{transactionStatus?.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
