# Meals Manager Component

A modular, themeable component for managing meals and recipes with full CRUD (Create, Read, Update, Delete) operations.

## Features

- **Full CRUD Operations**: Add, edit, delete, and view meals
- **Recipe Management**: Create complex recipes with multiple ingredients
- **Search & Filter**: Search by name/description and filter by difficulty
- **Nutrition Calculation**: Automatic calorie calculation based on ingredients
- **Image Support**: Add custom images or use fallback icons
- **Cooking Instructions**: Step-by-step cooking instructions
- **Themeable**: Supports multiple themes (default, dark, blue, green)
- **Responsive Design**: Works on desktop and mobile devices
- **Modular Architecture**: Self-contained component that can be easily integrated

## Usage

### Basic Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="components/meals-manager/meals-manager.css">
</head>
<body>
    <div id="meals-container"></div>
    
    <script src="components/meals-manager/meals-manager.js"></script>
    <script>
        const mealsManager = new MealsManager('meals-container', {
            theme: 'default',
            dataPath: 'data/',
            imagesPath: 'images/',
            onMealUpdate: (meals) => {
                console.log('Meals updated:', meals);
            },
            onMealDelete: (id) => {
                console.log('Meal deleted:', id);
            },
            onMealAdd: (meal) => {
                console.log('Meal added:', meal);
            }
        });
    </script>
</body>
</html>
```

### Configuration Options

```javascript
const options = {
    // Theme options: 'default', 'dark', 'blue', 'green'
    theme: 'default',
    
    // Path to data directory containing meals.json and ingredients.json
    dataPath: 'data/',
    
    // Path to images directory
    imagesPath: 'images/',
    
    // Callback when meals are updated
    onMealUpdate: (meals) => {},
    
    // Callback when a meal is deleted
    onMealDelete: (id) => {},
    
    // Callback when a new meal is added
    onMealAdd: (meal) => {}
};
```

## Data Structure

The component expects two JSON files:

### meals.json
```json
[
    {
        "id": "unique-id",
        "name": "Spaghetti Bolognese",
        "cookTime": 30,
        "difficulty": "Easy",
        "description": "Classic Italian pasta dish",
        "image": "spaghetti-bolognese.jpg",
        "ingredients": [
            {
                "id": "ingredient-id",
                "name": "Ground Beef",
                "amount": 200
            }
        ],
        "instructions": [
            "Brown the ground beef in a large pan",
            "Add tomato sauce and simmer for 20 minutes",
            "Cook spaghetti according to package instructions"
        ]
    }
]
```

### ingredients.json
```json
[
    {
        "id": "ingredient-id",
        "name": "Ground Beef",
        "category": "proteins",
        "protein": 26.0,
        "carbs": 0.0,
        "fat": 15.0,
        "calories": 250
    }
]
```

### Difficulty Levels

- `Easy` - Quick meals (0-15 minutes)
- `Medium` - Moderate complexity (15-30 minutes)
- `Hard` - Complex recipes (30+ minutes)

## API Methods

### Instance Methods

```javascript
// Destroy the component and clean up
mealsManager.destroy();

// Get all meals
const meals = mealsManager.meals;

// Get filtered meals
const filtered = mealsManager.filteredMeals;

// Calculate calories for a meal
const calories = mealsManager.calculateMealCalories(meal);
```

## Themes

The component supports four themes:

- **Default**: Light theme with teal accents
- **Dark**: Dark theme with true black background
- **Blue**: Blue accent theme
- **Green**: Green accent theme

## Styling

The component uses CSS custom properties for theming. You can override these variables:

```css
.meals-manager-component {
    --mmp-primary-color: #4fd1c5;
    --mmp-secondary-color: #38b2ac;
    --mmp-background-color: #f8f9fa;
    --mmp-surface-color: #ffffff;
    --mmp-text-color: #2d3748;
    --mmp-text-secondary: #4a5568;
    --mmp-border-color: #e2e8f0;
    --mmp-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    --mmp-border-radius: 8px;
    --mmp-transition: all 0.2s ease-in-out;
}
```

## Image Support

The component supports custom images for meals:

1. **Custom URLs**: Add a full image URL in the meal's `image` field
2. **Local Images**: Place images in the `imagesPath` directory
3. **Fallback Icons**: Uses emoji icons when no image is available

### Local Image Mapping

The component includes automatic image mapping for common meal names:

```javascript
const imageMap = {
    'spaghetti-bolognese': 'spaghetti-bolognese-food.svg',
    'chicken-curry': 'chicken-curry-rice-food.svg',
    'chilli-con-carne': 'chilli-con-carne-rice-food.svg',
    // ... more mappings
};
```

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support required
- Fetch API support required

## Dependencies

- Requires `ingredients.json` for ingredient reference
- None (vanilla JavaScript)
- Requires a web server for data loading (fetch API)

## Example

See `example.html` for a complete working example with theme switching.

## Integration with Meal Planner

This component is designed to work seamlessly with the Meal Planner component. Meals created in the Meals Manager can be used in the Meal Planner for nutrition tracking and meal planning. 