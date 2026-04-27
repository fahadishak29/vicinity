function renderMatch(container) {
    const unassignedNeeds = state.needs.filter(n => n.status !== 'Resolved' && !n.assignedTo);
    let selectedNeed = null;
    if (state.activeMatchTargetId) {
        selectedNeed = unassignedNeeds.find(n => n.id === state.activeMatchTargetId);
    }
    if (!selectedNeed && unassignedNeeds.length > 0) {
        selectedNeed = unassignedNeeds[0];
        state.activeMatchTargetId = selectedNeed.id;
    }

    let html = `
        <div class="animate-fade-in flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            
            <!-- Left Panel -->
            <div class="w-full lg:w-1/3 dark-card flex flex-col h-full overflow-hidden border-brand-dark-border">
                <div class="p-4 border-b border-brand-dark-border bg-brand-dark-panel">
                    <h3 class="text-white font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                        <i class="fa-solid fa-crosshairs text-brand-amber"></i> Target Selection
                    </h3>
                </div>
                
                <div class="p-3 border-b border-brand-dark-border bg-brand-dark-bg">
                    <select id="target-select" onchange="window.selectTarget(this.value)" class="dark-input dark-select w-full rounded-lg px-4 py-2.5 text-sm outline-none font-mono tracking-wide">
                        ${unassignedNeeds.map(n => `
                            <option value="${n.id}" ${state.activeMatchTargetId === n.id || (selectedNeed && selectedNeed.id === n.id) ? 'selected' : ''}>${n.category.toUpperCase()} - ${n.location.toUpperCase()} [THREAT: ${n.urgencyScore}]</option>
                        `).join('')}
                    </select>
                </div>

                <div class="p-5 flex-1 overflow-y-auto custom-scrollbar">
                    ${selectedNeed ? `
                        <div class="space-y-4">
                            <div>
                                <div class="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Mission Profile</div>
                                <h4 class="text-2xl font-heading text-brand-amber">${selectedNeed.category} Crisis</h4>
                                <p class="text-sm text-gray-300 mt-2 leading-relaxed">${utils.highlightCriticalTerms(selectedNeed.description)}</p>
                            </div>
                            
                            ${selectedNeed.aiReconIntel ? (typeof selectedNeed.aiReconIntel === 'object' ? `
                            <div class="mt-4 bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]">
                                <p class="text-[10px] uppercase font-bold tracking-widest text-purple-400 mb-3 flex items-center gap-2">
                                    <i class="fa-solid fa-satellite-dish animate-pulse"></i> Tactical Vision Intel
                                </p>
                                ${selectedNeed.aiReconImage ? `<img src="${selectedNeed.aiReconImage}" class="w-full h-40 object-cover rounded-lg mb-3 border border-purple-500/30">` : ''}
                                ${(selectedNeed.aiReconIntel.keywords || []).length > 0 ? `
                                <div class="flex flex-wrap gap-1 mb-3">
                                    ${selectedNeed.aiReconIntel.keywords.map(k => `<span class="bg-purple-600/30 text-purple-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border border-purple-500/50"><i class="fa-solid fa-tag"></i> ${k}</span>`).join('')}
                                </div>` : ''}
                                <div class="text-sm font-medium leading-relaxed space-y-4 mt-3">
                                    <div>
                                        <span class="text-red-400 font-bold block mb-1.5 uppercase tracking-widest text-[10px] font-mono"><i class="fa-solid fa-fire text-red-500 mr-1"></i> Structural Damages</span>
                                        ${(selectedNeed.aiReconIntel.damages || []).map(d => `<p class="border-l-[3px] border-red-500/50 pl-3 py-1 text-gray-200">${d.replace(/\*\*(.*?)\*\*/g, '<span class="text-red-300 bg-red-900/40 px-1.5 py-0.5 rounded-md font-bold tracking-wide border border-red-500/20 shadow-sm">$1</span>')}</p>`).join('')}
                                    </div>
                                    <div>
                                        <span class="text-brand-green-light font-bold block mb-1.5 uppercase tracking-widest text-[10px] font-mono"><i class="fa-solid fa-truck-medical text-brand-green mr-1"></i> Recommended Logistics</span>
                                        ${(selectedNeed.aiReconIntel.solutions || []).map(s => `<p class="border-l-[3px] border-brand-green/50 pl-3 py-1 text-gray-200">${s.replace(/\*\*(.*?)\*\*/g, '<span class="text-brand-green-light bg-brand-green/20 px-1.5 py-0.5 rounded-md font-bold tracking-wide border border-brand-green/30 shadow-sm">$1</span>')}</p>`).join('')}
                                    </div>
                                </div>
                            </div>
                            ` : `
                            <div class="mt-4 bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]">
                                <p class="text-[10px] uppercase font-bold tracking-widest text-purple-400 mb-2 flex items-center gap-2">
                                    <i class="fa-solid fa-camera-retro"></i> Legacy AI Recon
                                </p>
                                ${selectedNeed.aiReconImage ? `<img src="${selectedNeed.aiReconImage}" class="w-full h-40 object-cover rounded-lg mb-3 border border-purple-500/30">` : ''}
                                <div class="text-xs text-gray-300 font-mono space-y-1.5">
                                    ${String(selectedNeed.aiReconIntel).split('\\n').filter(l=>l.trim()!=='').map(l => `<p class="border-l-2 border-purple-500/50 pl-2 py-0.5">${l.replace(/\*\*(.*?)\*\*/g, '<span class="text-white bg-purple-500/30 px-1 rounded font-bold">$1</span>')}</p>`).join('')}
                                </div>
                            </div>
                            `) : ''}
                            
                            <div class="grid grid-cols-2 gap-3 pt-4 border-t border-brand-dark-border">
                                <div class="bg-brand-dark-bg p-3 rounded-lg border border-brand-dark-border">
                                    <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Threat Assessment</div>
                                    <div class="${utils.getScoreColorClass(selectedNeed.urgencyScore).replace('bg-','text-').replace('shadow-', 'drop-shadow-')} font-bold text-lg font-mono">${selectedNeed.urgencyScore} / 100</div>
                                </div>
                                <div class="bg-brand-dark-bg p-3 rounded-lg border border-brand-dark-border">
                                    <div class="text-[10px] text-gray-500 uppercase font-bold mb-1">Grid Coordinates</div>
                                    <div class="text-white font-mono text-xs mt-1.5 font-semibold text-brand-green-light">${selectedNeed.location.toUpperCase()}</div>
                                </div>
                            </div>
                            
                            <div class="pt-4 border-t border-brand-dark-border">
                                <div class="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Required Capabilities</div>
                                <div class="flex gap-2">
                                    <span class="bg-brand-dark-border/50 text-brand-amber border border-brand-amber/30 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase">${selectedNeed.category === 'Healthcare' ? 'Medical' : selectedNeed.category === 'Food' ? 'Logistics' : 'General'}</span>
                                    <span class="bg-brand-dark-bg border border-brand-dark-border text-gray-300 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase">Field Recon</span>
                                </div>
                            </div>
                        </div>
                    ` : '<div class="text-gray-500 text-center py-10 font-mono text-xs font-bold uppercase tracking-wider">NO ASSIGNABLE TARGETS IN QUEUE</div>'}
                </div>
            </div>

            <!-- Right Panel -->
            <div class="w-full lg:w-2/3 dark-card flex flex-col h-full overflow-hidden relative">
                <div class="absolute inset-0 bg-[linear-gradient(rgba(26,60,52,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(26,60,52,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-0 pointer-events-none"></div>
                
                <div class="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-50">
                    <i class="fa-solid fa-house-medical floating-icon delay-1 text-8xl" style="left: 10%;"></i>
                    <i class="fa-solid fa-triangle-exclamation floating-icon delay-2 text-9xl"></i>
                    <i class="fa-solid fa-helicopter floating-icon delay-3 text-7xl"></i>
                    <i class="fa-solid fa-radiation floating-icon delay-4 text-9xl"></i>
                    <i class="fa-solid fa-helmet-safety floating-icon delay-5 text-8xl"></i>
                    <i class="fa-solid fa-shield-heart floating-icon delay-6 text-7xl"></i>
                    <i class="fa-solid fa-kit-medical floating-icon delay-7 text-9xl"></i>
                </div>
                
                <div class="p-4 border-b border-brand-dark-border z-10 bg-brand-dark-panel flex justify-between items-center">
                    <h3 class="text-white font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                        <i class="fa-solid fa-network-wired text-brand-green-light"></i> Algorithmic Pairing Matrix
                    </h3>
                    <div class="flex items-center gap-3">
                        ${selectedNeed ? `<button onclick="window.runGeminiSquadMatch('${selectedNeed.id}')" class="bg-purple-600/20 text-purple-400 border border-purple-500/50 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-purple-600/40 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] font-bold tracking-wide uppercase"><i class="fa-solid fa-bolt"></i> AI Match</button>` : ''}
                        <span class="text-[10px] font-mono text-brand-amber font-bold animate-pulse tracking-widest bg-brand-amber/10 border border-brand-amber/30 px-2 py-1 rounded hidden sm:inline-block">EXEC COMPUTING...</span>
                    </div>
                </div>
                
                <div class="p-5 flex-1 overflow-y-auto z-10 space-y-4 custom-scrollbar relative">
                    <div id="ai-squad-output" class="hidden flex-col gap-2 mb-4 bg-brand-dark-bg border-l-2 border-purple-500 p-4 rounded-r-xl shadow-lg relative overflow-hidden">
                       <div class="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-transparent pointer-events-none"></div>
                       <div class="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10"><i class="fa-solid fa-microchip"></i> Gemini Tactical Strategy</div>
                       <div id="ai-squad-text" class="text-gray-300 text-[13px] font-sans leading-relaxed relative z-10 space-y-3"></div>
                    </div>
                    ${generateMatches(selectedNeed)}
                </div>
            </div>
            
        </div>
    `;
    container.innerHTML = html;
}

function generateMatches(need) {
    if (!need) return '<div class="text-brand-amber text-center py-10 font-mono text-xs font-bold uppercase tracking-wider relative mt-10"><div class="absolute inset-0 bg-brand-amber/5 blur-xl"></div>AWAITING TARGET SELECTION<br><span class="text-[9px] text-gray-500 mt-2 block">No active crises in need of operative assignment.</span></div>';
    
    const reqSkill = need.category === 'Healthcare' ? 'Medical' : need.category === 'Food' ? 'Logistics' : 'General';
    
    const activeNeeds = state.needs.filter(n => n.status === 'In Progress' && n.assignedTo);
    const deployedVolunteerIds = new Set(activeNeeds.map(n => n.assignedTo));
    const availableVolunteers = state.volunteers.filter(v => v.active && !deployedVolunteerIds.has(v.id));
    
    if (availableVolunteers.length === 0) {
        return '<div class="text-brand-amber text-center py-10 font-mono text-xs font-bold uppercase tracking-wider relative"><div class="absolute inset-0 bg-brand-amber/5 blur-xl"></div>NO AVAILABLE ASSETS IN QUEUE</div>';
    }
    
    const matches = availableVolunteers.map(v => {
        let score = 0;
        
        // 1. Skill Matrix (Max 40)
        let primaryMatch = false;
        let secondaryMatch = false;
        const vSkills = v.skills || [];
        
        switch(need.category) {
            case 'Healthcare':
                if (vSkills.includes('Medical')) primaryMatch = true;
                else if (vSkills.includes('Rescue')) secondaryMatch = true;
                break;
            case 'Food':
            case 'Water':
                if (vSkills.includes('Logistics')) primaryMatch = true;
                else if (vSkills.includes('General Support')) secondaryMatch = true;
                break;
            case 'Rescue':
                if (vSkills.includes('Rescue')) primaryMatch = true;
                else if (vSkills.includes('Medical') || vSkills.includes('Engineering')) secondaryMatch = true;
                break;
            case 'Infrastructure':
                if (vSkills.includes('Engineering')) primaryMatch = true;
                else if (vSkills.includes('Logistics')) secondaryMatch = true;
                break;
            case 'Comms':
                if (vSkills.includes('Communications')) primaryMatch = true;
                break;
            case 'Shelter':
                if (vSkills.includes('General Support') || vSkills.includes('Logistics')) primaryMatch = true;
                else if (vSkills.includes('Engineering')) secondaryMatch = true;
                break;
            default:
                if (vSkills.includes('General Support')) primaryMatch = true;
        }
        
        if (primaryMatch) score += 40;
        else if (secondaryMatch) score += 20;

        // 2. Topographic Proximity (Max 40)
        let vLat = v.lat;
        let vLng = v.lng;
        const locationName = (v.location || "").split(' (')[0].trim();
        const subOffice = window.utils && window.utils.SUB_OFFICES ? window.utils.SUB_OFFICES[locationName] : null;
        
        if (!vLat && subOffice) {
            vLat = subOffice.lat;
            vLng = subOffice.lng;
        }

        let dist = 999;
        if (vLat && vLng && need.lat && need.lng && window.utils && window.utils.getDistanceKM) {
            dist = window.utils.getDistanceKM(need.lat, need.lng, vLat, vLng);
            if (dist <= 2) score += 40;
            else if (dist < 5) score += 30;
            else if (dist < 10) score += 20;
            else if (dist < 20) score += 10;
        } else if (v.location && need.location && v.location.includes(need.location.split(' ')[0])) {
            score += 20; // Fallback string match
            dist = 5; // Assumed for transport logc if string matching
        }

        // 3. Transportation Mode (Max 20)
        const vVehicles = v.vehicles || [];
        const hasHeavy = vVehicles.includes('Heavy Truck') || vVehicles.includes('Off-Road 4x4');
        const hasStandard = vVehicles.includes('Standard') || vVehicles.includes('Motorcycle') || vVehicles.includes('Aerial') || vVehicles.includes('Aquatic');
        
        if (dist > 5 && dist !== 999) {
            if (hasHeavy || hasStandard) score += 20; 
        } else if (dist <= 5) {
            if (hasHeavy || hasStandard) score += 20; 
            else score += 10; 
        }
        
        if (v.availability === 'Flexible') score += 5; 
        
        score = Math.min(100, Math.round(score));
        
        return {...v, matchScore: score, distComputed: dist !== 999 ? dist.toFixed(1) + 'km' : 'Sector Match'};
    }).sort((a,b) => b.matchScore - a.matchScore);

    return matches.slice(0, 5).map((vol, idx) => `
        <div class="bg-brand-dark-panel/80 border ${idx === 0 ? 'border-brand-amber/50 shadow-[0_0_15px_rgba(240,165,0,0.15)] bg-gradient-to-r from-brand-dark-panel to-[rgba(240,165,0,0.05)]' : 'border-brand-dark-border'} p-4 rounded-xl flex items-center justify-between group hover:border-brand-amber/80 transition-all hover:bg-brand-dark-panel">
            <div class="flex items-center gap-5">
                <div class="relative w-14 h-14 flex items-center justify-center">
                    <svg class="w-full h-full transform -rotate-90 absolute inset-0">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#25303D" stroke-width="3"></circle>
                        <circle cx="28" cy="28" r="24" fill="none" stroke="${idx === 0 ? '#F0A500' : '#10b981'}" stroke-width="3" stroke-dasharray="150" stroke-dashoffset="${150 - (150 * vol.matchScore / 100)}" class="transition-all duration-1000"></circle>
                    </svg>
                    <div class="font-bold font-mono text-xs ${idx === 0 ? 'text-brand-amber' : 'text-brand-green-light'} relative z-10">${vol.matchScore}%</div>
                </div>
                <div>
                    <h4 class="text-white font-bold tracking-wide text-[15px] mb-0.5">${vol.name}</h4>
                    <div class="text-[10px] text-gray-400 font-mono mb-1.5 uppercase font-semibold"><i class="fa-solid fa-location-crosshairs text-brand-dark-border mr-1"></i>${vol.location} <span class="text-brand-amber/80 ml-2"><i class="fa-solid fa-route"></i> ${vol.distComputed}</span></div>
                    <div class="flex gap-1 flex-wrap mt-0.5">
                        ${vol.skills && vol.skills.length ? vol.skills.slice(0,3).map(s => `<span class="bg-brand-green/10 border border-brand-green/30 text-brand-green px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold">${s}</span>`).join('') : '<span class="text-gray-600 text-[9px] uppercase font-bold italic">No specified ops skills</span>'}
                    </div>
                    <div class="flex gap-1 flex-wrap mt-1">
                        ${vol.vehicles && vol.vehicles.length ? vol.vehicles.slice(0,3).map(v => `<span class="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold"><i class="fa-solid fa-truck-fast mr-1"></i>${v}</span>`).join('') : '<span class="text-gray-600 text-[8px] uppercase font-bold"><i class="fa-solid fa-shoe-prints mr-1"></i>Foot Mobile</span>'}
                    </div>
                </div>
            </div>
            
            <button onclick="window.deployUnit('${need.id}', '${vol.id}')" class="${idx === 0 ? 'bg-brand-amber hover:bg-yellow-400 text-brand-dark-bg shadow-[0_0_10px_rgba(240,165,0,0.4)]' : 'bg-brand-dark-bg hover:bg-brand-green/20 border border-brand-dark-border hover:border-brand-green hover:text-brand-green text-gray-300'} px-5 py-2.5 rounded-lg font-bold text-xs tracking-wide flex items-center gap-2 transition-all font-mono uppercase shrink-0">
                <i class="fa-solid fa-bolt"></i> DEPLOY
            </button>
        </div>
    `).join('');
}

window.deployUnit = function(needId, volunteerId) {
    // Create Custom Tactical Modal
    const modalId = 'tactical-confirm-modal';
    if(document.getElementById(modalId)) return;
    
    const modalHtml = `
        <div id="${modalId}" class="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-dark-bg/80 backdrop-blur-sm animate-fade-in p-4">
            <div class="bg-brand-dark-panel border-2 border-brand-amber/50 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(240,165,0,0.2)] transform scale-100 transition-transform">
                <div class="flex items-center gap-3 border-b border-brand-dark-border pb-4 mb-4">
                    <div class="w-10 h-10 rounded-full bg-brand-amber/20 text-brand-amber flex items-center justify-center text-xl shrink-0">
                        <i class="fa-solid fa-triangle-exclamation animate-pulse"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-heading text-xl tracking-wide">Confirm Deployment</h3>
                        <p class="text-brand-amber text-[10px] font-mono tracking-widest uppercase">Authorization Required</p>
                    </div>
                </div>
                
                <p class="text-sm text-gray-300 mb-6 font-mono leading-relaxed">
                    Initiating deployment protocol. The selected operative will be dispatched to the target zone immediately. Proceed?
                </p>
                
                <div class="flex gap-3 justify-end">
                    <button onclick="document.getElementById('${modalId}').remove()" class="px-5 py-2.5 rounded-lg font-bold text-xs tracking-wide bg-brand-dark-bg border border-brand-dark-border hover:text-white hover:border-gray-500 transition-colors font-mono uppercase">
                        Abort
                    </button>
                    <button onclick="window.executeDeploy('${needId}', '${volunteerId}'); document.getElementById('${modalId}').remove()" class="px-5 py-2.5 rounded-lg font-bold text-xs tracking-wide bg-brand-amber hover:bg-yellow-400 text-brand-dark-bg shadow-[0_0_15px_rgba(240,165,0,0.4)] transition-colors flex items-center gap-2 font-mono uppercase">
                        <i class="fa-solid fa-bolt"></i> Execute
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.executeDeploy = async function(needId, volunteerId) {
    try {
        console.log("Execute Deploy called for Need:", needId, "Vol:", volunteerId);
        
        if(!window.fsCore) throw new Error("Firestore Core is missing from window scope");
        if(!window.db) throw new Error("Database reference is missing");
        
        const vol = window.state.volunteers.find(v => v.id === volunteerId);
        let opLoc = null;
        if (vol) {
            if (vol.lat && vol.lng) {
                opLoc = { lat: vol.lat, lng: vol.lng };
            } else {
                const locationName = (vol.location || "").split(' (')[0].trim();
                const subOffice = window.utils && window.utils.SUB_OFFICES ? window.utils.SUB_OFFICES[locationName] : null;
                if (subOffice) opLoc = { lat: subOffice.lat, lng: subOffice.lng };
            }
        }
        
        const updateData = { assignedTo: volunteerId, status: 'In Progress' };
        if (opLoc) updateData.operativeLocation = opLoc;
        
        const docRef = window.fsCore.doc(window.db, "needs", needId);
        await window.fsCore.updateDoc(docRef, updateData);
        console.log("Deployment success, data pushed to firebase!");
        // We do not reload or alert here on success as snapshot will auto-update the UI, but we could if we wanted.
    } catch(err) {
        console.error("Assignment Uplink Failed via Firestore", err);
        alert("DEPLOYMENT ERROR: " + err.message + "\n\n(Possibly Firebase Security Rules expired!)");
    }
};

window.selectTarget = function(id) {
    window.state.activeMatchTargetId = id;
    renderView('match', document.getElementById('views-container'));
};

window.runGeminiSquadMatch = async function(needId) {
    const need = window.state.needs.find(n => n.id === needId);
    if(!need) return;

    const btn = document.querySelector('button[onclick^="window.runGeminiSquadMatch"]');
    if(btn) { 
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing...'; 
        btn.disabled = true; 
    }

    const outBox = document.getElementById('ai-squad-output');
    const textEl = document.getElementById('ai-squad-text');
    outBox.classList.remove('hidden');
    outBox.classList.add('flex');
    textEl.innerHTML = '<div class="flex items-center justify-center p-4"><span class="animate-pulse text-purple-400 font-mono text-xs tracking-widest uppercase">Transmitting Data to Gemini Core...</span></div>';

    // Get available
    const activeNeeds = window.state.needs.filter(n => n.status === 'In Progress' && n.assignedTo);
    const deployedIds = new Set(activeNeeds.map(n => n.assignedTo));
    const available = window.state.volunteers.filter(v => v.active && !deployedIds.has(v.id));

    // Stringify Top 15 candidates so we don't blow context limits
    const candidates = available.slice(0, 15).map(v => {
        let distStr = 'Sector Match';
        if (v.lat && v.lng && need.lat && need.lng && window.utils && window.utils.getDistanceKM) {
            distStr = window.utils.getDistanceKM(need.lat, need.lng, v.lat, v.lng).toFixed(1) + 'km away';
        }
        return `[ID: ${v.id}] Name: ${v.name} | Skills: ${(v.skills||[]).join(', ') || 'General'} | Vehicle: ${(v.vehicles||[]).join(', ') || 'Foot'} | Location: ${distStr}`;
    }).join('\n');

    const prompt = `You are a military-grade tactical dispatcher for disaster relief. We have a critical emergency.
EMERGENCY DETAILS:
Category: ${need.category}
Threat Level: ${need.urgencyScore}/100
Context: ${need.description}

AVAILABLE OPERATIVES:
${candidates}

TASK: Select the absolute optimal 2-person squad to deploy to this emergency based on skill synergy and vehicle capabilities. 
Format your output cleanly in 3 bullet points explaining YOUR TACTICAL REASONING for selecting these precise individuals over the others. Mention their names explicitly. Be extremely brief, no markdown code blocks.`;

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
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white tracking-wide">$1</strong>');
        text = text.replace(/\*/g, '<span class="text-purple-500 mr-2 text-lg leading-none">&bull;</span>');
        
        textEl.innerHTML = '';
        const lines = text.split('\n').filter(l => l.trim() !== '');
        
        let delay = 0;
        lines.forEach(line => {
            const p = document.createElement('p');
            p.className = "opacity-0 transform translate-y-2 transition-all duration-500";
            p.innerHTML = line;
            textEl.appendChild(p);
            setTimeout(() => { p.classList.remove('opacity-0', 'translate-y-2'); }, delay);
            delay += 250;
        });

    } catch (e) {
        textEl.innerHTML = `<span class="text-red-400 font-mono text-xs">Failed: ${e.message}</span>`;
    }

    if(btn) { 
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> AI Match'; 
        btn.disabled = false; 
    }
};
