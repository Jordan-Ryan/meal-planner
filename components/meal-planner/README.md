# Meal Planner component

`meal-planner.js` defines `MealPlanner` and assigns it to `window.MealPlanner` (and to `module.exports` when `module` exists).

## Example page

`example.html` links `meal-planner.css` and `meal-planner.js`. It constructs the class with `dataPath` `../../data/` and `imagesPath` `../../images/`. Serve the repository root over HTTP so those paths and `fetch` work. See the root `README.md`.

`example.html` does not define the theme custom properties. Those properties are in the inline stylesheet in `index.html`.

## Constructor

```javascript
const mealPlanner = new MealPlanner('meal-planner-container', {
    theme: 'default',
    dataPath: 'data/',
    imagesPath: 'images/',
    onMealSelect: (meal) => {},
    onNutritionUpdate: (targets) => {}
});
```

| Option | Default in the constructor | Used for |
| --- | --- | --- |
| `theme` | `'default'` | `data-theme` on `.meal-planner-component` |
| `dataPath` | `'data/'` | Prefix for the four JSON fetches |
| `imagesPath` | `'images/'` | Prefix for `` `${imagesPath}${meal.image}.jpg` `` |
| `onMealSelect` | `null` | Called with the meal object when a meal detail opens |
| `onNutritionUpdate` | `null` | Called with the targets object after the detail inputs are read |

The constructor copies `options` after those defaults, so a provided key replaces the default.

HTML theme controls that ship with this repo offer `default`, `dark`, `blue`, and `green`.

## Data files

Fetched from `dataPath`:

- `ingredients.json` — stored as the parsed object (`proteins`, `sauces`, `carbs`, `extras`)
- `meals.json` — stored as `.meals`
- `portion_steps.json` — stored as `.portion_steps`
- `meal_extras.json` — stored as the parsed object; extras lookup uses `.meal_extras`

A meal in `data/meals.json` has `id`, `name`, `category`, `proteins`, `sauce`, `carb`, `carb_portions`, `image`, `cooking_base`, and `appropriate_extras`.

## Methods

```javascript
mealPlanner.getSelectedMeal();
mealPlanner.getNutritionTargets();
mealPlanner.setNutritionTargets({ calories: 0, carbs: 0, protein: 0, fat: 0 });
mealPlanner.destroy();
```

`getNutritionTargets` returns a shallow copy of `state.nutritionTargets`. That state starts at all zeros.

`setNutritionTargets` assigns `targets`, then calls `updateNutritionTargets`, which reads `#target-calories-detail`, `#target-carbs-detail`, `#target-protein-detail`, and `#target-fat-detail` and replaces `state.nutritionTargets` with those values before calling `onNutritionUpdate`.

`destroy` sets the container `innerHTML` to `''`.

The script does not dispatch custom events. `manifest.json` is not loaded by the class.

## UI wired in `meal-planner.js`

- Filter buttons: `all`, `beef`, `chicken`
- Meal gallery and a detail page
- Nutrition target inputs and a nutrition table built from `carb_portions`
- A cooking panel. When any target is greater than 0, the panel includes a Generate Exact button that calls `generateExactMacroFit`

`this.mealImages` is set in the constructor and is not read. Image requests use `meal.image` plus `.jpg`.
