/**
 * Simple Meal Planner App Loader
 * This file just initializes the meal planner component
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if component is already loaded
    if (typeof MealPlanner === 'undefined') {
        console.error('MealPlanner component not found. Make sure meal-planner.js is loaded.');
        return;
    }
    
    // Initialize the meal planner component
    const mealPlanner = new MealPlanner('meal-planner-container', {
        theme: 'default',
        dataPath: 'data/',
        imagesPath: 'images/',
        onMealSelect: (meal) => {
            console.log('Meal selected:', meal.name);
        },
        onNutritionUpdate: (targets) => {
            console.log('Nutrition targets updated:', targets);
        }
    });
    
    // Make component available globally for debugging
    window.mealPlanner = mealPlanner;
    
    console.log('Meal Planner app initialized successfully');
}); 