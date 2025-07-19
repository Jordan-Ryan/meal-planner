# 🍽️ Meal Planner

A modular, component-based meal planning application with nutrition tracking and recipe management.

## 🚀 Quick Start

### Option 1: Simple Component Usage
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="components/meal-planner/meal-planner.css">
</head>
<body>
    <div id="meal-planner-container"></div>
    <script src="components/meal-planner/meal-planner.js"></script>
    <script>
        const mealPlanner = new MealPlanner('meal-planner-container', {
            theme: 'default',
            dataPath: 'data/',
            imagesPath: 'images/'
        });
    </script>
</body>
</html>
```

### Option 2: Multi-App Platform
Open `platform-example.html` to see the meal planner as part of a larger multi-app platform.

## 📁 Project Structure

```
Meal Planner/
├── index.html                 # Simple component demo
├── app.js                     # Minimal component loader
├── components/                # Component library
│   ├── meal-planner/         # Meal planner component
│   │   ├── meal-planner.js   # Component logic
│   │   ├── meal-planner.css  # Component styles
│   │   ├── manifest.json     # Component metadata
│   │   ├── README.md         # Component documentation
│   │   └── example.html      # Component demo
│   └── component-registry.js # Component management system
├── data/                     # Meal and ingredient data
│   ├── ingredients.json
│   ├── meals.json
│   ├── portion_steps.json
│   └── meal_extras.json
├── images/                   # Meal images
├── platform-example.html     # Multi-app platform demo
└── MODULAR_ARCHITECTURE.md   # Architecture documentation
```

## 🎯 Features

- **🍽️ Meal Gallery** - Browse meals with filtering by category
- **📊 Nutrition Tracking** - Set and track calorie and macro targets
- **🎨 Themeable** - Multiple built-in themes (default, light, blue, green)
- **📱 Responsive** - Mobile-first design
- **♿ Accessible** - WCAG compliant with keyboard navigation
- **🔧 Modular** - Easy to integrate into larger applications
- **📦 Self-contained** - No external dependencies

## 🎨 Themes

The component supports multiple themes:

```javascript
const mealPlanner = new MealPlanner('container-id', {
    theme: 'default' // Options: 'default', 'dark', 'blue', 'green'
});
```

## 🔧 Configuration

```javascript
const mealPlanner = new MealPlanner('container-id', {
    theme: 'default',           // Visual theme
    dataPath: 'data/',          // Path to data files
    imagesPath: 'images/',      // Path to meal images
    onMealSelect: (meal) => {   // Callback when meal is selected
        console.log('Selected:', meal);
    },
    onNutritionUpdate: (targets) => { // Callback when targets change
        console.log('Targets:', targets);
    }
});
```

## 📊 Data Structure

The component requires these JSON files:

- **meals.json** - Meal definitions with proteins, carbs, and sauces
- **ingredients.json** - Nutrition data for all ingredients
- **portion_steps.json** - Carb portion calculations
- **meal_extras.json** - Optional extras for each meal

## 🚀 API Methods

```javascript
// Get selected meal
const selectedMeal = mealPlanner.getSelectedMeal();

// Get nutrition targets
const targets = mealPlanner.getNutritionTargets();

// Set nutrition targets
mealPlanner.setNutritionTargets({
    calories: 2000,
    carbs: 250,
    protein: 150,
    fat: 65
});

// Cleanup
mealPlanner.destroy();
```

## 🏗️ Architecture

This project demonstrates a modular component architecture:

- **Components** are self-contained and reusable
- **Component Registry** manages multiple components
- **Multi-App Platform** shows how to combine components
- **Theming System** provides consistent visual design

See `MODULAR_ARCHITECTURE.md` for detailed documentation.

## 🧪 Testing

### Component Demo
Open `components/meal-planner/example.html` to test the component in isolation.

### Multi-App Platform
Open `platform-example.html` to see the component in a larger application.

### Simple App
Open `index.html` for a basic implementation.

## 🔮 Future Enhancements

- Component marketplace
- Plugin system
- Real-time collaboration
- Analytics dashboard
- A/B testing framework

## 📞 Support

For questions and support:
- Check component documentation in `components/meal-planner/README.md`
- Review architecture guide in `MODULAR_ARCHITECTURE.md`
- Test with the provided example files

---

**Built with modular architecture for scalability and reusability.** 🚀 