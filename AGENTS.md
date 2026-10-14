# Agent notes

This repository is a static meal planner: HTML, CSS, JavaScript, and JSON. There is no package manifest, lockfile, bundler, test runner, or application server.

## Run

From the repository root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/` for `index.html`. Other entry points:

- `platform-example.html`
- `components/meal-planner/example.html`
- `components/meals-manager/example.html`
- `components/ingredients-manager/example.html`

Scripts load JSON with `fetch`, so serve the repository root. Component examples use `../../data/` (and `../../images/` where that option exists).

## Where behavior lives

- `index.html` — main page. Inline theme variables, meal-planner stylesheet, and inline script that constructs `MealPlanner`, `MealsManager`, and `IngredientsManager`. Startup calls `changeTheme('dark')` and shows the meal planner. The theme `<select>` value is left on its first option, `default`.
- `platform-example.html` — second shell. Loads `components/component-registry.js` but constructs the three classes with `new`. Placeholder sections for workout tracker, budget manager, task organizer, and weather dashboard are HTML in this file.
- `app.js` — loader for `#meal-planner-container`. No HTML file includes it.
- `components/meal-planner/meal-planner.js` — gallery, detail view, nutrition table, cooking panel, `generateExactMacroFit`.
- `components/meals-manager/meals-manager.js` — in-memory meal list editor.
- `components/ingredients-manager/ingredients-manager.js` — in-memory ingredient list editor.
- `components/component-registry.js` — `ComponentRegistry`. Only `meal-planner` is registered. No page calls `load()`.
- `data/*.json` — source data. Manager save methods log and call callbacks. They do not write these files.
- `aces.json` — metadata fields `status`, `progress`, and `previewUrl`.

`docs/STATE.md` lists data-shape and filename mismatches found in this tree. Read it before changing image paths, theme names, or the public methods.

## Editing constraints

- Keep new behavior in the existing static files unless a task asks for a toolchain.
- Theme values used by the HTML selects are `default`, `dark`, `blue`, and `green`. Theme custom properties are defined in `index.html`.
- Meal records use `proteins`, `sauce`, `carb`, `carb_portions`, `cooking_base`, `appropriate_extras`, and `image`. Ingredient records live under `proteins`, `sauces`, `carbs`, and `extras`.
- `components/meal-planner/manifest.json` is descriptive JSON. The class does not read it.
- Do not add readiness, launch, or quality claims to the docs.
