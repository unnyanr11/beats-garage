import React, { useState, useEffect } from "react";  
import PropTypes from "prop-types";  
import { ShoppingCart } from "lucide-react";  
import { useNavigate } from "react-router-dom";  
import { db } from "../firebase"; // Firestore instance  
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";  
import Popup from "../pages/Popup"; // Popup for messages  

// Utility Functions for Cart Management  
const getUniqueCartItems = () => {  
  const storedCart = localStorage.getItem("cartItems");  
  const parsedCart = storedCart ? JSON.parse(storedCart) : [];  
  return parsedCart.reduce((acc, curr) => {  
    if (!acc.some((item) => item.id === curr.id)) acc.push(curr);  
    return acc;  
  }, []);  
};  

const saveCartItems = (cartItems) => {  
  const uniqueCart = cartItems.reduce((acc, curr) => {  
    if (!acc.some((item) => item.id === curr.id)) acc.push(curr);  
    return acc;  
  }, []);  
  localStorage.setItem("cartItems", JSON.stringify(uniqueCart));  
};  

const FeaturedBeats = ({ isLoggedIn }) => {  
  const [beats, setBeats] = useState([]); // Dynamically fetched beats  
  const [playingAudioId, setPlayingAudioId] = useState(null); // Track currently playing beat  
  const [audioElements, setAudioElements] = useState({}); // Cache audio elements  
  const [showPopup, setShowPopup] = useState(false); // Popup state  
  const [popupMessage, setPopupMessage] = useState("");  
  const [popupButtons, setPopupButtons] = useState([]);  
  const navigate = useNavigate();  

  /**  
   * Fetch top 3 most recent beats from Firestore in real-time  
   */  
  useEffect(() => {  
    const fetchBeats = async () => {  
      try {  
        const beatsCollection = collection(db, "beats");  
        const beatsQuery = query(beatsCollection, orderBy("createdAt", "desc"), limit(3)); // Limit to top 3  
        const unsubscribe = onSnapshot(beatsQuery, (snapshot) => {  
          const fetchedBeats = snapshot.docs.map((doc) => ({  
            id: doc.id,  
            ...doc.data(),  
          }));  

          console.log("Realtime Beats: ", fetchedBeats); // Log real-time data  
          setBeats(fetchedBeats); // Update state with the top 3 beats (latest first)  
        });  

        // Clean up the listener on unmount  
        return () => unsubscribe();  
      } catch (error) {  
        console.error("Error fetching real-time beats:", error);  
        setBeats([]); // Fallback to avoid crashes  
      }  
    };  

    fetchBeats();  
  }, []);  

  /**  
   * Cache audio elements for play/pause functionality  
   */  
  useEffect(() => {  
    const elements = {};  
    beats.forEach((beat) => {  
      const audio = new Audio(beat.audioUrl || ""); // Use a fallback URL if audioUrl is missing  
      audio.preload = "metadata";  
      elements[beat.id] = audio;  
    });  
    setAudioElements(elements);  

    // Cleanup on unmount  
    return () => {  
      Object.values(elements).forEach((audio) => {  
        audio.pause();  
        audio.removeAttribute("src");  
      });  
    };  
  }, [beats]);  

  // Toggle Play/Pause for a Beat  
  const togglePlayPause = (beatId) => {  
    const currentAudio = audioElements[beatId];  
    if (!currentAudio) return;  

    if (playingAudioId && playingAudioId !== beatId) {  
      const previousAudio = audioElements[playingAudioId];  
      previousAudio.pause();  
    }  

    if (playingAudioId === beatId) {  
      currentAudio.pause();  
      setPlayingAudioId(null);  
    } else {  
      currentAudio.play().then(() => setPlayingAudioId(beatId));  
    }  
  };  

  // Handle Adding Beats to Cart  
  const handleBuy = (beat) => {  
    const cart = getUniqueCartItems();  
    const beatForCart = { ...beat, title: beat.name };  

    if (isLoggedIn) {  
      const isAlreadyInCart = cart.some((item) => item.id === beat.id);  

      if (isAlreadyInCart) {  
        showPopupWithMessage("Beat is already in your cart.", [  
          {  
            label: "Close",  
            onClick: closePopup,  
            className: "bg-blue-500 hover:bg-blue-600",  
          },  
        ]);  
      } else {  
        const updatedCart = [...cart, beatForCart];  
        saveCartItems(updatedCart);  
        showPopupWithMessage("Beat added to your cart!", [  
          {  
            label: "Close",  
            onClick: closePopup,  
            className: "bg-green-500 hover:bg-green-600",  
          },  
        ]);  
      }  
    } else {  
      showPopupWithMessage("Please log in or sign up to purchase.", [  
        {  
          label: "Log In",  
          onClick: () => redirectTo("/login"),  
          className: "bg-blue-500 hover:bg-blue-600",  
        },  
        {  
          label: "Sign Up",  
          onClick: () => redirectTo("/signup"),  
          className: "bg-green-500 hover:bg-green-600",  
        },  
      ]);  
    }  
  };  

  // Popup Helpers  
  const showPopupWithMessage = (message, buttons) => {  
    setPopupMessage(message);  
    setPopupButtons(buttons || []);  
    setShowPopup(true);  
  };  

  const closePopup = () => setShowPopup(false);  
  const redirectTo = (path) => navigate(path);  

  return (  
    <section id="featured-beats" className="py-20 container mx-auto px-5">  
      <h2 className="text-4xl font-bold mb-10 text-center text-white">Featured Beats</h2>  
      {beats.length > 0 ? (  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">  
          {beats.map((beat) => (  
            <div  
              key={beat.id}  
              className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 flex flex-col justify-between"  
            >  
              <div>  
                <h2 className="text-xl font-bold text-white mb-3">{beat.name}</h2>  
                <p className="text-sm text-gray-300">  
                  Genre: {beat.genre} | BPM: {beat.bpm} | Mood: {beat.mood}  
                </p>  
                <p className="text-md text-green-400 font-bold">  
                  ${beat.price?.toFixed(2) || "0.00"}  
                </p>  
              </div>  
              <div className="flex justify-center gap-4 mt-4">  
                <button  
                  className={`px-4 py-2 text-white font-bold rounded-lg transition-colors ${  
                    playingAudioId === beat.id  
                      ? "bg-red-600 hover:bg-red-700"  
                      : "bg-red-500 hover:bg-red-600"  
                  }`}  
                  onClick={() => togglePlayPause(beat.id)}  
                >  
                  {playingAudioId === beat.id ? "Pause" : "Play"}  
                </button>  
                <button  
                  className="px-4 py-2 bg-green-500 text-white font-bold flex items-center gap-2 rounded-lg hover:bg-green-600 transition"  
                  onClick={() => handleBuy(beat)}  
                  aria-label={`Buy ${beat.name}`}  
                >  
                  <ShoppingCart size={16} />  
                  Buy  
                </button>  
              </div>  
            </div>  
          ))}  
        </div>  
      ) : (  
        <p className="text-center text-gray-400">No featured beats available. Please check back later.</p>  
      )}  
      {showPopup && <Popup message={popupMessage} buttons={popupButtons} />}  
    </section>  
  );  
};  

// PropType validation  
FeaturedBeats.propTypes = {  
  isLoggedIn: PropTypes.bool.isRequired,  
};  

export default FeaturedBeats;  