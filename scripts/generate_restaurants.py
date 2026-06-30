import json
import random
import os

input_path = r'c:\Users\Norit\OneDrive\Desktop\LIGJERATAT\VITI I 3-të\SEMESTRI 6\Kurs Laboratorik\restaurants.json'
output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'data', 'restaurantsData.ts')

random.seed(42)

with open(input_path, encoding='utf-8') as f:
    data = json.load(f)

cuisine_variety = [
    'International', 'Italian', 'Traditional', 'Grill', 'Mediterranean',
    'Cafe', 'Fast Food', 'Bakery', 'Seafood', 'Mexican', 'Asian',
    'Steakhouse', 'Vegetarian', 'Desserts', 'Japanese', 'Pizza',
]

img_cats = [
    'restaurant', 'cafe', 'food', 'dinner', 'cuisine', 'bistro',
    'grill', 'pasta', 'pizza', 'sushi', 'steak', 'bakery',
    'seafood', 'salad', 'cocktail', 'brunch'
]

def gen_coords(city):
    if city == 'Prishtina':
        base = (42.66, 21.16)
        spread = 0.02
    elif city == 'Prizren':
        base = (42.21, 20.74)
        spread = 0.015
    else:
        base = (42.66, 20.29)
        spread = 0.015
    lat = base[0] + random.uniform(-spread, spread)
    lng = base[1] + random.uniform(-spread, spread)
    return f"{{ latitude: {lat:.6f}, longitude: {lng:.6f} }}"

output_lines = []
used_names = set()

# Header
output_lines.append("import { type Restaurant } from './mockData';")
output_lines.append("")
output_lines.append(f"// Total restaurants: {len(data)}")
output_lines.append(f"// Generated from 320 restaurant names all in Prishtina, distributed to PRISHTINA:192, PRIZREN:64, PEJE:64")
output_lines.append("")
output_lines.append("const image = (url: string) => `${url}?auto=format&fit=crop&w=1200&q=80`;")
output_lines.append("")
output_lines.append("export const RESTAURANTS_JSON: Restaurant[] = [")

for i, r in enumerate(data):
    name = r['name']
    if name in used_names:
        name = f"{name} {i}"
    used_names.add(name)
    
    if i % 5 < 3:
        city = 'Prishtina'
    elif i % 5 < 4:
        city = 'Prizren'
    else:
        city = 'Peje'
    
    cuisine = cuisine_variety[i % len(cuisine_variety)]
    coords = gen_coords(city)
    img_cat = img_cats[i % len(img_cats)]
    price = ['\u20AC', '\u20AC\u20AC', '\u20AC\u20AC\u20AC'][i % 3]
    rating = round(3.5 + random.uniform(0, 1.5), 1)
    reviews = random.randint(30, 500)
    dist = f"{round(0.3 + random.uniform(0, 4.5), 1)} km"
    is_open = random.random() > 0.2
    
    dish_names = ["Grilled Chicken Plate", "Pasta Carbonara", "Mixed Grill", "Veggie Bowl", "Fish & Chips"]
    promo_titles = ["Weekend Special", "Happy Hour", "Family Deal", "Lunch Offer", "Student Discount"]
    
    img_id = random.randint(1500000000, 1599999999)
    hero_img_id = random.randint(1500000000, 1599999999)
    special_img_id = random.randint(1500000000, 1599999999)
    
    original_price = random.randint(5, 15)
    special_price = random.randint(3, 12)
    discount = random.randint(15, 30)
    menu_price = random.randint(5, 15)
    
    entry = f"""  {{
    id: 'rest-{i}',
    name: '{name.replace("'", "\\'")}',
    cuisine: '{cuisine}',
    tagline: '{cuisine}',
    priceRange: '{price}',
    rating: {rating},
    reviewCount: {reviews},
    distance: '{dist}',
    isOpen: {'true' if is_open else 'false'},
    image: image('https://images.unsplash.com/photo-{img_id}'),
    heroImage: image('https://images.unsplash.com/photo-{hero_img_id}'),
    address: 'Street in {city}',
    phone: '+383 44 xxx xxx',
    hours: '09:00 - 23:00',
    city: '{city}',
    coordinates: {coords},
    todaySpecial: {{
      name: '{cuisine} Special',
      description: 'Chef recommended dish',
      originalPrice: '\u20AC{original_price}',
      price: '\u20AC{special_price}',
      discount: '-{discount}%',
      image: image('https://images.unsplash.com/photo-{special_img_id}'),
    }},
    promotions: [
      {{
        id: 'promo-{i}',
        title: '{promo_titles[i % 5]}',
        subtitle: 'Check in-store for details',
      }},
    ],
    menuSections: [
      {{
        id: 'menu-{i}-mains',
        title: 'Main Courses',
        items: [
          {{
            id: 'item-{i}-0',
            name: '{dish_names[i % 5]}',
            description: 'Freshly prepared daily',
            price: '\u20AC{menu_price}.00',
          }},
        ],
      }},
    ],
    reviews: [
      {{
        id: 'rev-{i}-0',
        author: 'KosVibe User',
        comment: 'Great place, highly recommend!',
        rating: {random.randint(4,5)},
        timeAgo: 'Recently',
      }},
    ],
  }},"""
    
    output_lines.append(entry)

output_lines.append("];")

# Write file with UTF-8 encoding
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

print(f"Generated {len(data)} restaurants to {output_path}")
print(f"City distribution: Prishtina={(len(data)//5)*3}, Prizren={(len(data)//5)*1}, Peje={(len(data)//5)*1}")