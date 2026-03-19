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

const chennaiData = {
  "Anjappar": {
    category: "Non Veg",
    items: [
      { name: "Chettinad Chicken Curry", price: 250, description: "Spicy Chettinad flavor", image: "" },
      { name: "Chicken 65", price: 200, description: "Classic fried chicken", image: "" },
      { name: "Mutton Sukka", price: 300, description: "Dry roasted mutton", image: "" },
      { name: "Fish Fry", price: 220, description: "Crispy fried fish", image: "" },
      { name: "Chicken Biryani", price: 280, description: "Aromatic basmati rice", image: "" },
      { name: "Mutton Biryani", price: 320, description: "Tender mutton with rice", image: "" },
      { name: "Pepper Chicken", price: 240, description: "Spicy pepper chicken", image: "" }
    ]
  },
  "Murugan Idly Shop": {
    category: "Veg",
    items: [
      { name: "Idli", price: 40, description: "Soft steamed rice cakes", image: "" },
      { name: "Ghee Podi Idli", price: 80, description: "Idlis tossed in ghee and spiced powder", image: "" },
      { name: "Masala Dosa", price: 100, description: "Crispy crepe with potato filling", image: "" },
      { name: "Plain Dosa", price: 70, description: "Crispy crepe", image: "" },
      { name: "Pongal", price: 90, description: "Savory rice and lentil porridge", image: "" },
      { name: "Medu Vada", price: 50, description: "Crispy lentil donut", image: "" },
      { name: "Filter Coffee", price: 45, description: "Classic South Indian coffee", image: "" }
    ]
  },
  "A2B (Adyar Ananda Bhavan)": {
    category: "Veg",
    items: [
      { name: "Mini Tiffin", price: 150, description: "Assorted mini breakfast items", image: "" },
      { name: "Rava Dosa", price: 110, description: "Crispy semolina crepe", image: "" },
      { name: "Poori Masala", price: 120, description: "Fried flatbread with potato curry", image: "" },
      { name: "Vegetable Biryani", price: 180, description: "Spiced rice with mixed vegetables", image: "" },
      { name: "Paneer Butter Masala", price: 220, description: "Paneer in rich tomato gravy", image: "" },
      { name: "Chole Bhature", price: 160, description: "Spicy chickpea curry with fried bread", image: "" },
      { name: "South Indian Meals", price: 250, description: "Traditional full meal", image: "" }
    ]
  },
  "Buhari Restaurant": {
    category: "Non Veg",
    items: [
        { name: "Chicken 65", price: 200, description: "Original 1965 recipe", image: "" },
        { name: "Chicken Biryani", price: 260, description: "Signature biryani", image: "" },
        { name: "Mutton Biryani", price: 320, description: "Rich mutton flavor", image: "" },
        { name: "Chicken Tikka", price: 250, description: "Grilled chicken pieces", image: "" },
        { name: "Butter Chicken", price: 280, description: "Creamy tomato gravy", image: "" },
        { name: "Chicken Fried Rice", price: 210, description: "Wok tossed rice", image: "" },
        { name: "Egg Fried Rice", price: 180, description: "Classic egg fried rice", image: "" }
    ]
  },
  "Barbeque Nation": {
    category: "Non Veg",
    items: [
        { name: "Grilled Chicken Wings", price: 300, description: "Smoky BBQ wings", image: "" },
        { name: "BBQ Chicken Tikka", price: 320, description: "Classic BBQ chicken", image: "" },
        { name: "Fish Tikka", price: 350, description: "Grilled fish chunks", image: "" },
        { name: "Mutton Seekh Kebab", price: 380, description: "Minced mutton grilled on skewers", image: "" },
        { name: "Chicken Biryani", price: 290, description: "flavorful rice", image: "" },
        { name: "Butter Chicken", price: 310, description: "Rich buttery sauce", image: "" },
        { name: "Chicken Dum Biryani", price: 320, description: "Slow cooked biryani", image: "" }
    ]
  },
  "Dominos Pizza": {
    category: "Pizza",
    items: [
        { name: "Margherita Pizza", price: 150, description: "Classic cheese pizza", image: "" },
        { name: "Farmhouse Pizza", price: 250, description: "Loaded with veggies", image: "" },
        { name: "Peppy Paneer Pizza", price: 280, description: "Spicy paneer and paprika", image: "" },
        { name: "Veg Extravaganza Pizza", price: 300, description: "All veggies combined", image: "" },
        { name: "Chicken Dominator Pizza", price: 350, description: "Loaded with double chicken", image: "" },
        { name: "Pepper Barbecue Chicken Pizza", price: 320, description: "BBQ chicken toppings", image: "" },
        { name: "Indi Chicken Tikka Pizza", price: 360, description: "Indian style chicken tikka", image: "" }
    ]
  },
  "KFC": {
    category: "Burgers / Fried Chicken",
    items: [
        { name: "Zinger Burger", price: 180, description: "Classic crispy chicken burger", image: "" },
        { name: "Veg Zinger Burger", price: 160, description: "Crispy veg patty", image: "" },
        { name: "Hot & Crispy Chicken", price: 220, description: "Signature fried chicken", image: "" },
        { name: "Chicken Popcorn", price: 150, description: "Bite-sized chicken", image: "" },
        { name: "Peri Peri Chicken Strips", price: 190, description: "Spicy boneless strips", image: "" },
        { name: "Double Down Burger", price: 250, description: "All chicken, no bun", image: "" },
        { name: "Chicken Bucket", price: 650, description: "Family size fried chicken bucket", image: "" }
    ]
  }
};

const run = async () => {
  try {
    const q = query(collection(db, "restaurants"), where("city", "==", "CHENNAI"));
    const snapshot = await getDocs(q);
    
    let updatedCount = 0;
    for (const restaurantDoc of snapshot.docs) {
      const restName = restaurantDoc.data().name;
      const data = chennaiData[restName];
      if (data) {
        console.log(`Adding subcollection menu for ${restName}`);
        for (const item of data.items) {
          item.category = data.category;
          await addDoc(collection(db, `restaurants/${restaurantDoc.id}/menu`), item);
        }
        updatedCount++;
      }
    }
    console.log(`Done updating ${updatedCount} restaurants in Chennai.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
