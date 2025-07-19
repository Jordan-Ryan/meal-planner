/**
 * Component Registry
 * A centralized system for managing and loading components across a multi-app platform
 */

class ComponentRegistry {
    constructor() {
        this.components = new Map();
        this.instances = new Map();
        this.config = {
            basePath: '/components/',
            defaultTheme: 'default',
            globalCallbacks: {}
        };
    }
    
    /**
     * Register a component with the registry
     * @param {string} name - Component name
     * @param {Object} component - Component definition
     */
    register(name, component) {
        this.components.set(name, {
            ...component,
            name,
            registeredAt: new Date()
        });
        
        console.log(`Component "${name}" registered successfully`);
    }
    
    /**
     * Load and initialize a component
     * @param {string} name - Component name
     * @param {string} containerId - Target container ID
     * @param {Object} options - Component options
     */
    async load(name, containerId, options = {}) {
        const component = this.components.get(name);
        
        if (!component) {
            throw new Error(`Component "${name}" not found in registry`);
        }
        
        // Load CSS if not already loaded
        if (component.styles && !document.querySelector(`link[href*="${component.styles}"]`)) {
            await this.loadCSS(`${this.config.basePath}${name}/${component.styles}`);
        }
        
        // Load JS if not already loaded
        if (component.main && !window[component.main]) {
            await this.loadJS(`${this.config.basePath}${name}/${component.main}`);
        }
        
        // Merge options with defaults
        const finalOptions = {
            theme: this.config.defaultTheme,
            ...component.defaultOptions,
            ...options
        };
        
        // Create component instance
        const ComponentClass = window[component.main];
        if (!ComponentClass) {
            throw new Error(`Component class "${component.main}" not found`);
        }
        
        const instance = new ComponentClass(containerId, finalOptions);
        
        // Store instance
        this.instances.set(`${name}-${containerId}`, {
            name,
            containerId,
            instance,
            options: finalOptions,
            createdAt: new Date()
        });
        
        console.log(`Component "${name}" loaded in container "${containerId}"`);
        return instance;
    }
    
    /**
     * Unload a component instance
     * @param {string} name - Component name
     * @param {string} containerId - Container ID
     */
    unload(name, containerId) {
        const key = `${name}-${containerId}`;
        const instanceData = this.instances.get(key);
        
        if (instanceData) {
            if (instanceData.instance.destroy) {
                instanceData.instance.destroy();
            }
            this.instances.delete(key);
            console.log(`Component "${name}" unloaded from container "${containerId}"`);
        }
    }
    
    /**
     * Get a component instance
     * @param {string} name - Component name
     * @param {string} containerId - Container ID
     */
    getInstance(name, containerId) {
        const key = `${name}-${containerId}`;
        const instanceData = this.instances.get(key);
        return instanceData ? instanceData.instance : null;
    }
    
    /**
     * Get all instances of a component
     * @param {string} name - Component name
     */
    getInstances(name) {
        const instances = [];
        for (const [key, instanceData] of this.instances) {
            if (instanceData.name === name) {
                instances.push(instanceData);
            }
        }
        return instances;
    }
    
    /**
     * Load CSS file dynamically
     * @param {string} href - CSS file path
     */
    loadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
            document.head.appendChild(link);
        });
    }
    
    /**
     * Load JS file dynamically
     * @param {string} src - JS file path
     */
    loadJS(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load JS: ${src}`));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Set global configuration
     * @param {Object} config - Configuration object
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
    
    /**
     * Get component information
     * @param {string} name - Component name
     */
    getComponent(name) {
        return this.components.get(name);
    }
    
    /**
     * Get all registered components
     */
    getComponents() {
        return Array.from(this.components.values());
    }
    
    /**
     * Get all active instances
     */
    getActiveInstances() {
        return Array.from(this.instances.values());
    }
    
    /**
     * Clear all instances
     */
    clearInstances() {
        for (const [key, instanceData] of this.instances) {
            if (instanceData.instance.destroy) {
                instanceData.instance.destroy();
            }
        }
        this.instances.clear();
    }
}

// Create global registry instance
window.ComponentRegistry = ComponentRegistry;
window.componentRegistry = new ComponentRegistry();

// Auto-register known components
window.componentRegistry.register('meal-planner', {
    main: 'MealPlanner',
    styles: 'meal-planner.css',
    description: 'A modular meal planning component',
    version: '1.0.0',
    defaultOptions: {
        theme: 'default',
        dataPath: 'data/',
        imagesPath: 'images/'
    },
    config: {
        containerId: { required: true, type: 'string' },
        theme: { default: 'default', options: ['default', 'light', 'blue', 'green'] },
        dataPath: { default: 'data/', type: 'string' },
        imagesPath: { default: 'images/', type: 'string' }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentRegistry;
} 