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

const getRandomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const data = {
  "BANGALORE": {
    "Mavalli Tiffin Room (MTR)": {
      category: "Veg",
      items: [
        { name: "Rava Idli", price: 80, description: "Classic semolina idli" },
        { name: "Masala Dosa", price: 120, description: "Crispy dosa with spiced potato" },
        { name: "Bisibele Bath", price: 150, description: "Spicy rice and lentil dish" },
        { name: "Puri Sagu", price: 110, description: "Deep fried bread with mixed veg curry" },
        { name: "Chandrahara", price: 90, description: "Signature sweet dessert" },
        { name: "Filter Coffee", price: 50, description: "Strong South Indian coffee" },
        { name: "Mysore Pak", price: 70, description: "Rich ghee sweet" }
      ]
    },
    "Sattvam": {
      category: "Veg",
      items: [
        { name: "Sattvic Paneer Tikka", price: 280, description: "No onion no garlic paneer tikka" },
        { name: "Dal Makhani", price: 240, description: "Creamy black lentils" },
        { name: "Sattvic Biryani", price: 260, description: "Aromatic vegetable rice" },
        { name: "Paneer Pyari Patti", price: 290, description: "Special paneer gravy" },
        { name: "Amritras Ke Kofte", price: 270, description: "Vegetable dumplings in rich gravy" },
        { name: "Kesar Malai Tikka", price: 300, description: "Soft malai paneer" },
        { name: "Kurmuri Jalebi Chaat", price: 180, description: "Crispy jalebi in chaat style" }
      ]
    },
    "Empire Restaurant": {
      category: "Non Veg",
      items: [
        { name: "Empire Special Grilled Chicken", price: 350, description: "Signature grilled chicken" },
        { name: "Chicken Biryani", price: 250, description: "Flavorful chicken biryani" },
        { name: "Ghee Rice with Butter Chicken", price: 320, description: "Classic combination" },
        { name: "Chicken Kebab", price: 220, description: "Crispy fried chicken bites" },
        { name: "Coin Paratha", price: 60, description: "Soft flaky bread" },
        { name: "Chicken Manchurian", price: 240, description: "Indo-chinese chicken" },
        { name: "Chicken Varaval", price: 280, description: "Spicy dry chicken roast" }
      ]
    },
    "The Fisherman's Wharf": {
      category: "Seafood",
      items: [
        { name: "Fish Rawa Fried", price: 380, description: "Crispy semolina coated fish" },
        { name: "Scrambled Crab", price: 420, description: "Spicy scrambled crab meat" },
        { name: "Goan Prawn Curry", price: 450, description: "Authentic goan style curry" },
        { name: "Masala Fried Pomfret", price: 500, description: "Whole pomfret fried with spices" },
        { name: "Lobster Thermidor", price: 800, description: "Creamy baked lobster" },
        { name: "Squid Butter Garlic", price: 400, description: "Tender squid in butter garlic sauce" },
        { name: "Fish Recheado", price: 450, description: "Goan stuffed fish" }
      ]
    },
    "Nandhini Deluxe": {
      category: "Non Veg",
      items: [
        { name: "Andhra Style Chilli Chicken", price: 260, description: "Spicy green chilli chicken" },
        { name: "Chicken Sholay Kebab", price: 280, description: "Signature spicy chicken appetizer" },
        { name: "Mutton Fry", price: 350, description: "Dry roasted mutton pieces" },
        { name: "Nandhini Special Biryani", price: 290, description: "Spicy Andhra biryani" },
        { name: "Mutton Chilli", price: 360, description: "Mutton cooked with green chillies" },
        { name: "Egg Chilli", price: 180, description: "Spicy egg preparation" },
        { name: "Chicken Guntur", price: 270, description: "Very spicy chicken curry" }
      ]
    },
    "Brik Oven": {
      category: "Pizza",
      items: [
        { name: "Margherita Pizza", price: 400, description: "Classic Neapolitan pizza" },
        { name: "Honey-Trap Pepperoni Pizza", price: 550, description: "Pepperoni with hot honey" },
        { name: "The 24K Pie", price: 600, description: "Premium ingredients" },
        { name: "Forest Floor Pizza (Mushroom)", price: 480, description: "Truffle and wild mushrooms" },
        { name: "Popeyes Paneer Pizza", price: 450, description: "Spinach and paneer" },
        { name: "The Buffalo Wingman Pizza", price: 500, description: "Spicy buffalo chicken" },
        { name: "Umami Bomb Pizza", price: 520, description: "Rich umami flavors" }
      ]
    },
    "The Pizza Bakery": {
      category: "Pizza",
      items: [
        { name: "Popo's Veggie Delight", price: 420, description: "Loaded with vegetables" },
        { name: "The Hellboy (Pepperoni & Bacon)", price: 600, description: "Spicy meat lovers" },
        { name: "Chicken Pizzaiola", price: 480, description: "Classic chicken pizza" },
        { name: "Burrata Pizza", price: 550, description: "Fresh burrata cheese" },
        { name: "Flambé Pizza", price: 650, description: "Signature flambe preparation" },
        { name: "Vegan Sicilia", price: 450, description: "Authentic vegan pizza" },
        { name: "Stuffed Garlic Bread", price: 250, description: "Cheese stuffed garlic bread" }
      ]
    }
  },
  "HYDERABAD": {
    "Chutneys": {
      category: "Veg",
      items: [
        { name: "Babai Hotel Idli", price: 90, description: "Famous soft idlis with butter" },
        { name: "Guntur Idli", price: 110, description: "Spicy podi coated idli" },
        { name: "Steam Dosa", price: 120, description: "Oil-free soft dosa" },
        { name: "Paneer Tikka Dosa", price: 160, description: "Fusion dosa with paneer tikka" },
        { name: "Paneer Butter Masala", price: 240, description: "Rich paneer gravy" },
        { name: "Veg Biryani", price: 220, description: "Aromatic basmati rice with veggies" },
        { name: "Mango Lassi", price: 100, description: "Sweet mango yogurt drink" }
      ]
    },
    "Tatva": {
      category: "Veg",
      items: [
        { name: "Dal Makhani", price: 280, description: "Slow cooked black lentils" },
        { name: "Malai Paneer Kofta", price: 320, description: "Soft koftas in white gravy" },
        { name: "Methi Chaman Bahar", price: 300, description: "Spinach and paneer curry" },
        { name: "Hyderabadi Veg Biryani", price: 290, description: "Authentic hyderabadi style" },
        { name: "Hara Bhara Kebab", price: 250, description: "Spinach and pea patties" },
        { name: "Lahsooni Palak", price: 270, description: "Garlic flavored spinach" },
        { name: "Cashew Nut Pulao", price: 260, description: "Rich cashew rice" }
      ]
    },
    "Bawarchi Restaurant": {
      category: "Non Veg",
      items: [
        { name: "Mutton Dum Biryani", price: 380, description: "Signature hyderabadi biryani" },
        { name: "Chicken Dum Biryani", price: 320, description: "Classic chicken biryani" },
        { name: "Chicken 65", price: 280, description: "Spicy fried chicken appetizer" },
        { name: "Bawarchi Special Mutton Curry", price: 420, description: "House special curry" },
        { name: "Chicken Garlic Kebab", price: 300, description: "Garlic flavored kebabs" },
        { name: "Boti Kebab", price: 350, description: "Tender mutton pieces" },
        { name: "Tandoori Chicken", price: 340, description: "Clay oven roasted chicken" }
      ]
    },
    "Pista House": {
      category: "Non Veg",
      items: [
        { name: "Mutton Haleem", price: 250, description: "Famous pounded meat and wheat" },
        { name: "Chicken Majestic", price: 280, description: "Strips of chicken in yogurt sauce" },
        { name: "Chicken 65", price: 260, description: "Spicy fried chicken" },
        { name: "Chicken Lollipop", price: 240, description: "Crispy chicken wings" },
        { name: "Special Mutton Biryani", price: 400, description: "Extra meat biryani" },
        { name: "Dragon Chicken", price: 290, description: "Spicy indo-chinese chicken" },
        { name: "Pepper Chicken", price: 270, description: "Black pepper flavored chicken" }
      ]
    },
    "Paradise Biryani": {
      category: "Non Veg",
      items: [
        { name: "Royal Chicken Dum Biryani", price: 350, description: "World famous biryani" },
        { name: "Royal Mutton Dum Biryani", price: 450, description: "Premium mutton biryani" },
        { name: "Chicken Tikka Kebab", price: 320, description: "Boneless grilled chicken" },
        { name: "Mutton Seekh Kebab", price: 400, description: "Minced mutton skewers" },
        { name: "Chicken Reshmi Kebab", price: 340, description: "Silky soft chicken kebabs" },
        { name: "Egg Biryani", price: 280, description: "Biryani rice with boiled eggs" },
        { name: "Double Ka Meetha", price: 150, description: "Classic bread pudding dessert" }
      ]
    },
    "Pizza Den": {
      category: "Pizza",
      items: [
        { name: "Paneer Pizza", price: 250, description: "Indian style paneer pizza" },
        { name: "Crispy Chicken Cheese Pizza", price: 300, description: "Fried chicken topping" },
        { name: "Bbq Chicken Pizza", price: 280, description: "Sweet and smoky BBQ flavor" },
        { name: "Veg Farmers Pizza", price: 240, description: "Loaded with fresh veggies" },
        { name: "Chicken Peri Peri Pizza", price: 320, description: "Spicy African flavor" },
        { name: "Spicy Veg Pizza", price: 220, description: "Jalapeno and paprika" },
        { name: "Mixed Special Pizza", price: 350, description: "Chef's special mix" }
      ]
    },
    "Cafe Niloufer": {
      category: "Beverages / Snacks",
      items: [
        { name: "Niloufer Special Tea", price: 40, description: "Famous Irani Chai" },
        { name: "Osmania Biscuits", price: 60, description: "Classic sweet and salty biscuits" },
        { name: "Bun Maska", price: 50, description: "Soft bun with butter" },
        { name: "Maska Bun with Jam", price: 60, description: "Bun with butter and fruit jam" },
        { name: "Pista Baklava Croissant", price: 180, description: "Fusion pastry" },
        { name: "Malai Bun", price: 70, description: "Bun with fresh cream" },
        { name: "Vegetable Samosa", price: 30, description: "Crispy pastry with veg filling" }
      ]
    }
  },
  "VIZAG": {
    "Subbayya Gari Hotel": {
      category: "Veg",
      items: [
        { name: "Andhra Thali", price: 250, description: "Unlimited traditional full meal" },
        { name: "Pulihora", price: 120, description: "Tamarind rice" },
        { name: "Aratikaya Dullu Curry", price: 160, description: "Raw banana curry" },
        { name: "Avakaya Pappu Annam", price: 150, description: "Mango pickle dal rice" },
        { name: "Sunnundalu", price: 80, description: "Roasted urad dal laddu" },
        { name: "Kobbari Podi", price: 60, description: "Coconut spice powder" },
        { name: "Perugu Wada", price: 90, description: "Vada soaked in yogurt" }
      ]
    },
    "Venkatadri Vantillu": {
      category: "Veg",
      items: [
        { name: "Sponge Dosa", price: 70, description: "Extra soft thick dosa" },
        { name: "Ghee Roast Dosa", price: 100, description: "Crispy dosa roasted in ghee" },
        { name: "Pesarattu Upma", price: 120, description: "Moong dal dosa stuffed with upma" },
        { name: "Dibba Rotti", price: 90, description: "Thick crusty lentil bread" },
        { name: "Idli with Ginger Chutney", price: 60, description: "Soft idlis with spicy chutney" },
        { name: "Mysore Bajji", price: 70, description: "Deep fried flour dumplings" },
        { name: "Filter Coffee", price: 40, description: "Strong traditional coffee" }
      ]
    },
    "The Spicy Venue": {
      category: "Non Veg",
      items: [
        { name: "MLA Potlam Biryani", price: 350, description: "Biryani wrapped in omelette with keema and prawns" },
        { name: "Apricot Delight", price: 180, description: "Famous layered apricot dessert" },
        { name: "Kodi Pulusu", price: 280, description: "Tangy chicken curry" },
        { name: "Lamb Fry Pulao", price: 320, description: "Spicy mutton pieces with aromatic rice" },
        { name: "Garlic Chicken", price: 260, description: "Dry garlic flavored chicken" },
        { name: "Chicken 65", price: 240, description: "Classic spicy fried chicken" },
        { name: "Ragi Sankati", price: 150, description: "Finger millet balls" }
      ]
    },
    "Kamath Restaurant": {
      category: "Seafood",
      items: [
        { name: "Tandoori Vanjaram", price: 450, description: "Clay oven roasted seer fish" },
        { name: "Prawn Masala Fry", price: 380, description: "Spicy pan-fried prawns" },
        { name: "Fish Curry", price: 320, description: "Authentic Andhra style fish curry" },
        { name: "Chicken Majestic", price: 280, description: "Yogurt and spice coated chicken strips" },
        { name: "Crab Masala", price: 400, description: "Spicy crab curry" },
        { name: "Apollo Fish", price: 350, description: "Spicy batter fried fish" },
        { name: "Squid Fry", price: 340, description: "Crispy fried calamari" }
      ]
    },
    "Raju Gari Dhaba": {
      category: "Non Veg",
      items: [
        { name: "Rajugari Kodi Pulao", price: 300, description: "Signature chicken pulao" },
        { name: "Vanjaram Fish Fry", price: 400, description: "Seer fish tawa fry" },
        { name: "Crab Fry", price: 350, description: "Dry roasted crab" },
        { name: "Prawn Fry", price: 320, description: "Spicy prawn fry" },
        { name: "Mutton Fry", price: 380, description: "Tender mutton pieces dry fry" },
        { name: "Chicken Fry Piece Biryani", price: 290, description: "Biryani with fried chicken pieces" },
        { name: "Liver Curry", price: 250, description: "Spicy mutton liver curry" }
      ]
    },
    "Flying Spaghetti Monster": {
      category: "Pizza / Italian",
      items: [
        { name: "Margherita Pizza", price: 450, description: "Classic Italian pizza" },
        { name: "The Bomb", price: 250, description: "Signature melting chocolate dessert" },
        { name: "Napoletana Pasta", price: 380, description: "Tomato and basil pasta" },
        { name: "Gamberetti Pizza", price: 550, description: "Pizza topped with prawns" },
        { name: "Sizzling Brownie", price: 220, description: "Brownie with ice cream on hot plate" },
        { name: "Lasagna Al Forno", price: 480, description: "Baked meat lasagna" },
        { name: "Panna Cotta", price: 200, description: "Italian cream dessert" }
      ]
    },
    "Bean Board": {
      category: "Cafe / Desserts",
      items: [
        { name: "Cold Brewed Coffee", price: 180, description: "Smooth 12-hour steeped coffee" },
        { name: "Veg Paneer Roll", price: 150, description: "Paneer tikka wrapped in paratha" },
        { name: "Chicken Roll", price: 180, description: "Spicy chicken wrapped in paratha" },
        { name: "Banana Caramel Waffle", price: 220, description: "Fresh waffle with banana and caramel" },
        { name: "Choco Chip Pastry", price: 160, description: "Rich chocolate cake slice" },
        { name: "Blueberry Smoothie", price: 200, description: "Thick mixed berry blend" },
        { name: "Espresso", price: 120, description: "Strong coffee shot" }
      ]
    }
  }
};

const run = async () => {
  try {
    const citiesToUpdate = ["BANGALORE", "HYDERABAD", "VIZAG"];
    
    let updatedCount = 0;
    
    for (const city of citiesToUpdate) {
      console.log(`Processing city: ${city}`);
      const q = query(collection(db, "restaurants"), where("city", "==", city));
      const snapshot = await getDocs(q);
      
      for (const restaurantDoc of snapshot.docs) {
        const restName = restaurantDoc.data().name;
        const cityData = data[city][restName];
        
        if (cityData) {
          console.log(`Adding subcollection menu for ${restName} in ${city}`);
          for (const item of cityData.items) {
            item.category = cityData.category;
            item.image = ""; // Add empty image field to match chennai implementation
            await addDoc(collection(db, `restaurants/${restaurantDoc.id}/menu`), item);
          }
          updatedCount++;
        }
      }
    }
    
    console.log(`Done updating ${updatedCount} restaurants.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
