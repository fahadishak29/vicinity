function renderDashboard(container) {
    const activeNeeds = state.needs.filter(n => n.status !== 'Resolved').length;
    const availableVolunteers = state.volunteers.filter(v => v.active).length;
    const matchedToday = state.needs.filter(n => n.status === 'In Progress').length;
    const communitiesCovered = new Set(state.needs.map(n => n.location)).size;

    let html = `
        <div class="animate-fade-in space-y-6">
            <!-- Hero Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4" id="dashboard-hero-stats">
                ${generateDashboardHeroStatsHtml(activeNeeds, availableVolunteers, matchedToday, communitiesCovered)}
            </div>

            <!-- Main Dashboard Area -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Priority Heatmap -->
                <div class="lg:col-span-2 dark-card flex flex-col overflow-hidden">
                    <div class="p-4 border-b border-brand-dark-border flex justify-between items-center bg-brand-dark-panel">
                        <h3 class="font-semibold text-lg text-white flex items-center gap-2">
                            <i class="fa-solid fa-satellite-dish text-brand-amber text-sm"></i> Priority Sector Map
                        </h3>
                        <span class="text-xs text-gray-500 font-mono">LIVE FEED ENCRYPTED</span>
                    </div>
                    <div id="dashboard-map" class="h-[400px] w-full z-0 relative"></div>
                </div>

                <!-- Live Feed & Quick Actions -->
                <div class="flex flex-col gap-6">
                    <!-- Quick Actions -->
                    <div class="dark-card p-5">
                        <h3 class="font-semibold text-white mb-4 uppercase tracking-wider text-sm border-b border-brand-dark-border pb-2">Command Directives</h3>
                        <div class="space-y-3">
                            <button onclick="document.querySelector('[data-view=needs]').click()" class="w-full flex items-center justify-center gap-2 bg-brand-green/20 border border-brand-green text-brand-green-light py-2.5 px-4 rounded-xl hover:bg-brand-green hover:text-white transition-colors shadow-sm font-medium">
                                <i class="fa-solid fa-file-arrow-up"></i> Ingest New Intel
                            </button>
                            <button onclick="document.querySelector('[data-view=volunteers]').click()" class="w-full flex items-center justify-center gap-2 bg-transparent border border-gray-600 text-gray-300 py-2.5 px-4 rounded-xl hover:border-brand-amber hover:text-brand-amber transition-colors font-medium">
                                <i class="fa-solid fa-user-plus"></i> Register Operative
                            </button>
                            <button onclick="document.querySelector('[data-view=match]').click()" class="w-full flex items-center justify-center gap-2 bg-brand-amber text-brand-dark-bg py-2.5 px-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(240,165,0,0.2)] font-bold">
                                <i class="fa-solid fa-bolt"></i> Execute Allocation
                            </button>
                        </div>
                    </div>

                    <!-- Live Feed -->
                    <div class="dark-card flex-1 flex flex-col max-h-[440px] overflow-hidden">
                        <div class="p-4 border-b border-brand-dark-border bg-brand-dark-bg/50">
                            <h3 class="font-semibold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                                <span class="relative flex h-2.5 w-2.5">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></span>
                                </span>
                                Critical Intelligence Intercepts
                            </h3>
                        </div>
                        <div id="dashboard-live-feed" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            ${generateDashboardLiveFeedHtml()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Map Init
    setTimeout(() => {
        initDashboardMap();
    }, 100);
}

function generateDashboardHeroStatsHtml(activeNeeds, availableVolunteers, matchedToday, communitiesCovered) {
    return `
        <div class="dark-card p-6 flex flex-col hover:border-brand-amber transition-colors cursor-pointer relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i class="fa-solid fa-bullseye text-[6rem] text-white"></i>
            </div>
            <span class="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Total Active Operations</span>
            <span class="text-4xl font-heading text-white">${activeNeeds}</span>
        </div>
        <div class="dark-card p-6 flex flex-col hover:border-brand-amber transition-colors cursor-pointer relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i class="fa-solid fa-users text-[6rem] text-brand-amber"></i>
            </div>
            <span class="text-xs text-brand-amber uppercase tracking-wider font-semibold mb-2">Available Operatives</span>
            <span class="text-4xl font-heading text-white">${availableVolunteers}</span>
        </div>
        <div class="dark-card p-6 flex flex-col hover:border-brand-amber transition-colors cursor-pointer relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i class="fa-solid fa-person-running text-[6rem] text-blue-400"></i>
            </div>
            <span class="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-2">Engaged Missions</span>
            <span class="text-4xl font-heading text-white">${matchedToday}</span>
        </div>
        <div class="dark-card p-6 flex flex-col hover:border-brand-amber transition-colors cursor-pointer relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i class="fa-solid fa-map text-[6rem] text-brand-green"></i>
            </div>
            <span class="text-xs text-brand-green-light uppercase tracking-wider font-semibold mb-2">Sectors Secured</span>
            <span class="text-4xl font-heading text-white">${communitiesCovered}</span>
        </div>
    `;
}

function generateDashboardLiveFeedHtml() {
    return state.needs.slice()
        .sort((a,b) => b.urgencyScore - a.urgencyScore)
        .slice(0, 6)
        .map(need => {
            const isCritical = need.urgencyLevel === 'Critical';
            return `
            <div class="p-3 bg-brand-dark-bg border ${isCritical ? 'border-red-500/30 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]' : 'border-brand-dark-border hover:border-brand-amber/50'} rounded-lg transition-colors cursor-pointer group">
                <div class="flex justify-between items-start mb-1.5">
                    <span class="font-semibold ${isCritical ? 'text-red-400' : 'text-brand-amber'} flex items-center gap-1.5 text-sm uppercase tracking-wider">
                        ${need.category} ${isCritical ? '<i class="fa-solid fa-triangle-exclamation animate-pulse"></i>' : ''}
                    </span>
                    <span class="text-[10px] uppercase font-mono text-gray-500 bg-brand-dark-panel px-1.5 py-0.5 rounded">${need.reportedDate}</span>
                </div>
                <p class="text-gray-400 line-clamp-2 text-xs mb-2 group-hover:text-gray-300 transition-colors leading-relaxed">${utils.highlightCriticalTerms(need.description)}</p>
                <div class="flex items-center justify-between text-[11px] font-mono">
                    <span class="text-gray-500"><i class="fa-solid fa-location-crosshairs text-brand-green-light"></i> ${need.location.toUpperCase()}</span>
                    <span class="${isCritical ? 'text-red-400 font-bold' : 'text-brand-amber'}">THREAT Lvl: ${need.urgencyScore}</span>
                </div>
            </div>
        `}).join('');
}

window.updateDashboardData = function() {
    // Clean data updates
    const activeNeeds = state.needs.filter(n => n.status !== 'Resolved').length;
    const availableVolunteers = state.volunteers.filter(v => v.active).length;
    const matchedToday = state.needs.filter(n => n.status === 'In Progress').length;
    const communitiesCovered = new Set(state.needs.map(n => n.location)).size;

    const heroStatsEl = document.getElementById('dashboard-hero-stats');
    if(heroStatsEl) heroStatsEl.innerHTML = generateDashboardHeroStatsHtml(activeNeeds, availableVolunteers, matchedToday, communitiesCovered);

    const liveFeedEl = document.getElementById('dashboard-live-feed');
    if(liveFeedEl) liveFeedEl.innerHTML = generateDashboardLiveFeedHtml();

    if(window.dashboardMapInstance && window.dashboardMapLayers) {
        window.dashboardMapLayers.clearLayers();
        const baseCoords = [12.9716, 77.5946];
        const hqIcon = L.divIcon({
            className: 'hq-marker',
            html: '<div class="w-6 h-6 bg-brand-dark-bg border-2 border-brand-amber rounded-full flex items-center justify-center text-brand-amber shadow-[0_0_15px_rgba(240,165,0,0.8)] animate-pulse relative z-50"><i class="fa-solid fa-tower-broadcast text-[10px]"></i></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        L.marker(baseCoords, { icon: hqIcon, zIndexOffset: 1000 }).addTo(window.dashboardMapLayers)
            .bindPopup('<div class="p-1 font-mono text-[10px] text-brand-amber font-bold text-center">VICINITY HQ</div>', { className: 'dark-popup' });

        if (window.utils && window.utils.SUB_OFFICES) {
            Object.entries(window.utils.SUB_OFFICES).forEach(([name, coords]) => {
                const subIcon = L.divIcon({
                    className: 'suboffice-marker opacity-90',
                    html: '<div class="w-6 h-6 bg-brand-dark-bg border-2 border-brand-amber rounded-full flex items-center justify-center text-brand-amber shadow-[0_0_15px_rgba(240,165,0,0.5)] relative z-50"><i class="fa-solid fa-building-shield text-[10px]"></i></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                L.marker([coords.lat, coords.lng], { icon: subIcon, zIndexOffset: 800 }).addTo(window.dashboardMapLayers)
                    .bindPopup(`<div class="p-1 font-mono text-[10px] text-brand-amber font-bold text-center">SUB-OFFICE<br><span class="text-white text-[8px] uppercase">${name}</span></div>`, { className: 'dark-popup' });
            });
        }

        state.needs.forEach(need => {
            if(need.status === 'Resolved') return;
            if(!need.lat || !need.lng) return; // Prevent Leaflet crash on manual requests without GPS

            let color = '#10b981'; 
            let radius = 6;
            if (need.urgencyLevel === 'Critical') { color = '#ef4444'; radius = 12; }
            else if (need.urgencyLevel === 'High') { color = '#f97316'; radius = 9; }
            else if (need.urgencyLevel === 'Medium') { color = '#eab308'; radius = 7; }

            const circleMarker = L.circleMarker([need.lat, need.lng], {
            radius: radius,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.8,
            fillOpacity: need.urgencyLevel === 'Critical' ? 0.6 : 0.4
        }).addTo(window.dashboardMapLayers);

        const safeId = need.id;

        circleMarker.bindPopup(`
            <div class="p-1 min-w-[150px]">
                <span class="block font-bold text-white text-sm border-b border-brand-dark-border pb-1 mb-1 uppercase tracking-wide">${need.category}</span>
                <span class="block font-mono text-xs mb-1 font-bold" style="color: ${color}">PRIORITY: ${need.urgencyLevel.toUpperCase()}</span>
                <span class="text-xs text-gray-400 block line-clamp-2 mb-1">${need.description}</span>
                <span class="text-[10px] text-brand-green font-mono uppercase">${need.location}</span>
                <button onclick="if(window.analyzeTerrain) window.analyzeTerrain('${safeId}', ${need.lat}, ${need.lng}); else alert('Uplink missing');" id="btn-terrain-${safeId}" class="mt-2 w-full bg-brand-dark-bg border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-[9px] py-1 rounded font-mono uppercase transition-colors tracking-widest font-bold flex items-center justify-center gap-1">
                    <i class="fa-solid fa-satellite"></i> Scan Topo
                </button>
                <div id="terrain-result-${safeId}" class="mt-1 hidden flex-col gap-1 font-mono"></div>
            </div>
        `);

        // Draw Real-Time Road Route Vector ONLY for In-Progress needs!
        if (need.status === 'In Progress' && need.assignedTo) {
            const assignedVol = state.volunteers.find(v => v.id === need.assignedTo);
            let startCoords = baseCoords;
            if (assignedVol) {
                const locationName = (assignedVol.location || "").split(' (')[0].trim();
                const subOffice = window.utils && window.utils.SUB_OFFICES ? window.utils.SUB_OFFICES[locationName] : null;
                if (assignedVol.lat && assignedVol.lng) startCoords = [assignedVol.lat, assignedVol.lng];
                else if (subOffice) startCoords = [subOffice.lat, subOffice.lng];
            }
            
            const routeColor = '#EF4444'; // Tactical Red line

            const startLng = startCoords[1];
            const startLat = startCoords[0];
            const destLng = need.lng;
            const destLat = need.lat;

            if (startLat && startLng && destLat && destLng) {
                const routeLayer = L.polyline([[startLat, startLng], [destLat, destLng]], { color: routeColor, weight: 3, opacity: 0.8, dashArray: '8, 8' }).addTo(window.dashboardMapLayers);

                fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`)
                .then(res => res.json())
                .then(data => {
                    if(data.routes && data.routes[0]) {
                        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                        routeLayer.setLatLngs(coords);
                        const el = routeLayer.getElement();
                        if (el) el.classList.add('anim-route-line');
                    }
                }).catch(e => console.error("OSRM route fetch failed on dashboard map", e));
            }
        }
    });
    }
};

function initDashboardMap() {
    const mapEl = document.getElementById('dashboard-map');
    if (!mapEl) return;

    const bounds = [
        [6.7535, 68.1623],
        [35.5087, 97.3955]
    ];

    const baseCoords = [12.9716, 77.5946];
    const map = L.map('dashboard-map', { 
        zoomControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        minZoom: 4
    }).setView(baseCoords, 6);
    
    window.dashboardMapInstance = map;
    window.dashboardMapLayers = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    window.updateDashboardData();
}
