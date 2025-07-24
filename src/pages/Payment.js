
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import app from "../firebaseConfig";
import React, { useState, useEffect, useCallback } from "react";

// Currency Freaks API Key
const API_KEY = "b86a6db6f2b340f2891c19a3e91e781f";

const Payment = () => {
    const [user, loading] = useAuthState(auth);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        billingAddress: "",
        otherAddress: "",
        contactNumber: "",
        currency: "USD",
        paymentMode: "PayPal",
        countryCode: "+1",
    });

    const [countryList, setCountryList] = useState([]);
    const [checkoutAmount, setCheckoutAmount] = useState(0);
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [errors, setErrors] = useState({});
    const [rates, setRates] = useState({});
    const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Firebase Functions setup
    const functions = getFunctions(app);
    const purchaseBeatV2 = httpsCallable(functions, 'purchaseBeatV2');
    
    // Authentication test function
    // Authentication test function - FIXED VERSION  
const testAuthFunction = async () => {  
    try {  
        console.log('🔍 Testing authentication...');  
        
        // Get the current user's ID token  
        const authInstance = getAuth();  
        const currentUser = authInstance.currentUser;  
        
        if (!currentUser) {  
            alert('❌ No user logged in!');  
            return;  
        }  
        
        // Get fresh ID token  
        const idToken = await currentUser.getIdToken(true);  
        
        // Call the HTTP function (not callable function)  
        const FIREBASE_FUNCTIONS_URL = 'https://us-central1-beats-garage.cloudfunctions.net';  
        
        const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/testAuthV2`, {  
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json',  
                'Authorization': `Bearer ${idToken}`,  
                'Origin': window.location.origin  
            },  
            body: JSON.stringify({})  
        });  
        
        if (!response.ok) {  
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);  
        }  
        
        const result = await response.json();  
        console.log('✅ TEST AUTH SUCCESS:', result);  
        
        // Show result in alert with better formatting  
        const message = `🔍 AUTH TEST SUCCESS:  

✅ Message: ${result.message}  
🔐 hasAuth: ${result.hasAuth}  
👤 User: ${result.user?.email || 'N/A'}  
🆔 UserID: ${result.user?.userId || 'N/A'}  
📧 Email Verified: ${result.user?.emailVerified || 'N/A'}  

Check console for full details!`;

        alert(message);  
        
    } catch (error) {  
        console.error('❌ TEST AUTH ERROR:', error);  
        
        const errorMessage = `❌ AUTH TEST FAILED:  

🚨 Error: ${error.message}  
💬 Details: ${error.stack || 'No additional details'}  

Check console for full error details!`;

        alert(errorMessage);  
    }  
};
    // Fetch total cart amount from localStorage
    useEffect(() => {
        const fetchCartData = () => {
            const total = parseFloat(localStorage.getItem("totalAmount")) || 0;
            setCheckoutAmount(total);
            setConvertedAmount(total);
        };
        fetchCartData();
    }, []);

    // Fetch exchange rates
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch(
                    `https://api.currencyfreaks.com/latest?apikey=${API_KEY}`
                );
                const data = await response.json();

                if (data && data.rates) {
                    setRates(data.rates);
                    if (formData.currency === "USD") {
                        setConvertedAmount(checkoutAmount.toFixed(2));
                    } else {
                        setConvertedAmount(
                            (checkoutAmount * parseFloat(data.rates[formData.currency])).toFixed(2)
                        );
                    }
                } else {
                    console.error("Failed to fetch rates from Currency Freaks.");
                }
            } catch (error) {
                console.error("Error fetching currency rates:", error);
                // Fallback to USD if rates fail
                setConvertedAmount(checkoutAmount.toFixed(2));
            }
        };
        
        if (checkoutAmount > 0) {
            fetchRates();
        }
    }, [checkoutAmount, formData.currency]);

    // Update converted amount when currency changes
    useEffect(() => {
        if (rates[formData.currency] && checkoutAmount > 0) {
            if (formData.currency === "USD") {
                setConvertedAmount(checkoutAmount.toFixed(2));
            } else {
                setConvertedAmount(
                    (checkoutAmount * parseFloat(rates[formData.currency])).toFixed(2)
                );
            }
        }
    }, [formData.currency, checkoutAmount, rates]);

    // Fetch countries with fallback
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd");
                const data = await response.json();

                const countries = data
                    .map((country) => {
                        if (country.idd?.root) {
                            return {
                                name: country.name.common,
                                dialingCode: `${country.idd.root}${
                                    country.idd.suffixes ? country.idd.suffixes[0] : ""
                                }`,
                            };
                        }
                        return null;
                    })
                    .filter(Boolean)
                    .sort((a, b) => a.name.localeCompare(b.name));
                setCountryList(countries);
            } catch (error) {
                console.error("Error fetching countries:", error);
                // Fallback countries
                const fallbackCountries = [
                    { name: "United States", dialingCode: "+1" },
                    { name: "United Kingdom", dialingCode: "+44" },
                    { name: "Canada", dialingCode: "+1" },
                    { name: "Australia", dialingCode: "+61" },
                    { name: "Germany", dialingCode: "+49" },
                    { name: "France", dialingCode: "+33" },
                    { name: "India", dialingCode: "+91" },
                    { name: "Japan", dialingCode: "+81" },
                    { name: "China", dialingCode: "+86" },
                    { name: "Brazil", dialingCode: "+55" },
                ];
                setCountryList(fallbackCountries);
            }
        };
        fetchCountries();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required!";
        if (!formData.email.trim()) newErrors.email = "Email is required!";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Load PayPal script with currency reload handling
    useEffect(() => {
        const addPayPalScript = async () => {
            try {
                // Remove existing script if currency changes
                const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
                if (existingScript) {
                    existingScript.remove();
                    setPaypalScriptLoaded(false);
                }

                const script = document.createElement('script');
                script.src = `https://www.paypal.com/sdk/js?client-id=AbGr02P2mnEIwVirW4UgpBz0GjQMqeji0QDCiB5JwWF7KiGv83yzRjR3mlEI22XkXybcBJ43ym7VY305&currency=${formData.currency}&disable-funding=credit,card`;
                script.type = 'text/javascript';
                script.async = true;

                script.onload = () => {
                    console.log("PayPal SDK loaded successfully for currency:", formData.currency);
                    setPaypalScriptLoaded(true);
                };

                script.onerror = (err) => {
                    console.error("Failed to load PayPal SDK", err);
                    alert("Failed to load PayPal payment system. Please refresh the page and try again.");
                };

                document.body.appendChild(script);
            } catch (error) {
                console.error("Error adding PayPal script:", error);
            }
        };

        addPayPalScript();
    }, [formData.currency]);

    // Memoize the PayPal button creation to prevent infinite re-renders
    const createPayPalButtons = useCallback(() => {
        if (!paypalScriptLoaded || !window.paypal || convertedAmount <= 0) {
            return;
        }

        const buttonContainer = document.getElementById('paypal-button-container');
        if (!buttonContainer) {
            return;
        }

        try {
            // Clear existing buttons
            buttonContainer.innerHTML = '';
            
            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    // Validate form before creating order
                    if (!formData.name.trim()) {
                        alert("Please enter your name before proceeding with payment.");
                        throw new Error("Name required");
                    }
                    if (!formData.email.trim()) {
                        alert("Please enter your email before proceeding with payment.");
                        throw new Error("Email required");
                    }

                    const amount = Number(convertedAmount);
                    if (isNaN(amount) || amount <= 0) {
                        alert("Invalid payment amount. Please refresh and try again.");
                        throw new Error('Invalid amount');
                    }

                    console.log(`Creating PayPal order for ${amount} ${formData.currency}`);
                    
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toFixed(2),
                                currency_code: formData.currency,
                            },
                        }],
                    });
                },
                
                onApprove: (data, actions) => {
                    return actions.order.capture().then(async (details) => {
                        console.log('🎉 PayPal transaction completed:', details);
                        setIsProcessing(true);
                        
                        const paypalOrderId = data.orderID;
                        console.log('💳 PayPal Order ID:', paypalOrderId);
                        
                        try {
                            // === STEP 1: Authentication Check ===
                            console.log('🔐 STEP 1: Checking authentication...');
                            const authInstance = getAuth();
                            const currentUser = authInstance.currentUser;
                            
                            if (!currentUser) {
                                throw new Error("User not authenticated");
                            }
                            
                            console.log('👤 Current user details:', {
                                uid: currentUser.uid,
                                email: currentUser.email,
                                emailVerified: currentUser.emailVerified,
                                isAnonymous: currentUser.isAnonymous,
                                providerData: currentUser.providerData
                            });
                            
                            // === STEP 2: Token Refresh ===
                            console.log('🔑 STEP 2: Refreshing auth token...');
                            const idToken = await currentUser.getIdToken(true);
                            console.log('✅ Fresh ID token obtained. Length:', idToken.length);
                            console.log('🔍 Token preview:', idToken.substring(0, 50) + '...');
                            
                            // === STEP 3: Get Cart Data ===
                            console.log('🛒 STEP 3: Getting cart data...');
                            
                            const cartItemsRaw = localStorage.getItem("cartItems");
                            const selectedBeatIdRaw = localStorage.getItem("selectedBeatId");
                            const totalAmountRaw = localStorage.getItem("totalAmount");
                            
                            console.log('📦 Raw localStorage data:', {
                                cartItems: cartItemsRaw,
                                selectedBeatId: selectedBeatIdRaw,
                                totalAmount: totalAmountRaw
                            });
                            
                            const cartItems = JSON.parse(cartItemsRaw) || [];
                            let beatsToProcess = cartItems;
                            
                            if (beatsToProcess.length === 0 && selectedBeatIdRaw) {
                                beatsToProcess = [{ id: selectedBeatIdRaw }];
                                console.log('📝 Using selected beat ID:', selectedBeatIdRaw);
                            }
                            
                            if (beatsToProcess.length === 0) {
                                throw new Error("No beats found to purchase - cart is empty");
                            }
                            
                            console.log('🎵 Beats to process:', beatsToProcess);
                            
                            // === STEP 4: Prepare Customer Info ===
                            console.log('📋 STEP 4: Preparing customer info...');
                            
                            const customerInfo = {
                                name: formData.name.trim(),
                                email: formData.email.trim(),
                                billingAddress: formData.billingAddress.trim(),
                                contactNumber: `${formData.countryCode}${formData.contactNumber}`.trim(),
                                currency: formData.currency,
                                paypalDetails: {
                                    orderId: paypalOrderId,
                                    payerEmail: details.payer.email_address,
                                    payerName: `${details.payer.name?.given_name || ''} ${details.payer.name?.surname || ''}`.trim(),
                                    amount: details.purchase_units[0].amount.value,
                                    currency: details.purchase_units[0].amount.currency_code,
                                    transactionId: details.id,
                                    status: details.status
                                }
                            };
                            
                            console.log('📄 Customer info prepared:', customerInfo);
                            
                            // === STEP 5: Test Function Connection ===
                            console.log('🔧 STEP 5: Testing function connection...');
                            
                            // Check if functions are properly initialized
                            console.log('⚙️ Functions instance:', functions);
                            console.log('📞 purchaseBeatV2 callable:', typeof purchaseBeatV2);
                            
                            // === STEP 6: Process Each Beat ===
                            console.log('🔄 STEP 6: Processing transactions...');
                            
                            const transactionResults = [];
                            
                            for (let i = 0; i < beatsToProcess.length; i++) {
                                const beat = beatsToProcess[i];
                                console.log(`\n--- Processing Beat ${i + 1}/${beatsToProcess.length} ---`);
                                console.log('🎵 Beat details:', beat);
                                
                                try {
                                    const payload = {
                                        beatId: beat.id,
                                        paypalOrderId: paypalOrderId,
                                        customerInfo: customerInfo,
                                        webhookId: null,
                                        // Debug info
                                        debug: {
                                            timestamp: new Date().toISOString(),
                                            userAgent: navigator.userAgent,
                                            beatIndex: i,
                                            totalBeats: beatsToProcess.length
                                        }
                                    };
                                    
                                    console.log('📤 Calling purchaseBeatV2 with payload:', payload);
                                    
                                    const startTime = Date.now();
                                    const result = await purchaseBeatV2(payload);
                                    const endTime = Date.now();
                                    
                                    console.log(`✅ Transaction created successfully in ${endTime - startTime}ms:`, result);
                                    
                                    transactionResults.push({
                                        beatId: beat.id,
                                        success: true,
                                        result: result,
                                        transactionId: result.data?.transactionId || result.data?.id,
                                        duration: endTime - startTime
                                    });
                                    
                                } catch (beatError) {
                                    console.error(`❌ Error creating transaction for beat ${beat.id}:`, {
                                        error: beatError,
                                        code: beatError.code,
                                        message: beatError.message,
                                        details: beatError.details,
                                        stack: beatError.stack
                                    });
                                    
                                    // Additional error analysis
                                    let errorAnalysis = {};
                                    
                                    if (beatError.code) {
                                        switch (beatError.code) {
                                            case 'functions/not-found':
                                                errorAnalysis = {
                                                    type: 'function-missing',
                                                    suggestion: 'purchaseBeatV2 function not deployed or named incorrectly'
                                                };
                                                break;
                                            case 'functions/unauthenticated':
                                                errorAnalysis = {
                                                    type: 'auth-failed',
                                                    suggestion: 'User token invalid or expired'
                                                };
                                                break;
                                            case 'functions/permission-denied':
                                                errorAnalysis = {
                                                    type: 'permission-denied',
                                                    suggestion: 'Firestore security rules blocking write'
                                                };
                                                break;
                                            case 'functions/internal':
                                                errorAnalysis = {
                                                    type: 'server-error',
                                                    suggestion: 'Check Cloud Function logs for internal error'
                                                };
                                                break;
                                            default:
                                                errorAnalysis = {
                                                    type: 'unknown',
                                                    suggestion: 'Unexpected error code: ' + beatError.code
                                                };
                                        }
                                    }
                                    
                                    console.log('🔍 Error analysis:', errorAnalysis);
                                    
                                    transactionResults.push({
                                        beatId: beat.id,
                                        success: false,
                                        error: beatError.message || 'Unknown error',
                                        errorCode: beatError.code,
                                        errorAnalysis: errorAnalysis,
                                        fullError: beatError
                                    });
                                }
                                
                                // Small delay between requests
                                if (i < beatsToProcess.length - 1) {
                                    console.log('⏱️ Waiting 500ms before next transaction...');
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                }
                            }
                            
                            // === STEP 7: Process Results ===
                            console.log('\n🏁 STEP 7: Processing results...');
                            console.log('📊 All transaction results:', transactionResults);
                            
                            const successfulTransactions = transactionResults.filter(r => r.success);
                            const failedTransactions = transactionResults.filter(r => !r.success);
                            
                            console.log(`✅ Successful: ${successfulTransactions.length}`);
                            console.log(`❌ Failed: ${failedTransactions.length}`);
                            
                            if (successfulTransactions.length > 0) {
                                if (successfulTransactions.length === beatsToProcess.length) {
                                    // All transactions successful
                                    console.log('🎉 All transactions successful! Cleaning up and redirecting...');
                                    
                                    localStorage.removeItem("cartItems");
                                    localStorage.removeItem("totalAmount");
                                    localStorage.removeItem("selectedBeatId");
                                    
                                    console.log('🧹 localStorage cleaned up');
                                    console.log('🚀 Redirecting to success page...');
                                    
                                    window.location.href = `/payment-success?token=${paypalOrderId}`;
                                } else {
                                    // Partial success
                                    const message = `Partial success: ${successfulTransactions.length} of ${beatsToProcess.length} transactions created. Order ID: ${paypalOrderId}`;
                                    console.log('⚠️ ' + message);
                                    console.log('❌ Failed transactions:', failedTransactions);
                                    alert(message + '\n\nPlease contact support for assistance.');
                                    setIsProcessing(false);
                                }
                            } else {
                                // All failed
                                console.log('💥 All transactions failed!');
                                console.log('❌ Error summary:', failedTransactions.map(f => f.errorAnalysis));
                                
                                const errorCodes = [...new Set(failedTransactions.map(f => f.errorCode).filter(Boolean))];
                                const errorMessages = failedTransactions.map(f => f.error).join(', ');
                                
                                throw new Error(`All transactions failed. Error codes: ${errorCodes.join(', ')}. Messages: ${errorMessages}`);
                            }
                            
                        } catch (err) {
                            console.error('💥 FATAL ERROR in purchase process:', {
                                error: err,
                                code: err.code,
                                message: err.message,
                                stack: err.stack
                            });
                            
                            setIsProcessing(false);
                            
                            let userMessage = `Failed to process order. Please contact support with Order ID: ${paypalOrderId}`;
                            
                            // User-friendly error messages
                            if (err.message?.includes('User not authenticated')) {
                                userMessage = "Authentication failed. Please log out and log back in, then try again.";
                            } else if (err.code === 'functions/not-found') {
                                userMessage = "Payment service unavailable. Please contact support.";
                            } else if (err.code === 'functions/unauthenticated') {
                                userMessage = "Your session has expired. Please log in again and retry.";
                            } else if (err.message?.includes('No beats found')) {
                                userMessage = "No items found in cart. Please add items and try again.";
                            }
                            
                            console.log('👤 Showing user message:', userMessage);
                            alert(userMessage);
                        }
                    }).catch((captureError) => {
                        console.error('💳 PayPal capture error:', captureError);
                        setIsProcessing(false);
                        alert('Payment capture failed. Please contact support.');
                    });
                },
                
                onError: (err) => {
                    console.error("PayPal Checkout onError", err);
                    setIsProcessing(false);
                    alert("Payment failed. Please try again or contact support.");
                },
                onCancel: (data) => {
                    console.log("PayPal payment cancelled", data);
                    setIsProcessing(false);
                }
            }).render('#paypal-button-container').catch((renderError) => {
                console.error("Error rendering PayPal buttons:", renderError);
                setIsProcessing(false);
            });
        } catch (error) {
            console.error("Error creating PayPal buttons:", error);
            setIsProcessing(false);
        }
    }, [paypalScriptLoaded, convertedAmount, formData.currency, formData.name, formData.email, purchaseBeatV2]);

    // Render PayPal buttons with proper dependency management
    useEffect(() => {
        createPayPalButtons();
    }, [createPayPalButtons]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex justify-center items-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white flex justify-center items-center">
                <div className="bg-gray-900 px-8 py-8 rounded-lg shadow-md w-full max-w-md text-center">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Authentication Required</h1>
                    <p className="text-gray-300 mb-6">You must be logged in to make a purchase.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex justify-center items-center py-10">
            <div className="bg-gray-900 px-8 py-8 rounded-lg shadow-md w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-red-500 mb-8">Payment Details</h1>
                
                {/* User Info with Test Button */}
                <div className="mb-4 p-4 bg-gray-800 rounded-md">
                    <p className="text-sm text-gray-300 mb-2">
                        <strong>User:</strong> {user?.email || 'Loading...'}
                    </p>
                    {/* Test Authentication Button */}
                    <button 
                        onClick={testAuthFunction}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                        disabled={isProcessing}
                        title="Test if authentication is working properly"
                    >
                        🔍 TEST AUTH
                    </button>
                </div>

                {isProcessing && (
                    <div className="mb-4 p-4 bg-blue-600 text-white rounded-md text-center">
                        🔄 Processing your order... Please wait while we create your transaction records.
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name */}
                    <div>
                        <label className="block text-gray-300 font-medium">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full mt-1 px-4 py-2 bg-gray-800 border ${
                                errors.name ? "border-red-500" : "border-gray-700"
                            } rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring focus:ring-red-500`}
                            placeholder="Enter your name"
                            required
                            disabled={isProcessing}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-300 font-medium">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full mt-1 px-4 py-2 bg-gray-800 border ${
                                errors.email ? "border-red-500" : "border-gray-700"
                            } rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring focus:ring-red-500`}
                            placeholder="Enter your email"
                            required
                            disabled={isProcessing}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Billing Address */}
                    <div>
                        <label className="block text-gray-300 font-medium">Billing Address</label>
                        <input
                            type="text"
                            name="billingAddress"
                            value={formData.billingAddress}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring focus:ring-red-500"
                            placeholder="Enter your billing address"
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Contact Number */}
                    <div>
                        <label className="block text-gray-300 font-medium">Contact Number</label>
                        <div className="flex items-center space-x-2">
                            <select
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handleChange}
                                className="w-1/5 px-2 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring focus:ring-red-500 relative z-10"
                                style={{
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 0.5rem center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '1.5em 1.5em',
                                    paddingRight: '2.5rem'
                                }}
                                disabled={isProcessing}
                            >
                                {countryList.length === 0 ? (
                                    <option value="">Loading countries...</option>
                                ) : (
                                    countryList.map((country, index) => (
                                        <option 
                                            key={index} 
                                            value={country.dialingCode}
                                            className="bg-gray-800 text-gray-200 py-2"
                                        >
                                            {country.dialingCode} {country.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring focus:ring-red-500"
                                placeholder="Enter your contact number"
                                disabled={isProcessing}
                            />
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                            <label className="block text-gray-300 font-medium">Total Amount (USD):</label>
                            <p className="mt-1 px-4 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-md">
                                ${checkoutAmount}
                            </p>
                        </div>
                        {/* Currency Selection */}
                        <div className="flex-1">
                            <label className="block text-gray-300 font-medium">Select Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-red-500"
                                disabled={isProcessing}
                            >
                                <option value="USD">USD (US Dollar)</option>
                                <option value="EUR">EUR (Euro)</option>
                                <option value="GBP">GBP (British Pound)</option>
                                <option value="JPY">JPY (Japanese Yen)</option>
                                <option value="AUD">AUD (Australian Dollar)</option>
                                <option value="CAD">CAD (Canadian Dollar)</option>
                                <option value="CHF">CHF (Swiss Franc)</option>
                                <option value="CNY">CNY (Chinese Yuan)</option>
                                <option value="INR">INR (Indian Rupee)</option>
                                <option value="RUB">RUB (Russian Ruble)</option>
                            </select>
                        </div>
                    </div>

                    {/* Converted Total */}
                    <div className="bg-gray-800 text-gray-200 border border-gray-700 rounded-md py-3 px-4 text-center">
                        <span className="text-lg font-semibold">
                            Total in {formData.currency}: {convertedAmount} {formData.currency}
                        </span>
                    </div>

                    {/* Info about webhook processing */}
                    <div className="bg-blue-900 border border-blue-700 rounded-md p-4">
                        <h4 className="text-blue-300 font-semibold mb-2">🔄 Payment Processing</h4>
                        <p className="text-blue-200 text-sm">
                            After completing your PayPal payment, our system will automatically process your transaction. 
                            You will be redirected to a confirmation page where you can track the status.
                        </p>
                    </div>

                    {/* PayPal Button Container */}
                    {paypalScriptLoaded && !isProcessing && convertedAmount > 0 && (
                        <div id="paypal-button-container" className="mt-6"></div>
                    )}
                    
                    {/* Loading State */}
                    {isProcessing && (
                        <div className="text-center py-6">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2"></div>
                            <p className="text-gray-300">Creating transaction records...</p>
                        </div>
                    )}

                    {/* PayPal Loading State */}
                    {!paypalScriptLoaded && !isProcessing && (
                        <div className="text-center py-6">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                            <p className="text-gray-400">Loading PayPal payment system...</p>
                        </div>
                    )}

                    {/* Error State for PayPal */}
                    {paypalScriptLoaded && convertedAmount <= 0 && (
                        <div className="bg-red-900 border border-red-700 rounded-md p-4 text-center">
                            <p className="text-red-200">
                                Invalid payment amount. Please add items to your cart before proceeding.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Payment;
