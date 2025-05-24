import React from "react";  

import { FaInstagram, FaSoundcloud, FaTwitter } from "react-icons/fa"; // Import specific social media icons  

const Footer = () => {  
  return (  
    <footer className="bg-black py-6 text-center border-t border-red-500 text-sm">  
      <p className="mb-4">© 2025 Beats Garage. All Rights Reserved.</p>  
      <div className="flex justify-center space-x-6 text-2xl">  
        {/* Instagram */}  
        <a  
          href="https://www.instagram.com/gypsum.boy/" // Replace with your Instagram URL  
          target="_blank"  
          rel="noopener noreferrer"  
          className="text-white hover:text-pink-500 transition duration-300"  
        >  
          <FaInstagram />  
        </a>  
        {/* SoundCloud */}  
        <a  
          href="https://soundcloud.com/user-181720024" // Replace with your SoundCloud URL  
          target="_blank"  
          rel="noopener noreferrer"  
          className="text-white hover:text-orange-500 transition duration-300"  
        >  
          <FaSoundcloud />  
        </a>  
        {/* Twitter */}  
        <a  
          href="https://x.com/UnnyanR" // Replace with your Twitter URL  
          target="_blank"  
          rel="noopener noreferrer"  
          className="text-white hover:text-blue-400 transition duration-300"  
        >  
          <FaTwitter />  
        </a>  
      </div>  
    </footer>  
  );  
};  

export default Footer;  