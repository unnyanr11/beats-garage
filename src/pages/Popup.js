import React from "react";  
import PropTypes from "prop-types";  

const Popup = ({ message, buttons }) => {  
    return (  
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">  
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-xl text-center max-w-md w-full mx-auto">  
                {/* Popup Message */}  
                <h3 className="text-xl font-bold text-white mb-4">{message}</h3>  

                {/* Buttons Section */}  
                {buttons && (  
                    <div className="flex flex-col items-center">  
                        {/* Group all buttons except "Close" */}  
                        <div className="flex space-x-4 mb-2"> {/* Reduced margin-bottom */}  
                            {buttons  
                                .filter((button) => button.label !== "Close")  
                                .map((button, index) => (  
                                    <button  
                                        key={index}  
                                        className={`px-6 py-2 text-sm font-bold text-white rounded-lg ${button.className}`}  
                                        onClick={button.onClick}  
                                    >  
                                        {button.label}  
                                    </button>  
                                ))}  
                        </div>  

                        {/* Render the "Close" button separately */}  
                        {buttons  
                            .filter((button) => button.label === "Close")  
                            .map((button, index) => (  
                                <button  
                                    key={index}  
                                    className={`px-6 py-2 text-sm font-bold text-white rounded-lg ${button.className}`}  
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