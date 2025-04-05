import React from 'react';  
const HeroSection = () => {  
    return (  
        <section className="text-center py-20 bg-red-500">  
            <h2 className="text-5xl font-bold mb-6">🔥 Level Up Your Music</h2>  
            <p className="text-xl mb-6">  
                Discover high-quality, professional beats for your tracks.  
            </p>  
            <a href="#beats"   
                className="btn-custom px-6 py-3 font-bold text-black bg-white border border-black rounded-lg hover:bg-black hover:text-white focus:bg-black focus:text-white transition-all duration-300">Explore Beats  
            </a>    
        </section>  
    );  
};  

export default HeroSection;  