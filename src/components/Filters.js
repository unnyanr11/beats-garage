const Filters = () => {  
    return (  
        <section id="beats" className="py-20 container mx-auto px-5">  
            <h2 className="text-4xl font-bold mb-10 text-center">🎵 Browse Beats</h2>  
            <div className="filters mb-10 bg-black p-5 border border-red-500 rounded">  
                <h3 className="text-2xl font-bold mb-4 text-center">Filter Beats</h3>  
                <div className="grid md:grid-cols-3 gap-5">  
                    <div>  
                        <label className="block text-lg mb-2">BPM</label>  
                        <select className="form-input w-full p-2 border-2 border-white bg-black text-white rounded">  
                            <option>All BPMs</option>  
                            <option>60-80</option>  
                            <option>81-100</option>  
                            <option>101-120</option>  
                            <option>121-140</option>  
                            <option>141+</option>  
                        </select>  
                    </div>  
                    <div>  
                        <label className="block text-lg mb-2">Genre</label>  
                        <select className="form-input w-full p-2 border-2 border-white bg-black text-white rounded">  
                            <option>All Genres</option>  
                            <option>Trap</option>  
                            <option>Lo-Fi</option>  
                            <option>Drill</option>  
                        </select>  
                    </div>  
                    <div>  
                        <label className="block text-lg mb-2">Mood</label>  
                        <select className="form-input w-full p-2 border-2 border-white bg-black text-white rounded">  
                            <option>All Moods</option>  
                            <option>Happy</option>  
                            <option>Sad</option>  
                            <option>Energetic</option>  
                            <option>Dark</option>  
                        </select>  
                    </div>  
                </div>  
                <div className="text-center mt-6">  
                    <button className="btn-custom">Apply Filters</button>  
                </div>  
            </div>  
        </section>  
    );  
};  

export default Filters;  