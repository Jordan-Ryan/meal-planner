# State of `main`

Notes below match the tree at `8ef13a09929ee0135a6a4b40362fdb225ec90467` (`chore: add aces.json metadata`, 2025-08-12 23:39:33 +0200).

## Runtime

Static files only. No `package.json`, lockfile, Dockerfile, CI workflow, test files, or `LICENSE` file.

`python3 -m http.server` from the repository root serves the pages. `index.html` and `platform-example.html` request `data/` and `images/` relative to that root. The component `example.html` files pass `../../data/` and, where used, `../../images/`.

## Entry points

| File | What it loads | What it constructs |
| --- | --- | --- |
| `index.html` | `meal-planner.css`, inline theme CSS, three component scripts | `MealPlanner`, `IngredientsManager`, `MealsManager` from an inline script. Starts with `changeTheme('dark')` and the meal planner. Does not update the theme `<select>`, whose first option is `default`. |
| `platform-example.html` | `component-registry.js` and the three component scripts. No component CSS `<link>` | The same three classes with `new`. `window.platformAPI` exposes `switchApp`, `loadComponent`, `unloadComponent`, `changeTheme`, `getCurrentApp`, `getCurrentComponent`. |
| `components/*/example.html` | That component's CSS and JS | One class, with `dataPath: '../../data/'`. |
| `app.js` | Nothing by itself | `MealPlanner` into `#meal-planner-container` if the class exists. No HTML file references `app.js`. |

`platform-example.html` contains placeholder sections labeled workout tracker, budget manager, task organizer, and weather dashboard. There are no matching component directories.

`component-registry.js` registers only `meal-planner`. Its `config` theme options are `default`, `light`, `blue`, and `green`. `load()` requests `` `${basePath}${name}/${component.main}` `` with `basePath` `/components/` and `main` `MealPlanner`, which is `/components/meal-planner/MealPlanner`. No page calls `load()`.

## Components

`MealPlanner` options: `theme` (`default`), `dataPath` (`data/`), `imagesPath` (`images/`), `onMealSelect`, `onNutritionUpdate`. It fetches `ingredients.json`, `meals.json` (uses `.meals`), `portion_steps.json` (uses `.portion_steps`), and `meal_extras.json` (uses `.meal_extras`). Gallery and detail images use `` `${imagesPath}${meal.image}.jpg` ``. `this.mealImages` is assigned in the constructor and is not read. Public methods: `getSelectedMeal`, `getNutritionTargets`, `setNutritionTargets`, `destroy`. `setNutritionTargets` copies its argument, then `updateNutritionTargets` replaces `state.nutritionTargets` from the detail inputs. Initial targets are all `0`. Filters: `all`, `beef`, `chicken`. The detail panel adds a Generate Exact button when any target is `> 0`.

`MealsManager` reads `meals.json` and flattens `ingredients.json` into `proteins`, `sauces`, `carbs`, and `extras`. Forms edit `name`, `category` (`beef`, `chicken`, `other`), `image`, `proteins`, `sauce`, `carb`, `appropriate_extras`, and `cooking_base`. `saveMeals` logs and calls `onMealUpdate` with the meals array. It does not write `meals.json`. Edit also calls `onMealUpdate` with the single meal object. `getMealImageUrl` appends `.svg` unless `meal.image` starts with `http`. `calculateMealCalories` expects `meal.ingredients` and is not called. `destroy` clears the container and the stored listeners.

`IngredientsManager` flattens the same four ingredient groups. Filters: `all`, `proteins`, `sauces`, `carbs`, `extras`. Form fields: `name`, `category`, `protein`, `carbs`, `fat`, `calories`, `unit`, `description`. `saveIngredients` logs and calls `onIngredientUpdate` with the full array. Edit also calls `onIngredientUpdate` with the single ingredient. Nothing writes `ingredients.json`.

`components/meal-planner/manifest.json` lists events `mealSelect` and `nutritionUpdate`, `license` `MIT`, and an example with `theme: 'light'`. `meal-planner.js` does not read the manifest and does not dispatch those events.

## Data checked against the files

`meals.json` has 16 meals. `images/` has 16 `.jpg` files.

These `meals.json` `image` basenames have a same-named `.jpg` in `images/`: `spaghetti-bolognese-food`, `pasta-bake-food`, `beef-burgers-food`, `cottage-pie-food`, `loaded-nachos-food`, `stuffed-peppers-food`, `chicken-burgers-food`, `chicken-fajitas-food`.

These `image` values do not match a file name in `images/`:

| `meals.json` `image` | File present |
| --- | --- |
| `meatballs-pasta-food` | `meatballs-with-pasta-food.jpg` |
| `chilli-con-carne-rice-food` | `chilli-con-carne-food.jpg` |
| `burritos-food` | `beef-burrito-food.jpg` |
| `tacos-food` | `beef-tacos-food.jpg` |
| `chicken-pitta-food` | `chicken-pittas-food.jpg` |
| `chicken-curry-rice-food` | `chicken-curry-food.jpg` |
| `chicken-teriyaki-rice-food` | `chicken-teriyaki-food.jpg` |
| `chicken-stir-fry-food` | `sweet-and-sour-stir-fry-food.jpg` |

The unused `mealImages` map in `meal-planner.js` points at the filenames in the right-hand column.

`portion_steps.json` has no `white_potato` key. Cottage pie's `carb` is `white_potato`. `calcPerPortion` returns zeros when `portionSteps[carbKey]` is missing. `seeded_bun` and `sweet_potato` are in `ingredients.json` `carbs` and are not in `portion_steps.json`. No current meal uses those two ids.

`meal_extras.json` lists `peas`, `carrot`, and `sweetcorn`. Those keys are absent from `ingredients.json` `extras`. The meal detail extras markup reads `extraData.name` and `extraData.unit` for each id returned by `getAvailableExtras`.

## Themes

Defined only in the inline stylesheet in `index.html`. Component CSS comments say theme variations are handled globally and then use `var(--text-color)` and the other names from that stylesheet. `platform-example.html` and the component example pages do not define those properties. `platform-example.html` `changeTheme` sets `data-theme` on `.meal-planner-component` only.

## Metadata

`aces.json`:

```json
{
  "status": "Idea",
  "progress": 0,
  "previewUrl": "https://github.com/Jordan-Ryan/meal-planner"
}
```

The GitHub repository homepage field is `https://jordan-ryan.github.io/meal-planner/`. On 2026-10-14 a GET of that URL returned HTTP 200 with `last-modified: Tue, 12 Aug 2025 21:40:32 GMT`. This tree has no Pages workflow. The deployed bytes were not compared to this commit.

## Docs removed

`MODULAR_ARCHITECTURE.md` described npm scripts, Ajv, DOMPurify, a test suite, `component.on`, per-component data directories, and `workout-tracker` / `budget-manager` directories. Those are not in this tree, so that file was removed.
