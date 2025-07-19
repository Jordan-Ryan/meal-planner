// --- Data loading ---
let ingredients = {};
let meals = [];
let portionSteps = {};
let mealExtras = {};

async function loadData() {
  try {
    const [ingredientsRes, mealsRes, portionStepsRes, mealExtrasRes] = await Promise.all([
      fetch('data/ingredients.json'),
      fetch('data/meals.json'),
      fetch('data/portion_steps.json'),
      fetch('data/meal_extras.json')
    ]);
    ingredients = await ingredientsRes.json();
    meals = (await mealsRes.json()).meals;
    portionSteps = (await portionStepsRes.json()).portion_steps;
    mealExtras = await mealExtrasRes.json();
    console.log('Data loaded:', {ingredients, meals, portionSteps, mealExtras});
    console.log('mealExtras structure:', mealExtras);
    console.log('mealExtras.meal_extras:', mealExtras.meal_extras);
  } catch (err) {
    console.error('Error loading data:', err);
    alert('Error loading data files. Please make sure you are running a local server.');
  }
}

// --- Meal Gallery Rendering ---
let currentFilter = 'all';

function getDefaultMacros(meal) {
  // Use first protein, first carb portion, no extras, first sauce if multiple
  const proteinType = Array.isArray(meal.proteins) ? meal.proteins[0] : meal.proteins;
  const protein = ingredients.proteins[proteinType];
  const proteinWeight = 100; // default 100g
  let sauce = null;
  if (meal.sauce) {
    sauce = ingredients.sauces[meal.sauce];
  } else if (meal.sauce_options) {
    sauce = ingredients.sauces[meal.sauce_options[0]];
  }
  const carb = ingredients.carbs[meal.carb];
  const carbPortion = meal.carb_portions ? meal.carb_portions[0] : 0;
  // Sauce ratio
  function getSauceRatio(ratio) {
    if (!ratio) return 1;
    const parts = ratio.split(':').map(Number);
    return parts[1] / parts[0];
  }
  function calcPerGram(item, grams) {
    const factor = grams / 100;
    return {
      calories: Math.round(item.calories * factor),
      fat: +(item.fat * factor).toFixed(1),
      carbs: +(item.carbs * factor).toFixed(1),
      protein: +(item.protein * factor).toFixed(1)
    };
  }
  function calcPerPortion(item, portion) {
    // Find the step index for this portion
    const steps = portionSteps[meal.carb];
    if (!steps) return {calories: 0, fat: 0, carbs: 0, protein: 0};
    const idx = steps.steps.indexOf(portion);
    if (idx === -1) return {calories: 0, fat: 0, carbs: 0, protein: 0};
    const cal = steps.step_calories[idx];
    const factor = cal / item.calories;
    return {
      calories: cal,
      fat: +(item.fat * factor).toFixed(1),
      carbs: +(item.carbs * factor).toFixed(1),
      protein: +(item.protein * factor).toFixed(1)
    };
  }
  const sauceWeight = proteinWeight * getSauceRatio(sauce && sauce.ratio);
  const proteinMacros = protein ? calcPerGram(protein, proteinWeight) : {calories:0,fat:0,carbs:0,protein:0};
  const sauceMacros = sauce ? calcPerGram(sauce, sauceWeight) : {calories:0,fat:0,carbs:0,protein:0};
  const carbMacros = carb ? calcPerPortion(carb, carbPortion) : {calories:0,fat:0,carbs:0,protein:0};
  return {
    calories: proteinMacros.calories + sauceMacros.calories + carbMacros.calories,
    fat: +(proteinMacros.fat + sauceMacros.fat + carbMacros.fat).toFixed(1),
    carbs: +(proteinMacros.carbs + sauceMacros.carbs + carbMacros.carbs).toFixed(1),
    protein: +(proteinMacros.protein + sauceMacros.protein + carbMacros.protein).toFixed(1)
  };
}

// Local image mapping for each meal
const mealImages = {
  "spaghetti_bolognese": "images/spaghetti-bolognese-food.jpg",
  "meatballs_pasta": "images/meatballs-with-pasta-food.jpg",
  "pasta_bake": "images/pasta-bake-food.jpg",
  "beef_burgers": "images/beef-burgers-food.jpg",
  "cottage_pie": "images/cottage-pie-food.jpg",
  "chilli_con_carne": "images/chilli-con-carne-food.jpg",
  "beef_burrito": "images/beef-burrito-food.jpg",
  "beef_tacos": "images/beef-tacos-food.jpg",
  "loaded_nachos": "images/loaded-nachos-food.jpg",
  "stuffed_peppers": "images/stuffed-peppers-food.jpg",
  "chicken_pitta": "images/chicken-pittas-food.jpg",
  "chicken_burgers": "images/chicken-burgers-food.jpg",
  "chicken_curry": "images/chicken-curry-food.jpg",
  "chicken_teriyaki": "images/chicken-teriyaki-food.jpg",
  "sweet_sour_stir_fry": "images/sweet-and-sour-stir-fry-food.jpg",
  "chicken_fajitas": "images/chicken-fajitas-food.jpg"
};

function renderMealGallery() {
  const gallery = document.getElementById('meal-gallery');
  if (!gallery) {
    console.error('No #meal-gallery element found in DOM');
    return;
  }
  gallery.innerHTML = '';
  let filteredMeals = meals;
  if (currentFilter === 'beef') {
    filteredMeals = meals.filter(meal => meal.category === 'beef');
  } else if (currentFilter === 'chicken') {
    filteredMeals = meals.filter(meal => meal.category === 'chicken');
  }
  console.log('Rendering meal gallery. Meals to show:', filteredMeals.length);
  filteredMeals.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', meal.name);
    card.addEventListener('click', () => openMealDetails(meal.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openMealDetails(meal.id);
    });
    // Use Unsplash image if available, else fallback to SVG
    const img = document.createElement('img');
    if (mealImages[meal.id]) {
      img.src = mealImages[meal.id];
    } else {
      img.src = `images/${meal.image}.svg`;
    }
    img.alt = meal.name;
    img.onerror = function() {
      img.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.className = 'meal-fallback';
      fallback.innerHTML = '<span>🍽️</span>';
      card.insertBefore(fallback, card.firstChild);
    };
    card.appendChild(img);
    const info = document.createElement('div');
    info.className = 'meal-info';
    const name = document.createElement('div');
    name.className = 'meal-name';
    name.textContent = meal.name;
    info.appendChild(name);
    // Remove macro summary from gallery
    card.appendChild(info);
    gallery.appendChild(card);
  });
}

function renderMacroTable(meal) {
  const container = document.getElementById('macro-table-container');
  if (!meal) { container.innerHTML = ''; return; }
  // Protein types and weights
  const proteinTypes = meal.proteins || [];
  const proteinWeights = [50, 100, 150, 200, 250, 300, 350, 400];
  // Carb portions
  const carb = meal.carb;
  const carbSteps = (portionSteps[carb] && portionSteps[carb].steps) || [];
  // Sauce
  let sauce = null;
  if (meal.sauce) {
    sauce = ingredients.sauces[meal.sauce];
  } else if (meal.sauce_options) {
    sauce = ingredients.sauces[meal.sauce_options[0]];
  }
  // Table header
  let html = '<table class="macro-table"><thead><tr><th>Protein/Weight</th>';
  carbSteps.forEach(step => {
    html += `<th>${step}${ingredients.carbs[carb].unit.replace(/^[0-9]+/, '')}</th>`;
  });
  html += '</tr></thead><tbody>';
  // Table body
  proteinTypes.forEach(pid => {
    proteinWeights.forEach(weight => {
      html += `<tr><th>${ingredients.proteins[pid].name}<br>${weight}g</th>`;
      carbSteps.forEach(carbPortion => {
        // Calculate macros
        const protein = ingredients.proteins[pid];
        const sauceWeight = weight * (sauce && sauce.ratio ? Number(sauce.ratio.split(':')[1]) / Number(sauce.ratio.split(':')[0]) : 1);
        const proteinMacros = protein ? calcPerGram(protein, weight) : {calories:0,fat:0,carbs:0,protein:0};
        const sauceMacros = sauce ? calcPerGram(sauce, sauceWeight) : {calories:0,fat:0,carbs:0,protein:0};
        const carbMacros = ingredients.carbs[carb] ? calcPerPortion(ingredients.carbs[carb], carbPortion, carb) : {calories:0,fat:0,carbs:0,protein:0};
        const total = {
          calories: proteinMacros.calories + sauceMacros.calories + carbMacros.calories,
          fat: +(proteinMacros.fat + sauceMacros.fat + carbMacros.fat).toFixed(1),
          carbs: +(proteinMacros.carbs + sauceMacros.carbs + carbMacros.carbs).toFixed(1),
          protein: +(proteinMacros.protein + sauceMacros.protein + carbMacros.protein).toFixed(1)
        };
        html += `<td><div class='macro-cell-macros'>${total.calories} kcal<br>P:${total.protein}g C:${total.carbs}g F:${total.fat}g</div></td>`;
      });
      html += '</tr>';
    });
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}
// Helper for per gram
function calcPerGram(item, grams) {
  const factor = grams / 100;
  return {
    calories: Math.round(item.calories * factor),
    fat: +(item.fat * factor).toFixed(1),
    carbs: +(item.carbs * factor).toFixed(1),
    protein: +(item.protein * factor).toFixed(1)
  };
}
// Helper for per portion
function calcPerPortion(item, portion, carbKey) {
  const steps = portionSteps[carbKey];
  if (!steps) return {calories: 0, fat: 0, carbs: 0, protein: 0};
  const idx = steps.steps.indexOf(portion);
  if (idx === -1) return {calories: 0, fat: 0, carbs: 0, protein: 0};
  const cal = steps.step_calories[idx];
  const factor = cal / item.calories;
  return {
    calories: cal,
    fat: +(item.fat * factor).toFixed(1),
    carbs: +(item.carbs * factor).toFixed(1),
    protein: +(item.protein * factor).toFixed(1)
  };
}

let selectedCellData = null;

function openMealDetails(mealId) {
  const meal = meals.find(m => m.id === mealId);
  if (!meal) return;
  // Hide gallery and filter bar, show detail page
  document.getElementById('meal-gallery').classList.add('hidden');
  document.querySelector('.filter-bar').classList.add('hidden');
  document.getElementById('meal-detail-page').classList.remove('hidden');
  // Image and name
  const img = document.getElementById('meal-detail-img');
  if (mealImages[meal.id]) {
    img.src = mealImages[meal.id];
  } else {
    img.src = `images/${meal.image}.svg`;
  }
  img.alt = meal.name;
  document.getElementById('meal-detail-name').textContent = meal.name;
  selectedCellData = null; // Reset selection on new meal
  renderNutritionTable(meal);
  ['target-calories-detail','target-carbs-detail','target-protein-detail','target-fat-detail'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      renderNutritionTable(meal);
    });
  });
}

function renderNutritionTable(meal) {
  const container = document.querySelector('.nutrition-table-container');
  container.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'nutrition-table';
  // Header
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>Protein + Sauce</th>';
  meal.carb_portions.forEach(portion => {
    const carbUnit = ingredients.carbs[meal.carb].unit;
    headerRow.innerHTML += `<th>${portion}${getUnitDisplay(carbUnit, ingredients.carbs[meal.carb].name, portion)}</th>`;
  });
  table.appendChild(headerRow);
  // Rows
  meal.proteins.forEach(proteinType => {
    const proteinWeights = [100, 150, 200, 250, 300];
    proteinWeights.forEach(weight => {
      const row = document.createElement('tr');
      const proteinName = ingredients.proteins[proteinType].name;
      row.innerHTML = `<td class="protein-label">${proteinName} ${weight}g</td>`;
      meal.carb_portions.forEach(carbPortion => {
        const nutrition = calculateMealNutrition(meal.id, proteinType, weight, carbPortion, []);
        const cell = document.createElement('td');
        cell.className = 'nutrition-cell';
        cell.dataset.mealId = meal.id;
        cell.dataset.proteinType = proteinType;
        cell.dataset.proteinWeight = weight;
        cell.dataset.carbPortion = carbPortion;
        cell.innerHTML = `
          <div class="nutrition-summary">
            <strong>${Math.round(nutrition.calories)} kcal</strong><br>
            <small>${nutrition.fat.toFixed(1)}g fat, ${nutrition.carbs.toFixed(1)}g carbs, ${nutrition.protein.toFixed(1)}g protein</small>
          </div>
        `;
        // Mark as selected if matches selectedCellData
        if (
          selectedCellData &&
          selectedCellData.proteinType === proteinType &&
          Number(selectedCellData.proteinWeight) === weight &&
          Number(selectedCellData.carbPortion) === Number(carbPortion)
        ) {
          cell.classList.add('selected');
        }
        cell.addEventListener('click', () => {
          selectedCellData = {
            proteinType,
            proteinWeight: weight,
            carbPortion
          };
          // Clear previous highlights
          clearHighlights();
          // Highlight the clicked cell
          cell.classList.add('selected');
          // Open cooking panel for the selected cell
          openCookingPanel(selectedCellData, meal, false);
        });
        row.appendChild(cell);
      });
      table.appendChild(row);
    });
  });
  container.appendChild(table);
  highlightTargetMatches(meal);
  
  // Highlight selected cell if it exists and is in this table
  if (selectedCellData && isCellInTable(selectedCellData, meal)) {
    const selectedCell = document.querySelector(`[data-protein-type="${selectedCellData.proteinType}"][data-protein-weight="${selectedCellData.proteinWeight}"][data-carb-portion="${selectedCellData.carbPortion}"]`);
    if (selectedCell) {
      selectedCell.classList.add('selected');
    }
  }
  
  // Only show cooking panel if a cell is selected OR if macro targets are set
  const macroTargets = getTargetInputs();
  if (selectedCellData && isCellInTable(selectedCellData, meal)) {
    openCookingPanel(selectedCellData, meal, false);
  } else if (hasValidTargets(macroTargets)) {
    // If no cell selected but targets are set, show best match
    showCookingPanelForBestMatch(meal);
  } else {
    // Hide cooking panel if no selection and no targets
    const panel = document.querySelector('.cooking-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }
}

function isCellInTable(cellData, meal) {
  if (!cellData) return false;
  return meal.proteins.includes(cellData.proteinType) &&
    [100, 150, 200, 250, 300].includes(Number(cellData.proteinWeight)) &&
    meal.carb_portions.includes(Number(cellData.carbPortion));
}

function getUnitDisplay(unit, carbName = '', portion = 1) {
  if (!unit) return '';
  if (unit.includes('dry')) return 'g';
  if (unit === 'each') {
    // Pluralize carb name if portion > 1
    if (carbName) {
      let name = carbName.toLowerCase();
      // crude pluralization: add 's' if not already plural
      if (portion > 1 && !name.endsWith('s')) name += 's';
      return ' ' + name;
    }
    return '';
  }
  return unit.replace(/^[0-9]+/, '').trim();
}

function calculateMealNutrition(mealId, proteinType, proteinWeight, carbPortion, extras = []) {
  const meal = meals.find(m => m.id === mealId) || meals[mealId];
  const protein = ingredients.proteins[proteinType];
  const sauce = ingredients.sauces[meal.sauce];
  const carb = ingredients.carbs[meal.carb];
  // Protein nutrition
  const proteinNutrition = {
    calories: (protein.calories * proteinWeight) / 100,
    fat: (protein.fat * proteinWeight) / 100,
    carbs: (protein.carbs * proteinWeight) / 100,
    protein: (protein.protein * proteinWeight) / 100
  };
  // Sauce nutrition
  const sauceRatio = parseSauceRatioFraction(sauce.ratio);
  const sauceWeight = proteinWeight * sauceRatio;
  const sauceNutrition = {
    calories: (sauce.calories * sauceWeight) / 100,
    fat: (sauce.fat * sauceWeight) / 100,
    carbs: (sauce.carbs * sauceWeight) / 100,
    protein: (sauce.protein * sauceWeight) / 100
  };
  // Carb nutrition - fix for 'each' vs numbered units
  let carbNutrition;
  if (carb.unit === 'each') {
    // For 'each' units, use the portion directly (1 bun = 1 portion)
    carbNutrition = {
      calories: carb.calories * carbPortion,
      fat: carb.fat * carbPortion,
      carbs: carb.carbs * carbPortion,
      protein: carb.protein * carbPortion
    };
  } else {
    // For units with numbers (like '75g dry'), parse the number and calculate multiplier
    const carbBaseUnit = parseFloat(carb.unit.match(/\d+/)?.[0] || 100);
    const carbMultiplier = carbPortion / carbBaseUnit;
    carbNutrition = {
      calories: carb.calories * carbMultiplier,
      fat: carb.fat * carbMultiplier,
      carbs: carb.carbs * carbMultiplier,
      protein: carb.protein * carbMultiplier
    };
  }
  // Extras nutrition
  const extrasNutrition = extras.reduce((total, extra) => {
    const ingredient = ingredients.extras[extra.id];
    const multiplier = extra.weight / 100;
    return {
      calories: total.calories + (ingredient.calories * multiplier),
      fat: total.fat + (ingredient.fat * multiplier),
      carbs: total.carbs + (ingredient.carbs * multiplier),
      protein: total.protein + (ingredient.protein * multiplier)
    };
  }, { calories: 0, fat: 0, carbs: 0, protein: 0 });
  // Sum all
  return {
    calories: proteinNutrition.calories + sauceNutrition.calories + carbNutrition.calories + extrasNutrition.calories,
    fat: proteinNutrition.fat + sauceNutrition.fat + carbNutrition.fat + extrasNutrition.fat,
    carbs: proteinNutrition.carbs + sauceNutrition.carbs + carbNutrition.carbs + extrasNutrition.carbs,
    protein: proteinNutrition.protein + sauceNutrition.protein + carbNutrition.protein + extrasNutrition.protein
  };
}

function parseSauceRatio(ratio) {
  const ratioMap = { '1:1': 1.0, '1:2': 0.5, '1:4': 0.25 };
  return ratioMap[ratio] || 1.0;
}

// --- Macro Target Score Helper ---
function calculateTargetScore(nutrition, targets) {
  // Lower score = better match. Only include targets that are set (not null).
  let score = 0;
  if (targets.calories !== null) score += Math.abs(nutrition.calories - targets.calories) * 0.5; // calories are more important now
  if (targets.protein !== null) score += Math.abs(nutrition.protein - targets.protein) * 8; // protein is still the most important
  if (targets.carbs !== null) score += Math.abs(nutrition.carbs - targets.carbs) * 2; // carbs are moderately important
  if (targets.fat !== null) score += Math.abs(nutrition.fat - targets.fat) * 1; // fat is least important
  return score;
}

// --- Macro Target Inputs Helper ---
function getTargetInputs() {
  // Only return null if the field is truly empty, not if it's zero
  const getVal = id => {
    const v = document.getElementById(id).value;
    return v === '' ? null : Number(v);
  };
  return {
    calories: getVal('target-calories-detail'),
    carbs: getVal('target-carbs-detail'),
    protein: getVal('target-protein-detail'),
    fat: getVal('target-fat-detail')
  };
}

function hasValidTargets(targets) {
  // At least one target must be set (not null)
  return targets && (targets.calories !== null || targets.carbs !== null || targets.protein !== null || targets.fat !== null);
}

// Always show the best match's ingredient list and instructions in the cooking panel
function highlightTargetMatches(meal) {
  const targets = getTargetInputs();
  if (!hasValidTargets(targets)) {
    clearHighlights();
    showCookingPanelForBestMatch(meal);
    return;
  }
  const cells = document.querySelectorAll('.nutrition-cell');
  const scores = [];
  cells.forEach((cell, index) => {
    const nutrition = calculateMealNutrition(
      cell.dataset.mealId,
      cell.dataset.proteinType,
      parseInt(cell.dataset.proteinWeight),
      parseFloat(cell.dataset.carbPortion),
      []
    );
    const score = calculateTargetScore(nutrition, targets);
    scores.push({ cell, score, index, nutrition });
  });
  scores.sort((a, b) => a.score - b.score);
  clearHighlights();
  if (scores.length > 0) {
    scores[0].cell.classList.add('best-match');
    // If no cell is selected, show best match in cooking panel
    if (!selectedCellData) showCookingPanelForBestMatch(meal, scores[0].cell.dataset);
  }
  const threshold = scores.length > 0 ? scores[0].score * 1.1 : 0;
  let closeCount = 0;
  for (let i = 1; i < scores.length && closeCount < 4; i++) {
    if (scores[i].score <= threshold) {
      scores[i].cell.classList.add('close-match');
      closeCount++;
    }
  }
}

function getAvailableExtras(mealId) {
  console.log('getAvailableExtras called for mealId:', mealId);
  console.log('mealExtras:', mealExtras);
  
  // Safety check - if mealExtras is not loaded yet, return empty array
  if (!mealExtras || !mealExtras.meal_extras) {
    console.log('mealExtras not loaded yet, returning empty array');
    return [];
  }
  
  // Find which style this meal belongs to
  for (const [style, data] of Object.entries(mealExtras.meal_extras)) {
    console.log('Checking style:', style, 'data:', data);
    if (data.meals.includes(mealId)) {
      console.log('Found extras for mealId:', mealId, 'extras:', data.extras);
      return data.extras;
    }
  }
  console.log('No extras found for mealId:', mealId);
  return [];
}

function getSelectedExtras(panel) {
  const extras = [];
  panel.querySelectorAll('.extra-ingredient').forEach(extraItem => {
    const extraId = extraItem.dataset.extraId;
    const weightInput = extraItem.querySelector('.extra-weight-input');
    const weight = parseFloat(weightInput.value) || 0;
    if (weight > 0) {
      extras.push({ id: extraId, weight: weight });
    }
  });
  return extras;
}

function addExtraToIngredientsList(panel, extraId, extraName, extraUnit, meal, cellData) {
  const ingredientList = panel.querySelector('.ingredient-list');
  const extraData = ingredients.extras[extraId];
  const defaultWeight = extraUnit === 'each' ? 1 : 50;
  
  const extraItem = document.createElement('li');
  extraItem.className = 'ingredient-item extra-ingredient';
  extraItem.dataset.extraId = extraId;
  
  const displayWeight = extraUnit === 'each' ? defaultWeight : defaultWeight + 'g';
  
  extraItem.innerHTML = `
    <span>${extraName}</span>
    <input type='number' class='extra-weight-input' value='${defaultWeight}' min='1' max='200' style='width:60px;'>
    <span class='extra-unit'>${extraUnit === 'each' ? 'each' : 'g'}</span>
    <button class='ingredient-info-btn' data-ingtype='extra' data-ingid='${extraId}' data-ingweight='${defaultWeight}' aria-label='Show info for ${extraName}'>i</button>
    <button class='remove-extra-btn' aria-label='Remove ${extraName}'>&times;</button>
  `;
  
  // Add weight input event listener
  const weightInput = extraItem.querySelector('.extra-weight-input');
  weightInput.addEventListener('input', (e) => {
    const newWeight = parseFloat(e.target.value) || 0;
    
    // Update info button weight
    const infoBtn = extraItem.querySelector('.ingredient-info-btn');
    infoBtn.dataset.ingweight = newWeight;
    
    updateNutritionDisplay(meal, cellData, panel);
  });
  
  // Add remove button event listener
  const removeBtn = extraItem.querySelector('.remove-extra-btn');
  removeBtn.addEventListener('click', () => {
    removeExtraFromIngredientsList(panel, extraId);
    // Also show the extra in the extras section again
    const extraItemInSection = panel.querySelector(`.extra-item[data-extra-id='${extraId}']`);
    if (extraItemInSection) {
      extraItemInSection.style.display = 'flex';
    }
    updateNutritionDisplay(meal, cellData, panel);
  });
  
  // Add info button event listener for extras
  const infoBtn = extraItem.querySelector('.ingredient-info-btn');
  infoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const ingType = infoBtn.dataset.ingtype;
    const ingId = infoBtn.dataset.ingid;
    const ingWeight = parseFloat(infoBtn.dataset.ingweight) || 0;
    showIngredientInfo(ingType, ingId, ingWeight);
  });
  
  ingredientList.appendChild(extraItem);
}

function removeExtraFromIngredientsList(panel, extraId) {
  const extraItem = panel.querySelector(`.extra-ingredient[data-extra-id='${extraId}']`);
  if (extraItem) {
    extraItem.remove();
  }
}

function updateNutritionDisplay(meal, cellData, panel) {
  const selectedExtras = getSelectedExtras(panel);
  const nutrition = calculateMealNutrition(meal.id, cellData.proteinType, cellData.proteinWeight, cellData.carbPortion, selectedExtras);
  const nutritionDisplay = panel.querySelector('#nutrition-display');
  if (nutritionDisplay) {
    nutritionDisplay.textContent = `Calories: ${Math.round(nutrition.calories)} kcal, Protein: ${nutrition.protein.toFixed(1)}g, Carbs: ${nutrition.carbs.toFixed(1)}g, Fat: ${nutrition.fat.toFixed(1)}g`;
  }
}

function showCookingPanelForBestMatch(meal, cellData) {
  // If no cellData, use first protein/weight/carb
  if (!cellData) {
    cellData = {
      proteinType: meal.proteins[0],
      proteinWeight: 100,
      carbPortion: meal.carb_portions[0]
    };
  }
  openCookingPanel(cellData, meal, false);
}

function openCookingPanel(cellData, meal, scrollToPanel) {
  const panel = document.querySelector('.cooking-panel');
  console.log('openCookingPanel called with:', cellData, meal);
  console.log('Found cooking panel:', panel);
  
  if (!panel) {
    console.error('Cooking panel not found!');
    return;
  }
  
  const macroTargets = getTargetInputs();
  // Debug: log macroTargets and hasValidTargets
  console.log('macroTargets:', macroTargets, 'hasValidTargets:', hasValidTargets(macroTargets));
  // Gather ingredient info
  const protein = ingredients.proteins[cellData.proteinType];
  const sauce = ingredients.sauces[meal.sauce];
  const carb = ingredients.carbs[meal.carb];
  const proteinWeight = cellData.proteinWeight;
  const carbPortion = cellData.carbPortion;
  // Use correct sauce ratio (sauceWeight = proteinWeight * (sauce:protein fraction))
  const sauceWeight = Math.round(proteinWeight * parseSauceRatioFraction(sauce.ratio));
  
  // Get available extras for this meal
  const availableExtras = getAvailableExtras(meal.id);
  
  // Ingredient list
  const ingredientList = [
    { type: 'protein', name: protein.name, id: cellData.proteinType, weight: proteinWeight, unit: 'g' },
    { type: 'sauce', name: sauce.name, id: meal.sauce, weight: sauceWeight, unit: 'g' },
    { type: 'carb', name: carb.name, id: meal.carb, weight: carbPortion, unit: carb.unit }
  ];
  panel.innerHTML = `
    <ul class='ingredient-list'>
      ${ingredientList.map(ing => {
        const displayWeight = ing.unit === 'each' ? ing.weight : ing.weight + 'g';
        return `
        <li class='ingredient-item'>
          <span>${ing.name} <strong>${displayWeight}</strong></span>
          <button class='ingredient-info-btn' data-ingtype='${ing.type}' data-ingid='${ing.id}' data-ingweight='${ing.weight}' aria-label='Show info for ${ing.name}'>i</button>
        </li>
      `;
      }).join('')}
    </ul>
    
    ${availableExtras.length > 0 ? `
    <div class='extras-section'>
      <h4>Extras (Click to add)</h4>
      <div class='extras-grid'>
        ${availableExtras.map(extra => {
          const extraData = ingredients.extras[extra];
          return `
          <div class='extra-item inactive' data-extra-id='${extra}' data-extra-name='${extraData.name}' data-extra-unit='${extraData.unit}'>
            <span class='extra-name'>${extraData.name}</span>
            <button class='ingredient-info-btn' data-ingtype='extra' data-ingid='${extra}' data-ingweight='${extraData.unit === 'each' ? '1' : '50'}' aria-label='Show info for ${extraData.name}'>i</button>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    ` : ''}
    
    <div style='font-size:1.1rem;'><strong>Selected: ${protein.name} ${proteinWeight}g + ${carbPortion}${getUnitDisplay(carb.unit, carb.name, carbPortion)}</strong><br>
      <span id='nutrition-display'>Calories: ${Math.round(calculateMealNutrition(meal.id, cellData.proteinType, proteinWeight, carbPortion, []).calories)} kcal, Protein: ${calculateMealNutrition(meal.id, cellData.proteinType, proteinWeight, carbPortion, []).protein.toFixed(1)}g, Carbs: ${calculateMealNutrition(meal.id, cellData.proteinType, proteinWeight, carbPortion, []).carbs.toFixed(1)}g, Fat: ${calculateMealNutrition(meal.id, cellData.proteinType, proteinWeight, carbPortion, []).fat.toFixed(1)}g</span>
      <div class='cooking-instructions'><h4>Cooking Instructions</h4><ol>${generateCookingInstructionsHTML(meal, cellData).replace(/<[^>]+>/g, '').split('.').filter(Boolean).map(s => `<li>${s.trim()}.</li>`).join('')}</ol></div>
      ${hasValidTargets(macroTargets) ? "<button class='generate-exact-btn' style='margin-top:1rem;'>Generate Exact</button>" : ""}
    </div>
  `;
  if (hasValidTargets(macroTargets)) {
    panel.querySelector('.generate-exact-btn').addEventListener('click', () => generateExactMacroFit(meal));
  }
  
  // Extras event listeners
  if (availableExtras.length > 0) {
    panel.querySelectorAll('.extra-item').forEach(extraItem => {
      extraItem.addEventListener('click', (e) => {
        // Don't trigger if clicking the info button
        if (e.target.classList.contains('ingredient-info-btn')) {
          return;
        }
        
        const extraId = extraItem.dataset.extraId;
        const extraName = extraItem.dataset.extraName;
        const extraUnit = extraItem.dataset.extraUnit;
        
        if (extraItem.classList.contains('inactive')) {
          // Add to ingredients list
          addExtraToIngredientsList(panel, extraId, extraName, extraUnit, meal, cellData);
          
          // Hide the extra from the extras section
          extraItem.style.display = 'none';
        } else {
          // Remove from ingredients list
          removeExtraFromIngredientsList(panel, extraId);
          
          // Show the extra in the extras section again
          extraItem.style.display = 'flex';
        }
        
        updateNutritionDisplay(meal, cellData, panel);
      });
    });
  }
  
  // Ingredient info modals
  panel.querySelectorAll('.ingredient-info-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ingType = btn.dataset.ingtype;
      const ingId = btn.dataset.ingid;
      const ingWeight = btn.dataset.ingweight;
      openIngredientModal(ingType, ingId, ingWeight);
    });
  });
  // Make sure the panel is visible
  panel.style.display = 'block';
  if (scrollToPanel) panel.scrollIntoView({ behavior: 'smooth' });
}

function generateExactMacroFit(meal) {
  const targets = getTargetInputs();
  console.log('Generating exact macro fit for targets:', targets);
  
  let best = null;
  let bestScore = Infinity;
  let bestCombo = null;
  
  // Search through all protein types and reasonable weight ranges
  meal.proteins.forEach(proteinType => {
    // For protein, search in smaller steps for more precision
    for (let pw = 50; pw <= 400; pw += 5) {
      // For carbs, use smaller steps and limit range based on meal type
      const maxCarbs = meal.carb === 'brioche_bun' || meal.carb === 'seeded_bun' ? 10 : 200; // Limit buns to 10 max
      for (let cw = 1; cw <= maxCarbs; cw += 1) {
        const nutrition = calculateMealNutrition(meal.id, proteinType, pw, cw, []);
        const score = calculateTargetScore(nutrition, targets);
        
        // Debug: log some combinations to see what's being considered
        if (Math.random() < 0.001) { // Log 0.1% of combinations for debugging
          console.log(`Trying: ${proteinType} ${pw}g + ${cw}, Score: ${score}, Cals: ${Math.round(nutrition.calories)}, Protein: ${nutrition.protein.toFixed(1)}g`);
        }
        
        if (score < bestScore) {
          bestScore = score;
          best = nutrition;
          bestCombo = { proteinType, proteinWeight: pw, carbPortion: cw };
          console.log(`New best: ${proteinType} ${pw}g + ${cw}, Score: ${score}, Cals: ${Math.round(nutrition.calories)}, Protein: ${nutrition.protein.toFixed(1)}g`);
        }
      }
    }
  });
  
  const panel = document.querySelector('.cooking-panel');
  if (bestCombo) {
    // Keep the same format as the regular cooking panel
    const protein = ingredients.proteins[bestCombo.proteinType];
    const sauce = ingredients.sauces[meal.sauce];
    const carb = ingredients.carbs[meal.carb];
    const proteinWeight = bestCombo.proteinWeight;
    const carbPortion = bestCombo.carbPortion;
    const sauceWeight = Math.round(proteinWeight * parseSauceRatioFraction(sauce.ratio));
    
    // Get available extras for this meal
    const availableExtras = getAvailableExtras(meal.id);
    
    // Ingredient list
    const ingredientList = [
      { type: 'protein', name: protein.name, id: bestCombo.proteinType, weight: proteinWeight, unit: 'g' },
      { type: 'sauce', name: sauce.name, id: meal.sauce, weight: sauceWeight, unit: 'g' },
      { type: 'carb', name: carb.name, id: meal.carb, weight: carbPortion, unit: carb.unit }
    ];
    
    panel.innerHTML = `
      <ul class='ingredient-list'>
        ${ingredientList.map(ing => {
          const displayWeight = ing.unit === 'each' ? ing.weight : ing.weight + 'g';
          return `
          <li class='ingredient-item'>
            <span>${ing.name} <strong>${displayWeight}</strong></span>
            <button class='ingredient-info-btn' data-ingtype='${ing.type}' data-ingid='${ing.id}' data-ingweight='${ing.weight}' aria-label='Show info for ${ing.name}'>i</button>
          </li>
        `;
        }).join('')}
      </ul>
      
      ${availableExtras.length > 0 ? `
      <div class='extras-section'>
        <h4>Extras (Click to add)</h4>
        <div class='extras-grid'>
          ${availableExtras.map(extra => {
            const extraData = ingredients.extras[extra];
            return `
            <div class='extra-item inactive' data-extra-id='${extra}' data-extra-name='${extraData.name}' data-extra-unit='${extraData.unit}'>
              <span class='extra-name'>${extraData.name}</span>
              <button class='ingredient-info-btn' data-ingtype='extra' data-ingid='${extra}' data-ingweight='${extraData.unit === 'each' ? '1' : '50'}' aria-label='Show info for ${extraData.name}'>i</button>
            </div>
            `;
          }).join('')}
        </div>
      </div>
      ` : ''}
      
      <div style='font-size:1.1rem;'><strong>Exact Macro Fit: ${protein.name} ${proteinWeight}g + ${carbPortion}${getUnitDisplay(carb.unit, carb.name, carbPortion)}</strong><br>
        <span id='nutrition-display'>Calories: ${Math.round(best.calories)} kcal, Protein: ${best.protein.toFixed(1)}g, Carbs: ${best.carbs.toFixed(1)}g, Fat: ${best.fat.toFixed(1)}g</span>
        <div class='cooking-instructions'><h4>Cooking Instructions</h4><ol>${generateCookingInstructionsHTML(meal, bestCombo).replace(/<[^>]+>/g, '').split('.').filter(Boolean).map(s => `<li>${s.trim()}.</li>`).join('')}</ol></div>
      </div>
    `;
    
    // Extras event listeners
    if (availableExtras.length > 0) {
      panel.querySelectorAll('.extra-item').forEach(extraItem => {
        extraItem.addEventListener('click', (e) => {
          // Don't trigger if clicking the info button
          if (e.target.classList.contains('ingredient-info-btn')) {
            return;
          }
          
          const extraId = extraItem.dataset.extraId;
          const extraName = extraItem.dataset.extraName;
          const extraUnit = extraItem.dataset.extraUnit;
          
          if (extraItem.classList.contains('inactive')) {
            // Add to ingredients list
            addExtraToIngredientsList(panel, extraId, extraName, extraUnit, meal, bestCombo);
            
            // Hide the extra from the extras section
            extraItem.style.display = 'none';
          } else {
            // Remove from ingredients list
            removeExtraFromIngredientsList(panel, extraId);
            
            // Show the extra in the extras section again
            extraItem.style.display = 'flex';
          }
          
          updateNutritionDisplay(meal, bestCombo, panel);
        });
      });
    }
    
    // Re-add ingredient info button event listeners
    panel.querySelectorAll('.ingredient-info-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ingType = btn.dataset.ingtype;
        const ingId = btn.dataset.ingid;
        const ingWeight = btn.dataset.ingweight;
        openIngredientModal(ingType, ingId, ingWeight);
      });
    });
  } else {
    panel.innerHTML = '<div>No close macro fit found.</div>';
  }
}

function generateCookingInstructionsHTML(meal, cellData) {
  const protein = ingredients.proteins[cellData.proteinType];
  const sauce = ingredients.sauces[meal.sauce];
  const carb = ingredients.carbs[meal.carb];
  const proteinWeight = cellData.proteinWeight;
  const carbPortion = cellData.carbPortion;
  const sauceWeight = Math.round(proteinWeight * parseSauceRatioFraction(sauce.ratio));
  let steps = [];
  if (meal.category === 'beef') {
    steps.push(`Brown ${proteinWeight}g ${protein.name.toLowerCase()} in a non-stick pan over medium-high heat (4-5 minutes).`);
  } else {
    steps.push(`Cut ${proteinWeight}g ${protein.name.toLowerCase()} into strips/chunks and cook in a non-stick pan over medium-high heat (6-8 minutes).`);
  }
  if (['nandos_medium', 'teriyaki'].includes(meal.sauce)) {
    steps.push(`Add ${sauceWeight}g ${sauce.name.toLowerCase()} and cook for 2-3 minutes until heated through.`);
  } else {
    steps.push(`Stir in ${sauceWeight}g ${sauce.name.toLowerCase()}, reduce heat and simmer for 5 minutes.`);
  }
  if (carb.unit.includes('dry')) {
    steps.push(`Meanwhile, cook ${carbPortion}g ${carb.name.toLowerCase()} according to package instructions. Drain well.`);
  } else if (carb.unit === 'each') {
    steps.push(`Warm ${carbPortion} ${carb.name.toLowerCase()}${carbPortion > 1 ? 's' : ''} in a dry pan or microwave.`);
  }
  steps.push('Serve hot with your chosen accompaniments.');
  return `<div class='cooking-instructions'><h4>Cooking Instructions</h4><ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol></div>`;
}



function openIngredientModal(type, id, portionWeight) {
  // Get ingredient data
  let ing, macros, imgUrl, fallback;
  if (type === 'protein') {
    ing = ingredients.proteins[id];
    imgUrl = getIngredientImageUrl(id, ing.name);
    macros = ing;
    fallback = '🥩';
  } else if (type === 'sauce') {
    ing = ingredients.sauces[id];
    imgUrl = getIngredientImageUrl(id, ing.name);
    macros = ing;
    fallback = '🥫';
  } else if (type === 'carb') {
    ing = ingredients.carbs[id];
    imgUrl = getIngredientImageUrl(id, ing.name);
    macros = ing;
    fallback = '🍚';
  } else if (type === 'extra') {
    ing = ingredients.extras[id];
    imgUrl = getIngredientImageUrl(id, ing.name);
    macros = ing;
    fallback = '🥬';
  } else {
    return;
  }
  // Modal HTML
  const modal = document.createElement('div');
  modal.className = 'ingredient-modal';
  // Calculate macros for portion - handle 'each' vs numbered units
  const portion = parseFloat(portionWeight) || 100;
  let factor;
  if (ing.unit === 'each') {
    // For 'each' units, use the portion directly (1 bun = 1 portion)
    factor = portion;
  } else {
    // For units with numbers (like '75g dry', '100g'), parse the number and calculate multiplier
    const baseUnit = parseFloat(ing.unit.match(/\d+/)?.[0] || 100);
    factor = portion / baseUnit;
  }
  modal.innerHTML = `
    <div class='ingredient-modal-content'>
      <button class='ingredient-modal-close' aria-label='Close'>&times;</button>
      ${imgUrl ? `<img src='${imgUrl}' class='ingredient-modal-img' alt='${ing.name}'>` : `<div class='ingredient-modal-img' style='font-size:3rem;display:flex;align-items:center;justify-content:center;'>${fallback}</div>`}
      <h3 style='margin:0.5rem 0 0.2rem 0;'>${ing.name}</h3>
      <table class='ingredient-macros-table'>
        <tr><td></td><td>Per ${ing.unit}</td><td>In Meal (${ing.unit === 'each' ? portion : portion + 'g'})</td></tr>
        <tr><td>Calories</td><td>${ing.calories} kcal</td><td>${Math.round(ing.calories * factor)} kcal</td></tr>
        <tr><td>Fat</td><td>${ing.fat}g</td><td>${(ing.fat * factor).toFixed(1)}g</td></tr>
        <tr><td>Carbs</td><td>${ing.carbs}g</td><td>${(ing.carbs * factor).toFixed(1)}g</td></tr>
        <tr><td>Protein</td><td>${ing.protein}g</td><td>${(ing.protein * factor).toFixed(1)}g</td></tr>
      </table>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.ingredient-modal-close').focus();
  modal.querySelector('.ingredient-modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function getIngredientImageUrl(id, name) {
  // Currently no local ingredient images, return null to use fallback emojis
  return null;
}

function clearMealForm() {
  // Clear target inputs
  const targetInputs = ['target-calories-detail', 'target-carbs-detail', 'target-protein-detail', 'target-fat-detail'];
  targetInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  
  // Clear selected cell
  clearHighlights();
  
  // Clear cooking panel
  const cookingPanel = document.querySelector('.cooking-panel');
  if (cookingPanel) {
    cookingPanel.innerHTML = '';
  }
}

document.getElementById('close-detail-btn').addEventListener('click', () => {
  clearMealForm();
  document.getElementById('meal-detail-page').classList.add('hidden');
  document.getElementById('meal-gallery').classList.remove('hidden');
  document.querySelector('.filter-bar').classList.remove('hidden');
});

function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderMealGallery();
    });
  });
}

// --- Nutrition Table Highlight Helper ---
function clearHighlights() {
  document.querySelectorAll('.nutrition-cell.best-match, .nutrition-cell.close-match, .nutrition-cell.selected').forEach(cell => {
    cell.classList.remove('best-match', 'close-match', 'selected');
  });
}

// --- Sauce Ratio Helper ---
function parseSauceRatio(ratio) {
  // Accepts string like '1:1', '1:2', '1:4', '1:9', etc.
  if (!ratio) return 1.0;
  const parts = ratio.split(':').map(Number);
  if (parts.length === 2 && parts[0] > 0) {
    return parts[1] / parts[0];
  }
  return 1.0;
}
function parseSauceRatioFraction(ratio) {
  // Returns the fraction for sauce:protein, e.g. 1:9 => 1/9
  if (!ratio) return 1.0;
  const parts = ratio.split(':').map(Number);
  if (parts.length === 2 && parts[1] > 0) {
    return parts[0] / parts[1];
  }
  return 1.0;
}

// --- App Init ---
window.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupFilters();
  renderMealGallery();
  console.log('App initialized');
}); 