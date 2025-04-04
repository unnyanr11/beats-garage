import React from "react";  
import Header from "./components/Header";  
import HeroSection from "./components/HeroSection";  
import FeaturedBeats from "./components/FeaturedBeats";  
import Filters from "./components/Filters";  
import Footer from "./components/Footer";  

const App = () => {  
    return (  
        <div className="bg-black text-white">  
            <Header />  
            <HeroSection />  
            <FeaturedBeats />  
            <Filters />  
            <Footer />  
        </div>  
    );  
};  

export default App;  