import React from 'react'; 
import { render, screen } from "@testing-library/react";  
import App from "./App";  

test("renders Beats Garage header", () => {  
  render(<App />);  
  const headerElement = screen.getByText(/🔥 Beats Garage/i); // Match the header text in your app  
  expect(headerElement).toBeInTheDocument();  
});  