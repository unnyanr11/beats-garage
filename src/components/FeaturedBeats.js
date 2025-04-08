import React, { useState, useEffect, useRef } from "react";  
import PropTypes from "prop-types";  
import { ShoppingCart } from "lucide-react";  
import { useNavigate } from "react-router-dom";  
import { db } from "../firebase"; // Firestore instance  
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";  
import Popup from "../pages/Popup"; // Popup for handling messages  

const PLACEHOLDER_IMAGE = "/api/placeholder/300/300"; // Fallback if no image exists  

// Utility Functions for Cart Management  
const getCartItems = () => JSON.parse(localStorage.getItem("cartItems") || "[]");  

const saveCartItems = (cartItems) => {  
  const uniqueCart = cartItems.reduce((acc, curr) => {  
    if (!acc.some((item) => item.id === curr.id)) acc.push(curr);  
    return acc;  
  }, []);  
  localStorage.setItem("cartItems", JSON.stringify(uniqueCart));  
};  

const isBeatInCart = (beat) => getCartItems().some((item) => item.id === beat.id);  

const FeaturedBeats = ({ isLoggedIn }) => {  
  const [beats, setBeats] = useState([]); // Tracks fetched beats  
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null); // Tracks actively playing beat  
  const [showPopup, setShowPopup] = useState(false); // Show/hide popup state  
  const [popupMessage, setPopupMessage] = useState(""); // Popup text content  
  const [popupButtons, setPopupButtons] = useState([]); // Buttons in the popup  
  const navigate = useNavigate();  

  // Fetch the top 3 most recent beats from Firestore  
  useEffect(() => {  
    const fetchBeats = async () => {  
      try {  
        const beatsCollection = collection(db, "beats");  
        const beatsQuery = query(beatsCollection, orderBy("createdAt", "desc"), limit(3)); // Fetch only top 3 most recent beats  
        const unsubscribe = onSnapshot(beatsQuery, (snapshot) => {  
          const fetchedBeats = snapshot.docs.map((doc) => ({  
            id: doc.id,  
            ...doc.data(),  
            imageUrl: doc.data().imageUrl || PLACEHOLDER_IMAGE, // Add default image if missing  
          }));  
          setBeats(fetchedBeats);  
        });  

        return () => unsubscribe(); // Cleanup Firestore listener on unmount  
      } catch (error) {  
        console.error("Error fetching beats:", error);  
      }  
    };  

    fetchBeats();  
  }, []);  

  // Handles adding items to the cart  
  const handleAddToCart = (beat) => {  
    if (isLoggedIn) {  
      if (isBeatInCart(beat)) {  
        // If the beat is already in the cart  
        showPopupWithMessage(`"${beat.name}" is already in your cart.`, [  
          { label: "Close", onClick: closePopup, className: "bg-blue-500 hover:bg-blue-600" },  
        ]);  
      } else {  
        // Add the beat to cart  
        saveCartItems([...getCartItems(), beat]);  
        showPopupWithMessage(`"${beat.name}" has been added to your cart.`, [  
          { label: "Close", onClick: closePopup, className: "bg-green-500 hover:bg-green-600" },  
        ]);  
      }  
    } else {  
      // If user isn't logged in - show login/signup popup  
      showPopupWithMessage(`Please log in to purchase "${beat.name}".`, [  
        { label: "Log In", onClick: () => navigate("/login"), className: "bg-blue-500 hover:bg-blue-600" },  
        { label: "Sign Up", onClick: () => navigate("/signup"), className: "bg-green-500 hover:bg-green-600" },  
      ]);  
    }  
  };  

  // Setup the message popup  
  const showPopupWithMessage = (message, buttons = []) => {  
    setPopupMessage(message);  
    setPopupButtons(buttons);  
    setShowPopup(true);  
  };  

  const closePopup = () => setShowPopup(false);  

  return (  
    <section id="featured-beats" className="py-20 container mx-auto px-5">  
      <h2 className="text-4xl font-bold mb-10 text-center text-white">Featured Beats</h2>  
      {beats.length > 0 ? (  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">  
          {beats.map((beat) => (  
            <AudioPlayer  
              key={beat.id}  
              beat={beat}  
              isPlaying={currentlyPlayingId === beat.id}  
              onPlayPause={(id) => setCurrentlyPlayingId(currentlyPlayingId === id ? null : id)}  
              onAddToCart={handleAddToCart}  
            />  
          ))}  
        </div>  
      ) : (  
        <p className="text-center text-gray-400">No featured beats available. Please check back later.</p>  
      )}  
      {showPopup && <Popup message={popupMessage} buttons={popupButtons} />}  
    </section>  
  );  
};  

const AudioPlayer = ({ beat, isPlaying, onPlayPause, onAddToCart }) => {  
  const audioRef = useRef(null);  
  const [time, setTime] = useState({ current: "0:00", total: "0:00" });  
  const [progress, setProgress] = useState(0);  

  // Format seconds into "mm:ss"  
  const formatTime = (seconds) => {  
    if (!seconds || isNaN(seconds)) return "0:00";  
    const minutes = Math.floor(seconds / 60);  
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");  
    return `${minutes}:${secs}`;  
  };  

  useEffect(() => {  
    const audio = audioRef.current;  

    const updateMetadata = () => {  
      setTime((prev) => ({ ...prev, total: formatTime(audio.duration) }));  
    };  

    const updateProgress = () => {  
      setTime((prev) => ({ ...prev, current: formatTime(audio.currentTime) }));  
      setProgress((audio.currentTime / audio.duration) * 100 || 0);  
    };  

    if (audio) {  
      audio.addEventListener("loadedmetadata", updateMetadata);  
      audio.addEventListener("timeupdate", updateProgress);  
    }  

    return () => {  
      if (audio) {  
        audio.removeEventListener("loadedmetadata", updateMetadata);  
        audio.removeEventListener("timeupdate", updateProgress);  
      }  
    };  
  }, []);  

  const togglePlayPause = () => {  
    if (audioRef.current) {  
      if (isPlaying) audioRef.current.pause();  
      else audioRef.current.play();  
      onPlayPause(beat.id);  
    }  
  };  

  const handleSliderChange = (e) => {  
    if (audioRef.current) {  
      const newTime = (e.target.value / 100) * audioRef.current.duration;  
      audioRef.current.currentTime = newTime;  
      setProgress(e.target.value);  
    }  
  };  

  return (  
    <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col items-center p-4" style={{ width: "250px", height: "400px" }}>  
      <div className="w-full h-48 mb-4">  
        <img src={beat.imageUrl} alt={beat.name} className="w-full h-full object-cover rounded-t-lg" />  
      </div>  
      <div className="flex-1 w-full text-center">  
        <h2 className="font-bold text-lg text-white">{beat.name}</h2>  
        <p className="text-gray-300">Genre: {beat.genre} | BPM: {beat.bpm} | Mood: {beat.mood}</p>  
        <p className="font-bold text-green-400 mt-2">${beat.price.toFixed(2)}</p>  
        {/* Play/Pause Button */}  
        <div className="flex items-center justify-center mt-4 gap-4">  
          <button  
            className={`px-4 py-2 font-bold text-white rounded-lg ${isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}  
            onClick={togglePlayPause}  
          >  
            {isPlaying ? "Pause" : "Play"}  
          </button>  
          <span className="text-sm text-gray-300">{time.current} / {time.total}</span>  
        </div>  
        {/* Slider */}  
        <input  
          type="range"  
          min="0"  
          max="100"  
          value={progress}  
          onChange={handleSliderChange}  
          className="w-full h-1 mt-2 bg-gray-700 rounded cursor-pointer"  
          style={{ background: `linear-gradient(to right, #4caf50 ${progress}%, #555 ${progress}%)` }}  
        />  
        {/* Add to Cart */}  
        <button  
          className="mt-4 w-full px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"  
          onClick={() => onAddToCart(beat)}  
        >  
          <ShoppingCart size={16} />  
          Add to Cart  
        </button>  
      </div>  
      {/* Hidden Audio Element */}  
      <audio ref={audioRef} src={beat.audioUrl} autoPlay={false}></audio>  
    </div>  
  );  
};  

FeaturedBeats.propTypes = {  
  isLoggedIn: PropTypes.bool.isRequired,  
};  

AudioPlayer.propTypes = {  
  beat: PropTypes.object.isRequired,  
  isPlaying: PropTypes.bool.isRequired,  
  onPlayPause: PropTypes.func.isRequired,  
  onAddToCart: PropTypes.func.isRequired,  
};  

export default FeaturedBeats;  