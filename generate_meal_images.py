#!/usr/bin/env python3
"""
Meal Image Generator
Creates placeholder food images for the meal planner app
"""

import os
from PIL import Image, ImageDraw, ImageFont

# List of meals from your data
MEALS = [
    {
        "name": "Spaghetti Bolognese",
        "description": "A plate of spaghetti with rich bolognese sauce, topped with grated cheese, served on a wooden chopping board"
    },
    {
        "name": "Meatballs with Pasta",
        "description": "Juicy meatballs served with penne pasta and tomato sauce, garnished with fresh herbs, on a wooden chopping board"
    },
    {
        "name": "Pasta Bake",
        "description": "Baked penne pasta with minced beef, tomato sauce, and melted cheese on top, served on a wooden chopping board"
    },
    {
        "name": "Beef Burgers",
        "description": "Two juicy beef burgers with melted cheese, lettuce, tomato, and onion, served on brioche buns, on a wooden chopping board"
    },
    {
        "name": "Cottage Pie",
        "description": "Traditional cottage pie with minced beef filling topped with creamy mashed potatoes, golden brown, on a wooden chopping board"
    },
    {
        "name": "Chilli Con Carne",
        "description": "Spicy chilli con carne with minced beef, beans, and rice, topped with cheese and sour cream, on a wooden chopping board"
    },
    {
        "name": "Beef Burrito",
        "description": "Large flour tortilla filled with seasoned beef, rice, beans, cheese, and vegetables, wrapped and served on a wooden chopping board"
    },
    {
        "name": "Beef Tacos",
        "description": "Crispy taco shells filled with seasoned beef, lettuce, tomato, cheese, and salsa, arranged on a wooden chopping board"
    },
    {
        "name": "Loaded Nachos",
        "description": "Crispy tortilla chips topped with melted cheese, seasoned beef, jalapeños, sour cream, and guacamole, on a wooden chopping board"
    },
    {
        "name": "Stuffed Peppers",
        "description": "Bell peppers stuffed with seasoned beef, rice, and cheese, baked until tender, served on a wooden chopping board"
    },
    {
        "name": "Chicken Pittas",
        "description": "Grilled chicken breast in warm pitta bread with lettuce, tomato, and sauce, served on a wooden chopping board"
    },
    {
        "name": "Chicken Burgers",
        "description": "Grilled chicken breast burgers with melted cheese, lettuce, and tomato, served on brioche buns, on a wooden chopping board"
    },
    {
        "name": "Chicken Curry",
        "description": "Creamy chicken curry with tender chicken pieces, served over fluffy basmati rice, on a wooden chopping board"
    },
    {
        "name": "Chicken Teriyaki",
        "description": "Glazed teriyaki chicken with sticky sauce, served over steamed rice with vegetables, on a wooden chopping board"
    },
    {
        "name": "Sweet and Sour Stir Fry",
        "description": "Stir-fried chicken with colorful vegetables in sweet and sour sauce, served over egg noodles, on a wooden chopping board"
    },
    {
        "name": "Chicken Fajitas",
        "description": "Sizzling chicken fajitas with peppers and onions, served with warm tortillas and toppings, on a wooden chopping board"
    }
]

def create_placeholder_image(filename, meal_name):
    """Create a placeholder image with wooden background and meal name"""
    # Create a 1920x1080 image (16:9 aspect ratio)
    width, height = 1920, 1080
    
    # Create a wooden texture background
    img = Image.new('RGB', (width, height), color='#8B4513')  # Saddle brown
    draw = ImageDraw.Draw(img)
    
    # Add wood grain effect
    for y in range(0, height, 3):
        color = '#A0522D' if y % 6 == 0 else '#8B4513'
        draw.line([(0, y), (width, y)], fill=color, width=1)
    
    # Add some darker wood grain lines
    for y in range(0, height, 20):
        draw.line([(0, y), (width, y)], fill='#654321', width=2)
    
    # Add meal name text
    try:
        # Try to use a nice font if available
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 80)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), meal_name, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Add text shadow
    draw.text((x+3, y+3), meal_name, fill='#654321', font=font)
    # Add main text
    draw.text((x, y), meal_name, fill='#FFFFFF', font=font)
    
    # Add a subtle border
    draw.rectangle([(0, 0), (width-1, height-1)], outline='#654321', width=3)
    
    # Save the image
    img.save(filename, 'JPEG', quality=95)
    print(f"   📸 Placeholder created for {meal_name}")

def main():
    """Main function to generate all meal images"""
    print("🍽️  Meal Image Generator")
    print("=" * 50)
    
    # Create images directory if it doesn't exist
    if not os.path.exists('images'):
        os.makedirs('images')
    
    for i, meal in enumerate(MEALS, 1):
        print(f"\n{i}/{len(MEALS)}: Generating {meal['name']}...")
        
        # Create filename
        filename = meal['name'].lower().replace(' ', '-').replace('&', 'and')
        filename = f"images/{filename}-food.jpg"
        
        # Skip if file already exists
        if os.path.exists(filename):
            print(f"   ✓ Already exists: {filename}")
            continue
        
        # Create placeholder image
        create_placeholder_image(filename, meal['name'])
        print(f"   ✓ Created: {filename}")

if __name__ == "__main__":
    main()
    print("\n✅ All meal images generated!")
    print("\n📝 AI Image Generation Prompts:")
    print("=" * 50)
    
    for meal in MEALS:
        prompt = f"""Professional food photography: {meal['description']}. High quality, realistic, appetizing, 16:9 aspect ratio, natural lighting, wooden chopping board background, food styling, no text or watermarks."""
        print(f"\n🍽️  {meal['name']}:")
        print(f"   {prompt}")
    
    print("\n💡 Use these prompts with:")
    print("- DALL-E 3")
    print("- Midjourney") 
    print("- Stable Diffusion")
    print("- Canva's AI Image Generator")
    print("- Bing Image Creator") 