/**
 * Meal Planner Component
 * A modular, reusable meal planning component for multi-app platforms
 */

class MealPlanner {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            theme: options.theme || 'default',
            dataPath: options.dataPath || 'data/',
            imagesPath: options.imagesPath || 'images/',
            onMealSelect: options.onMealSelect || null,
            onNutritionUpdate: options.onNutritionUpdate || null,
            ...options
        };
        
        this.state = {
            currentFilter: 'all',
            selectedMeal: null,
            selectedCellData: null,
            nutritionTargets: {
                calories: 0,
                carbs: 0,
                protein: 0,
                fat: 0
            }
        };
        
        this.data = {
            ingredients: {},
            meals: [],
            portionSteps: {},
            mealExtras: {}
        };
        
        // Local image mapping for each meal
        this.mealImages = {
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
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.render();
        this.bindEvents();
    }
    
    async loadData() {
        try {
            const [ingredientsRes, mealsRes, portionStepsRes, mealExtrasRes] = await Promise.all([
                fetch(`${this.options.dataPath}ingredients.json`),
                fetch(`${this.options.dataPath}meals.json`),
                fetch(`${this.options.dataPath}portion_steps.json`),
                fetch(`${this.options.dataPath}meal_extras.json`)
            ]);
            
            this.data.ingredients = await ingredientsRes.json();
            this.data.meals = (await mealsRes.json()).meals;
            this.data.portionSteps = (await portionStepsRes.json()).portion_steps;
            this.data.mealExtras = await mealExtrasRes.json();
            
            console.log('Data loaded:', this.data);
            
        } catch (err) {
            console.error('Error loading meal planner data:', err);
            this.showError('Error loading data files. Please check your configuration.');
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="meal-planner-component" data-theme="${this.options.theme}">
                <header class="meal-planner-header">
                    <h1>Meal Planner</h1>
                </header>
                
                <nav class="filter-bar">
                    <div class="filter-group">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="beef">Beef Mince</button>
                        <button class="filter-btn" data-filter="chicken">Chicken</button>
                    </div>
                </nav>
                
                <section id="meal-gallery" class="meal-gallery"></section>
                
                <section id="meal-detail-page" class="meal-detail-page hidden">
                    <div class="meal-page">
                        <header class="meal-header">
                            <button class="close-detail" id="close-detail-btn" aria-label="Back to gallery">&larr; Back</button>
                            <img id="meal-detail-img" class="meal-banner" alt="Meal image" />
                            <h1 id="meal-detail-name" class="meal-title"></h1>
                        </header>
                        
                        <section class="nutrition-targets">
                            <div class="target-inputs">
                                <input type="number" id="target-calories-detail" placeholder="Calories">
                                <input type="number" id="target-carbs-detail" placeholder="Carbs (g)">
                                <input type="number" id="target-protein-detail" placeholder="Protein (g)">
                                <input type="number" id="target-fat-detail" placeholder="Fat (g)">
                            </div>
                        </section>
                        
                        <section class="nutrition-table-container">
                            <!-- Nutrition table will be rendered here -->
                        </section>
                        
                        <section class="cooking-panel hidden">
                            <!-- Cooking instructions and customization -->
                        </section>
                    </div>
                </section>
            </div>
        `;
        
        this.renderMealGallery();
    }
    
    renderMealGallery() {
        const gallery = this.container.querySelector('#meal-gallery');
        if (!gallery) return;
        
        gallery.innerHTML = '';
        let filteredMeals = this.data.meals;
        
        if (this.state.currentFilter === 'beef') {
            filteredMeals = this.data.meals.filter(meal => meal.category === 'beef');
        } else if (this.state.currentFilter === 'chicken') {
            filteredMeals = this.data.meals.filter(meal => meal.category === 'chicken');
        }
        
        filteredMeals.forEach(meal => {
            const card = this.createMealCard(meal);
            gallery.appendChild(card);
        });
    }
    
    createMealCard(meal) {
        const card = document.createElement('div');
        card.className = 'meal-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', meal.name);
        
        const img = document.createElement('img');
        img.src = `${this.options.imagesPath}${meal.image}.jpg`;
        img.alt = meal.name;
        img.onerror = () => {
            img.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'meal-fallback';
            fallback.innerHTML = '<span>🍽️</span>';
            card.insertBefore(fallback, card.firstChild);
        };
        
        const info = document.createElement('div');
        info.className = 'meal-info';
        const name = document.createElement('div');
        name.className = 'meal-name';
        name.textContent = meal.name;
        info.appendChild(name);
        
        card.appendChild(img);
        card.appendChild(info);
        
        return card;
    }
    
    bindEvents() {
        // Filter buttons
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Meal cards
        this.container.addEventListener('click', (e) => {
            const mealCard = e.target.closest('.meal-card');
            if (mealCard) {
                const mealName = mealCard.querySelector('.meal-name').textContent;
                const meal = this.data.meals.find(m => m.name === mealName);
                if (meal) {
                    this.openMealDetails(meal);
                }
            }
        });
        
        // Close detail button
        this.container.addEventListener('click', (e) => {
            if (e.target.id === 'close-detail-btn') {
                this.closeMealDetails();
            }
        });
        
        // Nutrition target inputs
        ['target-calories-detail', 'target-carbs-detail', 'target-protein-detail', 'target-fat-detail'].forEach(id => {
            const input = this.container.querySelector(`#${id}`);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.updateNutritionTargets();
                });
            }
        });
    }
    
    setFilter(filter) {
        this.state.currentFilter = filter;
        
        // Update active filter button
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderMealGallery();
    }
    
    openMealDetails(meal) {
        this.state.selectedMeal = meal;
        
        // Hide gallery, show detail page
        this.container.querySelector('#meal-gallery').classList.add('hidden');
        this.container.querySelector('.filter-bar').classList.add('hidden');
        this.container.querySelector('#meal-detail-page').classList.remove('hidden');
        
        // Update meal details
        const img = this.container.querySelector('#meal-detail-img');
        img.src = `${this.options.imagesPath}${meal.image}.jpg`;
        img.alt = meal.name;
        
        this.container.querySelector('#meal-detail-name').textContent = meal.name;
        
        this.renderNutritionTable(meal);
        
        // Ensure cooking panel is hidden when opening meal
        const cookingPanel = this.container.querySelector('.cooking-panel');
        if (cookingPanel) {
            cookingPanel.classList.add('hidden');
            cookingPanel.innerHTML = '';
        }
        
        // Call callback if provided
        if (this.options.onMealSelect) {
            this.options.onMealSelect(meal);
        }
    }
    
    closeMealDetails() {
        this.state.selectedMeal = null;
        this.state.selectedCellData = null; // Reset selected cell data
        
        // Show gallery, hide detail page
        this.container.querySelector('#meal-gallery').classList.remove('hidden');
        this.container.querySelector('.filter-bar').classList.remove('hidden');
        this.container.querySelector('#meal-detail-page').classList.add('hidden');
        
        // Hide cooking panel
        const cookingPanel = this.container.querySelector('.cooking-panel');
        if (cookingPanel) {
            cookingPanel.classList.add('hidden');
            cookingPanel.innerHTML = '';
        }
    }
    
    updateNutritionTargets() {
        const targets = {};
        ['calories', 'carbs', 'protein', 'fat'].forEach(nutrient => {
            const input = this.container.querySelector(`#target-${nutrient}-detail`);
            if (input) {
                targets[nutrient] = parseFloat(input.value) || 0;
            }
        });
        
        this.state.nutritionTargets = targets;
        
        if (this.state.selectedMeal) {
            this.renderNutritionTable(this.state.selectedMeal);
        }
        
        // Call callback if provided
        if (this.options.onNutritionUpdate) {
            this.options.onNutritionUpdate(targets);
        }
    }
    
    renderNutritionTable(meal) {
        const container = this.container.querySelector('.nutrition-table-container');
        container.innerHTML = '';
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        const table = document.createElement('table');
        table.className = 'nutrition-table';
        
        // Header
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Protein + Sauce</th>';
        meal.carb_portions.forEach(portion => {
            const carbUnit = this.data.ingredients.carbs[meal.carb].unit;
            headerRow.innerHTML += `<th>${portion}${this.getUnitDisplay(carbUnit, this.data.ingredients.carbs[meal.carb].name, portion)}</th>`;
        });
        table.appendChild(headerRow);
        
        // Rows
        meal.proteins.forEach(proteinType => {
            const proteinWeights = [100, 150, 200, 250, 300];
            proteinWeights.forEach(weight => {
                const row = document.createElement('tr');
                const proteinName = this.data.ingredients.proteins[proteinType].name;
                row.innerHTML = `<td class="protein-label">${proteinName} ${weight}g</td>`;
                
                meal.carb_portions.forEach(carbPortion => {
                    const nutrition = this.calculateMealNutrition(meal.id, proteinType, weight, carbPortion, []);
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
                        this.state.selectedCellData &&
                        this.state.selectedCellData.proteinType === proteinType &&
                        Number(this.state.selectedCellData.proteinWeight) === weight &&
                        Number(this.state.selectedCellData.carbPortion) === Number(carbPortion)
                    ) {
                        cell.classList.add('selected');
                    }
                    
                    cell.addEventListener('click', () => {
                        this.state.selectedCellData = {
                            proteinType,
                            proteinWeight: weight,
                            carbPortion
                        };
                        this.clearHighlights();
                        cell.classList.add('selected');
                        
                        // Show cooking panel
                        const cookingPanel = this.container.querySelector('.cooking-panel');
                        if (cookingPanel) {
                            cookingPanel.classList.remove('hidden');
                            this.openCookingPanel(this.state.selectedCellData, meal, true);
                            
                            // Scroll to cooking panel
                            cookingPanel.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start',
                                inline: 'nearest'
                            });
                        }
                    });
                    
                    row.appendChild(cell);
                });
                table.appendChild(row);
            });
        });
        
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);
        
        // Force table to have minimum width for horizontal scrolling
        const nutritionTable = tableContainer.querySelector('.nutrition-table');
        if (nutritionTable) {
            // Get the viewport width and container width
            const viewportWidth = window.innerWidth;
            const tableWidth = Math.max(2000, viewportWidth + 800); // Much wider to guarantee scrolling
            
            nutritionTable.style.minWidth = tableWidth + 'px';
            nutritionTable.style.width = tableWidth + 'px';
            
            // Force a reflow to ensure the scroll container recognizes the width
            nutritionTable.offsetHeight;
            
            // Also set the container to have a fixed width
            tableContainer.style.width = '100%';
            tableContainer.style.overflowX = 'auto';
        }
        
        this.highlightTargetMatches(meal);
    }
    
    highlightTargetMatches(meal) {
        const targets = this.getTargetInputs();
        if (!this.hasValidTargets(targets)) {
            this.clearHighlights();
            // Don't automatically show cooking panel - let user select
            return;
        }
        
        const cells = this.container.querySelectorAll('.nutrition-cell');
        const scores = [];
        
        cells.forEach((cell, index) => {
            const nutrition = this.calculateMealNutrition(
                cell.dataset.mealId,
                cell.dataset.proteinType,
                parseInt(cell.dataset.proteinWeight),
                parseFloat(cell.dataset.carbPortion),
                []
            );
            const score = this.calculateTargetScore(nutrition, targets);
            scores.push({ cell, score, index, nutrition });
        });
        
        scores.sort((a, b) => a.score - b.score);
        this.clearHighlights();
        
        if (scores.length > 0) {
            scores[0].cell.classList.add('best-match');
            if (!this.state.selectedCellData) {
                this.showCookingPanelForBestMatch(meal, scores[0].cell.dataset);
            }
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
    
    clearHighlights() {
        this.container.querySelectorAll('.nutrition-cell.best-match, .nutrition-cell.close-match, .nutrition-cell.selected').forEach(cell => {
            cell.classList.remove('best-match', 'close-match', 'selected');
        });
    }
    
    showCookingPanelForBestMatch(meal, cellData) {
        if (!cellData) {
            cellData = {
                proteinType: meal.proteins[0],
                proteinWeight: 100,
                carbPortion: meal.carb_portions[0]
            };
        }
        this.openCookingPanel(cellData, meal, false); // Don't scroll automatically
    }
    
    openCookingPanel(cellData, meal, scrollToPanel) {
        const panel = this.container.querySelector('.cooking-panel');
        if (!panel) return;
        
        const macroTargets = this.getTargetInputs();
        const protein = this.data.ingredients.proteins[cellData.proteinType];
        const sauce = this.data.ingredients.sauces[meal.sauce];
        const carb = this.data.ingredients.carbs[meal.carb];
        const proteinWeight = cellData.proteinWeight;
        const carbPortion = cellData.carbPortion;
        const sauceWeight = Math.round(proteinWeight * this.parseSauceRatioFraction(sauce.ratio));
        
        // Get available extras for this meal
        const availableExtras = this.getAvailableExtras(meal.id);
        
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
                        const extraData = this.data.ingredients.extras[extra];
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
            
            <div style='font-size:1.1rem;'>
                <strong>Selected: ${protein.name} ${proteinWeight}g + ${carbPortion}${this.getUnitDisplay(carb.unit, carb.name, carbPortion)}</strong><br>
                <span id='nutrition-display'>Calories: ${Math.round(this.calculateMealNutrition(meal.id, cellData.proteinType, proteinWeight, carbPortion, []).calories)} kcal, Protein: ${this.calculateMealNutrition(meal.id, cellData.proteinType, proteinWeight, carbPortion, []).protein.toFixed(1)}g, Carbs: ${this.calculateMealNutrition(meal.id, cellData.proteinType, proteinWeight, carbPortion, []).carbs.toFixed(1)}g, Fat: ${this.calculateMealNutrition(meal.id, cellData.proteinType, proteinWeight, carbPortion, []).fat.toFixed(1)}g</span>
                <div class='cooking-instructions'>
                    <h4>Cooking Instructions</h4>
                    <ol>${this.generateCookingInstructionsHTML(meal, cellData).replace(/<[^>]+>/g, '').split('.').filter(Boolean).map(s => `<li>${s.trim()}.</li>`).join('')}</ol>
                </div>
                ${this.hasValidTargets(macroTargets) ? "<button class='generate-exact-btn' style='margin-top:1rem;'>Generate Exact</button>" : ""}
            </div>
        `;
        
        if (this.hasValidTargets(macroTargets)) {
            panel.querySelector('.generate-exact-btn').addEventListener('click', () => this.generateExactMacroFit(meal));
        }
        
        // Extras event listeners
        if (availableExtras.length > 0) {
            panel.querySelectorAll('.extra-item').forEach(extraItem => {
                extraItem.addEventListener('click', (e) => {
                    if (e.target.classList.contains('ingredient-info-btn')) {
                        return;
                    }
                    
                    const extraId = extraItem.dataset.extraId;
                    const extraName = extraItem.dataset.extraName;
                    const extraUnit = extraItem.dataset.extraUnit;
                    
                    if (extraItem.classList.contains('inactive')) {
                        this.addExtraToIngredientsList(panel, extraId, extraName, extraUnit, meal, cellData);
                        extraItem.style.display = 'none';
                    } else {
                        this.removeExtraFromIngredientsList(panel, extraId);
                        extraItem.style.display = 'flex';
                    }
                    
                    this.updateNutritionDisplay(meal, cellData, panel);
                });
            });
        }
        
        // Ingredient info modals
        panel.querySelectorAll('.ingredient-info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ingType = btn.dataset.ingtype;
                const ingId = btn.dataset.ingid;
                const ingWeight = btn.dataset.ingweight;
                this.openIngredientModal(ingType, ingId, ingWeight);
            });
        });
        
        panel.style.display = 'block';
        if (scrollToPanel) panel.scrollIntoView({ behavior: 'smooth' });
    }
    
    getAvailableExtras(mealId) {
        if (!this.data.mealExtras || !this.data.mealExtras.meal_extras) {
            return [];
        }
        
        for (const [style, data] of Object.entries(this.data.mealExtras.meal_extras)) {
            if (data.meals.includes(mealId)) {
                return data.extras;
            }
        }
        return [];
    }
    
    getSelectedExtras(panel) {
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
    
    addExtraToIngredientsList(panel, extraId, extraName, extraUnit, meal, cellData) {
        const ingredientList = panel.querySelector('.ingredient-list');
        const extraData = this.data.ingredients.extras[extraId];
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
            const infoBtn = extraItem.querySelector('.ingredient-info-btn');
            infoBtn.dataset.ingweight = newWeight;
            this.updateNutritionDisplay(meal, cellData, panel);
        });
        
        // Add remove button event listener
        const removeBtn = extraItem.querySelector('.remove-extra-btn');
        removeBtn.addEventListener('click', () => {
            this.removeExtraFromIngredientsList(panel, extraId);
            const extraItemInSection = panel.querySelector(`.extra-item[data-extra-id='${extraId}']`);
            if (extraItemInSection) {
                extraItemInSection.style.display = 'flex';
            }
            this.updateNutritionDisplay(meal, cellData, panel);
        });
        
        // Add info button event listener for extras
        const infoBtn = extraItem.querySelector('.ingredient-info-btn');
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ingType = infoBtn.dataset.ingtype;
            const ingId = infoBtn.dataset.ingid;
            const ingWeight = parseFloat(infoBtn.dataset.ingweight) || 0;
            this.openIngredientModal(ingType, ingId, ingWeight);
        });
        
        ingredientList.appendChild(extraItem);
    }
    
    removeExtraFromIngredientsList(panel, extraId) {
        const extraItem = panel.querySelector(`.extra-ingredient[data-extra-id='${extraId}']`);
        if (extraItem) {
            extraItem.remove();
        }
    }
    
    updateNutritionDisplay(meal, cellData, panel) {
        const selectedExtras = this.getSelectedExtras(panel);
        const nutrition = this.calculateMealNutrition(meal.id, cellData.proteinType, cellData.proteinWeight, cellData.carbPortion, selectedExtras);
        const nutritionDisplay = panel.querySelector('#nutrition-display');
        if (nutritionDisplay) {
            nutritionDisplay.textContent = `Calories: ${Math.round(nutrition.calories)} kcal, Protein: ${nutrition.protein.toFixed(1)}g, Carbs: ${nutrition.carbs.toFixed(1)}g, Fat: ${nutrition.fat.toFixed(1)}g`;
        }
    }
    
    generateCookingInstructionsHTML(meal, cellData) {
        const protein = this.data.ingredients.proteins[cellData.proteinType];
        const sauce = this.data.ingredients.sauces[meal.sauce];
        const carb = this.data.ingredients.carbs[meal.carb];
        const proteinWeight = cellData.proteinWeight;
        const carbPortion = cellData.carbPortion;
        const sauceWeight = Math.round(proteinWeight * this.parseSauceRatioFraction(sauce.ratio));
        
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
        return steps.join('. ');
    }
    
    openIngredientModal(type, id, portionWeight) {
        let ing, macros, imgUrl, fallback;
        if (type === 'protein') {
            ing = this.data.ingredients.proteins[id];
            imgUrl = this.getIngredientImageUrl(id, ing.name);
            macros = ing;
            fallback = '🥩';
        } else if (type === 'sauce') {
            ing = this.data.ingredients.sauces[id];
            imgUrl = this.getIngredientImageUrl(id, ing.name);
            macros = ing;
            fallback = '🥫';
        } else if (type === 'carb') {
            ing = this.data.ingredients.carbs[id];
            imgUrl = this.getIngredientImageUrl(id, ing.name);
            macros = ing;
            fallback = '🍚';
        } else if (type === 'extra') {
            ing = this.data.ingredients.extras[id];
            imgUrl = this.getIngredientImageUrl(id, ing.name);
            macros = ing;
            fallback = '🥬';
        } else {
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'ingredient-modal';
        
        const portion = parseFloat(portionWeight) || 100;
        let factor;
        if (ing.unit === 'each') {
            factor = portion;
        } else {
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
    
    getIngredientImageUrl(id, name) {
        // Currently no local ingredient images, return null to use fallback emojis
        return null;
    }
    
    generateExactMacroFit(meal) {
        const targets = this.getTargetInputs();
        console.log('Generating exact macro fit for targets:', targets);
        
        let best = null;
        let bestScore = Infinity;
        let bestCombo = null;
        
        meal.proteins.forEach(proteinType => {
            for (let pw = 50; pw <= 400; pw += 5) {
                const maxCarbs = meal.carb === 'brioche_bun' || meal.carb === 'seeded_bun' ? 10 : 200;
                for (let cw = 1; cw <= maxCarbs; cw += 1) {
                    const nutrition = this.calculateMealNutrition(meal.id, proteinType, pw, cw, []);
                    const score = this.calculateTargetScore(nutrition, targets);
                    
                    if (score < bestScore) {
                        bestScore = score;
                        best = nutrition;
                        bestCombo = { proteinType, proteinWeight: pw, carbPortion: cw };
                    }
                }
            }
        });
        
        const panel = this.container.querySelector('.cooking-panel');
        if (bestCombo) {
            const protein = this.data.ingredients.proteins[bestCombo.proteinType];
            const sauce = this.data.ingredients.sauces[meal.sauce];
            const carb = this.data.ingredients.carbs[meal.carb];
            const proteinWeight = bestCombo.proteinWeight;
            const carbPortion = bestCombo.carbPortion;
            const sauceWeight = Math.round(proteinWeight * this.parseSauceRatioFraction(sauce.ratio));
            
            const availableExtras = this.getAvailableExtras(meal.id);
            
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
                            const extraData = this.data.ingredients.extras[extra];
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
                
                <div style='font-size:1.1rem;'>
                    <strong>Exact Macro Fit: ${protein.name} ${proteinWeight}g + ${carbPortion}${this.getUnitDisplay(carb.unit, carb.name, carbPortion)}</strong><br>
                    <span id='nutrition-display'>Calories: ${Math.round(best.calories)} kcal, Protein: ${best.protein.toFixed(1)}g, Carbs: ${best.carbs.toFixed(1)}g, Fat: ${best.fat.toFixed(1)}g</span>
                    <div class='cooking-instructions'>
                        <h4>Cooking Instructions</h4>
                        <ol>${this.generateCookingInstructionsHTML(meal, bestCombo).replace(/<[^>]+>/g, '').split('.').filter(Boolean).map(s => `<li>${s.trim()}.</li>`).join('')}</ol>
                    </div>
                </div>
            `;
            
            // Re-add event listeners for the exact macro fit panel
            if (availableExtras.length > 0) {
                panel.querySelectorAll('.extra-item').forEach(extraItem => {
                    extraItem.addEventListener('click', (e) => {
                        if (e.target.classList.contains('ingredient-info-btn')) {
                            return;
                        }
                        
                        const extraId = extraItem.dataset.extraId;
                        const extraName = extraItem.dataset.extraName;
                        const extraUnit = extraItem.dataset.extraUnit;
                        
                        if (extraItem.classList.contains('inactive')) {
                            this.addExtraToIngredientsList(panel, extraId, extraName, extraUnit, meal, bestCombo);
                            extraItem.style.display = 'none';
                        } else {
                            this.removeExtraFromIngredientsList(panel, extraId);
                            extraItem.style.display = 'flex';
                        }
                        
                        this.updateNutritionDisplay(meal, bestCombo, panel);
                    });
                });
            }
            
            panel.querySelectorAll('.ingredient-info-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const ingType = btn.dataset.ingtype;
                    const ingId = btn.dataset.ingid;
                    const ingWeight = btn.dataset.ingweight;
                    this.openIngredientModal(ingType, ingId, ingWeight);
                });
            });
            
            // Show and scroll to cooking panel after generating exact macro fit
            panel.classList.remove('hidden');
            setTimeout(() => {
                panel.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            }, 100);
        } else {
            panel.innerHTML = '<div>No close macro fit found.</div>';
        }
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div class="meal-planner-error">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `;
    }
    
    // Nutrition calculation methods
    calcPerGram(item, grams) {
        const factor = grams / 100;
        return {
            calories: Math.round(item.calories * factor),
            fat: +(item.fat * factor).toFixed(1),
            carbs: +(item.carbs * factor).toFixed(1),
            protein: +(item.protein * factor).toFixed(1)
        };
    }
    
    calcPerPortion(item, portion, carbKey) {
        const steps = this.data.portionSteps[carbKey];
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
    
    parseSauceRatio(ratio) {
        const ratioMap = { '1:1': 1.0, '1:2': 0.5, '1:4': 0.25 };
        return ratioMap[ratio] || 1.0;
    }
    
    parseSauceRatioFraction(ratio) {
        if (!ratio) return 1.0;
        const parts = ratio.split(':').map(Number);
        if (parts.length === 2 && parts[1] > 0) {
            return parts[0] / parts[1];
        }
        return 1.0;
    }
    
    getUnitDisplay(unit, carbName = '', portion = 1) {
        if (!unit) return '';
        if (unit.includes('dry')) return 'g';
        if (unit === 'each') {
            if (carbName) {
                let name = carbName.toLowerCase();
                if (portion > 1 && !name.endsWith('s')) name += 's';
                return ' ' + name;
            }
            return '';
        }
        return unit.replace(/^[0-9]+/, '').trim();
    }
    
    calculateMealNutrition(mealId, proteinType, proteinWeight, carbPortion, extras = []) {
        const meal = this.data.meals.find(m => m.id === mealId) || this.data.meals[mealId];
        const protein = this.data.ingredients.proteins[proteinType];
        const sauce = this.data.ingredients.sauces[meal.sauce];
        const carb = this.data.ingredients.carbs[meal.carb];
        
        // Protein nutrition
        const proteinNutrition = {
            calories: (protein.calories * proteinWeight) / 100,
            fat: (protein.fat * proteinWeight) / 100,
            carbs: (protein.carbs * proteinWeight) / 100,
            protein: (protein.protein * proteinWeight) / 100
        };
        
        // Sauce nutrition
        const sauceRatio = this.parseSauceRatioFraction(sauce.ratio);
        const sauceWeight = proteinWeight * sauceRatio;
        const sauceNutrition = {
            calories: (sauce.calories * sauceWeight) / 100,
            fat: (sauce.fat * sauceWeight) / 100,
            carbs: (sauce.carbs * sauceWeight) / 100,
            protein: (sauce.protein * sauceWeight) / 100
        };
        
        // Carb nutrition
        let carbNutrition;
        if (carb.unit === 'each') {
            carbNutrition = {
                calories: carb.calories * carbPortion,
                fat: carb.fat * carbPortion,
                carbs: carb.carbs * carbPortion,
                protein: carb.protein * carbPortion
            };
        } else {
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
            const ingredient = this.data.ingredients.extras[extra.id];
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
    
    calculateTargetScore(nutrition, targets) {
        let score = 0;
        if (targets.calories !== null) score += Math.abs(nutrition.calories - targets.calories) * 0.5;
        if (targets.protein !== null) score += Math.abs(nutrition.protein - targets.protein) * 8;
        if (targets.carbs !== null) score += Math.abs(nutrition.carbs - targets.carbs) * 2;
        if (targets.fat !== null) score += Math.abs(nutrition.fat - targets.fat) * 1;
        return score;
    }
    
    getTargetInputs() {
        const getVal = id => {
            const v = this.container.querySelector(`#${id}`)?.value;
            return v === '' ? null : Number(v);
        };
        return {
            calories: getVal('target-calories-detail'),
            carbs: getVal('target-carbs-detail'),
            protein: getVal('target-protein-detail'),
            fat: getVal('target-fat-detail')
        };
    }
    
    hasValidTargets(targets) {
        return targets && (targets.calories !== null || targets.carbs !== null || targets.protein !== null || targets.fat !== null);
    }
    
    // Public API methods
    getSelectedMeal() {
        return this.state.selectedMeal;
    }
    
    getNutritionTargets() {
        return { ...this.state.nutritionTargets };
    }
    
    setNutritionTargets(targets) {
        this.state.nutritionTargets = { ...targets };
        this.updateNutritionTargets();
    }
    
    destroy() {
        // Cleanup method for when component is removed
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MealPlanner;
} else if (typeof window !== 'undefined') {
    window.MealPlanner = MealPlanner;
} 