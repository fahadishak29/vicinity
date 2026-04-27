function renderCommunityMap(container) {
    let html = `
        <div class="animate-fade-in flex flex-col h-[calc(100vh-140px)]">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b border-brand-dark-border pb-4">
                <div>
                    <h2 class="text-2xl font-heading text-white tracking-wide">Tactical Map</h2>
                    <p class="text-brand-green-light text-sm font-mono tracking-widest uppercase">Global Surveillance Engine</p>
                </div>
                <div class="flex gap-3">
                    <button class="bg-brand-dark-panel border border-brand-dark-border text-gray-300 px-4 py-2 rounded-lg text-xs hover:border-brand-amber hover:text-brand-amber transition-colors font-mono tracking-wide font-bold shadow-[inset_0_0_10px_rgba(37,48,61,0.5)]">
                        <i class="fa-solid fa-filter mr-1"></i> APPLY FILTERS
                    </button>
                    <button class="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-xs hover:bg-red-500/20 hover:border-red-400 transition-colors font-mono font-bold tracking-wide shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                        <i class="fa-solid fa-triangle-exclamation mr-1"></i> CRITICAL OVERLAY
                    </button>
                </div>
            </div>
            
            <div class="flex-1 dark-card overflow-hidden relative border border-brand-dark-border shadow-2xl z-0 rounded-xl">
                <!-- Map UI Legend -->
                <div class="absolute top-4 left-4 z-[400] bg-brand-dark-bg/90 backdrop-blur-md border border-brand-dark-border p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-none">
                    <div class="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono mb-3 border-b border-brand-dark-border pb-1">Asset Legend</div>
                    <div class="space-y-2.5">
                        <div class="flex items-center gap-3 text-xs text-white font-medium"><div class="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-white/20"></div> Critical Target (L1)</div>
                        <div class="flex items-center gap-3 text-xs text-gray-300"><div class="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)] opacity-90"></div> High Priority (L2)</div>
                        <div class="flex items-center gap-3 text-xs text-gray-400"><div class="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80"></div> Medium (L3)</div>
                        <div class="flex items-center gap-3 text-xs text-brand-green-light"><div class="w-2 h-2 rounded-full bg-brand-green opacity-70"></div> Low Priority</div>
                    </div>
                </div>
                
                <div class="absolute top-4 right-4 z-[400] bg-brand-amber/10 backdrop-blur-sm border border-brand-amber/30 text-brand-amber px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(240,165,0,0.15)] animate-pulse">
                    LINK ESTABLISHED
                </div>

                <div id="community-map" class="w-full h-full z-0 relative bg-brand-dark-bg"></div>
            </div>
        </div>
    `;
    container.innerHTML = html;

    setTimeout(() => {
        const mapEl = document.getElementById('community-map');
        if (!mapEl) return;
        
        const baseCoords = [12.9716, 77.5946];
        const map = L.map('community-map', {
            zoomControl: false,
            minZoom: 2
        }).setView(baseCoords, 6);
        
        window.communityMapInstance = map;
        window.communityMapLayers = L.layerGroup().addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20,
            className: 'map-tiles-dark'
        }).addTo(map);

        window.updateCommunityMapMarkers();
    }, 100);
}

window.updateCommunityMapMarkers = function() {
    if (!window.communityMapInstance || !window.communityMapLayers) return;
    
    // Clear dynamic layers
    window.communityMapLayers.clearLayers();
    
    const baseCoords = [12.9716, 77.5946];

    // Render HQ
    const hqIcon = L.divIcon({
        className: 'hq-marker',
        html: '<div class="w-10 h-10 bg-brand-dark-bg border-2 border-brand-amber rounded-full flex items-center justify-center text-brand-amber shadow-[0_0_30px_rgba(240,165,0,0.8)] animate-pulse relative z-50"><i class="fa-solid fa-tower-broadcast text-lg"></i></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
    L.marker(baseCoords, { icon: hqIcon, zIndexOffset: 1000 }).addTo(window.communityMapLayers)
        .bindPopup('<div class="p-2 font-mono text-xs text-brand-amber font-bold text-center">VICINITY COMMAND<br><span class="text-white text-[10px]">Bengaluru HQ</span></div>', { className: 'dark-popup' });

    // Render Sub-Offices
    if (window.utils && window.utils.SUB_OFFICES) {
        Object.entries(window.utils.SUB_OFFICES).forEach(([name, coords]) => {
            const subIcon = L.divIcon({
                className: 'suboffice-marker opacity-90',
                html: '<div class="w-10 h-10 bg-brand-dark-bg border-2 border-brand-amber rounded-full flex items-center justify-center text-brand-amber shadow-[0_0_20px_rgba(240,165,0,0.5)] relative z-50"><i class="fa-solid fa-building-shield text-lg"></i></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            L.marker([coords.lat, coords.lng], { icon: subIcon, zIndexOffset: 800 }).addTo(window.communityMapLayers)
                .bindPopup(`<div class="p-1.5 font-mono text-xs text-brand-amber font-bold text-center">SUB-OFFICE<br><span class="text-white text-[10px] uppercase">${name}</span></div>`, { className: 'dark-popup' });
        });
    }

    state.needs.forEach(need => {
        if(need.status === 'Resolved') return;

        let color = '#10b981'; // green line
        let radius = 6;
        let fillOp = 0.5;
        
        if (need.urgencyLevel === 'Critical') { color = '#ef4444'; radius = 14; fillOp = 0.7; }
        else if (need.urgencyLevel === 'High') { color = '#f97316'; radius = 10; fillOp = 0.6; }
        else if (need.urgencyLevel === 'Medium') { color = '#eab308'; radius = 8; }

        const circleMarker = L.circleMarker([need.lat, need.lng], {
            radius: radius,
            fillColor: color,
            color: color,
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: fillOp
        }).addTo(window.communityMapLayers);

        const safeId = need.id;

        circleMarker.bindPopup(`
            <div class="p-1 min-w-[200px] bg-brand-dark-panel">
                <span class="block font-bold text-white text-xs border-b border-brand-dark-border pb-1.5 mb-1.5 uppercase tracking-wide flex items-center gap-2">
                    <i class="fa-solid fa-crosshairs text-brand-amber"></i> ${need.category}
                </span>
                <span class="block font-mono text-[10px] mb-2 font-bold bg-brand-dark-bg px-2 py-1 rounded" style="color: ${color}">PRIO: ${need.urgencyLevel.toUpperCase()} | SCORE: ${need.urgencyScore}</span>
                <span class="text-[11px] text-gray-300 block line-clamp-3 mb-2 leading-relaxed">${need.description}</span>
                ${need.aiReconIntel ? (typeof need.aiReconIntel === 'object' ? `
                <div class="mt-2 bg-brand-dark-bg border border-brand-dark-border rounded p-2 mb-2">
                    <div class="text-[9px] font-black tracking-widest uppercase text-purple-400 mb-2 border-b border-brand-dark-border pb-1 flex items-center justify-between"><span class="flex items-center gap-1.5"><i class="fa-solid fa-camera-retro"></i> AI VISION RECON</span> <i class="fa-solid fa-satellite-dish text-[8px] animate-pulse"></i></div>
                    ${need.aiReconImage ? `<img src="${need.aiReconImage}" class="w-full h-24 object-cover rounded mb-2 border border-purple-500/30 opacity-90">` : ''}
                    ${need.aiReconIntel.keywords && need.aiReconIntel.keywords.length > 0 ? `
                    <div class="flex flex-wrap gap-1 mb-2">
                        ${need.aiReconIntel.keywords.map(k => `<span class="bg-purple-600/30 text-purple-200 border border-purple-500/60 px-1.5 py-0.5 rounded-sm text-[8px] font-bold tracking-widest uppercase"><i class="fa-solid fa-tag opacity-70"></i> ${k}</span>`).join('')}
                    </div>
                    ` : ''}
                    <div class="text-[10px] text-gray-300 font-mono leading-tight space-y-2">
                        <div>
                            <span class="text-red-400 font-bold block mb-0.5"><i class="fa-solid fa-fire"></i> Damages</span>
                            ${(need.aiReconIntel.damages || []).map(d => `<p class="border-l border-red-500/50 pl-1.5 py-0.5 mt-1">${d.replace(/\*\*(.*?)\*\*/g, '<span class="text-red-300 font-bold bg-red-900/40 px-1 mx-0.5 rounded border border-red-500/30">$1</span>').replace(/\*/g, '')}</p>`).join('')}
                        </div>
                        <div class="mt-2 text-[10.5px]">
                            <span class="text-brand-green-light font-bold block mb-0.5"><i class="fa-solid fa-truck-medical"></i> Solutions</span>
                            ${(need.aiReconIntel.solutions || []).map(s => `<p class="border-l border-brand-green/50 pl-1.5 py-0.5 mt-1">${s.replace(/\*\*(.*?)\*\*/g, '<span class="text-brand-green font-bold bg-brand-green/20 px-1 mx-0.5 rounded border border-brand-green/30">$1</span>').replace(/\*/g, '')}</p>`).join('')}
                        </div>
                    </div>
                </div>` : `
                <div class="mt-2 bg-purple-900/20 border border-purple-500/30 rounded p-2 mb-2">
                    <div class="text-[9px] font-black tracking-widest uppercase text-purple-400 mb-1 flex items-center gap-1.5"><i class="fa-solid fa-camera-retro"></i> AI VISION RECON</div>
                    <div class="text-[10px] text-gray-300 font-mono leading-tight space-y-1">
                        ${String(need.aiReconIntel).split('\\n').filter(l=>l.trim()!=='').map(l => `<p class="border-l border-purple-500/40 pl-1.5 py-0.5 mt-1">${l.replace(/\*\*(.*?)\*\*/g, '<span class="text-white font-bold bg-purple-500/40 px-1 rounded">$1</span>').replace(/\*/g, '')}</p>`).join('')}
                    </div>
                </div>`) : ''}
                <div class="text-[9px] text-brand-green-light font-mono uppercase border-t border-brand-dark-border pt-2 mt-1 flex flex-col gap-1">
                    <span>COORD: ${need.lat.toFixed(4)}, ${need.lng.toFixed(4)}</span>
                    <span>ZONE: ${need.location}</span>
                </div>
                <button onclick="window.analyzeTerrain('${safeId}', ${need.lat}, ${need.lng})" id="btn-terrain-${safeId}" class="mt-2 w-full bg-brand-dark-bg border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-[9px] py-1.5 rounded font-mono uppercase transition-colors tracking-widest font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)] flex items-center justify-center gap-1">
                    <i class="fa-solid fa-satellite"></i> Scan Topography
                </button>
                <div id="terrain-result-${safeId}" class="mt-1.5 hidden flex-col gap-1 font-mono"></div>
            </div>
        `, { className: 'dark-popup' });

        // Draw Real-Time Road Route Vector ONLY for In-Progress needs!
        if (need.status === 'In Progress' && need.assignedTo) {
            const assignedVol = state.volunteers.find(v => v.id === need.assignedTo);
            const volIdx = state.volunteers.findIndex(v => v.id === need.assignedTo);
            let startCoords = baseCoords;
            if (assignedVol) {
                const locationName = (assignedVol.location || "").split(' (')[0].trim();
                const subOffice = window.utils && window.utils.SUB_OFFICES ? window.utils.SUB_OFFICES[locationName] : null;
                let anchorCoords = baseCoords;
                if (subOffice) anchorCoords = [subOffice.lat, subOffice.lng];
                
                const vLat = assignedVol.lat || (anchorCoords[0] + (Math.sin(volIdx * 7) * 0.005));
                const vLng = assignedVol.lng || (anchorCoords[1] + (Math.cos(volIdx * 7) * 0.005));
                startCoords = [vLat, vLng];
            }
            
            const routeColor = '#EF4444'; // Tactical Red line

            // Fetch explicit route from OSRM to bind nicely to the layer group
            const startLng = startCoords[1];
            const startLat = startCoords[0];
            const destLng = need.lng;
            const destLat = need.lat;

            const routeLayer = L.polyline([[startLat, startLng], [destLat, destLng]], { color: routeColor, weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(window.communityMapLayers);

            fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`)
            .then(res => res.json())
            .then(data => {
                if(data.routes && data.routes[0]) {
                    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    routeLayer.setLatLngs(coords);
                    routeLayer.getElement().classList.add('anim-route-line');
                }
            }).catch(e => console.error("OSRM route fetch failed on admin map", e));
        }
    });

    if (state.volunteers) {
        state.volunteers.forEach((vol, idx) => {
            if(!vol.active) return;
            
            const locationName = (vol.location || "").split(' (')[0].trim();
            const subOffice = window.utils && window.utils.SUB_OFFICES ? window.utils.SUB_OFFICES[locationName] : null;
            let anchorCoords = baseCoords;
            if (subOffice) anchorCoords = [subOffice.lat, subOffice.lng];

            const vLat = vol.lat || (anchorCoords[0] + (Math.sin(idx * 7) * 0.005));
            const vLng = vol.lng || (anchorCoords[1] + (Math.cos(idx * 7) * 0.005));
            const initials = vol.name ? vol.name.substring(0, 2).toUpperCase() : 'OP';

            const volIcon = L.divIcon({
                className: 'volunteer-marker',
                html: `<div class="w-10 h-10 bg-brand-dark-bg border border-brand-green-light rounded-xl flex items-center justify-center text-brand-green-light shadow-[0_0_20px_rgba(43,95,84,0.4)] relative z-50 overflow-hidden transform hover:scale-110 transition-transform cursor-pointer">
                           <div class="absolute inset-0 bg-brand-green-light/10"></div>
                           <span class="font-heading font-bold text-sm leading-none pl-[1px] tracking-wider">${initials}</span>
                           <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-green-light rounded-full border border-brand-dark-bg flex items-center justify-center">
                               <i class="fa-solid fa-check text-[6px] text-brand-dark-bg"></i>
                           </div>
                       </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            L.marker([vLat, vLng], { icon: volIcon }).addTo(window.communityMapLayers)
                .bindPopup(`
                    <div class="p-2 min-w-[180px] bg-brand-dark-panel">
                        <span class="block font-bold text-white text-xs border-b border-brand-dark-border pb-1.5 mb-1.5 uppercase tracking-wide flex items-center gap-2">
                            <i class="fa-solid fa-person-military-pointing text-brand-green-light"></i> ${vol.name || 'Unknown Operative'}
                        </span>
                        <span class="block font-mono text-[10px] mb-1 font-bold text-gray-400">ID: ${(vol.id || '').substring(0,8)}</span>
                        <span class="block text-[10px] text-brand-amber font-mono font-bold">${vol.location || 'Deployed in Field'}</span>
                        <div class="mt-2 text-[9px] text-brand-green-light font-mono uppercase bg-brand-green/20 px-2 py-1 rounded border border-brand-green/30 flex justify-between items-center">
                            <span>STATUS: ACTIVE</span>
                            <span id="tsp-dist-${vol.id}" class="text-white hidden"></span>
                        </div>
                        <div class="flex flex-col gap-1.5 mt-2">
                            <button onclick="window.generateTacticalVector('${vol.id}', ${vLat}, ${vLng})" id="btn-tsp-${vol.id}" class="w-full bg-brand-dark-bg border border-brand-amber/50 text-brand-amber hover:bg-brand-amber/10 text-[9px] py-1.5 rounded font-mono uppercase transition-colors tracking-widest font-bold shadow-[0_0_10px_rgba(240,165,0,0.1)] flex items-center justify-center gap-1">
                                <i class="fa-solid fa-route"></i> Auto-Vector Route
                            </button>
                            <button onclick="window.generateAITraumaVector('${vol.id}', ${vLat}, ${vLng})" id="btn-ai-${vol.id}" class="w-full bg-purple-600/20 border border-purple-500/50 text-purple-400 hover:bg-purple-600/40 text-[9px] py-1.5 rounded font-mono uppercase transition-colors tracking-widest font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center gap-1 relative overflow-hidden group">
                                <div class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                <i class="fa-solid fa-microchip relative"><span class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white glow rounded-full animate-ping"></span></i> AI Priority Route
                            </button>
                        </div>
                    </div>
                `, { className: 'dark-popup' });
        });
    }

    // Auto-center map on all active markers (using requestAnimationFrame to ensure smooth rendering)
    requestAnimationFrame(() => {
        const layers = window.communityMapLayers.getLayers();
        if (layers.length > 0) {
            const group = L.featureGroup(layers);
            if (group.getBounds().isValid()) {
                window.communityMapInstance.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 16 });
            }
        }
    });
};

window.analyzeTerrain = async function(id, lat, lng) {
    const btn = document.getElementById(`btn-terrain-${id}`);
    const resBox = document.getElementById(`terrain-result-${id}`);
    
    if(!btn || !resBox) return;
    
    btn.innerHTML = '<i class="fa-solid fa-satellite fa-spin"></i> Uplink Active...';
    btn.classList.add('opacity-70', 'cursor-wait');
    resBox.classList.remove('hidden');
    resBox.innerHTML = '<div class="text-[9px] text-gray-400 text-center py-2 animate-pulse">QUERYING ORBITAL SENSORS...</div>';
    
    try {
        // Fetch Elevation
        const elevationProm = fetch(`https://api.opentopodata.org/v1/srtm90m?locations=${lat},${lng}`).then(r => r.json());
        // Fetch Surface Weather
        const weatherProm = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`).then(r => r.json());
        
        const [elevData, weatherData] = await Promise.all([elevationProm, weatherProm].map(p => p.catch(e => null)));
        
        let altitudeInfo = 'UNKN';
        if(elevData && elevData.results && elevData.results[0] && elevData.results[0].elevation !== null) {
            const elevM = Math.round(elevData.results[0].elevation);
            altitudeInfo = `${elevM}m MSL`;
        }

        let envInfo = 'SENSOR OFFLINE';
        let windStr = 'N/A';
        if(weatherData && weatherData.current_weather) {
            const cw = weatherData.current_weather;
            const wmoCodes = {0: 'Clear conditions', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast limit', 45:'Fog reduced vis', 48:'Depositing rime fog', 51:'Light drizzle', 53:'Mod drizzle', 55:'Dense drizzle', 61:'Slight rain', 63:'Mod rain', 65:'Heavy rain', 71:'Slight snow', 73:'Mod snow', 75:'Heavy snow', 95:'Thunderstorm hazard'};
            const codeStr = wmoCodes[cw.weathercode] || 'Unstable atmos';
            envInfo = `${cw.temperature}°C, ${codeStr}`;
            windStr = `${cw.windspeed}km/h @ ${cw.winddirection}°`;
        }

        resBox.innerHTML = `
            <div class="bg-[#0f172a] border border-blue-500/20 p-1.5 rounded text-[10px] text-gray-300">
                <div class="flex justify-between border-b border-blue-500/10 mb-1 pb-1">
                    <span class="text-blue-400">ALTITUDE</span>
                    <span class="font-bold">${altitudeInfo}</span>
                </div>
                <div class="flex justify-between border-b border-blue-500/10 mb-1 pb-1">
                    <span class="text-blue-400">ATMOSPHERE</span>
                    <span class="font-bold text-right">${envInfo}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-blue-400">WIND VECTOR</span>
                    <span class="font-bold">${windStr}</span>
                </div>
            </div>
            <button onclick="window.communityMapInstance.flyTo([${lat},${lng}], 16, {duration: 1.5})" class="w-full bg-blue-600/20 text-blue-400 hover:text-white border border-blue-500/30 text-[9px] py-1 rounded transition-colors uppercase mt-1">
                <i class="fa-solid fa-magnifying-glass-location"></i> Engage Zoom
            </button>
        `;
        
        btn.innerHTML = '<i class="fa-solid fa-check"></i> SCAN COMPLETE';
        btn.classList.remove('opacity-70', 'cursor-wait');
        btn.classList.add('border-brand-green', 'text-brand-green');
        
    } catch(err) {
        resBox.innerHTML = '<div class="text-[9px] text-red-400 text-center py-1">UPLINK FAILED</div>';
        btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> RETRY SCAN';
        btn.classList.remove('opacity-70', 'cursor-wait');
    }
};

window.generateTacticalVector = async function(volId, vLat, vLng) {
    const btn = document.getElementById(`btn-tsp-${volId}`);
    if(!btn) return;
    
    btn.innerHTML = '<i class="fa-solid fa-microchip fa-spin"></i> Clustering...';
    btn.disabled = true;
    
    // 1. Density Clustering: Find exactly the 5 closest OPEN nodes to this operative using Haversine approximations.
    const openNodes = state.needs.filter(n => n.status !== 'Resolved' && typeof n.lat === 'number' && typeof n.lng === 'number');
    
    if(openNodes.length === 0) {
        btn.innerHTML = '<i class="fa-solid fa-ban"></i> No Active Ops';
        return;
    }

    const dist = (lat1, lng1, lat2, lng2) => Math.sqrt(Math.pow(lat1-lat2, 2) + Math.pow(lng1-lng2, 2));
    const sortedNodes = openNodes.sort((a,b) => dist(vLat,vLng, a.lat,a.lng) - dist(vLat,vLng, b.lat,b.lng)).slice(0, 5);
    
    // 2. VicinityTSP Mathematical Solver (Travelling Salesman via Brute Force Permutation for N=5)
    // Complexity O(N!) runs in <1ms for 5 nodes on modern V8 Javascript engines.
    btn.innerHTML = '<i class="fa-solid fa-network-wired"></i> Calculating Vector...';
    
    function calculateTotalDistance(sequence) {
        let pathDist = 0;
        let curr = { lat: vLat, lng: vLng };
        for(let node of sequence) {
            pathDist += dist(curr.lat, curr.lng, node.lat, node.lng);
            curr = node;
        }
        return pathDist;
    }

    function permutate(arr) {
        if (arr.length <= 1) return [arr];
        let permutations = [];
        for (let i = 0; i < arr.length; i++) {
            let current = arr[i];
            let remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            let remainingPerms = permutate(remaining);
            for (let j = 0; j < remainingPerms.length; j++) {
                permutations.push([current].concat(remainingPerms[j]));
            }
        }
        return permutations;
    }

    const allRoutes = permutate(sortedNodes);
    let bestRoute = null;
    let shortestDist = Infinity;

    for (const sequence of allRoutes) {
        const d = calculateTotalDistance(sequence);
        if (d < shortestDist) {
            shortestDist = d;
            bestRoute = sequence;
        }
    }

    // 3. Render exact road geometries via OSRM API using the mathematically solved sequence!
    btn.innerHTML = '<i class="fa-solid fa-satellite-dish fa-spin"></i> Tracing Roads...';
    
    const coordString = [`${vLng},${vLat}`, ...bestRoute.map(n => `${n.lng},${n.lat}`)].join(';');
    try {
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`);
        const osrmData = await osrmRes.json();
        
        if(osrmData.routes && osrmData.routes.length > 0) {
            const geoJsonCoords = osrmData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            const tripDistKm = (osrmData.routes[0].distance / 1000).toFixed(1);
            
            // Draw visually striking dynamic tactical line
            const routeLine = L.polyline(geoJsonCoords, {
                color: '#F0A500', 
                weight: 5, 
                opacity: 0.9, 
                dashArray: '10, 10'
            }).addTo(window.communityMapLayers);
            
            routeLine.getElement().classList.add('anim-route-line');
            
            // Draw numerical Waypoint markers
            bestRoute.forEach((node, idx) => {
                const wpIcon = L.divIcon({
                    className: 'waypoint-marker',
                    html: `<div class="w-6 h-6 bg-brand-amber border-2 border-brand-dark-bg text-brand-dark-bg rounded-full flex flex-col items-center justify-center font-bold text-[10px] shadow-[0_0_15px_rgba(240,165,0,0.8)] z-[600]">${idx + 1}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                L.marker([node.lat, node.lng], { icon: wpIcon, zIndexOffset: 2000 }).addTo(window.communityMapLayers);
                
                // Assign internally (silently update Firebase if needed, but for now just visual)
                if(node.status !== 'In Progress') {
                    window.fsCore.updateDoc(window.fsCore.doc(window.db, "needs", node.id), {
                        status: 'In Progress',
                        assignedTo: volId
                    }).catch(e => console.error("Auto-assign failed", e));
                }
            });

            btn.innerHTML = '<i class="fa-solid fa-check"></i> TS ROUTE LOCKED';
            btn.classList.replace('text-brand-amber', 'text-brand-green');
            btn.classList.replace('border-brand-amber/50', 'border-brand-green/50');
            
            const distLabel = document.getElementById(`tsp-dist-${volId}`);
            if(distLabel) {
                distLabel.classList.remove('hidden');
                distLabel.innerHTML = `<span class="text-brand-amber px-1 rounded bg-brand-dark-bg border border-brand-amber/30">${tripDistKm} KM ROUTE</span>`;
            }
        }
    } catch(err) {
        console.error("OSRM Route Failed:", err);
        btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ROUTING FAILED';
    }
};

window.generateAITraumaVector = async function(volId, vLat, vLng) {
    const btn = document.getElementById(`btn-ai-${volId}`);
    if(!btn) return;
    
    btn.innerHTML = '<i class="fa-solid fa-microchip fa-spin"></i> Triage Protocol...';
    btn.disabled = true;
    
    const openNodes = window.state.needs.filter(n => n.status !== 'Resolved' && typeof n.lat === 'number' && typeof n.lng === 'number');
    
    if(openNodes.length === 0) {
        btn.innerHTML = '<i class="fa-solid fa-ban"></i> No Active Ops';
        return;
    }

    const dist = (lat1, lng1, lat2, lng2) => Math.sqrt(Math.pow(lat1-lat2, 2) + Math.pow(lng1-lng2, 2));
    const sortedNodes = openNodes.sort((a,b) => dist(vLat,vLng, a.lat,a.lng) - dist(vLat,vLng, b.lat,b.lng)).slice(0, 5);
    
    btn.innerHTML = '<i class="fa-solid fa-satellite-dish fa-spin"></i> Linking Gemini...';

    const payload = sortedNodes.map(n => `ID: "${n.id}" | ThreatLevel: ${n.urgencyScore} | Type: ${n.category} | Desc: ${n.description}`).join('\n');
    
    const prompt = `You are a Chief Medical AI for disaster triage. We have 5 active crises nearby. 
CRISES:
${payload}

TASK: Determine the absolute optimal sequence the operative must visit these locations to maximize human survival. Ignore geographic distance completely. Focus purely on trauma severity (e.g., severe arterial bleeding dictates visiting that location first over someone who needs MRE food rations).

OUTPUT REQUIREMENT: You MUST output ONLY a valid JSON object in this exact format, with no markdown code blocks wrapping it:
{
  "sequence": ["id1", "id2", "id3", "id4", "id5"],
  "reasoning": "1 sentence explaining the medical triage logic."
}`;

    try {
        const API_KEY = "AIzaSyACgecLgKxdeks78FWXnwBqmaVsQ97cbN8";
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await response.json();
        if(data.error) throw new Error(data.error.message);
        
        let text = data.candidates[0].content.parts[0].text;
        
        // Strip markdown backticks if Gemini incorrectly wraps the JSON
        text = text.replace(/\\`\\`\\`json/g, '').replace(/\\`\\`\\`/g, '').trim();
        const aiStrategy = JSON.parse(text);
        
        if(!aiStrategy.sequence || !Array.isArray(aiStrategy.sequence)) {
            throw new Error("Invalid AI payload structure");
        }

        // Apply Gemini's logical order array to our local Node Objects
        const bestRoute = aiStrategy.sequence.map(id => sortedNodes.find(n => n.id === id)).filter(n => n != null);

        // Render geometries via OSRM map layer using Generative Array
        btn.innerHTML = '<i class="fa-solid fa-satellite-dish fa-spin"></i> Plotting Matrix...';
        
        const coordString = [`${vLng},${vLat}`, ...bestRoute.map(n => `${n.lng},${n.lat}`)].join(';');
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`);
        const osrmData = await osrmRes.json();
        
        if(osrmData.routes && osrmData.routes.length > 0) {
            const geoJsonCoords = osrmData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            
            // Draw visually striking tactical line for Gemini override
            const routeLine = L.polyline(geoJsonCoords, {
                color: '#a855f7', 
                weight: 5, 
                opacity: 0.9, 
                dashArray: '10, 10'
            }).addTo(window.communityMapLayers);
            
            routeLine.getElement().classList.add('anim-route-line');
            
            bestRoute.forEach((node, idx) => {
                const wpIcon = L.divIcon({
                    className: 'waypoint-marker',
                    html: `<div class="w-6 h-6 bg-purple-500 border-2 border-brand-dark-bg text-brand-dark-bg rounded-full flex flex-col items-center justify-center font-bold text-[10px] shadow-[0_0_15px_rgba(168,85,247,0.8)] z-[600]">${idx + 1}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                L.marker([node.lat, node.lng], { icon: wpIcon, zIndexOffset: 2000 }).addTo(window.communityMapLayers);
                
                if(node.status !== 'In Progress') {
                    window.fsCore.updateDoc(window.fsCore.doc(window.db, "needs", node.id), {
                        status: 'In Progress',
                        assignedTo: volId
                    }).catch(e => console.error("Silent AI assign failed", e));
                }
            });

            btn.innerHTML = '<i class="fa-solid fa-check"></i> AI ROUTE LOCKED';
            btn.classList.replace('text-purple-400', 'text-brand-green');
            btn.classList.replace('border-purple-500/50', 'border-brand-green/50');
            
            // Generate Glassmorphism HUD overlay Toast!
            const overlayHost = document.getElementById('community-map').parentElement;
            const toast = document.createElement('div');
            toast.className = "absolute top-20 right-4 z-[1000] bg-brand-dark-panel/90 backdrop-blur border border-purple-500/50 rounded-xl p-4 shadow-[0_0_40px_rgba(168,85,247,0.3)] min-w-[300px] max-w-sm flex flex-col gap-2 opacity-0 transition-opacity duration-500 pointer-events-none";
            toast.innerHTML = `<div class="text-purple-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-1 border-b border-brand-dark-border pb-2"><i class="fa-solid fa-microchip"></i> Gemini Tactical Triage Override</div><div class="text-white text-xs leading-relaxed font-sans">${aiStrategy.reasoning}</div>`;
            overlayHost.appendChild(toast);
            
            setTimeout(() => toast.classList.remove('opacity-0'), 100);
            setTimeout(() => { toast.classList.add('opacity-0'); setTimeout(()=>toast.remove(), 500); }, 25000);
        }

    } catch(err) {
        console.error("AI Routing Failed:", err);
        btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> UPLINK FAILED';
    }
};
