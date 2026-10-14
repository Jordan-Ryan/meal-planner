# Meal Planner

Static browser app for browsing meals, entering calorie and macro targets, and editing the in-memory meal and ingredient lists. The repository is HTML, CSS, JavaScript, and JSON. It has no package manifest, lockfile, build script, or test runner.

## Run

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

- [http://localhost:8000/](http://localhost:8000/) — `index.html`
- [http://localhost:8000/platform-example.html](http://localhost:8000/platform-example.html)
- [http://localhost:8000/components/meal-planner/example.html](http://localhost:8000/components/meal-planner/example.html)
- [http://localhost:8000/components/meals-manager/example.html](http://localhost:8000/components/meals-manager/example.html)
- [http://localhost:8000/components/ingredients-manager/example.html](http://localhost:8000/components/ingredients-manager/example.html)

The scripts load JSON with `fetch`. Serve this directory so the relative `data/` and `images/` paths resolve. The component example pages pass `../../data/` and, for the meal planner and meals manager, `../../images/`.

There is no install step in this repository.

The GitHub repository homepage field is `https://jordan-ryan.github.io/meal-planner/`. This tree has no Pages workflow or CNAME.

## Pages

`index.html` is the main page. It links `components/meal-planner/meal-planner.css`, defines theme variables in an inline stylesheet, and loads the three component scripts. On `DOMContentLoaded` it sets the body theme to `dark` and shows the meal planner. The header switches among meal planner, ingredients manager, and meals manager. It does not load `app.js` or `components/component-registry.js`, and it does not link `meals-manager.css` or `ingredients-manager.css`.

`platform-example.html` loads `components/component-registry.js` and the three component scripts, then constructs them with `new`. It does not call `componentRegistry.load()`, and it does not link the component stylesheets. The workout tracker, budget manager, task organizer, and weather dashboard controls show placeholder blocks that are written in that HTML file.

`app.js` is not referenced by any HTML file. On a page that already defines `MealPlanner` and contains `#meal-planner-container`, it constructs `MealPlanner` on `DOMContentLoaded` and assigns `window.mealPlanner`.

## Layout

```
index.html
platform-example.html
app.js
aces.json
components/
  component-registry.js
  meal-planner/
    meal-planner.js
    meal-planner.css
    manifest.json
    example.html
    README.md
  meals-manager/
    meals-manager.js
    meals-manager.css
    example.html
    README.md
  ingredients-manager/
    ingredients-manager.js
    ingredients-manager.css
    example.html
    README.md
data/
  meals.json
  ingredients.json
  portion_steps.json
  meal_extras.json
images/          # 16 .jpg files
docs/STATE.md
AGENTS.md
```

## Themes

The theme `<select>` elements in `index.html`, `platform-example.html`, and the three example pages use `default`, `dark`, `blue`, and `green`.

`index.html` defines these custom properties on `:root` and on `[data-theme]`: `--primary-color`, `--secondary-color`, `--background-color`, `--surface-color`, `--text-color`, `--text-secondary`, `--border-color`, `--shadow`, `--border-radius`, `--transition`.

`:root` and `[data-theme="dark"]` use the dark palette. `[data-theme="default"]` uses the light palette. `[data-theme="blue"]` and `[data-theme="green"]` change only `--primary-color` and `--secondary-color`.

Component stylesheets read those `var(--…)` names. They do not define their own theme blocks. Each component sets `data-theme` on its root element from the `theme` option. `index.html` also sets `data-theme` on `document.body`.

## Data

`data/meals.json` is an object with a `meals` array. Each meal has `id`, `name`, `category` (`beef` or `chicken` in the current file), `proteins` (ingredient ids), `sauce`, `carb`, `carb_portions`, `image` (basename with no extension), `cooking_base`, and `appropriate_extras`.

`data/ingredients.json` has objects `proteins`, `sauces`, `carbs`, and `extras`, keyed by id. Entries have `name`, `calories`, `fat`, `carbs`, `protein`, and `unit`. Sauce entries also have `ratio`.

`data/portion_steps.json` has `portion_steps`, keyed by carb id, with `base_unit`, `steps`, and `step_calories`.

`data/meal_extras.json` has `meal_extras`, keyed by style name, with `meals` and `extras` id lists.

The meal planner reads all four files. The meals manager reads `meals.json` and `ingredients.json`. The ingredients manager reads `ingredients.json`.

## Meal planner

```javascript
const mealPlanner = new MealPlanner('meal-planner-container', {
    theme: 'default',
    dataPath: 'data/',
    imagesPath: 'images/',
    onMealSelect: (meal) => {},
    onNutritionUpdate: (targets) => {}
});
```

`dataPath` and `imagesPath` default to `data/` and `images/`. Gallery images are requested as `${imagesPath}${meal.image}.jpg`.

Filters are `all`, `beef`, and `chicken`. Nutrition target state starts at `{ calories: 0, carbs: 0, protein: 0, fat: 0 }`. A **Generate Exact** button is added in the detail panel when any target is greater than 0; it calls `generateExactMacroFit`.

| Method | Behavior in `meal-planner.js` |
| --- | --- |
| `getSelectedMeal()` | Returns `state.selectedMeal`. |
| `getNutritionTargets()` | Returns a copy of `state.nutritionTargets`. |
| `setNutritionTargets(targets)` | Copies `targets` into state, then `updateNutritionTargets()` replaces that state from `#target-calories-detail`, `#target-carbs-detail`, `#target-protein-detail`, and `#target-fat-detail`, and calls `onNutritionUpdate`. |
| `destroy()` | Sets the container `innerHTML` to an empty string. |

`onMealSelect` and `onNutritionUpdate` are option callbacks. The script does not dispatch `mealSelect` or `nutritionUpdate` events.

## Meals manager and ingredients manager

Both classes take a container id and an options object. Defaults are `dataPath: 'data/'` and `theme: 'default'`. The meals manager also defaults `imagesPath` to `images/`.

Meals manager callbacks: `onMealUpdate`, `onMealDelete`, `onMealAdd`. Ingredients manager callbacks: `onIngredientUpdate`, `onIngredientDelete`, `onIngredientAdd`.

`saveMeals()` and `saveIngredients()` log the current arrays and call the update callback with the full array. They do not write `meals.json` or `ingredients.json`. Add, edit, and delete then update the in-memory arrays and re-render. Edit also calls the update callback again with the single edited object.

`destroy()` clears the container. The meals manager also removes listeners it stored on `this._eventListeners`.

The meals manager list filters are `all`, `beef`, and `chicken`. The ingredients manager filters are `all`, `proteins`, `sauces`, `carbs`, and `extras`. Both have a search field.

`MealsManager.calculateMealCalories(meal)` sums `meal.ingredients` using per-100 amounts. The meals in `meals.json` do not use an `ingredients` array, and the class does not call this method.

`MealsManager.getMealImageUrl(meal)` returns `meal.image` when it starts with `http`, otherwise `${imagesPath}${meal.image}.svg`.

Further notes for each class are in `components/meal-planner/README.md`, `components/meals-manager/README.md`, and `components/ingredients-manager/README.md`. `docs/STATE.md` records the current tree, including data and filename mismatches. `AGENTS.md` records how to run and change this repository.
