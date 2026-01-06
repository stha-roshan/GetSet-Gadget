class AdminSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  render() {
    const markup = `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <a href="/">GetSet Gadgets</a>
        </div>
        
        <ul class="sidebar-menu">
          <li><a href="/admin" data-route="dashboard">Dashboard</a></li>
          <li><a href="/admin/product-management" data-route="products">Products</a></li>
          <li><a href="/admin/category-management" data-route="categories">Categories</a></li>
          <li><a href="/admin/brand-management" data-route="brands">Brands</a></li>
          <li><a href="/admin/orders" data-route="orders">Orders</a></li>
        </ul>
      </aside>
    `;

    const styles = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .sidebar {
        width: 250px;
        height: 100vh;
        background-color: #1a1a1a;
        padding: 20px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
      }

      .sidebar-brand {
        font-size: 1.5rem;
        font-weight: bold;
        color: #fff;
        margin-bottom: 40px;
        text-align: center;
        border-bottom: 2px solid #444;
        padding-bottom: 20px;
      }

      .sidebar-brand a {
        color: #fff;
        text-decoration: none;
      }

      .sidebar-menu {
        list-style: none;
      }

      .sidebar-menu li {
        margin: 0;
      }

      .sidebar-menu a {
        display: block;
        padding: 12px 15px;
        color: #ccc;
        text-decoration: none;
        font-size: 1rem;
        transition: all 0.3s ease;
        border-left: 4px solid transparent;
        margin-bottom: 5px;
        border-radius: 4px;
      }

      .sidebar-menu a:hover {
        background-color: #333;
        color: #fff;
        border-left-color: #dc3545;
      }

      .sidebar-menu a.active {
        background-color: #8b3a3a;
        color: #fff;
        border-left-color: #dc3545;
      }
    `;

    this.shadowRoot.innerHTML = `<style>${styles}</style>${markup}`;
  }

  setupEvents() {
    this.setActiveLink();
    
    // Update active link on navigation (for SPAs)
    window.addEventListener('popstate', () => this.setActiveLink());
  }

  setActiveLink() {
    const links = this.shadowRoot.querySelectorAll(".sidebar-menu a");
    const currentPath = window.location.pathname;

    links.forEach((link) => {
      const linkHref = link.getAttribute("href");
      
      // Remove active from all first
      link.classList.remove("active");
      
      // Check if this link should be active
      if (linkHref === currentPath) {
        // Exact match
        link.classList.add("active");
      } else if (linkHref !== "/admin" && currentPath.startsWith(linkHref + "/")) {
        // Partial match for nested routes (e.g., /admin/product-management/edit/123)
        // But NOT for dashboard to avoid it being active on all /admin/* pages
        link.classList.add("active");
      }
    });
  }

  disconnectedCallback() {
    // Clean up event listener when component is removed
    window.removeEventListener('popstate', this.setActiveLink);
  }
}

customElements.define("admin-sidebar", AdminSidebar);