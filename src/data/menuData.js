// Starters
import imgStarters from '../assets/products/starters/starters.jpeg';
import imgMushroomWings from '../assets/products/starters/mushroom_wings.jpeg';
import imgPaneerPops from '../assets/products/starters/paneer_pops.jpeg';
import imgMoruMoruChicken from '../assets/products/starters/moru_moru_chicken.jpeg';
import imgChickenPopcorn from '../assets/products/starters/chicken_popcorn.jpeg';

// Fried Chicken
import imgFriedChicken from '../assets/products/fried_chicken/fried_chicken.jpeg';
import imgChickenWings from '../assets/products/fried_chicken/chicken_wings.jpeg';
import imgLollipop from '../assets/products/fried_chicken/chicken_lollipop.jpeg';
import imgStrips from '../assets/products/fried_chicken/chicken_strips.jpeg';
import imgFriedChickenBucket from '../assets/products/fried_chicken/fried_chicken_bucket.jpeg';

// Special Fried Bird
import imgSpecialBird from '../assets/products/special_fried_bird/special_fried_bird.jpeg';
import imgHalfBird from '../assets/products/special_fried_bird/half_bird.jpeg';

// Burgers
import imgBurgers from '../assets/products/burgers/burgers.jpeg';
import imgMushroomBurger from '../assets/products/burgers/mushroom_burger.jpeg';
import imgPaneerBurger from '../assets/products/burgers/paneer_burger.jpeg';
import imgCheeseVegBurger from '../assets/products/burgers/cheese_veg_burger.jpeg';

// Wraps
import imgWraps from '../assets/products/wraps/wraps.jpeg';
import imgMushroomWrap from '../assets/products/wraps/mushroom_wrap.jpeg';
import imgPaneerWrap from '../assets/products/wraps/paneer_wrap.jpeg';
import imgJumboChickenRoll from '../assets/products/wraps/jumbo_chicken_roll.jpeg';

// Loaded Fries
import imgLoadedFries from '../assets/products/loaded_fries/loaded_fries.jpeg';
import imgMushroomLoadedFries from '../assets/products/loaded_fries/mushroom_loaded_fries.jpeg';
import imgPaneerLoadedFries from '../assets/products/loaded_fries/paneer_loaded_fries.jpeg';
import imgPlainFries from '../assets/products/loaded_fries/plain_fries.jpeg';

// Momos
import imgMomos from '../assets/products/momos/momos.jpeg';
import imgVegMomos from '../assets/products/momos/veg_momos.jpeg';

// Milk Shakes
import imgMilkshakes from '../assets/products/milkshakes/milkshakes.jpeg';
import imgMilkshakeButterscotch from '../assets/products/milkshakes/milkshake_butterscotch.jpeg';
import imgMilkshakeStrawberry from '../assets/products/milkshakes/milkshake_strawberry.jpeg';
import imgMilkshakeChocolate from '../assets/products/milkshakes/milkshake_chocolate.jpeg';
import imgMilkshakeMango from '../assets/products/milkshakes/milkshake_mango.jpeg';
import imgMilkshakeLychee from '../assets/products/milkshakes/milkshake_lychee.jpeg';
import imgMilkshakeOreo from '../assets/products/milkshakes/milkshake_oreo.jpeg';

// Mocktails
import imgMocktails from '../assets/products/mocktails/mocktails.jpeg';
import imgMocktailTropical from '../assets/products/mocktails/mocktail_tropical_delight.jpeg';
import imgMocktailPinacolada from '../assets/products/mocktails/mocktail_pinacolada.jpeg';
import imgMocktailMango from '../assets/products/mocktails/mocktail_mango_masala.jpeg';
import imgMocktailCanberra from '../assets/products/mocktails/mocktail_canberra_delight.jpeg';
import imgMocktailMint from '../assets/products/mocktails/mocktail_mint_mojito.jpeg';
import imgMocktailBluecuraco from '../assets/products/mocktails/mocktail_bluecuraco.jpeg';

export const CATEGORIES = [
  {
    id: 'bk-starters',
    name: "BK Starters",
    image: imgStarters,
    items: [
      { id: 'mushroom-wings', name: "Mushroom Wings (4pcs)", image: imgMushroomWings, prices: { Normal: 99, Nashville: 109, Korean: 109 } },
      { id: 'crispy-paneer-pops', name: "Crispy Paneer Pop's", image: imgPaneerPops, prices: { Normal: 99, Nashville: 109, Korean: 109 } },
      { id: 'moru-moru-chicken', name: "Moru Moru Chicken (4pcs)", image: imgMoruMoruChicken, prices: { Normal: 99, Nashville: 109, Korean: 109 } },
      { id: 'crispy-chicken-popcorn', name: "Crispy Chicken Popcorn (100g)", image: imgChickenPopcorn, prices: { Normal: 99, Nashville: 109, Korean: 109 } },
    ],
  },
  {
    id: 'fried-chicken',
    name: 'Fried Chicken',
    image: imgFriedChicken,
    items: [
      { id: 'fried-chicken-2pcs', name: 'Fried Chicken (2pcs)', image: imgFriedChicken, prices: { Normal: 149, Nashville: 169, Korean: 169 } },
      { id: 'fried-chicken-wings-5pcs', name: 'Fried Chicken Wings (5pcs)', image: imgChickenWings, prices: { Normal: 149, Nashville: 169, Korean: 169 } },
      { id: 'fried-chicken-lollipop-5pcs', name: 'Fried Chicken Lollipop (5pcs)', image: imgLollipop, prices: { Normal: 159, Nashville: 179, Korean: 179 } },
      { id: 'chicken-strip', name: 'Chicken Strip', image: imgStrips, prices: { Normal: 149, Nashville: 169, Korean: 169 } },
      { id: 'fried-chicken-6pcs', name: 'Fried Chicken (6pcs)', image: imgFriedChickenBucket, prices: { Normal: 189, Nashville: 209, Korean: 209 } },
    ],
  },
  {
    id: 'special-fried-bird',
    name: "BK's Special Fried Bird",
    image: imgSpecialBird,
    items: [
      { id: 'fried-chicken-half-bird', name: 'Fried Chicken - Half Bird', image: imgHalfBird, prices: { Normal: 279, Nashville: 299, Korean: 299 } },
      { id: 'fried-chicken-full-bird', name: 'Fried Chicken - Full Bird', image: imgSpecialBird, prices: { Normal: 479, Nashville: 499, Korean: 499 } },
    ],
  },
  {
    id: 'burgers',
    name: 'Burgers',
    image: imgBurgers,
    items: [
      { id: 'royal-mushroom-burger', name: 'Royal Mushroom Burger', image: imgMushroomBurger, prices: { Normal: 99, Nashville: 119, Korean: 119 } },
      { id: 'classic-paneer-burger', name: 'Classic Paneer Burger', image: imgPaneerBurger, prices: { Normal: 99, Nashville: 119, Korean: 119 } },
      { id: 'broasted-chicken-burger', name: 'Broasted Chicken Burger', image: imgBurgers, prices: { Normal: 99, Nashville: 119, Korean: 119 } },
      { id: 'classic-cheese-veg-burger', name: 'Classic Cheese Veg Burger', image: imgCheeseVegBurger, prices: { Normal: 99, Nashville: 119, Korean: 119 } },
    ],
  },
  {
    id: 'wraps',
    name: 'Wraps',
    image: imgWraps,
    items: [
      { id: 'royal-mushroom-wrap', name: 'Royal Mushroom Wrap', image: imgMushroomWrap, prices: { Normal: 109, Nashville: 119, Korean: 119 } },
      { id: 'classic-paneer-wrap', name: 'Classic Paneer Wrap', image: imgPaneerWrap, prices: { Normal: 109, Nashville: 129, Korean: 129 } },
      { id: 'broasted-chicken-wrap', name: 'Broasted Chicken Wrap', image: imgWraps, prices: { Normal: 109, Nashville: 129, Korean: 129 } },
      { id: 'jumbo-chicken-roll', name: 'Jumbo Chicken Roll', image: imgJumboChickenRoll, prices: { Normal: 149, Nashville: 169, Korean: 169 } },
    ],
  },
  {
    id: 'loaded-fries',
    name: 'Loaded Fries',
    image: imgLoadedFries,
    items: [
      { id: 'mushroom-loaded-fries', name: 'Mushroom Loaded Fries', image: imgMushroomLoadedFries, prices: { Normal: 119, Nashville: 139, Korean: 139 } },
      { id: 'paneer-loaded-fries', name: 'Paneer Loaded Fries', image: imgPaneerLoadedFries, prices: { Normal: 119, Nashville: 139, Korean: 139 } },
      { id: 'chicken-loaded-fries', name: 'Chicken Loaded Fries', image: imgLoadedFries, prices: { Normal: 129, Nashville: 149, Korean: 149 } },
      { id: 'plain-fries', name: 'Plain Fries', image: imgPlainFries, prices: { Normal: 89, Nashville: 109, Korean: 109 } },
    ],
  },
  {
    id: 'momos',
    name: "Momo's",
    image: imgMomos,
    items: [
      { id: 'veg-momos', name: 'Veg Momos', image: imgVegMomos, prices: { Normal: 79, Nashville: 99, Korean: 99 } },
      { id: 'chicken-momos', name: 'Chicken Momos', image: imgMomos, prices: { Normal: 89, Nashville: 109, Korean: 99 } },
    ],
  },
  {
    id: 'milkshakes',
    name: 'Milk Shakes',
    image: imgMilkshakes,
    items: [
      { id: 'butterscotch-crystals', name: 'Butterscotch Crystals', image: imgMilkshakeButterscotch, price: 99 },
      { id: 'super-strawberry', name: 'Super Strawberry', image: imgMilkshakeStrawberry, price: 99 },
      { id: 'chocolate', name: 'Chocolate', image: imgMilkshakeChocolate, price: 99 },
      { id: 'mango-blast', name: 'Mango Blast', image: imgMilkshakeMango, price: 109 },
      { id: 'monster-lychee', name: 'Monster Lychee', image: imgMilkshakeLychee, price: 109 },
      { id: 'chocolate-oreo', name: 'Chocolate Oreo', image: imgMilkshakeOreo, price: 119 },
    ],
  },
  {
    id: 'mocktails',
    name: "Mocktail's",
    image: imgMocktails,
    items: [
      { id: 'tropical-delight', name: 'Tropical Delight', image: imgMocktailTropical, price: 99 },
      { id: 'pinacolada', name: 'Pinacolada', image: imgMocktailPinacolada, price: 99 },
      { id: 'mango-masala', name: 'Mango Masala', image: imgMocktailMango, price: 99 },
      { id: 'canberra-delight', name: 'Canberra Delight', image: imgMocktailCanberra, price: 99 },
      { id: 'mint-mojito', name: 'Mint Mojito', image: imgMocktailMint, price: 89 },
      { id: 'bluecuraco', name: 'Bluecuraco', image: imgMocktailBluecuraco, price: 89 },
    ],
  },
];

export const STORE_INFO = {
  name: 'Broasted Kozhi',
  addressLines: [
    'Door No. 102, Old Post Office Odai Street,',
    'Dhanamallam Nadanam',
    'Near Anantha Mahal,',
    'Landmark: Mani Melai Departmental Store,',
    'Theni – 625 531,',
    'Theni (Dt).',
  ],
  phone: '7358967717',
  fssai: '22426473000946',
  branch: 'Theni',
};

