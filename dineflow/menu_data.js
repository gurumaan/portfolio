/**
 * DINEFLOW 2.0 — MASTER CULINARY CATALOG & FLOOR PLAN CONFIGURATION
 * Crafted with authentic culinary terminology, modifier groups, and station routing.
 */

window.DINEFLOW_TABLES = [
  { id: 'T01', name: 'Table 01 — Window Bay', zone: 'Main Dining', capacity: 2, status: 'vacant' },
  { id: 'T02', name: 'Table 02 — Window Bay', zone: 'Main Dining', capacity: 2, status: 'vacant' },
  { id: 'T03', name: 'Table 03 — Center Hall', zone: 'Main Dining', capacity: 4, status: 'occupied', guests: 3, orderCount: 2, total: 1840 },
  { id: 'T04', name: 'Table 04 — Garden Terrace', zone: 'Terrace', capacity: 4, status: 'active', guests: 2, orderCount: 1, total: 1350 },
  { id: 'T05', name: 'Table 05 — Garden Terrace', zone: 'Terrace', capacity: 6, status: 'vacant' },
  { id: 'T06', name: 'Table 06 — Pergola Corner', zone: 'Terrace', capacity: 4, status: 'vacant' },
  { id: 'T07', name: 'Table 07 — Bar Lounge', zone: 'Bar & Lounge', capacity: 2, status: 'occupied', guests: 2, orderCount: 1, total: 980 },
  { id: 'T08', name: 'Table 08 — Bar High-Top', zone: 'Bar & Lounge', capacity: 2, status: 'vacant' },
  { id: 'T09', name: 'Table 09 — Private Dining Room', zone: 'Mezzanine', capacity: 8, status: 'billed', guests: 6, orderCount: 4, total: 5420 },
  { id: 'T10', name: 'Table 10 — Chef's Tasting Counter', zone: 'Mezzanine', capacity: 4, status: 'vacant' }
];

window.DINEFLOW_STATIONS = [
  { id: 'all', name: 'All Stations', icon: '⚡' },
  { id: 'grill', name: 'Grill & Sauté Line', icon: '🔥' },
  { id: 'woodfire', name: 'Woodfired Oven', icon: '🍕' },
  { id: 'larder', name: 'Cold Larder & Raw Bar', icon: '🥗' },
  { id: 'bar', name: 'Cocktail Bar & Barista', icon: '🍸' }
];

window.DINEFLOW_CATEGORIES = [
  { id: 'all', name: 'Full Menu', icon: '✨' },
  { id: 'starters', name: 'Small Plates & Crudo', icon: '🦪' },
  { id: 'pizza', name: 'Artisanal Woodfired Pizza', icon: '🍕' },
  { id: 'mains', name: 'Chef's Signature Mains', icon: '🥩' },
  { id: 'pasta', name: 'Handcrafted Pasta', icon: '🍝' },
  { id: 'drinks', name: 'Craft Cocktails & Elixirs', icon: '🍸' },
  { id: 'desserts', name: 'Artisan Dolci', icon: '🍮' }
];

window.DINEFLOW_MENU = [
  {
    id: 'm1',
    name: 'Truffle & Wild Mushroom Crostini',
    category: 'starters',
    station: 'larder',
    price: 490,
    prepTime: '8-10 min',
    dietary: ['veg'],
    desc: 'Charred artisanal sourdough, sautéed forest chanterelles, black summer truffle carpaccio, whipped cultured ricotta.',
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=700&q=80',
    modifierGroups: [
      {
        name: 'Bread Selection',
        required: true,
        options: [
          { name: 'House Fermented Sourdough', price: 0 },
          { name: 'Seeded Rye Bread', price: 30 },
          { name: 'Gluten-Free Herb Focaccia', price: 60 }
        ]
      },
      {
        name: 'Chef Add-Ons',
        required: false,
        multi: true,
        options: [
          { name: 'Extra Shaved Black Truffle', price: 120 },
          { name: 'Aged 24-Mo Parmigiano Reggiano', price: 80 }
        ]
      }
    ]
  },
  {
    id: 'm2',
    name: 'Burrata di Puglia & Heirloom Carpaccio',
    category: 'starters',
    station: 'larder',
    price: 680,
    prepTime: '6-8 min',
    dietary: ['veg', 'gluten-free'],
    desc: 'Fresh 250g Pugliese burrata, heirloom tri-color tomatoes, cold-pressed Ligurian olive oil, 12-year Modena balsamic reduction.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=700&q=80',
    modifierGroups: [
      {
        name: 'Finishing Oil',
        required: true,
        options: [
          { name: 'Ligurian Extra Virgin Olive Oil', price: 0 },
          { name: 'Calabrian Chili Infused Oil', price: 40 },
          { name: 'Basil Chlorophyll Oil', price: 40 }
        ]
      },
      {
        name: 'Add Prosciutto',
        required: false,
        options: [
          { name: 'San Daniele Prosciutto (30g)', price: 210 }
        ]
      }
    ]
  },
  {
    id: 'm3',
    name: 'Margherita Verace D.O.P.',
    category: 'pizza',
    station: 'woodfire',
    price: 720,
    prepTime: '10-12 min',
    dietary: ['veg'],
    desc: 'San Marzano D.O.P. tomatoes, Mozzarella di Bufala Campana, wild Genovese basil, 48-hour slow-fermented Neapolitan dough.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=700&q=80',
    modifierGroups: [
      {
        name: 'Crust Style',
        required: true,
        options: [
          { name: 'Classic Neapolitan (Soft & Leopard-Spotted)', price: 0 },
          { name: 'Well-Done Extra Crisp', price: 0 },
          { name: 'Gluten-Friendly Cauliflower Crust', price: 110 }
        ]
      },
      {
        name: 'Toppings & Finishing',
        required: false,
        multi: true,
        options: [
          { name: 'Stracciatella Cheese Core', price: 140 },
          { name: 'Spicy Hot Honey Drizzle', price: 60 },
          { name: 'Kalamata Olives & Capers', price: 70 }
        ]
      }
    ]
  },
  {
    id: 'm4',
    name: 'Diavola & Nduja Calabrese Pizza',
    category: 'pizza',
    station: 'woodfire',
    price: 860,
    prepTime: '12-14 min',
    dietary: ['spicy'],
    desc: 'Spicy Calabrian nduja, artisanal dry-cured pepperoni, smoked fior di latte, fermented chili honey, toasted oregano.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
    modifierGroups: [
      {
        name: 'Spice Urgency',
        required: true,
        options: [
          { name: 'Chef Signature (Spicy)', price: 0 },
          { name: 'Extra Fiery (Ghost Chili Flakes)', price: 40 },
          { name: 'Mild Heat', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'm5',
    name: 'Hand-Cut Tagliolini al Tartufo',
    category: 'pasta',
    station: 'grill',
    price: 890,
    prepTime: '12-15 min',
    dietary: ['veg'],
    desc: 'Fresh 40-yolk extruded pasta, Normandy cultured butter, aged Parmigiano broth, freshly shaved Umbrian black truffle.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80',
    modifierGroups: [
      {
        name: 'Pasta Firmness',
        required: true,
        options: [
          { name: 'Classic Molto Al Dente', price: 0 },
          { name: 'Tender / Standard Cook', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'm6',
    name: 'Prime Black Angus Ribeye (300g)',
    category: 'mains',
    station: 'grill',
    price: 1850,
    prepTime: '16-20 min',
    dietary: ['gluten-free'],
    desc: 'Grain-fed 120-day aged Black Angus, charred bone marrow jus, roasted confit garlic, Maldon sea salt flakes.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
    modifierGroups: [
      {
        name: 'Temperature / Doneness',
        required: true,
        options: [
          { name: 'Medium Rare (54°C warm red center)', price: 0 },
          { name: 'Rare (50°C cool red center)', price: 0 },
          { name: 'Medium (60°C pink center)', price: 0 },
          { name: 'Medium Well (65°C slight pink)', price: 0 }
        ]
      },
      {
        name: 'Select Side Accompaniment',
        required: true,
        options: [
          { name: 'Rosemary Salted Hand-Cut Fries', price: 0 },
          { name: 'Creamed Yukon Gold Potatoes', price: 0 },
          { name: 'Charred Broccolini & Lemon', price: 40 }
        ]
      }
    ]
  },
  {
    id: 'm7',
    name: 'Smoked Bourbon & Fig Old Fashioned',
    category: 'drinks',
    station: 'bar',
    price: 650,
    prepTime: '4-5 min',
    desc: 'Small-batch Kentucky bourbon, mission fig reduction, Angostura bitters, flamed orange peel, cedarwood smoke.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=700&q=80',
    modifierGroups: [
      {
        name: 'Bourbon Preference',
        required: true,
        options: [
          { name: 'Woodford Reserve', price: 0 },
          { name: 'Bulleit 10-Year (+₹120)', price: 120 },
          { name: 'Michter's Small Batch (+₹180)', price: 180 }
        ]
      }
    ]
  },
  {
    id: 'm8',
    name: 'Espresso & Pistachio Tiramisu',
    category: 'desserts',
    station: 'larder',
    price: 480,
    prepTime: '4-6 min',
    dietary: ['veg'],
    desc: 'Single-origin Ethiopian espresso dipped savoiardi, Bronte pistachio mascarpone sabayon, Valrhona 70% dark cocoa.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=700&q=80',
    modifierGroups: [
      {
        name: 'Coffee Profile',
        required: true,
        options: [
          { name: 'Classic Dark Roast Espresso', price: 0 },
          { name: 'Decaffeinated Swiss Water Extract', price: 0 }
        ]
      }
    ]
  }
];

window.DINEFLOW_SAMPLE_TICKETS = [
  {
    id: 'TKT-101',
    table: 'T04',
    tableName: 'Table 04 — Garden Terrace',
    time: '14:52',
    elapsedSeconds: 380, // 6m 20s
    status: 'in_prep',
    station: 'grill',
    items: [
      {
        name: 'Prime Black Angus Ribeye (300g)',
        qty: 1,
        price: 1850,
        station: 'grill',
        modifiers: ['Medium Rare', 'Rosemary Hand-Cut Fries']
      },
      {
        name: 'Hand-Cut Tagliolini al Tartufo',
        qty: 1,
        price: 890,
        station: 'grill',
        modifiers: ['Molto Al Dente']
      }
    ]
  },
  {
    id: 'TKT-102',
    table: 'T03',
    tableName: 'Table 03 — Center Hall',
    time: '14:56',
    elapsedSeconds: 190, // 3m 10s
    status: 'incoming',
    station: 'woodfire',
    items: [
      {
        name: 'Margherita Verace D.O.P.',
        qty: 2,
        price: 720,
        station: 'woodfire',
        modifiers: ['Neapolitan Crust', 'Stracciatella Core']
      }
    ]
  },
  {
    id: 'TKT-103',
    table: 'T07',
    tableName: 'Table 07 — Bar Lounge',
    time: '14:48',
    elapsedSeconds: 620, // 10m 20s
    status: 'ready',
    station: 'bar',
    items: [
      {
        name: 'Smoked Bourbon & Fig Old Fashioned',
        qty: 2,
        price: 650,
        station: 'bar',
        modifiers: ['Woodford Reserve', 'Cedarwood Smoke']
      }
    ]
  }
];