const Header = () => {  
    return (  
        <header className="sticky top-0 z-50 bg-black border-b border-red-500">  
            <nav className="container mx-auto px-5 py-4 flex justify-between items-center">  
                <h1 className="text-3xl font-bold">🔥 Beats Garage</h1>  
                <div className="space-x-6">  
                    <a href="#beats" className="btn-custom">Beats</a>  
                    <a href="signup.html" className="btn-custom">Sign Up</a>  
                    <a href="login.html" className="btn-custom">Login</a>  
                </div>  
            </nav>  
        </header>  
    );  
};  

export default Header;  