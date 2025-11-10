
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    let allBookmarks = [];
    let allIcons = {};
    let categoryIconMapping = {};

    const categoryColors = {
        'Inspirasi': 'bg-blue-500 text-white', 'Artikel': 'bg-green-500 text-white',
        'Inteligencia Artificial': 'bg-purple-500 text-white', 'Programación': 'bg-pink-500 text-white',
        'Herramientas Web': 'bg-yellow-500 text-gray-900', 'Formación': 'bg-indigo-500 text-white',
        'Resources': 'bg-gray-500 text-white', 'Tools': 'bg-red-500 text-white',
        'Video': 'bg-orange-500 text-white', 'Portfolio': 'bg-teal-500 text-white',
        'Quotes': 'bg-cyan-500 text-white',
    };

    const getInitials = (name) => name.charAt(0).toUpperCase();
    const companyToColor = (company) => {
        const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];
        let hash = 0;
        for (let i = 0; i < company.length; i++) {
            hash = company.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash % colors.length)];
    }

    const renderSidebar = (currentParams) => {
        const path = location.hash.substring(2).split('?')[0];
        const selectedCategory = currentParams.get('category') || 'Todos';

        const uniqueCategories = [...new Set(allBookmarks.map(b => b.categoria))].sort();
        const categoriesForSidebar = ['Todos', ...uniqueCategories];

        const categoryLinks = categoriesForSidebar.map(name => {
            const iconName = categoryIconMapping[name] || categoryIconMapping.default || 'FolderIcon';
            const icon = allIcons[iconName] || allIcons['FolderIcon'] || '';
            const href = name === 'Todos' ? '#/' : `#/category=${encodeURIComponent(name)}`;
            const isActive = path !== 'tags' && selectedCategory === name;
            const activeClass = isActive ? 'bg-[#6D28D9] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white';
            return `
                <a href="${href}" data-category="${name}" class="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 ${activeClass}">
                    ${icon}
                    <span>${name}</span>
                </a>`;
        }).join('');
        
        const tagsLinkActiveClass = path === 'tags' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white';

        sidebar.innerHTML = `
            <h2 class="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-6">Category</h2>
            <nav class="flex flex-col space-y-2">${categoryLinks}</nav>
            <div class="mt-auto">
                <a href="#/tags" class="flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 ${tagsLinkActiveClass}">
                    ${allIcons.TagsIcon || ''}
                    <span>Browse Tags</span>
                </a>
            </div>`;
    };

    const renderBookmarkCard = (bookmark) => {
        const { nombre_web, empresa, url, descripcion, categoria, tags } = bookmark;
        const color = companyToColor(empresa);
        const tagButtons = tags.map(tag =>
            `<button data-tag="${tag}" class="bg-gray-700/50 text-gray-300 text-xs px-2.5 py-1 rounded-full hover:bg-gray-600/70 transition-colors">${tag}</button>`
        ).join('');

        return `
            <div class="py-6 border-b border-white/10 flex items-start space-x-6">
                <div class="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-2xl" style="background-color: ${color};">
                    ${getInitials(empresa)}
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <div>
                            <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-white font-bold text-xl hover:underline">${nombre_web}</a>
                            <p class="text-sm text-gray-400 uppercase tracking-wider">${empresa}</p>
                        </div>
                        <span class="text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[categoria] || 'bg-gray-600 text-white'}">${categoria}</span>
                    </div>
                    <p class="mt-3 text-gray-300">${descripcion}</p>
                    <div class="mt-4 flex flex-wrap gap-2">${tagButtons}</div>
                </div>
            </div>`;
    };

    const renderBookmarksPage = (currentParams) => {
        const selectedCategory = currentParams.get('category') || 'Todos';
        const selectedTag = currentParams.get('tag');
        const searchTerm = currentParams.get('search') || '';

        const filteredBookmarks = allBookmarks
            .filter(b => selectedCategory === 'Todos' || b.categoria === selectedCategory)
            .filter(b => !selectedTag || b.tags.includes(selectedTag))
            .filter(b => {
                if (!searchTerm) return true;
                const lowerTerm = searchTerm.toLowerCase();
                return b.nombre_web.toLowerCase().includes(lowerTerm) ||
                       b.descripcion.toLowerCase().includes(lowerTerm) ||
                       b.tags.some(t => t.toLowerCase().includes(lowerTerm));
            });
        
        const bookmarksHtml = filteredBookmarks.length > 0
            ? filteredBookmarks.map(renderBookmarkCard).join('')
            : `<div class="flex flex-col items-center justify-center h-full text-center text-gray-400">
                   <svg class="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <h3 class="text-xl font-semibold text-white">No Bookmarks Found</h3>
                   <p class="mt-1">Try adjusting your search or filters.</p>
                   <a href="#/" class="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">Clear Filters</a>
               </div>`;

        mainContent.innerHTML = `
            <div class="p-8 md:p-12 h-full flex flex-col">
                <header class="mb-8">
                    <div class="flex justify-between items-center">
                        <h1 class="text-5xl font-bold text-white">Bookmarks</h1>
                        <form id="search-form" class="relative">
                            <input id="search-input" type="text" placeholder="Search bookmarks..." value="${searchTerm}" class="bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-4 w-72 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            <button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </form>
                    </div>
                    ${(selectedTag || searchTerm) ? `
                    <div class="mt-4 flex items-center gap-4">
                        ${selectedTag ? `<span class="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">Tag: ${selectedTag}<button data-tag="${selectedTag}" class="text-white/70 hover:text-white">&times;</button></span>` : ''}
                        <a href="#/" class="text-sm text-gray-400 hover:text-white hover:underline">Clear all filters</a>
                    </div>` : ''}
                </header>
                <div class="flex-1 overflow-y-auto -mr-8 pr-8">${bookmarksHtml}</div>
            </div>`;
    };

    const renderAllTagsPage = () => {
        const categories = [...new Set(allBookmarks.map(b => b.categoria))].sort();
        const tags = [...new Set(allBookmarks.flatMap(b => b.tags))].sort();

        mainContent.innerHTML = `
            <div class="p-8 md:p-12 text-white">
                <div class="flex items-center mb-10">
                    <button id="back-button" class="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h1 class="text-5xl font-bold">All Categories & Tags</h1>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h2 class="text-3xl font-semibold mb-6 border-b-2 border-purple-500 pb-2">Categories</h2>
                        <div class="flex flex-wrap gap-3">
                            ${categories.map(c => `<a href="#/category=${encodeURIComponent(c)}" class="bg-gray-700 text-gray-200 text-base px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-colors cursor-pointer">${c}</a>`).join('')}
                        </div>
                    </div>
                    <div>
                        <h2 class="text-3xl font-semibold mb-6 border-b-2 border-cyan-500 pb-2">Tags</h2>
                        <div class="flex flex-wrap gap-2">
                            ${tags.map(t => `<a href="#/tag=${encodeURIComponent(t)}" class="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-full hover:bg-cyan-600 hover:text-white transition-colors cursor-pointer">${t}</a>`).join('')}
                        </div>
                    </div>
                </div>
            </div>`;
    };

    const router = () => {
        const hash = location.hash || '#/';
        const [path, paramsStr] = hash.substring(2).split('?');
        const params = new URLSearchParams(paramsStr || (path.includes('=') ? path : ''));
        
        renderSidebar(params);

        if (path === 'tags') {
            renderAllTagsPage();
        } else {
            renderBookmarksPage(params);
        }
    };
    
    // Event delegation for clicks
    document.body.addEventListener('click', e => {
        const backButton = e.target.closest('#back-button');
        if (backButton) {
            history.back();
            return;
        }

        const anchor = e.target.closest('a');
        if (anchor && anchor.hash.startsWith('#/')) {
            location.hash = anchor.hash;
            return;
        }

        const tagButton = e.target.closest('[data-tag]');
        if (tagButton) {
            const tag = tagButton.dataset.tag;
            const params = new URLSearchParams(location.hash.split('?')[1] || '');
            const currentTag = params.get('tag');

            if (currentTag === tag) {
                params.delete('tag');
            } else {
                params.set('tag', tag);
                params.delete('category'); 
            }
            location.hash = `#/?${params.toString()}`;
        }
    });

    // Event delegation for search form submission
    mainContent.addEventListener('submit', e => {
        if (e.target.id === 'search-form') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            const params = new URLSearchParams(location.hash.split('?')[1] || '');
            const searchTerm = searchInput.value.trim();

            if (searchTerm) {
                params.set('search', searchTerm);
            } else {
                params.delete('search');
            }
            location.hash = `#/?${params.toString()}`;
        }
    });


    const init = async () => {
        try {
            const [bookmarksRes, iconsRes, categoryIconsRes] = await Promise.all([
                fetch('./data/bookmarks.json'),
                fetch('./data/icons.json'),
                fetch('./data/category_icons.json')
            ]);

            if (!bookmarksRes.ok || !iconsRes.ok || !categoryIconsRes.ok) {
                throw new Error('Failed to load initial data files.');
            }

            allBookmarks = await bookmarksRes.json();
            allIcons = await iconsRes.json();
            categoryIconMapping = await categoryIconsRes.json();

            window.addEventListener('hashchange', router);
            router();
        } catch (error) {
            mainContent.innerHTML = `<div class="p-8 text-center text-red-400"><h2>Error loading bookmarks</h2><p>${error.message}</p></div>`;
            console.error('Failed to initialize app:', error);
        }
    };

    init();
});
