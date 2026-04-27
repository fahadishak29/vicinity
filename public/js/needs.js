function renderNeeds(container) {
    let html = `
        <div class="animate-fade-in relative min-h-full">
            <div class="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-brand-dark-bg to-brand-dark-bg"></div>
            <div class="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"></div>
            
            <div class="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-40">
                <i class="fa-solid fa-tower-observation floating-icon delay-1 text-8xl" style="left: 10%;"></i>
                <i class="fa-solid fa-satellite-dish floating-icon delay-2 text-9xl"></i>
                <i class="fa-solid fa-database floating-icon delay-3 text-7xl"></i>
                <i class="fa-solid fa-globe floating-icon delay-4 text-9xl"></i>
                <i class="fa-solid fa-network-wired floating-icon delay-5 text-8xl"></i>
                <i class="fa-solid fa-map-location-dot floating-icon delay-6 text-7xl"></i>
                <i class="fa-solid fa-bullhorn floating-icon delay-7 text-9xl"></i>
            </div>

            <div class="relative z-10 space-y-6">
                <!-- Top Actions Bar -->
                <div class="flex justify-end gap-3 w-full border-b border-brand-dark-border pb-4">
                    <button class="bg-brand-dark-panel border border-brand-green-light text-brand-green-light px-4 py-2 rounded-lg text-sm flex-1 sm:flex-none flex items-center justify-center gap-2 hover:bg-brand-green/20 transition-colors shadow-sm font-medium">
                        <i class="fa-solid fa-plus"></i> Manual Input
                    </button>
                    <button onclick="window.runGeminiRecon()" class="bg-purple-600/20 text-purple-400 border border-purple-500/50 px-4 py-2 rounded-lg text-sm flex-1 sm:flex-none flex items-center justify-center gap-2 hover:bg-purple-600/40 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] font-medium">
                        <i class="fa-solid fa-brain"></i> Run AI Recon
                    </button>
                    <input type="file" id="csv-upload" accept=".csv" class="hidden" onchange="window.handleCSVUpload(event)">
                    <button onclick="document.getElementById('csv-upload').click()" class="bg-brand-green text-white px-4 py-2 rounded-lg text-sm flex-1 sm:flex-none flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors shadow-[0_0_10px_rgba(26,60,52,0.5)] font-medium">
                        <i class="fa-solid fa-file-csv"></i> Batch Ingest CSV
                    </button>
                </div>
            </div>

            <!-- Filters -->
            <div class="dark-card p-4 flex flex-wrap lg:flex-nowrap gap-4">
                <div class="relative flex-1 min-w-[200px]">
                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-500 text-sm"></i>
                    <input type="text" placeholder="Search parameters..." class="dark-input w-full rounded-lg pl-9 pr-3 py-2 text-sm transition-shadow">
                </div>
                <select class="dark-input dark-select rounded-lg px-4 py-2.5 text-sm sm:w-auto font-medium">
                    <option>All Categories</option>
                    <option>Food</option>
                    <option>Healthcare</option>
                    <option>Shelter</option>
                    <option>Sanitation</option>
                    <option>Education</option>
                </select>
                <select class="dark-input dark-select rounded-lg px-4 py-2.5 text-sm sm:w-auto font-medium">
                    <option>All Priorities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>
            </div>

            <!-- Needs Table -->
            <div class="dark-card overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr class="bg-brand-dark-panel border-b border-brand-dark-border text-[11px] uppercase text-gray-400 font-semibold tracking-wider font-mono">
                                <th class="py-4 px-5">Vector Classification</th>
                                <th class="py-4 px-5">Coordinates / Zone</th>
                                <th class="py-4 px-5 w-1/3">Detailed Recon</th>
                                <th class="py-4 px-5">Threat Assessment</th>
                                <th class="py-4 px-5 text-center">Status</th>
                                <th class="py-4 px-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-brand-dark-border/50 text-sm bg-brand-dark-bg/30">
                            ${state.needs.slice().sort((a,b) => b.urgencyScore - a.urgencyScore).map(need => `
                                <tr class="hover:bg-brand-dark-panel transition-colors group">
                                    <td class="py-4 px-5">
                                        <div class="font-semibold text-white uppercase tracking-wide text-xs">${need.category}</div>
                                        <div class="text-xs text-brand-amber/80 font-mono mt-0.5">${need.subCategory}</div>
                                    </td>
                                    <td class="py-4 px-5 text-gray-400 font-medium text-xs font-mono">
                                        <i class="fa-solid fa-crosshairs text-brand-dark-border mr-1"></i> ${need.location}
                                    </td>
                                    <td class="py-4 px-5 text-gray-400">
                                        <p class="line-clamp-2 text-xs group-hover:text-gray-300 transition-colors leading-relaxed">${utils.highlightCriticalTerms(need.description)}</p>
                                    </td>
                                    <td class="py-4 px-5">
                                        <div class="flex flex-col gap-2 w-36">
                                            <div class="flex justify-between items-center w-full">
                                                ${utils.getUrgencyBadge(need.urgencyLevel)}
                                                <span class="text-xs font-bold text-white font-mono bg-brand-dark-bg px-1.5 py-0.5 rounded border border-brand-dark-border">${need.urgencyScore}</span>
                                            </div>
                                            <div class="w-full h-1.5 bg-brand-dark-bg rounded-full overflow-hidden border border-brand-dark-border/50">
                                                <div class="h-full ${utils.getScoreColorClass(need.urgencyScore)} transition-all duration-500" style="width: ${need.urgencyScore}%"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-4 px-5 text-center">
                                        ${utils.getStatusBadge(need.status)}
                                        ${need.assignedTo ? (() => {
                                            const vol = state.volunteers.find(v => v.id === need.assignedTo);
                                            return `<div class="mt-1 text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase">OP: ${vol ? vol.name : need.assignedTo.substring(0,6)}</div>`;
                                        })() : ''}
                                    </td>
                                    <td class="py-4 px-5 text-right">
                                        <button onclick="window.engageTarget('${need.id}')" class="text-gray-500 hover:text-brand-amber p-1.5 rounded bg-brand-dark-bg border border-transparent hover:border-brand-amber/30 transition-all font-mono text-xs font-bold tracking-widest uppercase" title="View Details">
                                            Engage <i class="fa-solid fa-chevron-right ml-1"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="p-4 border-t border-brand-dark-border flex items-center justify-between text-xs text-brand-green-light font-mono bg-brand-dark-panel">
                    <div>DATASET VOLUME: <span class="font-bold text-white">${state.needs.length}</span> RECORDS</div>
                    <div class="flex gap-1.5">
                        <button class="px-2.5 py-1 border border-brand-dark-border rounded hover:bg-brand-dark-bg disabled:opacity-50 text-gray-500"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="px-3 py-1 border border-brand-amber/50 rounded bg-brand-amber/10 text-brand-amber font-bold shadow-[0_0_10px_rgba(240,165,0,0.1)]">1</button>
                        <button class="px-2.5 py-1 border border-brand-dark-border rounded hover:bg-brand-dark-bg text-gray-500"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

window.engageTarget = function(id) {
    if(window.state) {
        window.state.activeMatchTargetId = id;
    }
    const matchLink = document.querySelector('[data-view="match"]');
    if(matchLink) {
        matchLink.click();
    }
};

window.handleCSVUpload = function(event) {
    const file = event.target.files[0];
    if(!file) return;
    
    const btn = event.target.nextElementSibling;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Ingesting Data...';
    btn.disabled = true;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async function(results) {
            let successCount = 0;
            for(const row of results.data) {
                const category = row.category || 'General';
                const description = row.description || 'Routine support requested';
                
                let params = {
                    bleeding: 80, fever: 30, unconscious: 90, trauma: 85,
                    fracture: 70, amputated: 100, trapped: 95, fire: 80, explosion: 95,
                    collapse: 90, armed: 100, hostile: 95
                };
                let baseScore = 15;
                for (const [key, val] of Object.entries(params)) {
                    if (description.toLowerCase().includes(key)) baseScore = Math.max(baseScore, val);
                }
                
                let urgencyLevel = 'Low';
                if(baseScore >= 80) urgencyLevel = 'Critical';
                else if(baseScore >= 60) urgencyLevel = 'High';
                else if(baseScore >= 40) urgencyLevel = 'Medium';

                const newNeed = {
                    category: category,
                    subCategory: row.subCategory || 'General Support',
                    location: row.location || 'Unknown Coordinates',
                    description: description,
                    name: row.name || 'Anonymous Reporter',
                    phone: row.phone || 'Unknown',
                    urgencyLevel: urgencyLevel,
                    urgencyScore: baseScore,
                    status: 'Open',
                    timestamp: new Date()
                };

                try {
                    await window.fsCore.addDoc(window.fsCore.collection(window.db, "needs"), newNeed);
                    successCount++;
                } catch(e) {
                    console.error("[VICINITY ERR] CSV Row Upload Failed", e);
                }
            }
            
            alert(`[INTELLIGENCE BASE] Successfully ingested ${successCount} new crises records into the matrix.`);
            
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            event.target.value = ''; 
        },
        error: function(err) {
            console.error("CSV Parse Error", err);
            alert("Failed to parse CSV file. Ensure it has valid standard headers (category, subCategory, location, description, name, phone).");
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            event.target.value = '';
        }
    });
};

window.runGeminiRecon = async function() {
    if(!window.state || !window.state.needs || window.state.needs.length === 0) {
        return alert("No active distress signals in the Intelligence Base to analyze.");
    }
    
    // Change button to loading state to show processing coordinates
    const reconBtn = document.querySelector('button[onclick="window.runGeminiRecon()"]');
    let originalHtml = reconBtn ? reconBtn.innerHTML : '';
    if (reconBtn) {
        reconBtn.innerHTML = '<i class="fa-solid fa-satellite-dish fa-spin"></i> Interpolating Geodata...';
        reconBtn.disabled = true;
    }

    // 1. Reverse Geocoding Pre-processor (Nominatim)
    const needsToProcess = window.state.needs.slice(0, 30);
    const enrichedNeeds = await Promise.all(needsToProcess.map(async (n) => {
        let locName = n.location;
        const coordsMatch = locName.match(/LAT ([\d.-]+), LNG ([\d.-]+)/);
        if (coordsMatch) {
            try {
                const lat = coordsMatch[1];
                const lng = coordsMatch[2];
                // Reverse geocode to get human street level data
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await res.json();
                if (data && data.display_name) {
                    locName = data.display_name.split(',').slice(0, 3).join(','); // e.g. "Main St, Downtown"
                }
            } catch(e) { console.warn('Geocoding rate limit hit', e); }
        }
        return `[${n.urgencyLevel}] ${n.category}: ${n.description} (Location: ${locName})`;
    }));
    
    if (reconBtn) {
        reconBtn.innerHTML = originalHtml;
        reconBtn.disabled = false;
    }

    const dataStash = enrichedNeeds.join('\n');
    
    const prompt = `You are the Vicinity AI, a military-grade disaster relief and tactical coordination advisor. 
Analyze the following active distress signals and provide a highly concise, 3-point tactical deployment strategy for the ground operatives. 
Do not use markdown blocks, just format with bolding and bullet points. Be extremely tactical, brief, and objective.

ACTIVE DISTRESS SIGNALS:
${dataStash}`;

    // 2. Build or Reveal the Non-Blocking Right Side Drawer UI
    let drawer = document.getElementById('ai-recon-drawer');
    if(!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'ai-recon-drawer';
        // fixed to the right side, underneath the top header (top-20 = 5rem)
        drawer.className = 'fixed top-20 right-0 bottom-0 w-full max-w-md z-[100] transform translate-x-full transition-transform duration-500 ease-in-out shadow-[-10px_0_30px_rgba(0,0,0,0.5)]';
        drawer.innerHTML = `
            <div class="bg-brand-dark-panel border-l border-purple-500/30 h-full w-full flex flex-col relative backdrop-blur-3xl bg-opacity-95">
                <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none"></div>
                
                <div class="flex justify-between items-center p-6 border-b border-brand-dark-border relative z-10 shrink-0">
                    <h3 class="text-xl font-heading text-purple-400 flex items-center gap-3"><i class="fa-solid fa-microchip"></i> Tactical Analysis</h3>
                    <button onclick="document.getElementById('ai-recon-drawer').classList.add('translate-x-full'); document.getElementById('ai-recon-drawer').classList.remove('translate-x-0')" class="text-gray-500 hover:text-white transition-colors bg-brand-dark-bg border border-brand-dark-border w-8 h-8 flex items-center justify-center rounded-lg"><i class="fa-solid fa-arrow-right"></i></button>
                </div>
                
                <div id="ai-recon-content" class="flex-1 p-6 text-gray-300 text-[15px] leading-relaxed overflow-y-auto space-y-4 font-sans relative z-10 custom-scrollbar">
                </div>
            </div>
        `;
        document.body.appendChild(drawer);
    }
    
    // Trigger animation to slide in
    requestAnimationFrame(() => {
        drawer.classList.add('translate-x-0');
        drawer.classList.remove('translate-x-full');
    });
    
    const contentEl = document.getElementById('ai-recon-content');
    contentEl.innerHTML = `
        <div class="flex flex-col items-center justify-center h-40 text-purple-500/50">
            <i class="fa-solid fa-satellite-dish fa-fade text-4xl mb-4"></i>
            <span class="tracking-widest uppercase text-xs font-bold animate-pulse">Processing ${window.state.needs.length} signals via Google Gemini...</span>
        </div>
    `;

    // 3. Uplink to Render AI Backend (no API key in frontend)
    const RENDER_API = window.VICINITY_API_URL || 'https://vicinity-ml-api.onrender.com';
    try {
        const response = await fetch(`${RENDER_API}/analyze`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prompt: prompt })
        });
        
        const data = await response.json();
        if(data.error) throw new Error(data.error);
        if(!data.text) throw new Error('Empty response from AI backend');
        
        let text = data.text;
        
        // Convert Markdown into the UI classes dynamically
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white tracking-wide">$1</strong>');
        text = text.replace(/\*/g, '<span class="text-purple-500 mr-2 text-lg leading-none">&bull;</span>');
        
        contentEl.innerHTML = '';
        const lines = text.split('\n').filter(l => l.trim() !== '');
        
        // Typewriter reveal logic
        let delay = 0;
        lines.forEach((line) => {
            const p = document.createElement('p');
            p.className = "opacity-0 transform translate-y-2 transition-all duration-500";
            p.innerHTML = line;
            contentEl.appendChild(p);
            
            setTimeout(() => { p.classList.remove('opacity-0', 'translate-y-2'); }, delay);
            delay += 150;
        });

    } catch(err) {
        contentEl.innerHTML = `<div class="text-red-400 p-4 bg-red-500/10 border border-red-500/20 rounded-lg font-sans">
            <i class="fa-solid fa-triangle-exclamation mr-2"></i> Uplink Failed: ${err.message}
        </div>`;
    }
};
