document.addEventListener('DOMContentLoaded', function() {
    
    let allBookmarks = [];
    let currentCategory = 'Todas';
    let searchTerm = '';

    // Cache DOM Elements
    const $categoryList = $('#category-list');
    const $searchInput = $('#search-input');
    const $clearSearchBtn = $('#clear-search');
    const $container = $('#bookmarks-container');
    const $browserCatContainer = $('#browser-categories-container');
    const $tagDataList = $('#datalistOptions');
    const $tagSearchInput = $('#tagDataListInput');
    
    // View Containers
    const $mainView = $('#main-view');
    const $browserView = $('#browser-view');
    const $pageTitle = $('#page-title');
    const $btnBrowserTags = $('#btn-browser-tags');

    // --- Fetch Data ---
    fetch('./data/bookmarks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allBookmarks = data;
            $container.html(''); // Remove spinner
            initApp();
        })
        .catch(error => {
            console.error("App Initialization Error:", error);
            $container.html(`
                <div class="alert alert-danger m-4" role="alert">
                    <strong>Error:</strong> No se pudieron cargar los marcadores. ${error.message}.<br>
                    <small>Si estás abriendo el archivo localmente, asegúrate de usar un servidor local o que el navegador permita fetch a file://.</small>
                </div>
            `);
        });

    function initApp() {
        renderCategories();
        renderBookmarks();
        renderBrowserTagsPanel();
        setupEventListeners();
    }

    // Extract Categories and Render Sidebar
    function renderCategories() {
        const categories = new Set();
        allBookmarks.forEach(b => {
            if(b.categoria) categories.add(b.categoria);
        });

        const sortedCategories = Array.from(categories).sort();

        let html = `
            <button class="list-group-item list-group-item-action active" data-category="Todas">
                <i class="fas fa-folder"></i> Todas
            </button>
        `;

        const getIcon = (cat) => {
            cat = cat.toLowerCase();
            if (cat.includes('ia')) return 'fa-robot';
            if (cat.includes('descargas')) return 'fa-download';
            if (cat.includes('formación') || cat.includes('educacion')) return 'fa-graduation-cap';
            if (cat.includes('herramientas')) return 'fa-tools';
            if (cat.includes('moda') || cat.includes('compras')) return 'fa-shopping-bag';
            if (cat.includes('trabajo') || cat.includes('ofertas')) return 'fa-briefcase';
            return 'fa-bookmark';
        };

        sortedCategories.forEach(cat => {
            html += `
                <button class="list-group-item list-group-item-action" data-category="${cat}">
                    <i class="fas ${getIcon(cat)}"></i> ${cat}
                </button>
            `;
        });

        $categoryList.html(html);
    }

    // Render Bookmarks based on filters
    function renderBookmarks() {
        // Filter Logic
        const filtered = allBookmarks.filter(bookmark => {
            // 1. Category Filter
            const categoryMatch = currentCategory === 'Todas' || bookmark.categoria === currentCategory;
            
            // 2. Search Filter
            const term = searchTerm.toLowerCase();
            const textMatch = !term || 
                              bookmark.nombre_web.toLowerCase().includes(term) ||
                              bookmark.descripcion.toLowerCase().includes(term) ||
                              bookmark.empresa.toLowerCase().includes(term) ||
                              (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(term)));

            return categoryMatch && textMatch;
        });

        // Generate HTML
        if (filtered.length === 0) {
            $container.html(`
                <div class="text-center text-secondary mt-5">
                    <i class="fas fa-search fa-3x mb-3"></i>
                    <p>No se encontraron resultados para tu búsqueda.</p>
                </div>
            `);
            return;
        }

        let html = '';
        filtered.forEach(b => {
            let domain = 'google.com';
            try {
                domain = new URL(b.url).hostname;
            } catch (e) { /* ignore */ }
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            
            const tagsHtml = b.tags ? b.tags.map(tag => `<span class="tag-badge" data-tag="${tag}">${tag}</span>`).join('') : '';

            html += `
                <div class="bookmark-card animate-fade-in">
                    <div class="row align-items-start">
                        <div class="col-auto">
                            <div class="logo-container">
                                <img src="${faviconUrl}" alt="${b.nombre_web}" class="logo-img" onerror="this.parentElement.classList.add('error')">
                                <i class="fas fa-globe logo-fallback"></i>
                            </div>
                        </div>
                        <div class="col">
                            <div class="d-flex justify-content-between align-items-start flex-wrap">
                                <div>
                                    <div class="bookmark-company">${b.empresa}</div>
                                    <a href="${b.url}" target="_blank" class="bookmark-title stretched-link">${b.nombre_web} <i class="fas fa-external-link-alt ms-1 fs-6 opacity-50"></i></a>
                                </div>
                                <span class="category-badge ms-2 mb-2">${b.categoria}</span>
                            </div>
                            <p class="bookmark-desc mt-2 mb-3">${b.descripcion}</p>
                            <div class="tags-container" style="position: relative; z-index: 2;">
                                ${tagsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        $container.html(html);
    }

    // Render contents for Browser Tags View
    function renderBrowserTagsPanel() {
        const categories = new Set();
        const tags = new Set();

        allBookmarks.forEach(b => {
            if(b.categoria) categories.add(b.categoria);
            if(b.tags) b.tags.forEach(t => tags.add(t));
        });

        // Render Categories Buttons
        const sortedCategories = Array.from(categories).sort();
        let catHtml = '';
        sortedCategories.forEach(cat => {
             catHtml += `<button class="btn btn-outline-secondary footer-cat-btn" data-category="${cat}">${cat}</button>`;
        });
        $browserCatContainer.html(catHtml);

        // Render Tag Datalist
        const sortedTags = Array.from(tags).sort();
        let tagsOptions = '';
        sortedTags.forEach(tag => {
            tagsOptions += `<option value="${tag}">`;
        });
        $tagDataList.html(tagsOptions);
    }

    // --- View Switching Logic ---
    function switchToMainView() {
        $mainView.removeClass('d-none');
        $browserView.addClass('d-none');
        $btnBrowserTags.removeClass('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function switchToBrowserView() {
        $mainView.addClass('d-none');
        $browserView.removeClass('d-none');
        $pageTitle.text('Browser Tags');
        
        // Update Sidebar State
        $categoryList.find('.list-group-item').removeClass('active');
        $btnBrowserTags.addClass('active');
        
        // Mobile handling
        if (window.innerWidth < 992) {
            $('body').removeClass('sb-sidenav-toggled');
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        
        // Sidebar Category Click (Standard Mode)
        $categoryList.on('click', '.list-group-item', function() {
            const cat = $(this).data('category');
            
            // Logic
            switchToMainView();
            currentCategory = cat;
            $pageTitle.text('Bookmarks');
            
            // Update Active Class in Sidebar
            $categoryList.find('.list-group-item').removeClass('active');
            $(this).addClass('active');

            // Clear specific searches usually on category switch?
            // Keeping search term if user wants to filter within category
            
            if (window.innerWidth < 992) {
                $('body').removeClass('sb-sidenav-toggled');
            }
            
            renderBookmarks();
        });

        // Sidebar "Browser Tags" Button Click
        $btnBrowserTags.click(function() {
            switchToBrowserView();
        });

        // Browser View: Category Click
        $browserCatContainer.on('click', '.footer-cat-btn', function() {
            const cat = $(this).data('category');
            
            // Switch back to main view and set category
            switchToMainView();
            currentCategory = cat;
            $pageTitle.text('Bookmarks');

            // Update Sidebar UI
            $categoryList.find('.list-group-item').removeClass('active');
            $categoryList.find(`[data-category="${cat}"]`).addClass('active');

            renderBookmarks();
        });

        // Browser View: Tag Input Selection
        $tagSearchInput.on('change', function() {
            const val = $(this).val();
            if(val.trim() !== "") {
                 switchToMainView();
                 
                 // Reset Filters to "Search Mode"
                 currentCategory = 'Todas';
                 searchTerm = val;
                 $searchInput.val(val);
                 $pageTitle.text('Bookmarks');

                 // Update Sidebar UI
                 $categoryList.find('.list-group-item').removeClass('active');
                 $categoryList.find('[data-category="Todas"]').addClass('active');
                 
                 toggleClearBtn();
                 renderBookmarks();
                 
                 // Clear the input in browser view for next time
                 $(this).val('');
            }
        });

        // Toggle Sidebar (Mobile)
        $('#menu-toggle').click(function(e) {
            e.preventDefault();
            $('body').toggleClass('sb-sidenav-toggled');
        });

        // Main Search Input
        $searchInput.on('keyup', function() {
            searchTerm = $(this).val();
            toggleClearBtn();
            renderBookmarks();
        });

        // Clear Search
        $clearSearchBtn.click(function() {
            $searchInput.val('');
            searchTerm = '';
            toggleClearBtn();
            renderBookmarks();
        });

        function toggleClearBtn() {
            if (searchTerm.length > 0) {
                $clearSearchBtn.show();
            } else {
                $clearSearchBtn.hide();
            }
        }

        // Tag Click (in card)
        $('#bookmarks-container').on('click', '.tag-badge', function(e) {
            e.preventDefault();
            const tagText = $(this).data('tag');
            
            // If we are in browser view for some reason (shouldn't happen based on layout), switch
            switchToMainView();

            $searchInput.val(tagText);
            searchTerm = tagText;
            
            currentCategory = 'Todas';
            $categoryList.find('.list-group-item').removeClass('active');
            $categoryList.find('[data-category="Todas"]').addClass('active');

            toggleClearBtn();
            renderBookmarks();
        });
    }
});