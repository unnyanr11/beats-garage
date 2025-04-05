
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      // Specify the files to scan for Tailwind CSS classes
      content: [
        './src/**/*.{js,jsx,ts,tsx}', // Include all React source files
        './public/index.html',        // Include HTML templates
      ],
      theme: {
        extend: {
          // Extend default color palette
          colors: {
            customRed: '#FF0000',      // Custom red color
            customBlack: '#000000',    // Custom black color
            customWhite: '#FFFFFF',    // Custom white color
          },
          // Add custom border radius options
          borderRadius: {
            custom: '8px',             // Custom radius for rounded corners
          },
          // Add custom box shadow options
          boxShadow: {
            custom: '0px 8px 12px rgba(255, 0, 0, 0.8)',       // For hover/focus states
            customActive: '0px 4px 6px rgba(255, 0, 0, 0.5)',  // For active states
          },
        },
      },
      // Tailwind CSS plugins (add if needed)
      plugins: [],
    };
