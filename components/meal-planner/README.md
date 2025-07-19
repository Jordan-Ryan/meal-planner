# Meal Planner Component

A modular, reusable meal planning component designed for multi-app platforms. This component provides a complete meal planning interface with filtering, nutrition tracking, and customizable theming.

## Features

- 🍽️ **Meal Gallery** - Browse meals with filtering by category
- 📊 **Nutrition Tracking** - Set and track calorie and macro targets
- 🎨 **Themeable** - Multiple built-in themes with CSS custom properties
- 📱 **Responsive** - Mobile-first design that works on all devices
- ♿ **Accessible** - WCAG compliant with keyboard navigation
- 🔧 **Modular** - Easy to integrate into larger applications
- 📦 **Self-contained** - No external dependencies

## Quick Start

### 1. Include the Component Files

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="components/meal-planner/meal-planner.css">
</head>
<body>
    <div id="meal-planner-container"></div>
    <script src="components/meal-planner/meal-planner.js"></script>
</body>
</html>
```

### 2. Initialize the Component

```javascript
// Basic usage
const mealPlanner = new MealPlanner('meal-planner-container');

// With custom options
const mealPlanner = new MealPlanner('meal-planner-container', {
    theme: 'default',
    dataPath: '/api/meal-data/',
    imagesPath: '/assets/meal-images/',
    onMealSelect: (meal) => {
        console.log('Selected meal:', meal);
    },
    onNutritionUpdate: (targets) => {
        console.log('Nutrition targets:', targets);
    }
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | required | ID of the HTML element to mount the component |
| `theme` | string | `'default'` | Visual theme: `'default'`, `'dark'`, `'blue'`, `'green'` |
| `dataPath` | string | `'data/'` | Path to data directory containing JSON files |
| `imagesPath` | string | `'images/'` | Path to meal images directory |
| `onMealSelect` | function | `null` | Callback when a meal is selected |
| `onNutritionUpdate` | function | `null` | Callback when nutrition targets change |

## Data Structure

The component requires the following JSON files in your data directory:

### meals.json
```json
{
  "meals": [
    {
      "id": "spaghetti_bolognese",
      "name": "Spaghetti Bolognese",
      "category": "beef",
      "image": "spaghetti-bolognese-food",
      "proteins": ["beef_mince_5"],
      "sauce": "bolognese",
      "carb": "penne_pasta",
      "carb_portions": [40, 80, 120, 160]
    }
  ]
}
```

### ingredients.json
```json
{
  "proteins": {
    "beef_mince_5": {
      "name": "Beef Mince 5%",
      "calories": 150,
      "fat": 5,
      "carbs": 0,
      "protein": 25,
      "unit": "100g"
    }
  },
  "sauces": {
    "bolognese": {
      "name": "Bolognese Sauce",
      "calories": 80,
      "fat": 3,
      "carbs": 8,
      "protein": 4,
      "unit": "100g"
    }
  }
}
```

## API Methods

### getSelectedMeal()
Returns the currently selected meal object or `null`.

```javascript
const selectedMeal = mealPlanner.getSelectedMeal();
```

### getNutritionTargets()
Returns the current nutrition targets.

```javascript
const targets = mealPlanner.getNutritionTargets();
// Returns: { calories: 2000, carbs: 250, protein: 150, fat: 65 }
```

### setNutritionTargets(targets)
Sets the nutrition targets programmatically.

```javascript
mealPlanner.setNutritionTargets({
    calories: 2000,
    carbs: 250,
    protein: 150,
    fat: 65
});
```

### destroy()
Cleans up the component and removes it from the DOM.

```javascript
mealPlanner.destroy();
```

## Theming

The component uses CSS custom properties for easy theming. You can create custom themes by overriding these variables:

```css
.meal-planner-component[data-theme="custom"] {
    --mp-primary-color: #your-color;
    --mp-secondary-color: #your-secondary-color;
    --mp-background-color: #your-background;
    --mp-surface-color: #your-surface;
    --mp-text-color: #your-text;
    --mp-text-secondary: #your-secondary-text;
    --mp-border-color: #your-border;
    --mp-shadow: your-shadow;
    --mp-border-radius: your-radius;
    --mp-transition: your-transition;
}
```

## Events

The component fires custom events that you can listen to:

```javascript
// Listen for meal selection
document.addEventListener('mealSelect', (event) => {
    console.log('Meal selected:', event.detail);
});

// Listen for nutrition updates
document.addEventListener('nutritionUpdate', (event) => {
    console.log('Nutrition updated:', event.detail);
});
```

## Integration Examples

### React Integration
```jsx
import { useEffect, useRef } from 'react';

function MealPlannerWidget() {
    const containerRef = useRef();
    const mealPlannerRef = useRef();

    useEffect(() => {
        if (containerRef.current) {
            mealPlannerRef.current = new MealPlanner(containerRef.current.id, {
                theme: 'default',
                onMealSelect: (meal) => {
                    // Handle meal selection in React
                }
            });
        }

        return () => {
            if (mealPlannerRef.current) {
                mealPlannerRef.current.destroy();
            }
        };
    }, []);

    return <div id="meal-planner" ref={containerRef} />;
}
```

### Vue Integration
```vue
<template>
    <div id="meal-planner-container"></div>
</template>

<script>
export default {
    mounted() {
        this.mealPlanner = new MealPlanner('meal-planner-container', {
            onMealSelect: this.handleMealSelect
        });
    },
    beforeDestroy() {
        if (this.mealPlanner) {
            this.mealPlanner.destroy();
        }
    },
    methods: {
        handleMealSelect(meal) {
            this.$emit('meal-selected', meal);
        }
    }
}
</script>
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please create an issue in the repository or contact the maintainer. 