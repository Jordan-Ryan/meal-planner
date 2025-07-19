/**
 * Ingredients Manager Component
 * A modular component for managing ingredients with CRUD operations
 */
class IngredientsManager {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            dataPath: 'data/',
            theme: 'default',
            onIngredientUpdate: () => {},
            onIngredientDelete: () => {},
            onIngredientAdd: () => {},
            ...options
        };
        
        this.ingredients = [];
        this.filteredIngredients = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.editingIngredient = null;
        this.isAddingNew = false;
        this.viewingIngredient = null;
        
        this.init();
    }
    
    async init() {
        await this.loadIngredients();
        this.filterIngredients(); // Apply initial filtering
        this.render();
        this.attachEventListeners();
    }
    
    async loadIngredients() {
        try {
            const response = await fetch(`${this.options.dataPath}ingredients.json`);
            if (!response.ok) throw new Error('Failed to load ingredients');
            const data = await response.json();
            
            // Convert the existing data structure to flat array
            this.ingredients = [];
            
            // Process proteins
            Object.keys(data.proteins).forEach(id => {
                const ingredient = data.proteins[id];
                this.ingredients.push({
                    id: id,
                    name: ingredient.name,
                    category: 'proteins',
                    protein: ingredient.protein,
                    carbs: ingredient.carbs,
                    fat: ingredient.fat,
                    calories: ingredient.calories,
                    unit: ingredient.unit,
                    description: `${ingredient.name} - ${ingredient.unit}`
                });
            });
            
            // Process sauces
            Object.keys(data.sauces).forEach(id => {
                const ingredient = data.sauces[id];
                this.ingredients.push({
                    id: id,
                    name: ingredient.name,
                    category: 'sauces',
                    protein: ingredient.protein,
                    carbs: ingredient.carbs,
                    fat: ingredient.fat,
                    calories: ingredient.calories,
                    unit: ingredient.unit,
                    ratio: ingredient.ratio,
                    description: `${ingredient.name} - ${ingredient.unit}`
                });
            });
            
            // Process carbs
            Object.keys(data.carbs).forEach(id => {
                const ingredient = data.carbs[id];
                this.ingredients.push({
                    id: id,
                    name: ingredient.name,
                    category: 'carbs',
                    protein: ingredient.protein,
                    carbs: ingredient.carbs,
                    fat: ingredient.fat,
                    calories: ingredient.calories,
                    unit: ingredient.unit,
                    description: `${ingredient.name} - ${ingredient.unit}`
                });
            });
            
            // Process extras
            Object.keys(data.extras).forEach(id => {
                const ingredient = data.extras[id];
                this.ingredients.push({
                    id: id,
                    name: ingredient.name,
                    category: 'extras',
                    protein: ingredient.protein,
                    carbs: ingredient.carbs,
                    fat: ingredient.fat,
                    calories: ingredient.calories,
                    unit: ingredient.unit,
                    description: `${ingredient.name} - ${ingredient.unit}`
                });
            });
            
            this.filteredIngredients = [...this.ingredients];
        } catch (error) {
            console.error('Error loading ingredients:', error);
            this.ingredients = [];
            this.filteredIngredients = [];
        }
    }
    
    async saveIngredients() {
        try {
            // In a real app, this would be an API call
            // For now, we'll just update the local data
            console.log('Saving ingredients:', this.ingredients);
            this.options.onIngredientUpdate(this.ingredients);
        } catch (error) {
            console.error('Error saving ingredients:', error);
        }
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="ingredients-manager-component" data-theme="${this.options.theme}">
                <div class="ingredients-header">
                    <h1>Ingredients Manager</h1>
                    ${!this.viewingIngredient && !this.isAddingNew && !this.editingIngredient ? `
                    <button class="btn btn-primary" id="add-ingredient-btn">
                        <span>+</span> Add New Ingredient
                    </button>
                    ` : ''}
                </div>
                
                ${!this.viewingIngredient && !this.isAddingNew && !this.editingIngredient ? `
                <div class="ingredients-controls">
                    <div class="search-bar">
                        <input type="text" id="ingredient-search" class="input" placeholder="Search ingredients..." value="${this.searchTerm}">
                    </div>
                    <div class="filter-group">
                        <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                        <button class="filter-btn ${this.currentFilter === 'proteins' ? 'active' : ''}" data-filter="proteins">Proteins</button>
                        <button class="filter-btn ${this.currentFilter === 'sauces' ? 'active' : ''}" data-filter="sauces">Sauces</button>
                        <button class="filter-btn ${this.currentFilter === 'carbs' ? 'active' : ''}" data-filter="carbs">Carbs</button>
                        <button class="filter-btn ${this.currentFilter === 'extras' ? 'active' : ''}" data-filter="extras">Extras</button>
                    </div>
                </div>
                ` : ''}
                
                <div class="ingredients-content">
                    ${this.isAddingNew ? this.renderAddForm() : 
                      this.editingIngredient ? this.renderEditForm(this.editingIngredient) :
                      this.viewingIngredient ? this.renderIngredientDetail(this.viewingIngredient) : 
                      this.renderIngredientsList()}
                </div>
            </div>
        `;
    }
    
    renderIngredientsList() {
        if (this.filteredIngredients.length === 0) {
            return `
                <div class="empty-state">
                    <h3>No ingredients found</h3>
                    <p>${this.searchTerm ? 'Try adjusting your search terms.' : 'Add your first ingredient to get started!'}</p>
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
                            <th>Protein (g)</th>
                            <th>Carbs (g)</th>
                            <th>Fat (g)</th>
                            <th>Calories</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredIngredients.map(ingredient => `
                            <tr class="ingredient-row clickable" data-id="${ingredient.id}">
                                <td>
                                    <div class="ingredient-name-cell">
                                        <span class="ingredient-name">${ingredient.name}</span>
                                        ${ingredient.description ? `<small class="ingredient-unit">${ingredient.unit}</small>` : ''}
                                    </div>
                                </td>
                                <td><span class="badge badge-primary">${ingredient.category}</span></td>
                                <td>${ingredient.protein}</td>
                                <td>${ingredient.carbs}</td>
                                <td>${ingredient.fat}</td>
                                <td>${ingredient.calories}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    renderAddForm() {
        return `
            <div class="ingredient-detail-page">
                <div class="detail-header">
                    <button class="btn btn-secondary" id="cancel-add">
                        <span>←</span> Back to List
                    </button>
                </div>
                
                <div class="detail-content">
                    <h2>Add New Ingredient</h2>
                    
                    <form id="add-ingredient-form">
                        <div class="form-group">
                            <label for="ingredient-name">Name *</label>
                            <input type="text" id="ingredient-name" name="name" required class="input">
                        </div>
                        
                        <div class="form-group">
                            <label for="ingredient-category">Category *</label>
                            <div class="select-wrapper">
                                <select id="ingredient-category" name="category" required class="input">
                                    <option value="">Select category...</option>
                                    <option value="proteins">Proteins</option>
                                    <option value="sauces">Sauces</option>
                                    <option value="carbs">Carbs</option>
                                    <option value="extras">Extras</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="ingredient-protein">Protein (g)</label>
                                <input type="number" id="ingredient-protein" name="protein" step="0.1" min="0" value="0" class="input">
                            </div>
                            <div class="form-group">
                                <label for="ingredient-carbs">Carbs (g)</label>
                                <input type="number" id="ingredient-carbs" name="carbs" step="0.1" min="0" value="0" class="input">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="ingredient-fat">Fat (g)</label>
                                <input type="number" id="ingredient-fat" name="fat" step="0.1" min="0" value="0" class="input">
                            </div>
                            <div class="form-group">
                                <label for="ingredient-calories">Calories (kcal)</label>
                                <input type="number" id="ingredient-calories" name="calories" step="1" min="0" value="0" class="input">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="ingredient-unit">Unit</label>
                            <input type="text" id="ingredient-unit" name="unit" class="input" placeholder="e.g., g, each, cup">
                        </div>
                        
                        <div class="form-group">
                            <label for="ingredient-description">Description</label>
                            <textarea id="ingredient-description" name="description" rows="3" class="input" placeholder="Optional description..."></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-add">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Ingredient</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    renderIngredientDetail(ingredient) {
        return `
            <div class="ingredient-detail-page">
                <div class="detail-header">
                    <button class="btn btn-secondary" id="back-to-list">
                        <span>←</span> Back to Ingredients
                    </button>
                    <div class="detail-actions">
                        <button class="btn btn-primary edit-ingredient-btn" data-id="${ingredient.id}">Edit</button>
                        <button class="btn btn-danger delete-ingredient-btn" data-id="${ingredient.id}">Delete</button>
                    </div>
                </div>
                
                <div class="detail-content">
                    <div class="detail-section">
                        <h2>${ingredient.name}</h2>
                        <span class="badge badge-primary">${ingredient.category}</span>
                        ${ingredient.description ? `<p class="ingredient-description">${ingredient.description}</p>` : ''}
                    </div>
                    
                    <div class="detail-section">
                        <h3>Nutrition Information</h3>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <span class="nutrition-label">Protein</span>
                                <span class="nutrition-value">${ingredient.protein}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Carbohydrates</span>
                                <span class="nutrition-value">${ingredient.carbs}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Fat</span>
                                <span class="nutrition-value">${ingredient.fat}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Calories</span>
                                <span class="nutrition-value">${ingredient.calories} kcal</span>
                            </div>
                        </div>
                    </div>
                    
                    ${ingredient.ratio ? `
                        <div class="detail-section">
                            <h3>Additional Information</h3>
                            <p><strong>Sauce Ratio:</strong> ${ingredient.ratio}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderEditForm(ingredient) {
        return `
            <div class="ingredient-detail-page">
                <div class="detail-header">
                    <button class="btn btn-secondary" id="cancel-edit">
                        <span>←</span> Back to Detail
                    </button>
                </div>
                
                <div class="detail-content">
                    <h2>Edit Ingredient</h2>
                    
                    <form class="edit-ingredient-form" data-id="${ingredient.id}">
                        <div class="form-group">
                            <label for="edit-name-${ingredient.id}">Name *</label>
                            <input type="text" id="edit-name-${ingredient.id}" name="name" value="${ingredient.name}" required class="input">
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-category-${ingredient.id}">Category *</label>
                            <div class="select-wrapper">
                                <select id="edit-category-${ingredient.id}" name="category" required class="input">
                                    <option value="">Select category...</option>
                                    <option value="proteins" ${ingredient.category === 'proteins' ? 'selected' : ''}>Proteins</option>
                                    <option value="sauces" ${ingredient.category === 'sauces' ? 'selected' : ''}>Sauces</option>
                                    <option value="carbs" ${ingredient.category === 'carbs' ? 'selected' : ''}>Carbs</option>
                                    <option value="extras" ${ingredient.category === 'extras' ? 'selected' : ''}>Extras</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-protein-${ingredient.id}">Protein (g)</label>
                                <input type="number" id="edit-protein-${ingredient.id}" name="protein" step="0.1" min="0" value="${ingredient.protein}" class="input">
                            </div>
                            <div class="form-group">
                                <label for="edit-carbs-${ingredient.id}">Carbs (g)</label>
                                <input type="number" id="edit-carbs-${ingredient.id}" name="carbs" step="0.1" min="0" value="${ingredient.carbs}" class="input">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-fat-${ingredient.id}">Fat (g)</label>
                                <input type="number" id="edit-fat-${ingredient.id}" name="fat" step="0.1" min="0" value="${ingredient.fat}" class="input">
                            </div>
                            <div class="form-group">
                                <label for="edit-calories-${ingredient.id}">Calories (kcal)</label>
                                <input type="number" id="edit-calories-${ingredient.id}" name="calories" step="1" min="0" value="${ingredient.calories}" class="input">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-unit-${ingredient.id}">Unit</label>
                            <input type="text" id="edit-unit-${ingredient.id}" name="unit" value="${ingredient.unit || ''}" class="input" placeholder="e.g., g, each, cup">
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-description-${ingredient.id}">Description</label>
                            <textarea id="edit-description-${ingredient.id}" name="description" rows="3" class="input" placeholder="Optional description...">${ingredient.description || ''}</textarea>
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
        // Search functionality
        const searchInput = document.getElementById('ingredient-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.applyFiltersAndRender();
            });
        }
        

        
        // Add ingredient button
        const addBtn = document.getElementById('add-ingredient-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.isAddingNew = true;
                this.render();
                this.attachEventListeners();
            });
        }
        
        // Cancel add button
        const cancelAddBtn = document.getElementById('cancel-add');
        if (cancelAddBtn) {
            cancelAddBtn.addEventListener('click', () => {
                this.isAddingNew = false;
                this.filterIngredients(); // Re-apply filters when returning to list
                this.render();
                this.attachEventListeners();
            });
        }
        
        // Add ingredient form
        const addForm = document.getElementById('add-ingredient-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddIngredient(e.target);
            });
        }
        
        // Clickable table rows
        document.addEventListener('click', (e) => {
            const row = e.target.closest('.ingredient-row.clickable');
            if (row) {
                const id = row.dataset.id;
                const ingredient = this.ingredients.find(i => i.id === id);
                if (ingredient) {
                    this.viewingIngredient = ingredient;
                    this.render();
                    this.attachEventListeners();
                }
            }
            
            if (e.target.classList.contains('edit-ingredient-btn')) {
                console.log('Edit button clicked!');
                const id = e.target.dataset.id;
                console.log('Ingredient ID:', id);
                const ingredient = this.ingredients.find(i => i.id === id);
                console.log('Found ingredient:', ingredient);
                if (ingredient) {
                    this.editingIngredient = ingredient;
                    console.log('Setting editingIngredient to:', ingredient);
                    this.render();
                    this.attachEventListeners();
                }
            }
            
            if (e.target.classList.contains('delete-ingredient-btn')) {
                console.log('Delete button clicked!');
                const id = e.target.dataset.id;
                console.log('Ingredient ID:', id);
                const ingredient = this.ingredients.find(i => i.id === id);
                console.log('Found ingredient:', ingredient);
                if (ingredient) {
                    const confirmed = confirm(`Are you sure you want to delete "${ingredient.name}"?`);
                    if (confirmed) {
                        console.log('Delete confirmed, calling handleDeleteIngredient');
                        this.handleDeleteIngredient(id);
                    } else {
                        console.log('Delete cancelled');
                    }
                }
            }
        });
        
        // Back to list button
        const backToListBtn = document.getElementById('back-to-list');
        if (backToListBtn) {
            backToListBtn.addEventListener('click', () => {
                this.viewingIngredient = null;
                this.filterIngredients(); // Re-apply filters when returning to list
                this.render();
                this.attachEventListeners();
            });
        }
        
        // Back to detail button - use event delegation since it's dynamically created
        document.addEventListener('click', (e) => {
            if (e.target.id === 'back-to-detail') {
                this.editingIngredient = null;
                // Don't re-apply filters since we're going back to detail view
                this.render();
                this.attachEventListeners();
            }
        });
        
        // Edit ingredient form
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('edit-ingredient-form')) {
                e.preventDefault();
                this.handleEditIngredient(e.target);
            }
        });
        
        // Cancel edit button - use event delegation since it's dynamically created
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cancel-edit') {
                this.editingIngredient = null;
                // Stay on the detail view of the current ingredient
                this.render();
                this.attachEventListeners();
            }
        });
        
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
    }
    
    filterIngredients() {
        let filtered = [...this.ingredients];
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(ingredient => ingredient.category === this.currentFilter);
        }
        
        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(ingredient => 
                ingredient.name.toLowerCase().includes(searchLower) ||
                (ingredient.description && ingredient.description.toLowerCase().includes(searchLower))
            );
        }
        
        this.filteredIngredients = filtered;
        
        console.log('Filter applied:', {
            currentFilter: this.currentFilter,
            searchTerm: this.searchTerm,
            totalIngredients: this.ingredients.length,
            filteredCount: this.filteredIngredients.length,
            viewingIngredient: this.viewingIngredient,
            isAddingNew: this.isAddingNew,
            editingIngredient: this.editingIngredient
        });
    }
    
    applyFiltersAndRender() {
        this.filterIngredients();
        
        // Only update the table content if we're currently viewing the list
        if (!this.viewingIngredient && !this.isAddingNew && !this.editingIngredient) {
            console.log('Updating table content only');
            this.updateTableContent();
        } else {
            console.log('Not updating - not on list view');
        }
    }
    
    updateTableContent() {
        const contentContainer = document.querySelector('.ingredients-content');
        if (contentContainer) {
            contentContainer.innerHTML = this.renderIngredientsList();
        }
    }
    
    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    }
    
    handleAddIngredient(form) {
        const formData = new FormData(form);
        const newIngredient = {
            id: this.generateId(),
            name: formData.get('name'),
            category: formData.get('category'),
            protein: parseFloat(formData.get('protein')) || 0,
            carbs: parseFloat(formData.get('carbs')) || 0,
            fat: parseFloat(formData.get('fat')) || 0,
            calories: parseInt(formData.get('calories')) || 0,
            unit: formData.get('unit') || '',
            description: formData.get('description') || ''
        };
        
        this.ingredients.push(newIngredient);
        this.saveIngredients();
        this.options.onIngredientAdd(newIngredient);
        
        this.isAddingNew = false;
        this.filterIngredients(); // Re-apply filters
        this.render();
        this.attachEventListeners();
    }
    
    handleEditIngredient(form) {
        const id = form.dataset.id;
        const formData = new FormData(form);
        
        const updatedIngredient = {
            id: id,
            name: formData.get('name'),
            category: formData.get('category'),
            protein: parseFloat(formData.get('protein')) || 0,
            carbs: parseFloat(formData.get('carbs')) || 0,
            fat: parseFloat(formData.get('fat')) || 0,
            calories: parseInt(formData.get('calories')) || 0,
            unit: formData.get('unit') || '',
            description: formData.get('description') || ''
        };
        
        const index = this.ingredients.findIndex(i => i.id === id);
        if (index !== -1) {
            this.ingredients[index] = updatedIngredient;
            this.saveIngredients();
            this.options.onIngredientUpdate(updatedIngredient);
        }
        
        this.editingIngredient = null;
        this.viewingIngredient = updatedIngredient; // Show the updated ingredient
        this.filterIngredients(); // Re-apply filters
        this.render();
        this.attachEventListeners();
    }
    
    handleDeleteIngredient(id) {
        this.ingredients = this.ingredients.filter(i => i.id !== id);
        this.saveIngredients();
        this.options.onIngredientDelete(id);
        
        // Return to list view after deletion
        this.viewingIngredient = null;
        this.editingIngredient = null;
        this.filterIngredients(); // Re-apply filters
        this.render();
        this.attachEventListeners();
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Register component globally
if (typeof window !== 'undefined') {
    window.IngredientsManager = IngredientsManager;
} 