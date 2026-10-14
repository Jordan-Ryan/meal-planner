# Meals Manager component

`meals-manager.js` defines `MealsManager` and assigns it to `window.MealsManager`.

## Example page

`example.html` links `meals-manager.css` and `meals-manager.js`, and passes `dataPath: '../../data/'` and `imagesPath: '../../images/'`. Serve the repository root over HTTP. See the root `README.md`.

The example page does not define the theme custom properties used by `meals-manager.css`. Those properties are in the inline stylesheet in `index.html`.

## Constructor

```javascript
const mealsManager = new MealsManager('meals-manager-container', {
    theme: 'default',
    dataPath: 'data/',
    imagesPath: 'images/',
    onMealUpdate: (meals) => {},
    onMealDelete: (id) => {},
    onMealAdd: (meal) => {}
});
```

Defaults are `dataPath: 'data/'`, `imagesPath: 'images/'`, `theme: 'default'`, and no-op callbacks. Passed options override those defaults.

The theme `<select>` in `example.html` uses `default`, `dark`, `blue`, and `green`.

## Data

`loadData` fetches `${dataPath}meals.json` and uses `.meals`. It also fetches `${dataPath}ingredients.json` and flattens `proteins`, `sauces`, `carbs`, and `extras` into `this.ingredients` with a `category` field.

Current meal objects use `id`, `name`, `category`, `proteins`, `sauce`, `carb`, `carb_portions` (present on the JSON records; the add/edit forms do not write it), `image`, `cooking_base`, and `appropriate_extras`.

The add form categories are `beef`, `chicken`, and `other`. List filters are `all`, `beef`, and `chicken`. The search field filters by name.

## Save behavior

`saveMeals` logs `this.meals` and calls `onMealUpdate(this.meals)`. It does not write `meals.json`.

- Add calls `saveMeals`, then `onMealAdd(newMeal)`.
- Edit calls `saveMeals`, then `onMealUpdate(updatedMeal)` with the single meal.
- Delete calls `saveMeals`, then `onMealDelete(id)`.

## Other members

`destroy()` clears the container and removes listeners stored on `this._eventListeners`.

`this.meals` and `this.filteredMeals` are the current arrays.

`calculateMealCalories(meal)` reduces `meal.ingredients`, looking up each `id` and scaling `calories` by `amount / 100`. The meals loaded from `meals.json` do not have an `ingredients` array, and the class does not call this method.

`getMealImageUrl(meal)` returns `meal.image` when it starts with `http`. Otherwise it returns `` `${imagesPath}${meal.image}.svg` ``. Files in `images/` are `.jpg`.

`index.html` does not link `meals-manager.css`.
