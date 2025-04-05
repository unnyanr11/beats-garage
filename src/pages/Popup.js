import React from "react";  
import PropTypes from "prop-types";  

const Popup = ({ message, buttons }) => {  
    return (  
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">  
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-xl text-center max-w-md w-full mx-auto">  
                <h3 className="text-xl font-bold text-white mb-4">{message}</h3>  
                {/* Dynamically render buttons */}  
                {buttons && (  
                    <div className="flex gap-4 justify-center">  
                        {buttons.map((button, index) => (  
                            <button  
                                key={index}  
                                className={`px-6 py-2 font-bold text-white rounded-lg ${button.className}`}  
                                onClick={button.onClick}  
                            >  
                                {button.label}  
                            </button>  
                        ))}  
                    </div>  
                )}  
            </div>  
        </div>  
    );  
};  

Popup.propTypes = {  
    message: PropTypes.string.isRequired, // The popup message to display  
    buttons: PropTypes.arrayOf(  
        PropTypes.shape({  
            label: PropTypes.string.isRequired, // Text on the button  
            onClick: PropTypes.func.isRequired, // Callback when the button is clicked  
            className: PropTypes.string, // Tailwind classes for styling  
        })  
    ),  
};  

Popup.defaultProps = {  
    buttons: null, // No buttons rendered if not provided  
};  

export default Popup;  