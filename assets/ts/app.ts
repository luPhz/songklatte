/*
 * Utilities.
 */
const removeChildElements = (parentElement: HTMLElement) => {
    while (parentElement.lastChild) {
        parentElement.removeChild(parentElement.lastChild);
    }
};

/*
 * App-Navigation
 */
type NavCallback = () => void;
class NavItem {
    title: string;
    action: () => void;
    
    constructor(title: string, action: NavCallback) {
        this.title = title;
        this.action = action;
    }
}
class NavigationHandler {
    navContainer!: HTMLElement;
    navItems: NavItem[];

    constructor() {
        this.navItems = [];
    }

    createNavItemElements = function(navItem: NavItem) {
        let navButton = document.createElement("button");
        navButton.textContent = navItem.title;
        navButton.addEventListener("click", navItem.action);
        
        return navButton;
    };

    addNavItem(title: string, action: () => void) {
        var navItem = new NavItem(title, action);
        this.navItems.push(navItem);
        if (this.navContainer) {
            this.navContainer.appendChild(this.createNavItemElements(navItem));
        }
    }

    init() {
        this.navContainer = document.createElement("nav");

        this.navItems.forEach(item => {
            this.navContainer.appendChild(this.createNavItemElements(item));
        });
        
        return this.navContainer;
    }
}

/*
 * The App.
 * 
 * A self-initializing collection of general utilities and features.
 * 
 * - Feature: Initializer-Callbacks
 */
type ReadyCallback = () => void;
const app = (function() {
    
    const readyActions: ReadyCallback[] = [];
    
    var isInitialized = false;
    var navigation: NavigationHandler = new NavigationHandler();

    return {
        init: function() {
            /* Page Header */
            const pageHeader = document.getElementById("cnt-page-header");
            if (pageHeader) {
                pageHeader.appendChild(navigation.init());
            }
            else {
                console.error("App: Could not initialize app header.");
            }

            isInitialized = true;
            readyActions.forEach(action => action());
        },
        addNavItem: function(title: string, action: NavCallback) {
            navigation.addNavItem(title, action);
        },
        addInitializer: function(action: ReadyCallback) {
            readyActions.push(action);
            if (isInitialized) {
                action();
            }
        }
    };
})();
