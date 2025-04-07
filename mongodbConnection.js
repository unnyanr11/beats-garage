const { MongoClient } = require("mongodb");  

const uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database_name>?retryWrites=true&w=majority";  

// Create a MongoClient  
const client = new MongoClient(uri);  

async function run() {  
  try {  
    // Connect to the cluster  
    await client.connect();  
    console.log("Connected to MongoDB Atlas!");  

    // Select the database and collection  
    const database = client.db("beatsGarage");  
    const beatsCollection = database.collection("beats");  

    // Example: Insert a document  
    const beat = {  
      name: "Trap Beat 1",  
      bpm: 120,  
      genre: "Trap",  
      mood: "Energetic",  
      price: 19.99,  
    };  
    const result = await beatsCollection.insertOne(beat);  
    console.log(`New beat inserted with ID: ${result.insertedId}`);  

    // Example: Fetch all documents  
    const beats = await beatsCollection.find().toArray();  
    console.log("Available beats:", beats);  
  } catch (e) {  
    console.error("Error connecting to MongoDB:", e);  
  } finally {  
    // Close the connection when done  
    await client.close();  
  }  
}  

run().catch(console.error);  