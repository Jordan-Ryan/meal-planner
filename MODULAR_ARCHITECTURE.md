# 🏗️ Modular Component Architecture

## Overview

This document outlines the modular component architecture that transforms your meal planner into a scalable, multi-app platform. The architecture is designed for future-proofing and easy expansion.

## 🎯 Architecture Goals

- **Modularity**: Each app is a self-contained component
- **Reusability**: Components can be used across different platforms
- **Scalability**: Easy to add new apps and features
- **Maintainability**: Clear separation of concerns
- **Theming**: Consistent visual design across components
- **Performance**: Lazy loading and efficient resource management

## 📁 Project Structure

```
project/
├── components/                    # Component library
│   ├── component-registry.js     # Component management system
│   ├── meal-planner/            # Meal planner component
│   │   ├── meal-planner.js      # Component logic
│   │   ├── meal-planner.css     # Component styles
│   │   ├── manifest.json        # Component metadata
│   │   ├── README.md            # Component documentation
│   │   └── example.html         # Usage example
│   ├── workout-tracker/         # Future component
│   ├── budget-manager/          # Future component
│   └── ...
├── data/                        # Shared data files
│   ├── ingredients.json
│   ├── meals.json
│   └── ...
├── images/                      # Shared assets
├── platform-example.html        # Multi-app platform demo
└── MODULAR_ARCHITECTURE.md      # This documentation
```

## 🔧 Component System

### Component Structure

Each component follows a standardized structure:

```javascript
class ComponentName {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = { ...defaultOptions, ...options };
        this.state = { /* component state */ };
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.render();
        this.bindEvents();
    }
    
    render() {
        // Render component HTML
    }
    
    bindEvents() {
        // Bind event listeners
    }
    
    // Public API methods
    destroy() {
        // Cleanup
    }
}
```

### Component Registration

Components are registered with the Component Registry:

```javascript
componentRegistry.register('meal-planner', {
    main: 'MealPlanner',
    styles: 'meal-planner.css',
    description: 'A modular meal planning component',
    version: '1.0.0',
    defaultOptions: {
        theme: 'default',
        dataPath: 'data/',
        imagesPath: 'images/'
    }
});
```

## 🎨 Theming System

### CSS Custom Properties

Components use CSS custom properties for theming:

```css
.component-name {
    --cp-primary-color: #4fd1c5;
    --cp-secondary-color: #38b2ac;
    --cp-background-color: #1a202c;
    --cp-surface-color: #2d3748;
    --cp-text-color: #ffffff;
    --cp-text-secondary: #a0aec0;
    --cp-border-color: #4a5568;
    --cp-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --cp-border-radius: 8px;
    --cp-transition: all 0.2s ease-in-out;
}
```

### Theme Variations

```css
.component-name[data-theme="light"] {
    --cp-background-color: #f7fafc;
    --cp-surface-color: #ffffff;
    --cp-text-color: #2d3748;
}

.component-name[data-theme="blue"] {
    --cp-primary-color: #3182ce;
    --cp-secondary-color: #2c5282;
}
```

## 🚀 Platform Integration

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="components/meal-planner/meal-planner.css">
</head>
<body>
    <div id="meal-planner-container"></div>
    <script src="components/component-registry.js"></script>
    <script src="components/meal-planner/meal-planner.js"></script>
    <script>
        const mealPlanner = new MealPlanner('meal-planner-container', {
            theme: 'light',
            onMealSelect: (meal) => console.log('Selected:', meal)
        });
    </script>
</body>
</html>
```

### Multi-App Platform

```javascript
// Platform management
class AppPlatform {
    constructor() {
        this.currentApp = null;
        this.components = new Map();
    }
    
    async loadApp(appName, containerId, options = {}) {
        // Unload current app
        if (this.currentApp) {
            this.currentApp.destroy();
        }
        
        // Load new app
        const component = await componentRegistry.load(appName, containerId, options);
        this.currentApp = component;
        
        return component;
    }
    
    switchTheme(theme) {
        // Apply theme across all components
    }
}
```

## 📊 Data Management

### Shared Data Structure

```json
{
  "meals": [
    {
      "id": "spaghetti_bolognese",
      "name": "Spaghetti Bolognese",
      "category": "beef",
      "image": "spaghetti-bolognese-food",
      "proteins": ["beef_mince_5"],
      "sauce": "bolognese",
      "carb": "penne_pasta",
      "carb_portions": [40, 80, 120, 160]
    }
  ]
}
```

### Component-Specific Data

Each component can have its own data files:

```
components/
├── meal-planner/
│   └── data/
│       ├── meals.json
│       └── ingredients.json
├── workout-tracker/
│   └── data/
│       ├── exercises.json
│       └── workouts.json
```

## 🔌 API Design

### Component API

```javascript
// Standard component methods
component.getSelectedItem()     // Get current selection
component.getState()           // Get component state
component.setState(newState)   // Update component state
component.destroy()            // Cleanup component
```

### Event System

```javascript
// Component events
component.on('itemSelect', (item) => {
    console.log('Item selected:', item);
});

component.on('stateChange', (newState) => {
    console.log('State changed:', newState);
});
```

## 🧪 Testing Strategy

### Component Testing

```javascript
// Test component initialization
test('Component initializes correctly', () => {
    const component = new MealPlanner('test-container');
    expect(component.container).toBeDefined();
    expect(component.state.currentFilter).toBe('all');
});

// Test component methods
test('Component filters meals correctly', () => {
    component.setFilter('beef');
    expect(component.state.currentFilter).toBe('beef');
});
```

### Integration Testing

```javascript
// Test platform integration
test('Platform loads component correctly', async () => {
    const platform = new AppPlatform();
    const component = await platform.loadApp('meal-planner', 'test-container');
    expect(component).toBeInstanceOf(MealPlanner);
});
```

## 📈 Performance Optimization

### Lazy Loading

```javascript
// Load components on demand
async function loadComponentWhenNeeded(componentName) {
    if (!window[componentName]) {
        await componentRegistry.loadJS(`components/${componentName}/${componentName}.js`);
    }
}
```

### Resource Management

```javascript
// Cleanup unused components
function cleanupUnusedComponents() {
    componentRegistry.getActiveInstances().forEach(instance => {
        if (!isComponentVisible(instance.containerId)) {
            componentRegistry.unload(instance.name, instance.containerId);
        }
    });
}
```

## 🔒 Security Considerations

### Data Validation

```javascript
// Validate component options
function validateComponentOptions(options, schema) {
    const validator = new Ajv();
    const valid = validator.validate(schema, options);
    
    if (!valid) {
        throw new Error(`Invalid options: ${validator.errorsText()}`);
    }
}
```

### XSS Prevention

```javascript
// Sanitize user input
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}
```

## 🚀 Deployment Strategy

### Build Process

```bash
# Build components
npm run build:components

# Bundle for production
npm run bundle

# Deploy to CDN
npm run deploy
```

### CDN Integration

```html
<!-- Load from CDN -->
<link rel="stylesheet" href="https://cdn.example.com/components/meal-planner/meal-planner.css">
<script src="https://cdn.example.com/components/meal-planner/meal-planner.js"></script>
```

## 📚 Documentation Standards

### Component Documentation

Each component should include:

- **README.md**: Usage instructions and examples
- **manifest.json**: Component metadata and configuration
- **example.html**: Working example
- **API.md**: Detailed API documentation

### Code Documentation

```javascript
/**
 * Meal Planner Component
 * @class MealPlanner
 * @param {string} containerId - Target container ID
 * @param {Object} options - Component options
 * @param {string} options.theme - Visual theme
 * @param {string} options.dataPath - Path to data files
 */
class MealPlanner {
    // Implementation
}
```

## 🔮 Future Enhancements

### Planned Features

1. **Component Marketplace**: Browse and install components
2. **Plugin System**: Extend component functionality
3. **Real-time Collaboration**: Multi-user component editing
4. **Analytics Dashboard**: Component usage metrics
5. **A/B Testing**: Component variant testing

### Technology Roadmap

- **Web Components**: Native browser component support
- **Micro-frontends**: Independent deployment of components
- **Progressive Web Apps**: Offline component functionality
- **AI Integration**: Smart component recommendations

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Develop** your component
4. **Test** thoroughly
5. **Document** your changes
6. **Submit** a pull request

### Component Guidelines

- Follow the established component structure
- Include comprehensive documentation
- Write unit tests for all functionality
- Ensure accessibility compliance
- Optimize for performance

## 📞 Support

For questions and support:

- **Documentation**: Check component README files
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainer directly

---

This modular architecture provides a solid foundation for building scalable, maintainable multi-app platforms. The component system ensures consistency, reusability, and easy expansion as your platform grows. 