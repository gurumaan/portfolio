// ============================================================================
// DINEFLOW MASTER CULINARY INDEX & MODIFIER CATALOG
// Artisanal Bistro & Specialty Roastery Menu Data
// ============================================================================

window.DINEFLOW_MENU = [
  // --- STARTERS & SOURDOUGH ---
  {
    id: 'str-01',
    name: 'Truffle Mushroom Sourdough Toast',
    category: 'starters',
    price: 380,
    calories: '420 kcal',
    prepTime: '8-10 min',
    tags: ['Vegetarian', 'Chef Signature'],
    description: 'Pan-seared wild forest mushrooms, whipped garlic mascarpone, aged Modena balsamic glaze on 36-hour fermented country sourdough.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'bread',
        name: 'Bread Selection',
        required: true,
        options: [
          { name: 'Traditional 36h Country Sourdough', price: 0, default: true },
          { name: 'Seed & Grain Rye Loaf', price: 30 },
          { name: 'Gluten-Free Artisan Bread', price: 50 }
        ]
      },
      {
        id: 'addons',
        name: 'Chef Add-ons',
        required: false,
        multiple: true,
        options: [
          { name: 'Poached Free-Range Egg', price: 50 },
          { name: 'Shaved Black Summer Truffle (+3g)', price: 180 },
          { name: 'Extra Whipped Mascarpone', price: 40 }
        ]
      }
    ]
  },
  {
    id: 'str-02',
    name: 'Burrata & Charred Peach Salad',
    category: 'starters',
    price: 490,
    calories: '380 kcal',
    prepTime: '6-8 min',
    tags: ['Vegetarian', 'Gluten-Free'],
    description: 'Whole artisanal Pugliese burrata, wood-grilled sweet peaches, cold-pressed basil oil, roasted Sicilian pine nuts, and aged balsamic droplets.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'finish',
        name: 'Honey Finish',
        required: true,
        options: [
          { name: 'Hot Chili Infused Wildflower Honey', price: 0, default: true },
          { name: 'Mild Lavender Honey', price: 0 },
          { name: 'No Honey (Savory Only)', price: 0 }
        ]
      },
      {
        id: 'addons',
        name: 'Add-ons',
        required: false,
        multiple: true,
        options: [
          { name: 'Prosciutto di Parma Crisps', price: 120 },
          { name: 'Toasted Sourdough Focaccia (2 pcs)', price: 60 }
        ]
      }
    ]
  },
  {
    id: 'str-03',
    name: 'Crispy Polenta Bites & Smoked Aioli',
    category: 'starters',
    price: 320,
    calories: '340 kcal',
    prepTime: '7-9 min',
    tags: ['Vegetarian', 'Gluten-Free'],
    description: 'Golden polenta cubes dusted with 24-month Parmigiano-Reggiano, fresh garden rosemary salt, served with house-smoked garlic and pimenton aioli.',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'dip',
        name: 'Dipping Sauce',
        required: true,
        options: [
          { name: 'Smoked Garlic & Paprika Aioli', price: 0, default: true },
          { name: 'Truffle Mayo Dip', price: 40 },
          { name: 'Spicy Arrabbiata Reduction', price: 20 }
        ]
      }
    ]
  },

  // --- WOOD-FIRED MAINS & HANDMADE PASTAS ---
  {
    id: 'main-01',
    name: 'Slow-Braised Short Rib Tagliatelle',
    category: 'mains',
    price: 680,
    calories: '680 kcal',
    prepTime: '12-14 min',
    tags: ['Signature', 'Handmade Pasta'],
    description: 'Hand-rolled egg yolk tagliatelle folded through 8-hour braised beef short rib ragu, San Marzano tomato reduction, aged Pecorino Romano, and fresh gremolata.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'spice',
        name: 'Chili Heat Level',
        required: true,
        options: [
          { name: 'Classic (Subtle Rosemary & Black Pepper)', price: 0, default: true },
          { name: 'Calabrian Chili Kick (Medium Hot)', price: 0 },
          { name: 'Extra Fiery Pepperoncini', price: 0 }
        ]
      },
      {
        id: 'cheese',
        name: 'Extra Cheese',
        required: false,
        multiple: true,
        options: [
          { name: 'Fresh Shaved 24-mo Pecorino', price: 50 },
          { name: 'Creamy Burrata Crown (+100g)', price: 160 }
        ]
      }
    ]
  },
  {
    id: 'main-02',
    name: 'Wild Morel & Porcini Risotto',
    category: 'mains',
    price: 620,
    calories: '550 kcal',
    prepTime: '14-16 min',
    tags: ['Vegetarian', 'Gluten-Free'],
    description: 'Slow-simmered Acquerello carnaroli rice with mountain morels, porcini broth, cold brown butter emulsion, and crispy sage crisps.',
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'portion',
        name: 'Serving Size',
        required: true,
        options: [
          { name: 'Standard Entrée (320g)', price: 0, default: true },
          { name: 'Sharing Platter (520g)', price: 280 }
        ]
      },
      {
        id: 'addons',
        name: 'Gourmet Additions',
        required: false,
        multiple: true,
        options: [
          { name: 'Fresh Shaved Winter Truffle', price: 220 },
          { name: 'Pan-Seared King Oyster Mushroom Skewer', price: 90 }
        ]
      }
    ]
  },
  {
    id: 'main-03',
    name: 'Wood-Fired Neapolitan Burrata Pizza',
    category: 'mains',
    price: 640,
    calories: '720 kcal',
    prepTime: '10-12 min',
    tags: ['Vegetarian', 'Wood-Fired 450°C'],
    description: '48-hour fermented biga dough blistered at 450°C. San Marzano D.O.P. tomatoes, fior di latte, topped fresh with creamy burrata, fresh basil, and chili wildflower honey.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'crust',
        name: 'Crust Finish',
        required: true,
        options: [
          { name: 'Classic Leopard Blistered Char', price: 0, default: true },
          { name: 'Garlic Herb Infused Olive Oil Brush', price: 30 }
        ]
      },
      {
        id: 'toppings',
        name: 'Extra Toppings',
        required: false,
        multiple: true,
        options: [
          { name: 'Caramelized Balsamic Shallots', price: 40 },
          { name: 'Spicy Hot Honey Drizzle Cup', price: 40 },
          { name: 'Spicy Plant-Based Sausage Crumbles', price: 90 }
        ]
      }
    ]
  },

  // --- SPECIALTY COFFEE & FERMENTS ---
  {
    id: 'bev-01',
    name: 'Nitro Cold Brew Float',
    category: 'beverages',
    price: 290,
    calories: '160 kcal',
    prepTime: '3-4 min',
    tags: ['Artisanal Coffee', 'Popular'],
    description: 'Micro-filtered Ethiopian Yirgacheffe cold brew infused with nitrogen for a velvety stout-like head, topped with a scoop of single-origin Madagascar vanilla gelato.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'bean',
        name: 'Roast Profile',
        required: true,
        options: [
          { name: 'Ethiopia Yirgacheffe (Floral & Bergamot)', price: 0, default: true },
          { name: 'Colombia Geisha (Jasmine & Stone Fruit)', price: 50 },
          { name: 'House Dark Velvet Blend (Cacao & Walnut)', price: 0 }
        ]
      },
      {
        id: 'sweetener',
        name: 'Sweetener Level',
        required: true,
        options: [
          { name: 'Unsweetened (Pure Black + Gelato)', price: 0, default: true },
          { name: 'Touch of Salted Caramel (+15ml)', price: 30 },
          { name: 'Madagascar Vanilla Syrup (+15ml)', price: 30 }
        ]
      }
    ]
  },
  {
    id: 'bev-02',
    name: 'Cascara & Grapefruit Botanicals',
    category: 'beverages',
    price: 260,
    calories: '90 kcal',
    prepTime: '2-3 min',
    tags: ['Zero Alcohol', 'House Ferment'],
    description: 'Sparkling infusion of sun-dried organic coffee cherries (cascara), cold-pressed pink grapefruit, fresh garden rosemary sprig, and pink peppercorn essence.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'ice',
        name: 'Ice Preference',
        required: true,
        options: [
          { name: 'Hand-Cut Clear Ice Block', price: 0, default: true },
          { name: 'Light Ice', price: 0 },
          { name: 'Chilled (No Ice)', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'bev-03',
    name: 'Artisan Oat Flat White',
    category: 'beverages',
    price: 240,
    calories: '120 kcal',
    prepTime: '3-5 min',
    tags: ['Vegan', 'Hot Beverage'],
    description: 'Double shot of our washed Guatemalan espresso (notes of hazelnut and toffee) folded with micro-foamed organic Swedish oat milk at precise 62°C drinking temperature.',
    image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'milk',
        name: 'Milk Alternative',
        required: true,
        options: [
          { name: 'Oatly Barista Edition (Default)', price: 0, default: true },
          { name: 'Almond Breeze Barista', price: 20 },
          { name: 'Full Cream Organic Dairy', price: 0 }
        ]
      },
      {
        id: 'shots',
        name: 'Espresso Strength',
        required: true,
        options: [
          { name: 'Standard Double Ristretto', price: 0, default: true },
          { name: 'Triple Shot Boost (+1 shot)', price: 40 },
          { name: 'Single Shot (Gentle)', price: 0 }
        ]
      }
    ]
  },

  // --- PASTRY & DESSERTS ---
  {
    id: 'des-01',
    name: 'Basque Burnt Cheesecake & Sea Salt',
    category: 'desserts',
    price: 360,
    calories: '410 kcal',
    prepTime: '2-3 min',
    tags: ['Pastry Counter', 'Chef Special'],
    description: 'Caramelized deeply scorched top giving way to an oozy, velvet custard center. Finished with Maldon sea salt flakes and warm spiced blackberry reduction.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'topping',
        name: 'Berry Drizzle',
        required: true,
        options: [
          { name: 'Spiced Warm Blackberry Compote', price: 0, default: true },
          { name: 'Smoked Salted Toffee Drizzle', price: 30 },
          { name: 'Plain (Unadorned Purist)', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'des-02',
    name: 'Valrhona 70% Dark Chocolate Lava',
    category: 'desserts',
    price: 420,
    calories: '510 kcal',
    prepTime: '10-12 min',
    tags: ['Freshly Baked', 'Warm Dessert'],
    description: 'Single-estate French Valrhona Guanaja chocolate sponge with molten flowing ganache center, crushed Bronte pistachios, and clotted cream.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
    modifiers: [
      {
        id: 'cream',
        name: 'Accompaniment',
        required: true,
        options: [
          { name: 'Devonshire Clotted Cream', price: 0, default: true },
          { name: 'Tahitian Vanilla Gelato Scoop', price: 50 },
          { name: 'Espresso Bean Infused Cream', price: 30 }
        ]
      }
    ]
  }
];

window.DINEFLOW_TABLES = [
  { id: 'T-01', name: 'Table 01', type: 'Booth', capacity: 4, status: 'Available' },
  { id: 'T-02', name: 'Table 02', type: 'Window Corner', capacity: 2, status: 'Occupied' },
  { id: 'T-04', name: 'Table 04 (Demo)', type: 'Garden Terrace', capacity: 4, status: 'Active Session' },
  { id: 'T-07', name: 'Table 07', type: 'High Top Bar', capacity: 2, status: 'Available' },
  { id: 'T-12', name: 'Table 12', type: 'Private Dining', capacity: 8, status: 'Available' }
];
