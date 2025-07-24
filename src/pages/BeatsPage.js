import React, { useState, useEffect, useRef } from "react";  
import PropTypes from "prop-types";  
import { useNavigate, useLocation } from "react-router-dom";  
import { ShoppingCart } from "lucide-react";  
import { db } from "../firebase";  
import { collection, getDocs } from "firebase/firestore"; // Import doc and updateDoc  
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
  
  // Update total amount whenever cart changes
  const totalAmount = uniqueCart.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  localStorage.setItem("totalAmount", totalAmount.toString());
};
const isBeatInCart = (beat) => getCartItems().some((item) => item.id === beat.id);  

// BeatsPage Component  
const BeatsPage = ({ isLoggedIn }) => {  
  const [beats, setBeats] = useState([]);  
  const [filteredBeats, setFilteredBeats] = useState([]);  
  const [filters, setFilters] = useState({ bpm: "all", genre: "all", mood: "all" });  
  const [sortOption, setSortOption] = useState("newest");  
  const [showPopup, setShowPopup] = useState(false);  
  const [popupMessage, setPopupMessage] = useState("");  
  const [popupButtons, setPopupButtons] = useState([]);  
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);  
  const [reloadTrigger, setReloadTrigger] = useState(0);  

  const navigate = useNavigate();  
  const location = useLocation();  

  // Effect for filters  
  useEffect(() => {  
    const params = new URLSearchParams(location.search);  
    const bpm = params.get("bpm") || "all";  
    const genre = params.get("genre") || "all";  
    const mood = params.get("mood") || "all";  
    setFilters({ bpm, genre, mood });  
  }, [location.search]);  

  // Fetch beats data from Firestore  
  useEffect(() => {  
    const fetchBeats = async () => {  
      try {  
        const beatsCollection = collection(db, "beats");  
        const snapshot = await getDocs(beatsCollection);  
        const beatsData = snapshot.docs.map((doc) => {  
          const data = { id: doc.id, ...doc.data() };  
          return {  
            ...data,  
            imageUrl: data.imageUrl || PLACEHOLDER_IMAGE,  
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),  
            isAvailable: data.isAvailable,  
          };  
        });  
        setBeats(beatsData);  
        setFilteredBeats(beatsData);  
      } catch (error) {  
        console.error("Error fetching beats from Firestore:", error);  
        alert("Failed to fetch beats. Please try again later.");  
      }  
    };  

    fetchBeats();  
  }, [reloadTrigger]);  

  // Apply filters to the beats  
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

        return bpmMatch && genreMatch && moodMatch; // Removed availability check here for now  
      });  

    const filtered = applyFilters();  
    sortBeats(filtered);  
  }, [filters, beats]);  

  const sortBeats = (beatsToSort = filteredBeats) => {  
    const sortedBeats = [...beatsToSort];  

    switch (sortOption) {  
      case "newest":  
        sortedBeats.sort((a, b) => b.createdAt - a.createdAt);  
        break;  
      case "oldest":  
        sortedBeats.sort((a, b) => a.createdAt - b.createdAt);  
        break;  
      case "price-low-high":  
        sortedBeats.sort((a, b) => (a.price || 0) - (b.price || 0));  
        break;  
      case "price-high-low":  
        sortedBeats.sort((a, b) => (b.price || 0) - (a.price || 0));  
        break;  
      case "a-z":  
        sortedBeats.sort((a, b) => (a.name || "").localeCompare(b.name || ""));  
        break;  
      case "z-a":  
        sortedBeats.sort((a, b) => (b.name || "").localeCompare(a.name || ""));  
        break;  
      default:  
        break;  
    }  

    setFilteredBeats(sortedBeats);  
  };  

  useEffect(() => {  
    sortBeats(); // Re-sort when sort option changes  
  }, [sortOption]);  

  const handlePlayPause = (id, audioRef) => {  
    // Stop any currently playing audio if it's different from the clicked audio  
    if (currentlyPlayingId && currentlyPlayingId !== id) {  
      const currentlyPlayingAudio = document.getElementById(currentlyPlayingId);  
      if (currentlyPlayingAudio) {  
        currentlyPlayingAudio.pause();  
        currentlyPlayingAudio.currentTime = 0; // Reset the audio playback position  
      }  
    }  

    // Update the state with the ID of the currently playing audio  
    setCurrentlyPlayingId((prevId) => (prevId === id ? null : id));  

    // Play or pause the clicked audio  
    if (audioRef.current) {  
      if (currentlyPlayingId !== id) {  
        audioRef.current.play();  
      } else {  
        audioRef.current.pause();  
      }  
    }  
  };  

  const handleAddToCart = async (beat) => {  
  if (isLoggedIn) {  
    // Check if beat is sold out
    if (beat.isAvailable === false) {
      showPopupWithMessage(`"${beat.name}" is sold out and cannot be purchased.`, [
        { label: "Close", className: "bg-red-500 hover:bg-red-600", onClick: closePopup },
      ]);
      return;
    }

    if (isBeatInCart(beat)) {  
      showPopupWithMessage(`"${beat.name}" is already in your cart.`, [  
        { 
          label: "Buy Now", 
          className: "bg-green-500 hover:bg-green-600", 
          onClick: () => {
            closePopup();
            localStorage.setItem("selectedBeatId", beat.id);
            localStorage.setItem("totalAmount", beat.price.toString());
            navigate("/payment");
          }
        },
        { label: "Close", className: "bg-blue-500 hover:bg-blue-600", onClick: closePopup },  
      ]);  
    } else {  
      try {  
        // Create proper cart item structure
        const cartItem = {
          id: beat.id,
          name: beat.name,
          price: parseFloat(beat.price || 0),
          genre: beat.genre,
          bpm: beat.bpm,
          mood: beat.mood,
          imageUrl: beat.imageUrl,
          audioUrl: beat.audioUrl,
          isAvailable: beat.isAvailable
        };

        // Add to cart (DON'T update Firestore availability here)
        saveCartItems([...getCartItems(), cartItem]);  

        showPopupWithMessage(`"${beat.name}" added to your cart!`, [  
          { 
            label: "Buy Now", 
            className: "bg-green-500 hover:bg-green-600", 
            onClick: () => {
              closePopup();
              localStorage.setItem("selectedBeatId", beat.id);
              localStorage.setItem("totalAmount", beat.price.toString());
              navigate("/payment");
            }
          },
          { 
            label: "Continue Shopping", 
            className: "bg-blue-500 hover:bg-blue-600", 
            onClick: closePopup 
          },  
        ]);  
      } catch (error) {  
        console.error("Error adding beat to cart:", error);  
        showPopupWithMessage("Failed to add beat to cart. Please try again.", [  
          { label: "Close", className: "bg-red-500 hover:bg-red-600", onClick: closePopup },  
        ]);  
      }  
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
      {  
        label: "Close",  
        className: "bg-red-500 hover:bg-red-600",  
        onClick: closePopup,  
      },  
    ]);  
  }  
};

  const showPopupWithMessage = (message, buttons) => {  
    setPopupMessage(message);  
    setPopupButtons(buttons);  
    setShowPopup(true);  
  };  

  const closePopup = () => {  
    setShowPopup(false);  
    setReloadTrigger((prev) => prev + 1);  
  };  

  const redirectTo = (path) => navigate(path, { replace: true });  

  return (  
    <div className="bg-black text-white min-h-screen p-8 font-sans">  
      <header className="p-4 text-center">  
        <h1 className="text-4xl font-bold">Explore Our Beats</h1>  
        <p className="text-gray-400 mt-2">The best beats for your tracks</p>  
      </header>  

      {/* Filters Section */}  
      <section className="bg-gray-800 p-6 shadow-lg rounded-lg mb-4">  
        <form className="flex flex-col md:flex-row items-center justify-center gap-4">  
          <FilterSelect  
            name="bpm"  
            label="BPM"  
            value={filters.bpm}  
            handleChange={(e) => setFilters({ ...filters, [e.target.name]: e.target.value })}  
            options={["all", "60-90", "91-120", "121-150", "151+"]}  
          />  
          <FilterSelect  
            name="genre"  
            label="Genre"  
            value={filters.genre}  
            handleChange={(e) => setFilters({ ...filters, [e.target.name]: e.target.value })}  
            options={["all", "Trap", "Lofi", "Drill", "Hip-Hop", "R&B", "Latin"]}  
          />  
          <FilterSelect  
            name="mood"  
            label="Mood"  
            value={filters.mood}  
            handleChange={(e) => setFilters({ ...filters, [e.target.name]: e.target.value })}  
            options={["all", "Dark", "Chill", "Energetic", "WestCoast", "Ethnic", "Happy", "Sad"]}  
          />  
        </form>  
      </section>  

      {/* Sort Section */}  
      <section className="flex justify-end mb-6">  
        <div className="flex items-center">  
          <label htmlFor="sort" className="text-sm text-gray-300 mr-2">  
            Sort By:  
          </label>  
          <select  
            id="sort"  
            value={sortOption}  
            onChange={(e) => setSortOption(e.target.value)}  
            className="bg-black border border-gray-600 text-white rounded-lg px-4 py-2"  
          >  
            <option value="newest">Newest First</option>  
            <option value="oldest">Oldest First</option>  
            <option value="price-low-high">Price (Low-High)</option>  
            <option value="price-high-low">Price (High-Low)</option>  
            <option value="a-z">A-Z</option>  
            <option value="z-a">Z-A</option>  
          </select>  
        </div>  
      </section>  

      {/* Beats Section */}  
      <section className="mt-8">  
        {filteredBeats.length > 0 ? (  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">  
            {filteredBeats.map((beat) => {  
              return (  
              <AudioPlayer                key={beat.id}
                beat={beat}
                isPlaying={currentlyPlayingId === beat.id}
                onPlayPause={handlePlayPause}
                handleAddToCart={handleAddToCart}
                isAvailable={beat.isAvailable} // Pass availability to AudioPlayer
              />)
            }
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center">No beats match the selected filters.</p>
        )}
      </section>

      {/* Popup */}
      {showPopup && <Popup message={popupMessage} buttons={popupButtons} />}
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

// AudioPlayer Component (formerly BeatCard)
const AudioPlayer = ({ beat, isPlaying, onPlayPause, handleAddToCart, isAvailable }) => {
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
        setTime((prev) => ({ ...prev, total: formatTime(audioElement.duration || 0) }));
      }
    };

    const handleTimeUpdate = () => {
      if (audioElement) {
        setTime((prev) => ({ ...prev, current: formatTime(audioElement.currentTime || 0) }));
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
      onPlayPause(beat.id, audioRef);
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
              disabled={!isAvailable}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-1 font-bold ${
                isAvailable ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={18} />
              {isAvailable ? "Add to Cart" : "Sold Out"}
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
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <audio id={beat.id} ref={audioRef} src={beat.audioUrl} preload="metadata" />
    </div>
  );
};

// PropTypes
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
    isAvailable: PropTypes.bool.isRequired,
  }).isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  handleAddToCart: PropTypes.func.isRequired,
  isAvailable: PropTypes.bool.isRequired,
};

FilterSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default BeatsPage;