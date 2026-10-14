# Ingredients Manager component

`ingredients-manager.js` defines `IngredientsManager` and assigns it to `window.IngredientsManager`.

## Example page

`example.html` links `ingredients-manager.css` and `ingredients-manager.js`, and passes `dataPath: '../../data/'`. Serve the repository root over HTTP. See the root `README.md`.

The example page does not define the theme custom properties used by `ingredients-manager.css`. Those properties are in the inline stylesheet in `index.html`.

## Constructor

```javascript
const ingredientsManager = new IngredientsManager('ingredients-manager-container', {
    theme: 'default',
    dataPath: 'data/',
    onIngredientUpdate: (ingredients) => {},
    onIngredientDelete: (id) => {},
    onIngredientAdd: (ingredient) => {}
});
```

Defaults are `dataPath: 'data/'`, `theme: 'default'`, and no-op callbacks. Passed options override those defaults.

The theme `<select>` in `example.html` uses `default`, `dark`, `blue`, and `green`.

## Data

`loadIngredients` fetches `${dataPath}ingredients.json` and flattens `proteins`, `sauces`, `carbs`, and `extras` into `this.ingredients`. Each item gets `id`, `name`, `category`, `protein`, `carbs`, `fat`, `calories`, `unit`, and a `description` of `` `${name} - ${unit}` ``. Sauce items also keep `ratio`.

The file is grouped objects, not a top-level array. The on-screen categories and filters are `proteins`, `sauces`, `carbs`, and `extras`, plus an `all` filter. The search field filters the flattened list.

The add form fields are `name`, `category`, `protein`, `carbs`, `fat`, `calories`, `unit`, and `description`.

## Save behavior

`saveIngredients` logs `this.ingredients` and calls `onIngredientUpdate(this.ingredients)`. It does not write `ingredients.json`.

- Add calls `saveIngredients`, then `onIngredientAdd(newIngredient)`.
- Edit calls `saveIngredients`, then `onIngredientUpdate(updatedIngredient)` with the single ingredient.
- Delete calls `saveIngredients`, then `onIngredientDelete(id)`.

New and edited items stay on the flattened in-memory array. They are not written back into the `proteins` / `sauces` / `carbs` / `extras` objects.

## Other members

`destroy()` clears the container `innerHTML`.

`this.ingredients` and `this.filteredIngredients` are the current arrays.

`index.html` does not link `ingredients-manager.css`.
