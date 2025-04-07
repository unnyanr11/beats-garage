import React, { useState, useEffect, useRef } from "react";  
import PropTypes from "prop-types";  
import { useNavigate } from "react-router-dom";  
import { ShoppingCart } from "lucide-react";  
import { db } from "../firebase";  
import { collection, getDocs } from "firebase/firestore";  
import Popup from "../pages/Popup";  

// Constants  
const PLACEHOLDER_IMAGE = "/api/placeholder/400/400";  

// Utility Functions for LocalStorage  
const getCartItems = () => JSON.parse(localStorage.getItem("cartItems") || "[]");  

const saveCartItems = (items) => {  
  const uniqueCart = items.reduce((acc, curr) => {  
    if (!acc.some((item) => item.id === curr.id)) acc.push(curr);  
    return acc;  
  }, []);  
  localStorage.setItem("cartItems", JSON.stringify(uniqueCart));  
};  

const isBeatInCart = (beat) => getCartItems().some((item) => item.id === beat.id);  

// BeatsPage Component  
const BeatsPage = ({ isLoggedIn }) => {  
  const [beats, setBeats] = useState([]); // Holds all beats  
  const [filteredBeats, setFilteredBeats] = useState([]); // Holds filtered beats  
  const [filters, setFilters] = useState({ bpm: "all", genre: "all", mood: "all" });  
  const [showPopup, setShowPopup] = useState(false); // Popup state  
  const [popupMessage, setPopupMessage] = useState("");  
  const [popupButtons, setPopupButtons] = useState([]);  
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null); // Tracks currently playing beat  

  const navigate = useNavigate();  

  // Fetch beats data from Firestore  
  useEffect(() => {  
    const fetchBeats = async () => {  
      try {  
        const beatsCollection = collection(db, "beats");  
        const snapshot = await getDocs(beatsCollection);  
        const beatsData = snapshot.docs.map((doc) => {  
          const data = { id: doc.id, ...doc.data() };  
          // Ensure imageURL fallback during data fetch  
          return {  
            ...data,  
            imageUrl: data.imageUrl || PLACEHOLDER_IMAGE,  
          };  
        });  

        console.log("Fetched beats data:", beatsData); // Debugging fetched data  
        setBeats(beatsData);  
        setFilteredBeats(beatsData); // Initialize filtered beats  
      } catch (error) {  
        console.error("Error fetching beats from Firestore:", error);  
        alert("Failed to fetch beats. Please try again later.");  
      }  
    };  

    fetchBeats();  
  }, []);  

  // Update filtered beats whenever filters or beats change  
  useEffect(() => {  
    const applyFilters = () =>  
      beats.filter((beat) => {  
        const bpmMatch =  
          filters.bpm === "all" ||  
          (filters.bpm === "60-90" && beat.bpm >= 60 && beat.bpm <= 90) ||  
          (filters.bpm === "91-120" && beat.bpm >= 91 && beat.bpm <= 120) ||  
          (filters.bpm === "121-150" && beat.bpm >= 121 && beat.bpm <= 150) ||  
          (filters.bpm === "151+" && beat.bpm > 150);  

        const genreMatch = filters.genre === "all" || filters.genre === beat.genre;  
        const moodMatch = filters.mood === "all" || filters.mood === beat.mood;  

        return bpmMatch && genreMatch && moodMatch;  
      });  

    setFilteredBeats(applyFilters());  
  }, [filters, beats]);  

  const handleFilterChange = (e) => {  
    const { name, value } = e.target;  
    setFilters({ ...filters, [name]: value });  
  };  

  const handleAddToCart = (beat) => {  
    if (isLoggedIn) {  
      if (isBeatInCart(beat)) {  
        showPopupWithMessage(`"${beat.name}" is already in your cart.`, [  
          { label: "Close", className: "bg-blue-500 hover:bg-blue-600", onClick: closePopup },  
        ]);  
      } else {  
        saveCartItems([...getCartItems(), beat]);  
        showPopupWithMessage(`"${beat.name}" added to your cart!`, [  
          { label: "Close", className: "bg-green-500 hover:bg-green-600", onClick: closePopup },  
        ]);  
      }  
    } else {  
      showPopupWithMessage(`Log in or sign up to buy "${beat.name}".`, [  
        {  
          label: "Log In",  
          className: "bg-blue-500 hover:bg-blue-600",  
          onClick: () => redirectTo("/login"),  
        },  
        {  
          label: "Sign Up",  
          className: "bg-green-500 hover:bg-green-600",  
          onClick: () => redirectTo("/signup"),  
        },  
      ]);  
    }  
  };  

  const showPopupWithMessage = (message, buttons) => {  
    setPopupMessage(message);  
    setPopupButtons(buttons);  
    setShowPopup(true);  
  };  

  const closePopup = () => setShowPopup(false);  

  const redirectTo = (path) => navigate(path, { replace: true });  

  return (  
    <div className="bg-black text-white min-h-screen p-8 font-sans">  
      <header className="p-4 text-center">  
        <h1 className="text-4xl font-bold">Explore Our Beats</h1>  
        <p className="text-gray-400 mt-2">The best beats for your tracks</p>  
      </header>  

      {/* Filters Section */}  
      <section className="bg-gray-800 p-6 shadow-lg rounded-lg mb-8">  
        <form className="flex flex-col md:flex-row items-center justify-center gap-4">  
          <FilterSelect  
            name="bpm"  
            label="BPM"  
            value={filters.bpm}  
            handleChange={handleFilterChange}  
            options={["all", "60-90", "91-120", "121-150", "151+"]}  
          />  
          <FilterSelect  
            name="genre"  
            label="Genre"  
            value={filters.genre}  
            handleChange={handleFilterChange}  
            options={["all", "trap", "lofi", "drill", "edm"]}  
          />  
          <FilterSelect  
            name="mood"  
            label="Mood"  
            value={filters.mood}  
            handleChange={handleFilterChange}  
            options={["all", "dark", "chill", "energetic", "upbeat"]}  
          />  
        </form>  
      </section>  

      {/* Beats Section */}  
      <section>  
        {filteredBeats.length > 0 ? (  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">  
            {filteredBeats.map((beat) => (  
              <AudioPlayer  
                key={beat.id}  
                beat={beat}  
                isPlaying={currentlyPlayingId === beat.id}  
                onPlayPause={(id) =>  
                  setCurrentlyPlayingId(currentlyPlayingId === id ? null : id)  
                }  
                handleAddToCart={handleAddToCart}  
              />  
            ))}  
          </div>  
        ) : (  
          <p className="text-gray-400 text-center">No beats match the selected filters.</p>  
        )}  
      </section>  

      {/* Popup */}  
      {showPopup && <Popup message={popupMessage} buttons={popupButtons} />}  

      <footer className="text-center text-xs text-gray-600 mt-12">  
        © 2025 Beats Garage. All rights reserved.  
      </footer>  
    </div>  
  );  
};  

// FilterSelect Component  
const FilterSelect = ({ name, label, value, handleChange, options }) => (  
  <div className="flex flex-col">  
    <label htmlFor={name} className="text-sm text-gray-300 mb-1">  
      {label}  
    </label>  
    <select  
      id={name}  
      name={name}  
      value={value}  
      onChange={handleChange}  
      className="bg-black border border-gray-600 text-white rounded-lg px-4 py-2"  
    >  
      {options.map((option) => (  
        <option key={option} value={option}>  
          {option === "all" ? `All ${label}s` : option}  
        </option>  
      ))}  
    </select>  
  </div>  
);  

// AudioPlayer Component (Handles Images)  
const AudioPlayer = ({ beat, isPlaying, onPlayPause, handleAddToCart }) => {  
  const audioRef = useRef(null);  
  const [time, setTime] = useState({ current: "0:00", total: "0:00" });  
  const [progress, setProgress] = useState(0);  

  const formatTime = (secs) => {  
    if (!secs || isNaN(secs)) return "0:00";  
    const minutes = Math.floor(secs / 60);  
    const seconds = Math.floor(secs % 60).toString().padStart(2, "0");  
    return `${minutes}:${seconds}`;  
  };  

  useEffect(() => {  
    const audioElement = audioRef.current;  

    const handleLoadedMetadata = () => {  
      if (audioElement) {  
        setTime({ ...time, total: formatTime(audioElement.duration || 0) });  
      }  
    };  

    const handleTimeUpdate = () => {  
      if (audioElement) {  
        setTime({ ...time, current: formatTime(audioElement.currentTime || 0) });  
        setProgress((audioElement.currentTime / audioElement.duration) * 100 || 0);  
      }  
    };  

    if (audioElement) {  
      audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);  
      audioElement.addEventListener("timeupdate", handleTimeUpdate);  
    }  

    return () => {  
      if (audioElement) {  
        audioElement.removeEventListener("loadedmetadata", handleLoadedMetadata);  
        audioElement.removeEventListener("timeupdate", handleTimeUpdate);  
      }  
    };  
  }, [beat.audioUrl]);  

  const handlePlayPauseClick = () => {  
    if (audioRef.current) {  
      if (isPlaying) {  
        audioRef.current.pause();  
      } else {  
        audioRef.current.play();  
      }  
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
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg flex items-center gap-4">  
      <div className="flex-1">  
        <h2 className="font-bold text-lg mb-2">{beat.name || "Untitled Beat"}</h2>  
        <p className="text-gray-300">  
          Genre: {beat.genre || "N/A"} | BPM: {beat.bpm || "N/A"} | Mood: {beat.mood || "N/A"}  
        </p>  
        <p className="text-green-400 font-bold">${beat.price?.toFixed(2) || "0.00"}</p>  
        <div className="mt-4 flex flex-col items-start">  
          <div className="flex items-center gap-4">  
            <button  
              onClick={handlePlayPauseClick}  
              className={`px-4 py-2 font-bold text-white rounded-lg ${  
                isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"  
              }`}  
            >  
              {isPlaying ? "Pause" : "Play"}  
            </button>  
            <span className="text-gray-300 text-sm">  
              {time.current} / {time.total}  
            </span>  
            <button  
              onClick={() => handleAddToCart(beat)}  
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white flex items-center gap-1 font-bold"  
            >  
              <ShoppingCart size={18} />  
              Add to Cart  
            </button>  
          </div>  
          <input  
            type="range"  
            min={0}  
            max={100}  
            value={progress}  
            onChange={handleSliderChange}  
            className="mt-4 w-full h-2 bg-gray-700 rounded-lg cursor-pointer"  
            style={{ background: `linear-gradient(to right, #4caf50 ${progress}%, #555 ${progress}%)` }}  
          />  
        </div>  
      </div>  
      <div className="w-44 h-44">  
        <img  
          src={beat.imageUrl || PLACEHOLDER_IMAGE}  
          alt={beat.name || "No Image"}  
          className="w-full h-full object-cover "  
          loading="lazy"  
        />  
      </div>  
      <audio ref={audioRef} src={beat.audioUrl} preload="metadata"></audio>  
    </div>  
  );  
};  

BeatsPage.propTypes = {  
  isLoggedIn: PropTypes.bool.isRequired,  
};  

AudioPlayer.propTypes = {  
  beat: PropTypes.shape({  
    id: PropTypes.string.isRequired,  
    name: PropTypes.string,  
    genre: PropTypes.string,  
    bpm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),  
    mood: PropTypes.string,  
    price: PropTypes.number,  
    imageUrl: PropTypes.string,  
    audioUrl: PropTypes.string.isRequired,  
  }).isRequired,  
  isPlaying: PropTypes.bool.isRequired,  
  onPlayPause: PropTypes.func.isRequired,  
  handleAddToCart: PropTypes.func.isRequired,  
};  

FilterSelect.propTypes = {  
  name: PropTypes.string.isRequired,  
  label: PropTypes.string.isRequired,  
  value: PropTypes.string.isRequired,  
  handleChange: PropTypes.func.isRequired,  
  options: PropTypes.arrayOf(PropTypes.string).isRequired,  
};  

export default BeatsPage;  