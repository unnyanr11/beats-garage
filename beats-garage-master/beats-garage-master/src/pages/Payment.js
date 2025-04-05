import React, { useState, useEffect } from "react";  

// Currency Freaks API Key  
const API_KEY = "b86a6db6f2b340f2891c19a3e91e781f";  

const Payment = () => {  
    const [formData, setFormData] = useState({  
        name: "",  
        email: "",  
        billingAddress: "",  
        otherAddress: "",  
        contactNumber: "",  
        currency: "USD", // Default currency  
        paymentMode: "Card", // Default payment mode  
        countryCode: "+1", // Default country code  
    });  

    const [countryList, setCountryList] = useState([]); // Country dialing codes  
    const [checkoutAmount, setCheckoutAmount] = useState(0); // USD total amount  
    const [convertedAmount, setConvertedAmount] = useState(0); // Converted amount in selected currency  
    const [errors, setErrors] = useState({}); // Validation errors  
    const [rates, setRates] = useState({}); // Exchange rates for all currencies  

    // Fetch total cart amount from `localStorage`  
    useEffect(() => {  
        const fetchCartData = () => {  
            const total = parseFloat(localStorage.getItem("totalAmount")) || 0;  
            setCheckoutAmount(total); // Set default USD amount  
            setConvertedAmount(total); // Initial amount before conversion  
        };  

        fetchCartData();  
    }, []);  

    // Fetch exchange rates using Currency Freaks API  
    useEffect(() => {  
        const fetchRates = async () => {  
            try {  
                const response = await fetch(  
                    `https://api.currencyfreaks.com/latest?apikey=${API_KEY}`  
                );  
                const data = await response.json();  

                if (data && data.rates) {  
                    setRates(data.rates); // Store all rates in state  
                    // Set initial converted value in selected currency  
                    setConvertedAmount(  
                        (checkoutAmount *  
                            parseFloat(data.rates[formData.currency])).toFixed(2)  
                    );  
                } else {  
                    console.error("Failed to fetch rates from Currency Freaks.");  
                }  
            } catch (error) {  
                console.error(  
                    "Error fetching currency rates from Currency Freaks:",  
                    error  
                );  
            }  
        };  

        fetchRates();  
    }, [checkoutAmount]);  

    // Update the converted amount when the currency or total amount changes  
    useEffect(() => {  
        if (rates[formData.currency]) {  
            setConvertedAmount(  
                (checkoutAmount * parseFloat(rates[formData.currency])).toFixed(2)  
            );  
        }  
    }, [formData.currency, checkoutAmount, rates]);  

    // Fetch countries and dialing codes from REST API  
    useEffect(() => {  
        const fetchCountries = async () => {  
            try {  
                const response = await fetch("https://restcountries.com/v3.1/all");  
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
                    .sort((a, b) => a.name.localeCompare(b.name)); // Sorted by name  
                setCountryList(countries);  
            } catch (error) {  
                console.error("Error fetching countries:", error);  
            }  
        };  

        fetchCountries();  
    }, []);  

    // Handle input field changes  
    const handleChange = (e) => {  
        const { name, value } = e.target;  
        setFormData((prevState) => ({  
            ...prevState,  
            [name]: value,  
        }));  
    };  

    // Validate form before submission  
    const validateForm = () => {  
        const newErrors = {};  
        if (!formData.name.trim()) newErrors.name = "Name is required!";  
        if (!formData.email.trim()) newErrors.email = "Email is required!";  
        setErrors(newErrors);  

        return Object.keys(newErrors).length === 0; // Return `true` if no errors  
    };  

    // Handle form submission  
    const handleSubmit = (e) => {  
        e.preventDefault();  
        if (!validateForm()) return; // Stop if validation fails  

        alert(`Payment Details:  
        Name: ${formData.name}  
        Email: ${formData.email}  
        Billing Address: ${formData.billingAddress || "N/A"}  
        Other Address: ${formData.otherAddress || "N/A"}  
        Contact Number: ${formData.countryCode} ${formData.contactNumber || "N/A"}  
        Total Amount (USD): ${checkoutAmount}  
        Converted Amount: ${convertedAmount} ${formData.currency}  
        Payment Mode: ${formData.paymentMode}`);  
    };  

    return (  
        <div className="min-h-screen bg-black text-white flex justify-center items-center py-10">  
            <div className="bg-gray-900 px-8 py-8 rounded-lg shadow-md w-full max-w-2xl">  
                <h1 className="text-3xl font-bold text-red-500 mb-8">Payment Details</h1>  
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
                        />  
                    </div>  

                    {/* Contact Number */}  
                    <div>  
                        <label className="block text-gray-300 font-medium">Contact Number</label>  
                        <div className="flex items-center space-x-2">  
                            {/* Dropdown for country code */}  
                            <select  
                                name="countryCode"  
                                value={formData.countryCode}  
                                onChange={handleChange}  
                                className="w-1/5 px-2 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring focus:ring-red-500"  
                            >  
                                {countryList.map((country, index) => (  
                                    <option key={index} value={country.dialingCode}>  
                                        ({country.dialingCode}) {country.name}  
                                    </option>  
                                ))}  
                            </select>  
                            {/* Contact input field */}  
                            <input  
                                type="tel"  
                                name="contactNumber"  
                                value={formData.contactNumber}  
                                onChange={handleChange}  
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring focus:ring-red-500"  
                                placeholder="Enter your contact number"  
                            />  
                        </div>  
                    </div>  

                    {/* Total Amount */}  
                    <div className="flex justify-between">  
                        <div>  
                            <label className="block text-gray-300 font-medium">Total Amount (USD):</label>  
                            <p className="mt-1 px-4 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-md">  
                                ${checkoutAmount}  
                            </p>  
                        </div>  
                        {/* Currency Selection */}  
                        <div>  
                            <label className="block text-gray-300 font-medium">Select Currency</label>  
                            <select  
                                name="currency"  
                                value={formData.currency}  
                                onChange={handleChange}  
                                className="mt-1 px-4 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-red-500"  
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
                    <div className="bg-gray-800 text-gray-200 border border-gray-700 rounded-md py-2 px-4 text-center">  
                        Total in {formData.currency}: {convertedAmount} {formData.currency}  
                    </div>  

                    {/* Payment Mode */}  
                    <div>  
                        <label className="block text-gray-300 font-medium">Payment Mode</label>  
                        <select  
                            name="paymentMode"  
                            value={formData.paymentMode}  
                            onChange={handleChange}  
                            className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring focus:ring-red-500"  
                        >  
                            <option value="Card">Credit/Debit Card</option>  
                            <option value="PayPal">PayPal</option>  
                            <option value="UPI">UPI</option>  
                        </select>  
                    </div>  

                    {/* Submit Button */}  
                    <div>  
                        <button  
                            type="submit"  
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-md focus:outline-none focus:ring focus:ring-red-500"  
                        >  
                            Pay Now  
                        </button>  
                    </div>  
                </form>  
            </div>  
        </div>  
    );  
};  

export default Payment;  