import { useState } from "react";  

const FeaturedBeats = () => {  
    const beats = [  
        { id: 1, name: "Dark Vibes", genre: "Trap", bpm: 120, src: "beat1.mp3" },  
        { id: 2, name: "Chill Flow", genre: "Lo-Fi", bpm: 90, src: "beat2.mp3" },  
        { id: 3, name: "Drill Dreams", genre: "Drill", bpm: 140, src: "beat3.mp3" },  
    ];  

    const [playingAudio, setPlayingAudio] = useState(null);  

    const togglePlayPause = (audioId, audioElement) => {  
        if (playingAudio && playingAudio !== audioElement) {  
            playingAudio.pause();  
            playingAudio.currentTime = 0;  
        }  
        if (audioElement.paused) {  
            audioElement.play();  
            setPlayingAudio(audioElement);  
        } else {  
            audioElement.pause();  
            setPlayingAudio(null);  
        }  
    };  

    return (  
        <section id="featured-beats" className="py-20 container mx-auto px-5">  
            <h2 className="text-4xl font-bold mb-10 text-center">🔥 Featured Beats</h2>  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">  
                {beats.map((beat) => (  
                    <div  
                        key={beat.id}  
                        className="beat-card bg-black border border-red-500 p-5 rounded-lg text-center hover:transform hover:-translate-y-2 hover:shadow-lg"  
                    >  
                        <h3 className="text-2xl font-bold mb-4">{beat.name}</h3>  
                        <p className="mb-4">Genre: {beat.genre} | BPM: {beat.bpm}</p>  
                        <audio id={`audio-${beat.id}`} src={beat.src}></audio>  
                        <button  
                            onClick={() =>  
                                togglePlayPause(  
                                    beat.id,  
                                    document.getElementById(`audio-${beat.id}`)  
                                )  
                            }  
                            className="btn-custom"  
                        >  
                            Play  
                        </button>  
                        <small className="block mt-2 text-sm text-gray-400">  
                            Current Time: 0:00  
                        </small>  
                    </div>  
                ))}  
            </div>  
        </section>  
    );  
};  

export default FeaturedBeats;  