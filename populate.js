import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

const restaurantsList = [
  // CHENNAI
  { name: 'Anjappar', city: 'CHENNAI', category: 'Non Veg' },
  { name: 'Murugan Idly Shop', city: 'CHENNAI', category: 'Veg' },
  { name: 'A2B (Adyar Ananda Bhavan)', city: 'CHENNAI', category: 'Veg' },
  { name: 'Buhari Restaurant', city: 'CHENNAI', category: 'Non Veg' },
  { name: 'Barbeque Nation', city: 'CHENNAI', category: 'Non Veg' },
  { name: 'Dominos Pizza', city: 'CHENNAI', category: 'Pizza' },
  { name: 'KFC', city: 'CHENNAI', category: 'Burgers / Fried Chicken' },

  // BANGALORE
  { name: 'Mavalli Tiffin Room (MTR)', city: 'BANGALORE', category: 'Veg' },
  { name: 'Sattvam', city: 'BANGALORE', category: 'Veg' },
  { name: 'Empire Restaurant', city: 'BANGALORE', category: 'Non Veg' },
  { name: 'The Fisherman\'s Wharf', city: 'BANGALORE', category: 'Seafood' },
  { name: 'Nandhini Deluxe', city: 'BANGALORE', category: 'Non Veg' },
  { name: 'Brik Oven', city: 'BANGALORE', category: 'Pizza' },
  { name: 'The Pizza Bakery', city: 'BANGALORE', category: 'Pizza' },

  // HYDERABAD
  { name: 'Chutneys', city: 'HYDERABAD', category: 'Veg' },
  { name: 'Tatva', city: 'HYDERABAD', category: 'Veg' },
  { name: 'Bawarchi Restaurant', city: 'HYDERABAD', category: 'Non Veg' },
  { name: 'Pista House', city: 'HYDERABAD', category: 'Non Veg' },
  { name: 'Paradise Biryani', city: 'HYDERABAD', category: 'Non Veg' },
  { name: 'Pizza Den', city: 'HYDERABAD', category: 'Pizza' },
  { name: 'Cafe Niloufer', city: 'HYDERABAD', category: 'Beverages / Snacks' },

  // VIZAG
  { name: 'Subbayya Gari Hotel', city: 'VIZAG', category: 'Veg' },
  { name: 'Venkatadri Vantillu', city: 'VIZAG', category: 'Veg' },
  { name: 'The Spicy Venue', city: 'VIZAG', category: 'Non Veg' },
  { name: 'Kamath Restaurant', city: 'VIZAG', category: 'Seafood' },
  { name: 'Raju Gari Dhaba', city: 'VIZAG', category: 'Non Veg' },
  { name: 'Flying Spaghetti Monster', city: 'VIZAG', category: 'Pizza / Italian' },
  { name: 'Bean Board', city: 'VIZAG', category: 'Cafe / Desserts' }
];

const menuData = {
  veg: [
    { itemName: "Masala Dosa", category: "Veg" },
    { itemName: "Rava Idli", category: "Veg" },
    { itemName: "Veg Meals", category: "Veg" },
    { itemName: "Paneer Butter Masala", category: "Veg" }
  ],
  nonVeg: [
    { itemName: "Chicken Biryani", category: "Non Veg" },
    { itemName: "Mutton Biryani", category: "Non Veg" },
    { itemName: "Butter Chicken", category: "Non Veg" },
    { itemName: "Chicken Kebab", category: "Non Veg" },
    { itemName: "Fish Curry", category: "Non Veg" }
  ],
  pizzaBurgers: [
    { itemName: "Pizza Margherita", category: "Pizza / Burgers" },
    { itemName: "Pepperoni Pizza", category: "Pizza / Burgers" },
    { itemName: "Cheese Burger", category: "Pizza / Burgers" },
    { itemName: "Chicken Burger", category: "Pizza / Burgers" }
  ],
  dessertsDrinks: [
    { itemName: "Chocolate Cake", category: "Desserts / Drinks" },
    { itemName: "Ice Cream", category: "Desserts / Drinks" },
    { itemName: "Cold Coffee", category: "Desserts / Drinks" },
    { itemName: "Fresh Juice", category: "Desserts / Drinks" },
    { itemName: "Tea", category: "Desserts / Drinks" },
    { itemName: "Hyderabadi Chai", category: "Desserts / Drinks" }
  ]
};

const getRandomPrice = () => Math.floor(Math.random() * (500 - 80 + 1)) + 80;
const getRandomRating = () => parseFloat((Math.random() * 1.2 + 3.8).toFixed(1)); // 3.8 to 5.0

const getMenuItemsForCategory = (categoryStr) => {
  const items = [];
  const cat = categoryStr.toLowerCase();
  
  if (cat.includes('veg') && !cat.includes('non veg')) {
    items.push(...menuData.veg);
  }
  if (cat.includes('non veg') || cat.includes('seafood')) {
    items.push(...menuData.nonVeg);
    items.push(...menuData.veg); // typically Non-veg restaurants also serve veg meals/side dishes
  }
  if (cat.includes('pizza') || cat.includes('burger') || cat.includes('italian') || cat.includes('fried chicken')) {
    items.push(...menuData.pizzaBurgers);
  }
  if (cat.includes('cafe') || cat.includes('beverage') || cat.includes('snack') || cat.includes('dessert')) {
    items.push(...menuData.dessertsDrinks);
  }

  // Everyone gets some drinks/desserts if they didn't get all of them above
  if (!cat.includes('cafe') && !cat.includes('beverage') && !cat.includes('dessert')) {
    items.push(menuData.dessertsDrinks[2]); // Cold Coffee
    items.push(menuData.dessertsDrinks[3]); // Fresh Juice
    
    // Add Chai in Hyderabad
    if (categoryStr.toLowerCase().includes('hyderabad')) {
      items.push(menuData.dessertsDrinks[5]); // Hyderabadi Chai
    }
  }

  return items;
};

const runPopulation = async () => {
  try {
    for (const rest of restaurantsList) {
      console.log(`Adding restaurant: ${rest.name}`);
      
      const restData = {
        name: rest.name,
        city: rest.city,
        category: rest.category,
        rating: getRandomRating()
      };
      
      const restDocRef = await addDoc(collection(db, "restaurants"), restData);
      const restId = restDocRef.id;
      
      const menuItems = getMenuItemsForCategory(rest.category);
      let count = 0;
      for (const item of menuItems) {
        const itemData = {
          restaurantId: restId,
          itemName: item.itemName,
          category: item.category,
          price: getRandomPrice()
        };
        await addDoc(collection(db, "menu"), itemData);
        count++;
      }
      console.log(`- Added ${count} menu items for ${rest.name} (ID: ${restId})`);
    }
    console.log("Database successfully populated!");
    process.exit(0);
  } catch (error) {
    console.error("Error populating database: ", error);
    process.exit(1);
  }
};

runPopulation();
