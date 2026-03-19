import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGJzet03LkhCg2W7erWnEst9Fbc0tYKsM",
  authDomain: "ecom-webapp-99927.firebaseapp.com",
  projectId: "ecom-webapp-99927",
  storageBucket: "ecom-webapp-99927.firebasestorage.app",
  messagingSenderId: "215794250171",
  appId: "1:215794250171:web:01fb154ccaeb37a5b3d49e",
  measurementId: "G-40YE7R50JJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const anjapparItems = [
    { name: "Veg Meals (Full Thali)", price: 200, description: "White Rice, Sambar, Rasam, Kootu, Poriyal, Keerai, Curd, Pickle, Appalam, and Sweet.", image: "", category: "Veg" },
    { name: "Paneer 65", price: 220, description: "Deep-fried paneer cubes marinated in Chettinad spices.", image: "", category: "Veg" },
    { name: "Mushroom Pepper Fry", price: 240, description: "Fresh mushrooms sautéed with black pepper and curry leaves.", image: "", category: "Veg" },
    { name: "Gobi Manchurian", price: 180, description: "Cauliflower florets tossed in a spicy and tangy sauce.", image: "", category: "Veg" },
    { name: "Veg Pulao", price: 190, description: "Aromatic basmati rice cooked with assorted vegetables and mild spices.", image: "", category: "Veg" },
    { name: "Appam with Veg Stew", price: 160, description: "Soft-centered lacy pancakes served with coconut milk-based vegetable gravy.", image: "", category: "Veg" },
    { name: "Ceylone Veg Parotta", price: 150, description: "A layered, square-shaped parotta stuffed with a spiced vegetable filling.", image: "", category: "Veg" }
];

const run = async () => {
  try {
    const q = query(collection(db, "restaurants"), where("city", "==", "Chennai"), where("name", "==", "Anjappar"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        console.log("Anjappar in Chennai not found with 'Chennai'. Trying 'CHENNAI'");
        const q2 = query(collection(db, "restaurants"), where("city", "==", "CHENNAI"), where("name", "==", "Anjappar"));
        const snapshot2 = await getDocs(q2);

        if (snapshot2.empty) {
            console.log("Still not found. Exiting.");
            process.exit(1);
        }

        const restaurantDoc = snapshot2.docs[0];
        console.log(`Adding subcollection menu for Anjappar (ID: ${restaurantDoc.id})`);
        for (const item of anjapparItems) {
            await addDoc(collection(db, `restaurants/${restaurantDoc.id}/menu`), item);
        }
    } else {
        const restaurantDoc = snapshot.docs[0];
        console.log(`Adding subcollection menu for Anjappar (ID: ${restaurantDoc.id})`);
        for (const item of anjapparItems) {
            await addDoc(collection(db, `restaurants/${restaurantDoc.id}/menu`), item);
        }
    }

    console.log(`Done updating Anjappar.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
