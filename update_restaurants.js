import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCGJzet03LkhCg2W7erWnEst9Fbc0tYKsM",
  authDomain: "ecom-webapp-99927.firebaseapp.com",
  projectId: "ecom-webapp-99927",
  storageBucket: "ecom-webapp-99927.firebasestorage.app",
  messagingSenderId: "215794250171",
  appId: "1:215794250171:web:01fb154ccaeb37a5b3d49e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const locations = {
  "Buhari Restaurant": { lat: 13.067439, lng: 80.237617, addr: "Anna Salai, Chennai" },
  "Mavalli Tiffin Room (MTR)": { lat: 12.955212, lng: 77.585934, addr: "Lalbagh Road, Bangalore" },
  "Saravana Bhavan": { lat: 13.0827, lng: 80.2707, addr: "T. Nagar, Chennai" },
  "Anjappar Chettinad Restaurant": { lat: 13.0410, lng: 80.2323, addr: "Nungambakkam, Chennai" },
  "Empire Restaurant": { lat: 12.9756, lng: 77.6067, addr: "MG Road, Bangalore" }
};

const updateRestaurants = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'restaurants'));
    for (const restaurantDoc of snapshot.docs) {
      const data = restaurantDoc.data();
      const loc = locations[data.name] || { 
        lat: data.city === 'Chennai' ? 13.0827 : 12.9716, 
        lng: data.city === 'Chennai' ? 80.2707 : 77.5946,
        addr: `${data.name}, ${data.city}`
      };
      
      await updateDoc(doc(db, 'restaurants', restaurantDoc.id), {
        latitude: loc.lat,
        longitude: loc.lng,
        address: loc.addr
      });
      console.log(`Updated ${data.name}`);
    }
    console.log("All restaurants updated successfully.");
  } catch (error) {
    console.error("Error updating restaurants:", error);
  }
  process.exit(0);
};

updateRestaurants();
