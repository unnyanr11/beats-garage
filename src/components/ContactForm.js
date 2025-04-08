import React, { useState } from "react";  
import emailjs from "emailjs-com"; // Import EmailJS library  

const ContactForm = () => {  
  const [formData, setFormData] = useState({  
    name: "",  
    email: "",  
    subject: "",  
    message: "",  
  });  
  const [formErrors, setFormErrors] = useState({});  
  const [formStatus, setFormStatus] = useState(null); // Success or error message  

  // Handle input change  
  const handleChange = (e) => {  
    const { name, value } = e.target;  
    setFormData({ ...formData, [name]: value });  
    setFormErrors({ ...formErrors, [name]: "" }); // Clear errors when the user starts typing  
    setFormStatus(null); // Reset form status  
  };  

  // Validation function  
  const validateForm = () => {  
    const errors = {};  
    if (!formData.name.trim()) errors.name = "Name is required.";  
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))  
      errors.email = "Valid email is required.";  
    if (!formData.message.trim()) errors.message = "Message cannot be empty.";  
    return errors;  
  };  

  // Handle form submission  
  const handleSubmit = async (e) => {  
    e.preventDefault();  

    const errors = validateForm();  
    if (Object.keys(errors).length > 0) {  
      setFormErrors(errors);  
      return;  
    }  

    try {  
        // Send data via EmailJS API  
        await emailjs.send(  
          "service_r8fssyq", // Replace with your EmailJS Service ID  
          "template_pqmmge6", // Replace with your EmailJS Template ID  
          {  
            name: formData.name,  
            email: formData.email,  
            subject: formData.subject || "No Subject", // Default subject if not provided  
            message: formData.message,  
          },  
          "3MX7KWFm4qldIATpV" // Replace with your EmailJS Public Key  
        );  

      // On successful submission  
      setFormStatus("Your message has been sent successfully! We'll get back to you soon.");  
      setFormData({  
        name: "",  
        email: "",  
        subject: "",  
        message: "",  
      });  
    } catch (error) {  
      // Handle email sending error  
      console.error("Error sending email via EmailJS:", error);  
      setFormStatus("Failed to send your message. Please try again later.");  
    }  
  };  

  return (  
    <div className="bg-gray-900 text-white px-5 py-10 rounded-lg shadow-lg">  
      <h3 className="text-3xl font-bold text-center mb-6">Contact Us</h3>  
      <p className="text-center text-gray-300 mb-8">  
        Feel free to reach out with any questions, concerns, or feedback.  
      </p>  

      {formStatus && (  
        <div  
          className={`text-center mb-4 font-semibold p-3 rounded-lg ${  
            formStatus.includes("successfully") ? "bg-green-500" : "bg-red-500"  
          }`}  
        >  
          {formStatus}  
        </div>  
      )}  

      {/* Spam Note */}  
      {formStatus?.includes("successfully") && (  
        <p className="text-center text-sm text-gray-400 mb-6">  
          If you don&#39;t see our email soon, please check your spam or junk folder.  
        </p>  
      )}   

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">  
        {/* Name Input */}  
        <div className="mb-5">  
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">  
            Your Name <span className="text-red-500">*</span>  
          </label>  
          <input  
            type="text"  
            id="name"  
            name="name"  
            value={formData.name}  
            onChange={handleChange}  
            className={`w-full p-3 rounded-lg bg-gray-800 ${  
              formErrors.name ? "border border-red-500" : ""  
            }`}  
            placeholder="Enter your name"  
          />  
          {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}  
        </div>  

        {/* Email Input */}  
        <div className="mb-5">  
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">  
            Your Email <span className="text-red-500">*</span>  
          </label>  
          <input  
            type="email"  
            id="email"  
            name="email"  
            value={formData.email}  
            onChange={handleChange}  
            className={`w-full p-3 rounded-lg bg-gray-800 ${  
              formErrors.email ? "border border-red-500" : ""  
            }`}  
            placeholder="Enter your email"  
          />  
          {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}  
        </div>  

        {/* Subject Input */}  
        <div className="mb-5">  
          <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-300">  
            Subject  
          </label>  
          <input  
            type="text"  
            id="subject"  
            name="subject"  
            value={formData.subject}  
            onChange={handleChange}  
            className="w-full p-3 rounded-lg bg-gray-800"  
            placeholder="Enter the subject (optional)"  
          />  
        </div>  

        {/* Message Input */}  
        <div className="mb-5">  
          <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-300">  
            Message <span className="text-red-500">*</span>  
          </label>  
          <textarea  
            id="message"  
            name="message"  
            value={formData.message}  
            onChange={handleChange}  
            rows="5"  
            className={`w-full p-3 rounded-lg bg-gray-800 ${  
              formErrors.message ? "border border-red-500" : ""  
            }`}  
            placeholder="Write your message here"  
          ></textarea>  
          {formErrors.message && (  
            <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>  
          )}  
        </div>  

        {/* Submit Button */}  
        <button  
          type="submit"  
          className="block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg w-full transition duration-300"  
        >  
          Send Message  
        </button>  
      </form>  
    </div>  
  );  
};  

export default ContactForm;  