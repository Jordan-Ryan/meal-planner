# Ingredients Manager Component

A modular, themeable component for managing ingredients with full CRUD (Create, Read, Update, Delete) operations.

## Features

- **Full CRUD Operations**: Add, edit, delete, and view ingredients
- **Search & Filter**: Search by name/description and filter by category
- **Nutrition Tracking**: Track protein, carbs, fat, and calories per ingredient
- **Category Management**: Organize ingredients by categories (proteins, carbs, fats, vegetables, etc.)
- **Themeable**: Supports multiple themes (default, dark, blue, green)
- **Responsive Design**: Works on desktop and mobile devices
- **Modular Architecture**: Self-contained component that can be easily integrated

## Usage

### Basic Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="components/ingredients-manager/ingredients-manager.css">
</head>
<body>
    <div id="ingredients-container"></div>
    
    <script src="components/ingredients-manager/ingredients-manager.js"></script>
    <script>
        const ingredientsManager = new IngredientsManager('ingredients-container', {
            theme: 'default',
            dataPath: 'data/',
            onIngredientUpdate: (ingredients) => {
                console.log('Ingredients updated:', ingredients);
            },
            onIngredientDelete: (id) => {
                console.log('Ingredient deleted:', id);
            },
            onIngredientAdd: (ingredient) => {
                console.log('Ingredient added:', ingredient);
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
    
    // Path to data directory containing ingredients.json
    dataPath: 'data/',
    
    // Callback when ingredients are updated
    onIngredientUpdate: (ingredients) => {},
    
    // Callback when an ingredient is deleted
    onIngredientDelete: (id) => {},
    
    // Callback when a new ingredient is added
    onIngredientAdd: (ingredient) => {}
};
```

## Data Structure

The component expects an `ingredients.json` file with the following structure:

```json
[
    {
        "id": "unique-id",
        "name": "Chicken Breast",
        "category": "proteins",
        "protein": 31.0,
        "carbs": 0.0,
        "fat": 3.6,
        "calories": 165,
        "description": "Lean protein source"
    }
]
```

### Ingredient Categories

- `proteins` - Meat, fish, eggs, etc.
- `carbs` - Rice, pasta, bread, etc.
- `fats` - Oils, nuts, avocados, etc.
- `vegetables` - Broccoli, spinach, carrots, etc.
- `fruits` - Apples, bananas, berries, etc.
- `dairy` - Milk, cheese, yogurt, etc.
- `other` - Miscellaneous ingredients

## API Methods

### Instance Methods

```javascript
// Destroy the component and clean up
ingredientsManager.destroy();

// Get all ingredients
const ingredients = ingredientsManager.ingredients;

// Get filtered ingredients
const filtered = ingredientsManager.filteredIngredients;
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
.ingredients-manager-component {
    --imp-primary-color: #4fd1c5;
    --imp-secondary-color: #38b2ac;
    --imp-background-color: #f8f9fa;
    --imp-surface-color: #ffffff;
    --imp-text-color: #2d3748;
    --imp-text-secondary: #4a5568;
    --imp-border-color: #e2e8f0;
    --imp-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    --imp-border-radius: 8px;
    --imp-transition: all 0.2s ease-in-out;
}
```

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support required
- Fetch API support required

## Dependencies

- None (vanilla JavaScript)
- Requires a web server for data loading (fetch API)

## Example

See `example.html` for a complete working example with theme switching. 