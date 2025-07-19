/**
 * Meals Manager Component
 * A modular component for managing meals with CRUD operations
 */
class MealsManager {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            dataPath: 'data/',
            imagesPath: 'images/',
            theme: 'default',
            onMealUpdate: () => {},
            onMealDelete: () => {},
            onMealAdd: () => {},
            ...options
        };
        
        this.meals = [];
        this.ingredients = [];
        this.filteredMeals = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.editingMeal = null;
        this.isAddingNew = false;
        this.viewingMeal = null;
        this.eventListenersAttached = false;
        this._eventListeners = [];
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.filterMeals(); // Apply initial filtering
        this.render();
        this.attachEventListeners();
    }
    
    async loadData() {
        try {
            // Load meals
            const mealsResponse = await fetch(`${this.options.dataPath}meals.json`);
            if (!mealsResponse.ok) throw new Error('Failed to load meals');
            const mealsData = await mealsResponse.json();
            this.meals = mealsData.meals || [];
            
            // Load ingredients for reference
            const ingredientsResponse = await fetch(`${this.options.dataPath}ingredients.json`);
            if (ingredientsResponse.ok) {
                const ingredientsData = await ingredientsResponse.json();
                
                // Convert ingredients to flat array for easier lookup
                this.ingredients = [];
                
                // Process proteins
                Object.keys(ingredientsData.proteins).forEach(id => {
                    const ingredient = ingredientsData.proteins[id];
                    this.ingredients.push({
                        id: id,
                        name: ingredient.name,
                        category: 'proteins',
                        protein: ingredient.protein,
                        carbs: ingredient.carbs,
                        fat: ingredient.fat,
                        calories: ingredient.calories,
                        unit: ingredient.unit
                    });
                });
                
                // Process sauces
                Object.keys(ingredientsData.sauces).forEach(id => {
                    const ingredient = ingredientsData.sauces[id];
                    this.ingredients.push({
                        id: id,
                        name: ingredient.name,
                        category: 'sauces',
                        protein: ingredient.protein,
                        carbs: ingredient.carbs,
                        fat: ingredient.fat,
                        calories: ingredient.calories,
                        unit: ingredient.unit
                    });
                });
                
                // Process carbs
                Object.keys(ingredientsData.carbs).forEach(id => {
                    const ingredient = ingredientsData.carbs[id];
                    this.ingredients.push({
                        id: id,
                        name: ingredient.name,
                        category: 'carbs',
                        protein: ingredient.protein,
                        carbs: ingredient.carbs,
                        fat: ingredient.fat,
                        calories: ingredient.calories,
                        unit: ingredient.unit
                    });
                });
                
                // Process extras
                Object.keys(ingredientsData.extras).forEach(id => {
                    const ingredient = ingredientsData.extras[id];
                    this.ingredients.push({
                        id: id,
                        name: ingredient.name,
                        category: 'extras',
                        protein: ingredient.protein,
                        carbs: ingredient.carbs,
                        fat: ingredient.fat,
                        calories: ingredient.calories,
                        unit: ingredient.unit
                    });
                });
            }
            
            this.filteredMeals = [...this.meals];
        } catch (error) {
            console.error('Error loading data:', error);
            this.meals = [];
            this.ingredients = [];
            this.filteredMeals = [];
        }
    }
    
    async saveMeals() {
        try {
            // In a real app, this would be an API call
            console.log('Saving meals:', this.meals);
            this.options.onMealUpdate(this.meals);
        } catch (error) {
            console.error('Error saving meals:', error);
        }
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="meals-manager-component" data-theme="${this.options.theme}">
                <div class="meals-header">
                    <h1>Meals Manager</h1>
                    ${!this.viewingMeal && !this.isAddingNew && !this.editingMeal ? `
                    <button class="btn btn-primary" id="add-meal-btn">
                        <span>+</span> Add New Meal
                    </button>
                    ` : ''}
                </div>
                
                ${!this.viewingMeal && !this.isAddingNew && !this.editingMeal ? `
                <div class="meals-controls">
                    <div class="search-bar">
                        <input type="text" id="meal-search" class="input" placeholder="Search meals..." value="${this.searchTerm}">
                    </div>
                    <div class="filter-group">
                        <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                        <button class="filter-btn ${this.currentFilter === 'beef' ? 'active' : ''}" data-filter="beef">Beef</button>
                        <button class="filter-btn ${this.currentFilter === 'chicken' ? 'active' : ''}" data-filter="chicken">Chicken</button>
                    </div>
                </div>
                ` : ''}
                
                <div class="meals-content">
                    ${this.isAddingNew ? this.renderAddForm() : 
                      this.editingMeal ? this.renderEditForm(this.editingMeal) :
                      this.viewingMeal ? this.renderMealDetail(this.viewingMeal) : 
                      this.renderMealsList()}
                </div>
            </div>
        `;
    }
    
    renderMealsList() {
        if (this.filteredMeals.length === 0) {
            return `
                <div class="empty-state">
                    <h3>No meals found</h3>
                    <p>${this.searchTerm ? 'Try adjusting your search terms.' : 'Add your first meal to get started!'}</p>
                </div>
            `;
        }
        
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Proteins</th>
                            <th>Sauce</th>
                            <th>Carb</th>
                            <th>Extras</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredMeals.map(meal => `
                            <tr class="meal-row clickable" data-id="${meal.id}">
                                <td>
                                    <div class="meal-name-cell">
                                        <span class="meal-name">${meal.name}</span>
                                        ${meal.cooking_base ? `<small class="meal-description">${meal.cooking_base.substring(0, 50)}...</small>` : ''}
                                    </div>
                                </td>
                                <td><span class="badge badge-primary">${meal.category || 'other'}</span></td>
                                <td>
                                    <div class="ingredients-list">
                                        ${meal.proteins ? meal.proteins.map(proteinId => {
                                            const protein = this.ingredients.find(i => i.id === proteinId);
                                            return protein ? `<span class="ingredient-tag">${protein.name}</span>` : '';
                                        }).join('') : '<span class="no-ingredients">None</span>'}
                                    </div>
                                </td>
                                <td>
                                    ${meal.sauce ? (() => {
                                        const sauce = this.ingredients.find(i => i.id === meal.sauce);
                                        return sauce ? `<span class="ingredient-tag">${sauce.name}</span>` : '';
                                    })() : '<span class="no-ingredients">None</span>'}
                                </td>
                                <td>
                                    ${meal.carb ? (() => {
                                        const carb = this.ingredients.find(i => i.id === meal.carb);
                                        return carb ? `<span class="ingredient-tag">${carb.name}</span>` : '';
                                    })() : '<span class="no-ingredients">None</span>'}
                                </td>
                                <td>
                                    <div class="ingredients-list">
                                        ${meal.appropriate_extras && meal.appropriate_extras.length > 0 ? 
                                          meal.appropriate_extras.slice(0, 2).map(extraId => {
                                              const extra = this.ingredients.find(i => i.id === extraId);
                                              return extra ? `<span class="ingredient-tag">${extra.name}</span>` : '';
                                          }).join('') + (meal.appropriate_extras.length > 2 ? `<span class="more-ingredients">+${meal.appropriate_extras.length - 2}</span>` : '') : 
                                          '<span class="no-ingredients">None</span>'}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    renderMealDetail(meal) {
        const imageUrl = this.getMealImageUrl(meal);
        const category = meal.category || 'other';
        
        return `
            <div class="meal-detail-page">
                <div class="detail-header">
                    <button class="btn btn-secondary" id="back-to-list">
                        <span>←</span> Back to Meals
                    </button>
                    <div class="detail-actions">
                        <button class="btn btn-primary edit-meal-btn" data-id="${meal.id}">Edit</button>
                        <button class="btn btn-danger delete-meal-btn" data-id="${meal.id}">Delete</button>
                    </div>
                </div>
                
                <div class="detail-content">
                    <div class="detail-section">
                        <div class="meal-header-detail">
                            ${imageUrl ? `<img src="${imageUrl}" alt="${meal.name}" class="meal-detail-image" onerror="this.style.display='none'">` : ''}
                            <div class="meal-info-detail">
                                <h2>${meal.name}</h2>
                                <span class="badge badge-primary">${category}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Ingredients</h3>
                        <div class="ingredients-detail-grid">
                            <div class="ingredient-category">
                                <h4>Proteins</h4>
                                <div class="ingredients-list">
                                    ${meal.proteins ? meal.proteins.map(proteinId => {
                                        const protein = this.ingredients.find(i => i.id === proteinId);
                                        return protein ? `<span class="ingredient-tag">${protein.name}</span>` : '';
                                    }).join('') : '<span class="no-ingredients">None</span>'}
                                </div>
                            </div>
                            
                            <div class="ingredient-category">
                                <h4>Sauce</h4>
                                <div class="ingredients-list">
                                    ${meal.sauce ? (() => {
                                        const sauce = this.ingredients.find(i => i.id === meal.sauce);
                                        return sauce ? `<span class="ingredient-tag">${sauce.name}</span>` : '';
                                    })() : '<span class="no-ingredients">None</span>'}
                                </div>
                            </div>
                            
                            <div class="ingredient-category">
                                <h4>Carb</h4>
                                <div class="ingredients-list">
                                    ${meal.carb ? (() => {
                                        const carb = this.ingredients.find(i => i.id === meal.carb);
                                        return carb ? `<span class="ingredient-tag">${carb.name}</span>` : '';
                                    })() : '<span class="no-ingredients">None</span>'}
                                </div>
                            </div>
                            
                            ${meal.appropriate_extras && meal.appropriate_extras.length > 0 ? `
                                <div class="ingredient-category">
                                    <h4>Extras</h4>
                                    <div class="ingredients-list">
                                        ${meal.appropriate_extras.map(extraId => {
                                            const extra = this.ingredients.find(i => i.id === extraId);
                                            return extra ? `<span class="ingredient-tag">${extra.name}</span>` : '';
                                        }).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${meal.cooking_base ? `
                        <div class="detail-section">
                            <h3>Cooking Instructions</h3>
                            <div class="cooking-instructions-detail">
                                <p>${this.processCookingInstructions(meal.cooking_base, meal, meal.proteins[0], 150, meal.carb_portions[1])}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderAddForm() {
        return `
            <div class="meal-detail-page">
                <div class="detail-header">
                    <button class="btn btn-secondary" id="cancel-add">
                        <span>←</span> Back to List
                    </button>
                </div>
                
                <div class="detail-content">
                    <h2>Add New Meal</h2>
                    
                    <form id="add-meal-form">
                        <div class="form-group">
                            <label for="meal-name">Meal Name *</label>
                            <input type="text" id="meal-name" name="name" required class="input">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="meal-category">Category</label>
                                <div class="select-wrapper">
                                    <select id="meal-category" name="category" class="input">
                                        <option value="beef">Beef</option>
                                        <option value="chicken">Chicken</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="meal-image">Image</label>
                                <input type="text" id="meal-image" name="image" placeholder="Image name (without extension)" class="input">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Proteins *</label>
                            <div id="proteins-list" class="ingredients-form-list">
                                <div class="ingredient-form-item">
                                    <div class="select-wrapper">
                                        <select name="proteins[0]" required class="input">
                                            <option value="">Select protein...</option>
                                            ${this.getProteinsByCategory('other').map(ing => `
                                                <option value="${ing.id}">${ing.name}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <button type="button" class="btn btn-danger btn-sm remove-ingredient-btn" onclick="this.parentElement.remove()">Remove</button>
                                </div>
                            </div>
                            <button type="button" class="btn btn-secondary btn-sm add-ingredient-btn" data-action="add-protein" data-target="proteins-list">+ Add Protein</button>
                        </div>
                        
                        <div class="form-group">
                            <label>Sauce</label>
                            <div class="select-wrapper">
                                <select name="sauce" class="input">
                                    <option value="">No sauce</option>
                                    ${this.ingredients.filter(i => i.category === 'sauces').map(ing => `
                                        <option value="${ing.id}">${ing.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Carb *</label>
                            <div class="select-wrapper">
                                <select name="carb" required class="input">
                                    <option value="">Select carb...</option>
                                    ${this.ingredients.filter(i => i.category === 'carbs').map(ing => `
                                        <option value="${ing.id}">${ing.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Extras</label>
                            <div id="extras-list" class="ingredients-form-list">
                                <!-- Extras will be added here -->
                            </div>
                            <button type="button" class="btn btn-secondary btn-sm add-ingredient-btn" data-action="add-extra" data-target="extras-list">+ Add Extra</button>
                        </div>
                        
                        <div class="form-group">
                            <label for="cooking-base">Cooking Instructions</label>
                            <textarea id="cooking-base" name="cooking_base" rows="4" placeholder="Write instructions using keywords like [MEAT], [SAUCE], [CARB]. Example: Cook the [MEAT] in a pan, add [SAUCE] and simmer..." class="input"></textarea>
                            <small class="form-help">Available keywords: [MEAT], [PROTEIN], [SAUCE], [MARINADE], [CARB], [RICE], [PASTA], [BREAD], [CHICKEN], [BEEF]</small>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-add">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Meal</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    renderEditForm(meal) {
        return `
            <div class="meal-detail-page">
                <div class="detail-header">
                    <button class="btn btn-secondary" id="cancel-edit">
                        <span>←</span> Back to Detail
                    </button>
                </div>
                
                <div class="detail-content">
                    <h2>Edit Meal</h2>
                    
                    <form class="edit-meal-form" data-id="${meal.id}">
                        <div class="form-group">
                            <label for="edit-name-${meal.id}">Meal Name *</label>
                            <input type="text" id="edit-name-${meal.id}" name="name" value="${meal.name}" required class="input">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-category-${meal.id}">Category</label>
                                <div class="select-wrapper">
                                    <select id="edit-category-${meal.id}" name="category" class="input">
                                        <option value="beef" ${meal.category === 'beef' ? 'selected' : ''}>Beef</option>
                                        <option value="chicken" ${meal.category === 'chicken' ? 'selected' : ''}>Chicken</option>
                                        <option value="other" ${meal.category === 'other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="edit-image-${meal.id}">Image</label>
                                <input type="text" id="edit-image-${meal.id}" name="image" value="${meal.image || ''}" class="input" placeholder="Image name (without extension)">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Proteins *</label>
                            <div id="edit-proteins-list-${meal.id}" class="ingredients-form-list">
                                ${meal.proteins ? meal.proteins.map((proteinId, index) => {
                                    const protein = this.ingredients.find(i => i.id === proteinId);
                                    return `
                                        <div class="ingredient-form-item">
                                            <div class="select-wrapper">
                                                <select name="proteins[${index}]" required class="input">
                                                    <option value="">Select protein...</option>
                                                    ${this.getProteinsByCategory(meal.category).map(ing => `
                                                        <option value="${ing.id}" ${ing.id === proteinId ? 'selected' : ''}>${ing.name}</option>
                                                    `).join('')}
                                                </select>
                                            </div>
                                            <button type="button" class="btn btn-danger btn-sm remove-ingredient-btn" onclick="this.parentElement.remove()">Remove</button>
                                        </div>
                                    `;
                                }).join('') : `
                                    <div class="ingredient-form-item">
                                        <div class="select-wrapper">
                                            <select name="proteins[0]" required class="input">
                                                <option value="">Select protein...</option>
                                                ${this.getProteinsByCategory(meal.category).map(ing => `
                                                    <option value="${ing.id}">${ing.name}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <button type="button" class="btn btn-danger btn-sm remove-ingredient-btn" onclick="this.parentElement.remove()">Remove</button>
                                    </div>
                                `}
                            </div>
                            <button type="button" class="btn btn-secondary btn-sm add-ingredient-btn" data-action="add-protein" data-target="edit-proteins-list-${meal.id}">+ Add Protein</button>
                        </div>
                        
                        <div class="form-group">
                            <label>Sauce</label>
                            <div class="select-wrapper">
                                <select name="sauce" class="input">
                                    <option value="">No sauce</option>
                                    ${this.ingredients.filter(i => i.category === 'sauces').map(ing => `
                                        <option value="${ing.id}" ${ing.id === meal.sauce ? 'selected' : ''}>${ing.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Carb *</label>
                            <div class="select-wrapper">
                                <select name="carb" required class="input">
                                    <option value="">Select carb...</option>
                                    ${this.ingredients.filter(i => i.category === 'carbs').map(ing => `
                                        <option value="${ing.id}" ${ing.id === meal.carb ? 'selected' : ''}>${ing.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Extras</label>
                            <div id="edit-extras-list-${meal.id}" class="ingredients-form-list">
                                ${meal.appropriate_extras ? meal.appropriate_extras.map((extraId, index) => {
                                    const extra = this.ingredients.find(i => i.id === extraId);
                                    return `
                                        <div class="ingredient-form-item">
                                            <div class="select-wrapper">
                                                <select name="extras[${index}]" class="input">
                                                    <option value="">Select extra...</option>
                                                    ${this.ingredients.filter(i => i.category === 'extras').map(ing => `
                                                        <option value="${ing.id}" ${ing.id === extraId ? 'selected' : ''}>${ing.name}</option>
                                                    `).join('')}
                                                </select>
                                            </div>
                                            <button type="button" class="btn btn-danger btn-sm remove-ingredient-btn" onclick="this.parentElement.remove()">Remove</button>
                                        </div>
                                    `;
                                }).join('') : ''}
                            </div>
                            <button type="button" class="btn btn-secondary btn-sm add-ingredient-btn" data-action="add-extra" data-target="edit-extras-list-${meal.id}">+ Add Extra</button>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-cooking-base-${meal.id}">Cooking Instructions</label>
                            <textarea id="edit-cooking-base-${meal.id}" name="cooking_base" rows="4" class="input" placeholder="Write instructions using keywords like [MEAT], [SAUCE], [CARB]. Example: Cook the [MEAT] in a pan, add [SAUCE] and simmer...">${meal.cooking_base || ''}</textarea>
                            <small class="form-help">Available keywords: [MEAT], [PROTEIN], [SAUCE], [MARINADE], [CARB], [RICE], [PASTA], [BREAD], [CHICKEN], [BEEF]</small>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-edit">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Prevent duplicate event listeners
        if (this.eventListenersAttached) {
            return;
        }
        this.eventListenersAttached = true;
        
        // Remove any existing event listeners to prevent duplicates
        this.removeEventListeners();
        
        // Search functionality
        const searchInput = document.getElementById('meal-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.applyFiltersAndRender();
            });
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.currentFilter = filter;
                
                // Update active filter button
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === filter);
                });
                
                this.applyFiltersAndRender();
            });
        });
        
        // Add meal button - use event delegation since it's dynamically created
        const addMealHandler = (e) => {
            if (e.target.id === 'add-meal-btn') {
                this.isAddingNew = true;
                this.render();
                this.attachEventListeners();
            }
        };
        
        document.addEventListener('click', addMealHandler);
        this._eventListeners.push({element: document, type: 'click', handler: addMealHandler});
        
        // Cancel add button - use event delegation since it's dynamically created
        const cancelAddHandler = (e) => {
            if (e.target.id === 'cancel-add') {
                this.isAddingNew = false;
                this.filterMeals(); // Re-apply filters when returning to list
                this.render();
                this.attachEventListeners();
            }
        };
        
        document.addEventListener('click', cancelAddHandler);
        this._eventListeners.push({element: document, type: 'click', handler: cancelAddHandler});
        
        // Add meal form
        const addForm = document.getElementById('add-meal-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddMeal(e.target);
            });
        }
        
        // Add ingredient buttons - use event delegation
        const addIngredientHandler = (e) => {
            if (e.target.classList.contains('add-ingredient-btn')) {
                const action = e.target.dataset.action;
                const target = e.target.dataset.target;
                
                if (action === 'add-protein' && target) {
                    // Get current category for filtering
                    const form = e.target.closest('form');
                    const categorySelect = form ? form.querySelector('select[name="category"]') : null;
                    const category = categorySelect ? categorySelect.value : 'other';
                    this.addProteinRow(target, category);
                } else if (action === 'add-extra' && target) {
                    console.log('Adding extra row to:', target);
                    console.log('this.addExtraRow exists:', typeof this.addExtraRow);
                    this.addExtraRow(target);
                }
            }
        };
        
        const categoryChangeHandler = (e) => {
            if (e.target.name === 'category') {
                const form = e.target.closest('form');
                const proteinsContainer = form ? form.querySelector('.ingredients-form-list') : null;
                
                if (proteinsContainer) {
                    const category = e.target.value;
                    this.updateProteinOptions(proteinsContainer, category);
                }
            }
        };
        
        document.addEventListener('click', addIngredientHandler);
        document.addEventListener('change', categoryChangeHandler);
        
        // Store references for removal
        this._eventListeners.push(
            {element: document, type: 'click', handler: addIngredientHandler},
            {element: document, type: 'change', handler: categoryChangeHandler}
        );
        
        // Clickable table rows
        const tableRowHandler = (e) => {
            const row = e.target.closest('.meal-row.clickable');
            if (row) {
                const id = row.dataset.id;
                const meal = this.meals.find(m => m.id === id);
                if (meal) {
                    this.viewingMeal = meal;
                    this.render();
                    this.attachEventListeners();
                }
            }
            
            if (e.target.classList.contains('edit-meal-btn')) {
                console.log('Edit meal button clicked!');
                const id = e.target.dataset.id;
                console.log('Meal ID:', id);
                const meal = this.meals.find(m => m.id === id);
                console.log('Found meal:', meal);
                if (meal) {
                    this.editingMeal = meal;
                    console.log('Setting editingMeal to:', meal);
                    this.render();
                    this.attachEventListeners();
                }
            }
            
            if (e.target.classList.contains('delete-meal-btn')) {
                console.log('Delete meal button clicked!');
                const id = e.target.dataset.id;
                console.log('Meal ID:', id);
                const meal = this.meals.find(m => m.id === id);
                console.log('Found meal:', meal);
                if (meal) {
                    const confirmed = confirm(`Are you sure you want to delete "${meal.name}"?`);
                    if (confirmed) {
                        console.log('Delete confirmed, calling handleDeleteMeal');
                        this.handleDeleteMeal(id);
                    } else {
                        console.log('Delete cancelled');
                    }
                }
            }
        };
        
        document.addEventListener('click', tableRowHandler);
        this._eventListeners.push({element: document, type: 'click', handler: tableRowHandler});
        
        // Back to list button - use event delegation since it's dynamically created
        const backToListHandler = (e) => {
            if (e.target.id === 'back-to-list') {
                this.viewingMeal = null;
                this.filterMeals(); // Re-apply filters when returning to list
                this.render();
                this.attachEventListeners();
            }
        };
        
        document.addEventListener('click', backToListHandler);
        this._eventListeners.push({element: document, type: 'click', handler: backToListHandler});
        
        // Edit forms
        document.querySelectorAll('.edit-meal-form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditMeal(e.target);
            });
        });
        
        // Cancel edit button - use event delegation since it's dynamically created
        const cancelEditHandler = (e) => {
            if (e.target.id === 'cancel-edit') {
                this.editingMeal = null;
                // Stay on the detail view of the current meal
                this.render();
                this.attachEventListeners();
            }
        };
        
        document.addEventListener('click', cancelEditHandler);
        this._eventListeners.push({element: document, type: 'click', handler: cancelEditHandler});
    }
    
    addIngredientRow(containerId) {
        const container = document.getElementById(containerId);
        const index = container.children.length;
        
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-form-item';
        newRow.innerHTML = `
            <select class="ingredient-select" name="ingredients[${index}][id]" required>
                <option value="">Select ingredient...</option>
                ${this.ingredients.map(ing => `
                    <option value="${ing.id}">${ing.name}</option>
                `).join('')}
            </select>
            <input type="number" class="ingredient-amount" name="ingredients[${index}][amount]" placeholder="Amount (g)" min="1" required>
            <button type="button" class="remove-ingredient-btn" onclick="this.parentElement.remove()">Remove</button>
        `;
        
        container.appendChild(newRow);
    }
    
    addProteinRow(containerId, category = 'other') {
        const container = document.getElementById(containerId);
        const index = container.children.length;
        
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-form-item';
        newRow.innerHTML = `
            <div class="select-wrapper">
                <select name="proteins[${index}]" required class="input">
                    <option value="">Select protein...</option>
                    ${this.getProteinsByCategory(category).map(ing => `
                        <option value="${ing.id}">${ing.name}</option>
                    `).join('')}
                </select>
            </div>
            <button type="button" class="btn btn-danger btn-sm remove-ingredient-btn" onclick="this.parentElement.remove()">Remove</button>
        `;
        
        container.appendChild(newRow);
    }
    
    addExtraRow(containerId) {
        const container = document.getElementById(containerId);
        const index = container.children.length;
        
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-form-item';
        newRow.innerHTML = `
            <div class="select-wrapper">
                <select name="extras[${index}]" class="input">
                    <option value="">Select extra...</option>
                    ${this.ingredients.filter(i => i.category === 'extras').map(ing => `
                        <option value="${ing.id}">${ing.name}</option>
                    `).join('')}
                </select>
            </div>
            <button type="button" class="btn btn-danger btn-sm remove-ingredient-btn" onclick="this.parentElement.remove()">Remove</button>
        `;
        
        container.appendChild(newRow);
    }
    
    filterMeals() {
        let filtered = [...this.meals];
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(meal => meal.category === this.currentFilter);
        }
        
        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(meal => 
                meal.name.toLowerCase().includes(searchLower) ||
                (meal.cooking_base && meal.cooking_base.toLowerCase().includes(searchLower))
            );
        }
        
        this.filteredMeals = filtered;
    }
    
    applyFiltersAndRender() {
        this.filterMeals();
        
        // Only update the table content if we're currently viewing the list
        if (!this.viewingMeal && !this.isAddingNew && !this.editingMeal) {
            this.updateTableContent();
        }
    }
    
    updateTableContent() {
        const contentContainer = document.querySelector('.meals-content');
        if (contentContainer) {
            contentContainer.innerHTML = this.renderMealsList();
        }
    }
    
    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    }
    
    handleAddMeal(form) {
        const formData = new FormData(form);
        
        // Parse proteins
        const proteins = [];
        let proteinIndex = 0;
        while (formData.has(`proteins[${proteinIndex}]`)) {
            const proteinId = formData.get(`proteins[${proteinIndex}]`);
            if (proteinId) {
                proteins.push(proteinId);
            }
            proteinIndex++;
        }
        
        // Parse extras
        const extras = [];
        let extraIndex = 0;
        while (formData.has(`extras[${extraIndex}]`)) {
            const extraId = formData.get(`extras[${extraIndex}]`);
            if (extraId) {
                extras.push(extraId);
            }
            extraIndex++;
        }
        
        const newMeal = {
            id: this.generateId(),
            name: formData.get('name'),
            category: formData.get('category') || 'other',
            image: formData.get('image') || '',
            proteins: proteins,
            sauce: formData.get('sauce') || null,
            carb: formData.get('carb'),
            appropriate_extras: extras,
            cooking_base: formData.get('cooking_base') || ''
        };
        
        this.meals.push(newMeal);
        this.saveMeals();
        this.options.onMealAdd(newMeal);
        
        this.isAddingNew = false;
        this.filterMeals(); // Re-apply filters
        this.render();
        this.attachEventListeners();
    }
    
    handleEditMeal(form) {
        const id = form.dataset.id;
        const formData = new FormData(form);
        
        // Parse proteins
        const proteins = [];
        let proteinIndex = 0;
        while (formData.has(`proteins[${proteinIndex}]`)) {
            const proteinId = formData.get(`proteins[${proteinIndex}]`);
            if (proteinId) {
                proteins.push(proteinId);
            }
            proteinIndex++;
        }
        
        // Parse extras
        const extras = [];
        let extraIndex = 0;
        while (formData.has(`extras[${extraIndex}]`)) {
            const extraId = formData.get(`extras[${extraIndex}]`);
            if (extraId) {
                extras.push(extraId);
            }
            extraIndex++;
        }
        
        const updatedMeal = {
            id: id,
            name: formData.get('name'),
            category: formData.get('category') || 'other',
            image: formData.get('image') || '',
            proteins: proteins,
            sauce: formData.get('sauce') || null,
            carb: formData.get('carb'),
            appropriate_extras: extras,
            cooking_base: formData.get('cooking_base') || ''
        };
        
        const index = this.meals.findIndex(m => m.id === id);
        if (index !== -1) {
            this.meals[index] = updatedMeal;
            this.saveMeals();
            this.options.onMealUpdate(updatedMeal);
        }
        
        this.editingMeal = null;
        this.viewingMeal = updatedMeal; // Show the updated meal
        this.filterMeals(); // Re-apply filters
        this.render();
        this.attachEventListeners();
    }
    
    parseIngredientsFromForm(formData) {
        const ingredients = [];
        let index = 0;
        
        while (formData.has(`ingredients[${index}][id]`)) {
            const id = formData.get(`ingredients[${index}][id]`);
            const amount = parseFloat(formData.get(`ingredients[${index}][amount]`));
            
            if (id && amount) {
                const ingredient = this.ingredients.find(ing => ing.id === id);
                if (ingredient) {
                    ingredients.push({
                        id: id,
                        name: ingredient.name,
                        amount: amount
                    });
                }
            }
            index++;
        }
        
        return ingredients;
    }
    
    handleDeleteMeal(id) {
        this.meals = this.meals.filter(m => m.id !== id);
        this.saveMeals();
        this.options.onMealDelete(id);
        
        // Return to list view after deletion
        this.viewingMeal = null;
        this.editingMeal = null;
        this.filterMeals(); // Re-apply filters
        this.render();
        this.attachEventListeners();
    }
    
    getMealImageUrl(meal) {
        if (meal.image) {
            // Check if it's a full URL
            if (meal.image.startsWith('http')) {
                return meal.image;
            }
            // Check if it's a local image
            return `${this.options.imagesPath}${meal.image}.svg`;
        }
        
        return null;
    }
    
    calculateMealCalories(meal) {
        return meal.ingredients.reduce((total, ing) => {
            const ingredient = this.ingredients.find(i => i.id === ing.id);
            if (ingredient) {
                const ratio = ing.amount / 100; // Assuming nutrition is per 100g
                return total + (ingredient.calories * ratio);
            }
            return total;
        }, 0);
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
        this.removeEventListeners();
        this.eventListenersAttached = false;
    }
    
    removeEventListeners() {
        // Store references to event listeners so we can remove them later
        if (this._eventListeners) {
            this._eventListeners.forEach(({element, type, handler}) => {
                element.removeEventListener(type, handler);
            });
        }
        this._eventListeners = [];
    }
    
    // Helper method to filter proteins by meal category
    getProteinsByCategory(category) {
        return this.ingredients.filter(ing => {
            if (ing.category !== 'proteins') return false;
            
            if (category === 'beef') {
                return ing.name.toLowerCase().includes('beef');
            } else if (category === 'chicken') {
                return ing.name.toLowerCase().includes('chicken');
            } else {
                return true; // Show all proteins for 'other' category
            }
        });
    }
    
    // Process natural language cooking instructions
    processCookingInstructions(instructions, meal, proteinId, proteinWeight, carbPortion) {
        if (!instructions) return '';
        
        // Get ingredient data
        const protein = this.ingredients.find(i => i.id === proteinId);
        const sauce = this.ingredients.find(i => i.id === meal.sauce);
        const carb = this.ingredients.find(i => i.id === meal.carb);
        
        if (!protein || !sauce || !carb) return instructions;
        
        // Calculate sauce weight based on protein weight
        const sauceRatio = this.parseSauceRatio(sauce.ratio || '1:1');
        const sauceWeight = Math.round(proteinWeight * sauceRatio);
        
        // Create replacement map
        const replacements = {
            '[MEAT]': `${proteinWeight}g ${protein.name.toLowerCase()}`,
            '[PROTEIN]': `${proteinWeight}g ${protein.name.toLowerCase()}`,
            '[SAUCE]': `${sauceWeight}g ${sauce.name.toLowerCase()}`,
            '[MARINADE]': `${sauceWeight}g ${sauce.name.toLowerCase()}`,
            '[CARB]': `${carbPortion}${this.getUnitDisplay(carb.unit, carb.name, carbPortion)}`,
            '[RICE]': carb.name.toLowerCase().includes('rice') ? `${carbPortion}${this.getUnitDisplay(carb.unit, carb.name, carbPortion)}` : `${carbPortion}${this.getUnitDisplay(carb.unit, carb.name, carbPortion)}`,
            '[PASTA]': carb.name.toLowerCase().includes('pasta') ? `${carbPortion}${this.getUnitDisplay(carb.unit, carb.name, carbPortion)}` : `${carbPortion}${this.getUnitDisplay(carb.unit, carb.name, carbPortion)}`,
            '[BREAD]': carb.name.toLowerCase().includes('bun') || carb.name.toLowerCase().includes('bread') ? `${carbPortion}${this.getUnitDisplay(carb.unit, carb.name, carbPortion)}` : `${carbPortion}${this.getUnitDisplay(carb.unit, carb.name, carbPortion)}`,
            '[CHICKEN]': meal.category === 'chicken' ? `${proteinWeight}g ${protein.name.toLowerCase()}` : `${proteinWeight}g ${protein.name.toLowerCase()}`,
            '[BEEF]': meal.category === 'beef' ? `${proteinWeight}g ${protein.name.toLowerCase()}` : `${proteinWeight}g ${protein.name.toLowerCase()}`
        };
        
        // Replace all keywords
        let processed = instructions;
        Object.entries(replacements).forEach(([keyword, replacement]) => {
            processed = processed.replace(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replacement);
        });
        
        return processed;
    }
    
    // Parse sauce ratio (e.g., "1:4" returns 0.25)
    parseSauceRatio(ratio) {
        if (!ratio) return 1;
        const parts = ratio.split(':');
        if (parts.length === 2) {
            return parseFloat(parts[0]) / parseFloat(parts[1]);
        }
        return 1;
    }
    
    // Get unit display for carbs
    getUnitDisplay(unit, name, portion) {
        if (unit === 'each') {
            if (portion > 1 && !name.endsWith('s')) {
                return ' ' + name + 's';
            }
            return ' ' + name;
        }
        return 'g';
    }
    
    // Update protein options when category changes
    updateProteinOptions(container, category) {
        const proteinSelects = container.querySelectorAll('select[name^="proteins["]');
        const filteredProteins = this.getProteinsByCategory(category);
        
        proteinSelects.forEach(select => {
            const currentValue = select.value;
            
            // Clear existing options except the first "Select protein..." option
            select.innerHTML = '<option value="">Select protein...</option>';
            
            // Add filtered options
            filteredProteins.forEach(protein => {
                const option = document.createElement('option');
                option.value = protein.id;
                option.textContent = protein.name;
                option.selected = protein.id === currentValue;
                select.appendChild(option);
            });
            
            // If current value is not in filtered list, clear it
            if (currentValue && !filteredProteins.find(p => p.id === currentValue)) {
                select.value = '';
            }
        });
    }
}

// Register component globally
if (typeof window !== 'undefined') {
    window.MealsManager = MealsManager;
} 