import React from 'react'; 
 

const HeroSection = () => {  
    return (  
        <section className="relative text-center py-20 px-6 bg-gradient-to-b from-red-800 via-red-600 to-orange-500 text-white">  
            {/* Dynamic Music Icons */}  
            <div className="absolute top-10 left-10 w-16 h-16 bg-white opacity-20 rounded-full blur-xl"></div>  
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-300 opacity-30 rounded-full blur-3xl"></div>  

            {/* Hero Content */}  
            <h2 className="text-6xl font-extrabold mb-6 drop-shadow-md">  
                🔥 Level Up Your Music  
            </h2>  
            <p className="text-2xl mb-10 max-w-xl mx-auto drop-shadow-lg">  
                Discover high-quality, professional beats for your tracks.  
            </p>  

            {/* Call-to-Action Button */}  
            <a  
                href="#beats"  
                className="px-8 py-4 text-lg font-bold text-red-500 bg-white rounded-full shadow-lg hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105"  
            >  
                Explore Beats  
            </a>  

            {/* Decorative Floating Elements */}  
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">  
                <svg  
                    className="w-full h-full"  
                    xmlns="http://www.w3.org/2000/svg"  
                    viewBox="0 0 1440 320"  
                    fill="none"  
                >  
                    <path  
                        fill="rgba(255,255,255,0.1)"  
                        d="M0,224L60,202.7C120,181,240,139,360,112C480,85,600,75,720,64C840,53,960,43,1080,64C1200,85,1320,139,1380,165.3L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"  
                    ></path>  
                </svg>  
            </div>  
        </section>  
    );  
};  

export default HeroSection;  