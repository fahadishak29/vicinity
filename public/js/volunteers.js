window.volunteerRegistryState = {
    search: '',
    skillFilter: 'All Assets',
    statusFilter: 'Status: All'
};

window.updateVolRegistry = function(type, value) {
    window.volunteerRegistryState[type] = value;
    const container = document.getElementById('views-container');
    if (container) renderVolunteers(container);
};

window.triggerDeployFromRegistry = function(volId) {
    // Navigate smoothly to Match UI
    if (window.renderView) window.renderView('match', document.getElementById('views-container'));
};

function renderVolunteers(container) {
    const s = window.volunteerRegistryState;
    const state = window.state || { volunteers: [] };
    
    let filteredVols = state.volunteers.filter(vol => {
        // Search Filter (callsign, zone, or skill)
        if (s.search) {
            const term = s.search.toLowerCase();
            const matchName = vol.name && vol.name.toLowerCase().includes(term);
            const matchLoc = vol.location && vol.location.toLowerCase().includes(term);
            const matchSkills = vol.skills && vol.skills.some(skill => skill.toLowerCase().includes(term));
            
            if (!matchName && !matchLoc && !matchSkills) return false;
        }
        
        // Skill Dropdown
        if (s.skillFilter !== 'All Assets') {
            if (!vol.skills || !vol.skills.includes(s.skillFilter)) return false;
        }
        
        // Status Dropdown
        if (s.statusFilter !== 'Status: All') {
            const volStatus = vol.active ? 'Active' : 'Standby';
            if (volStatus !== s.statusFilter) return false;
        }
        
        return true;
    });

    let html = `
        <div class="animate-fade-in relative min-h-full">
            <!-- Background Tactical Elements & Floating Logistics Particles -->
            <div class="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-green/20 via-brand-dark-bg to-brand-dark-bg"></div>
            <div class="absolute inset-0 bg-[linear-gradient(rgba(26,60,52,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,60,52,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"></div>
            
            <div class="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-50">
                <i class="fa-solid fa-house-medical floating-icon delay-1 text-8xl" style="left: 10%;"></i>
                <i class="fa-solid fa-triangle-exclamation floating-icon delay-2 text-9xl"></i>
                <i class="fa-solid fa-helicopter floating-icon delay-3 text-7xl"></i>
                <i class="fa-solid fa-radiation floating-icon delay-4 text-9xl"></i>
                <i class="fa-solid fa-helmet-safety floating-icon delay-5 text-8xl"></i>
                <i class="fa-solid fa-shield-heart floating-icon delay-6 text-7xl"></i>
                <i class="fa-solid fa-kit-medical floating-icon delay-7 text-9xl"></i>
            </div>

            <div class="relative z-10 space-y-6">
                <!-- Header Component -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-dark-border pb-4">
                    <div>
                        <h2 class="text-2xl font-heading text-white tracking-wide">Personnel Registry</h2>
                        <p class="text-brand-green-light text-sm font-mono tracking-widest uppercase"><i class="fa-solid fa-users pr-1"></i> Active Field Operatives</p>
                    </div>
                    <a href="/volunteer.html" target="_blank" class="bg-brand-green hover:bg-brand-amber text-white px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-green/20 font-semibold tracking-wide border border-transparent hover:border-brand-amber/50">
                        <i class="fa-solid fa-user-plus"></i> Enlist Asset
                    </a>
                </div>

                <!-- Live Filters -->
                <div class="dark-card p-4 flex flex-wrap lg:flex-nowrap gap-4 bg-brand-dark-panel/80 backdrop-blur-md rounded-2xl border-brand-dark-border shadow-sm">
                    <div class="relative flex-1 min-w-[200px]">
                        <i class="fa-solid fa-search absolute left-4 top-[1.125rem] text-gray-500"></i>
                        <input type="text" placeholder="Search by callsign, skill, zone..." 
                            value="${s.search}"
                            onkeyup="window.updateVolRegistry('search', this.value)" 
                            class="w-full bg-brand-dark-bg/80 border border-brand-dark-border hover:border-brand-amber/50 focus:border-brand-amber text-white placeholder-gray-500 rounded-lg pl-11 pr-4 py-3 text-sm outline-none transition-colors shadow-inner">
                    </div>
                    <select onchange="window.updateVolRegistry('skillFilter', this.value)" class="dark-input dark-select bg-brand-dark-bg/80 border border-brand-dark-border hover:border-brand-amber/50 focus:border-brand-amber rounded-lg px-4 py-3 text-sm outline-none font-mono text-gray-300 cursor-pointer shadow-inner pr-8">
                        <option value="All Assets" ${s.skillFilter === 'All Assets' ? 'selected' : ''}>All Technical Skills</option>
                        <option value="Medical" ${s.skillFilter === 'Medical' ? 'selected' : ''}>Medical Corp</option>
                        <option value="Rescue" ${s.skillFilter === 'Rescue' ? 'selected' : ''}>Heavy Rescue</option>
                        <option value="Logistics" ${s.skillFilter === 'Logistics' ? 'selected' : ''}>Logistics & Supply</option>
                        <option value="Engineering" ${s.skillFilter === 'Engineering' ? 'selected' : ''}>Civil Engineering</option>
                        <option value="Communications" ${s.skillFilter === 'Communications' ? 'selected' : ''}>Communications</option>
                        <option value="General Support" ${s.skillFilter === 'General Support' ? 'selected' : ''}>General Support</option>
                    </select>
                    <select onchange="window.updateVolRegistry('statusFilter', this.value)" class="dark-input dark-select bg-brand-dark-bg/80 border border-brand-dark-border hover:border-brand-amber/50 focus:border-brand-amber rounded-lg px-4 py-3 text-sm outline-none font-mono text-gray-300 cursor-pointer shadow-inner pr-8">
                        <option ${s.statusFilter === 'Status: All' ? 'selected' : ''}>Status: All Assets</option>
                        <option ${s.statusFilter === 'Active' ? 'selected' : ''}>Status: Active</option>
                        <option ${s.statusFilter === 'Standby' ? 'selected' : ''}>Status: Standby</option>
                    </select>
                </div>

                <!-- Asset Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                    ${filteredVols.length > 0 ? filteredVols.map(vol => `
                        <div class="dark-card p-5 group hover:border-brand-amber/50 transition-all hover:bg-brand-dark-panel/80 hover:-translate-y-1 relative overflow-hidden bg-brand-dark-bg/95 backdrop-blur-md border border-brand-dark-border rounded-2xl shadow-xl flex flex-col h-full">
                            
                            <!-- Subtle decorative flare -->
                            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${vol.active ? 'from-brand-green/10' : 'from-gray-500/10'} to-transparent rounded-bl-[100px] pointer-events-none"></div>
                            
                            <div class="flex justify-between items-start mb-4 relative z-10">
                                <div class="w-12 h-12 rounded-full bg-brand-dark-panel flex items-center justify-center text-lg font-bold text-gray-200 font-heading shrink-0 ${vol.active ? 'border border-brand-green text-brand-green-light shadow-[0_0_15px_rgba(26,60,52,0.6)]' : 'border border-gray-600 text-gray-400 opacity-80'}">
                                    ${vol.name ? vol.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '?'}
                                </div>
                                <span class="px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest shrink-0 ${vol.active ? 'bg-brand-green/20 text-brand-green-light border border-brand-green/30 shadow-[0_0_10px_rgba(26,60,52,0.2)]' : 'bg-gray-800 text-gray-400 border border-gray-700 opacity-80'}">
                                    ${vol.active ? '<i class="fa-solid fa-satellite-dish fa-beat-fade mr-1 opacity-70"></i> Active' : 'Standby'}
                                </span>
                            </div>
                            
                            <h3 class="text-xl font-heading text-white mb-1.5 group-hover:text-brand-amber transition-colors relative z-10 truncate font-medium drop-shadow-sm">${vol.name}</h3>
                            <div class="text-xs text-gray-400 font-mono mb-5 flex flex-col gap-2.5 relative z-10">
                                <span class="flex items-center gap-2 truncate opacity-90"><i class="fa-solid fa-location-crosshairs w-3 text-brand-amber"></i> ${vol.location ? vol.location.toUpperCase() : 'UNKNOWN ZONE'}</span>
                                <span class="flex items-center gap-2"><i class="fa-solid fa-phone w-3 text-brand-amber"></i> <span class="bg-brand-dark-panel px-2 py-0.5 rounded border border-brand-dark-border font-bold text-gray-300 drop-shadow-sm">${vol.phone || 'NO COMM LINK'}</span></span>
                            </div>
                            
                            <div class="flex flex-wrap gap-1.5 mb-5 relative z-10 content-start flex-1">
                                ${(vol.skills || []).map(s => `
                                    <span class="bg-brand-dark-panel border border-brand-dark-border text-gray-300 px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase shadow-sm group-hover:border-gray-500 transition-colors">${s}</span>
                                `).join('')}
                                ${(!vol.skills || vol.skills.length === 0) ? '<span class="text-gray-600 text-[9px] uppercase font-bold italic border border-brand-dark-border border-dashed px-2 py-1 rounded">No registered payload</span>' : ''}
                            </div>

                            <div class="grid grid-cols-3 gap-2 mb-4 relative z-10 border-t border-brand-dark-border pt-4">
                                <div class="text-center">
                                    <div class="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Rank</div>
                                    <div class="text-[9px] sm:text-[10px] font-bold ${vol.points >= 500 ? 'text-purple-400' : (vol.points >= 100 ? 'text-brand-amber' : 'text-gray-300')} tracking-widest uppercase truncate">${vol.points >= 500 ? 'SPL AGT' : (vol.points >= 100 ? 'OPERATIVE' : 'TRAINEE')}</div>
                                </div>
                                <div class="text-center border-l border-r border-brand-dark-border">
                                    <div class="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Sec-Pts</div>
                                    <div class="text-xs font-black text-blue-400 drop-shadow-sm">${vol.points || 0}</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Missions</div>
                                    <div class="text-xs font-black text-brand-green-light drop-shadow-sm">${vol.missionsCompleted || 0}</div>
                                </div>
                            </div>
                            
                            <div class="pt-4 border-t border-brand-dark-border mt-auto flex justify-between items-center text-xs relative z-10 bg-brand-dark-bg/50 -mx-5 -mb-5 px-5 py-4 group-hover:bg-brand-dark-panel/30 transition-colors">
                                <span class="text-gray-500 font-mono text-[9px] uppercase font-black tracking-widest">Avail: <span class="${vol.availability === 'Immediate' || vol.availability === 'Deployment Ready' ? 'text-brand-green-light font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]' : 'text-brand-amber'} ml-1">${vol.availability || 'Deployment Ready'}</span></span>
                                <button onclick="window.triggerDeployFromRegistry('${vol.id}')" class="text-brand-amber hover:text-white font-black tracking-widest uppercase transition-colors text-[10px] flex items-center gap-1.5 group/btn">Deploy <i class="fa-solid fa-arrow-right transform group-hover/btn:translate-x-1 transition-transform"></i></button>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="col-span-full py-24 text-center border-2 border-dashed border-brand-dark-border rounded-2xl bg-brand-dark-panel/40 shadow-inner">
                            <i class="fa-solid fa-users-slash text-5xl text-gray-600 mb-5 relative"><div class="absolute inset-0 bg-brand-dark-bg blur-xl z-[-1] opacity-50"></div></i>
                            <h3 class="text-gray-300 font-heading text-2xl tracking-wide">No Operatives Found</h3>
                            <p class="text-gray-500 text-xs mt-3 font-mono uppercase tracking-widest font-bold">Adjust filters or await registry synchronization</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}
