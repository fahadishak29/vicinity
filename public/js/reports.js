function renderReports(container) {
    let html = `
        <div class="animate-fade-in space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b border-brand-dark-border pb-4">
                <div>
                    <h2 class="text-2xl font-heading text-white tracking-wide">Data Insight</h2>
                    <p class="text-brand-green-light text-sm font-mono tracking-widest uppercase">Analytics & Metrics Overview</p>
                </div>
                <button class="bg-brand-dark-panel border border-brand-dark-border hover:border-brand-amber text-brand-amber px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all font-mono font-bold tracking-wide shadow-[0_0_10px_rgba(240,165,0,0.1)] hover:bg-brand-amber hover:text-brand-dark-bg group">
                    <i class="fa-solid fa-download group-hover:animate-bounce"></i> EXPORT SECURE CSV
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="dark-card p-5 group hover:border-brand-dark-border/80 transition-colors">
                    <h3 class="text-gray-400 font-semibold mb-4 text-xs tracking-widest uppercase border-b border-brand-dark-border pb-2 group-hover:text-white transition-colors">Threat Categorization Matrix</h3>
                    <div class="h-72 flex items-center justify-center p-2">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
                
                <div class="dark-card p-5 group hover:border-brand-dark-border/80 transition-colors">
                    <h3 class="text-gray-400 font-semibold mb-4 text-xs tracking-widest uppercase border-b border-brand-dark-border pb-2 group-hover:text-white transition-colors">Operative Skill Distribution</h3>
                    <div class="h-72 flex items-center justify-center p-2 relative">
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span class="text-xs font-mono font-bold text-brand-dark-border text-center pt-2">ASSET<br>DIST</span>
                        </div>
                        <canvas id="skillsChart" class="relative z-10"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="dark-card overflow-hidden my-6">
                <div class="p-4 border-b border-brand-dark-border bg-brand-dark-panel flex justify-between items-center">
                    <h3 class="text-white font-semibold text-sm tracking-wider uppercase flex items-center gap-2">
                        <i class="fa-solid fa-triangle-exclamation text-red-500"></i> Code-Red Priorities (Top 5)
                    </h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left font-mono text-xs whitespace-nowrap">
                        <thead>
                            <tr class="text-gray-500 uppercase tracking-wider border-b border-brand-dark-border/50 bg-brand-dark-bg/80">
                                <th class="py-3 px-5">Identifier</th>
                                <th class="py-3 px-5">Classification</th>
                                <th class="py-3 px-5 text-right border-l border-brand-dark-border/30">Threat Level</th>
                                <th class="py-3 px-5 text-right border-l border-brand-dark-border/30">Action Status</th>
                            </tr>
                        </thead>
                        <tbody class="text-gray-300">
                            ${state.needs.slice().sort((a,b)=>b.urgencyScore - a.urgencyScore).slice(0,5).map((n, i) => `
                                <tr class="hover:bg-brand-dark-panel transition-colors border-b border-brand-dark-border/30 last:border-0 group">
                                    <td class="py-3.5 px-5 text-brand-amber font-bold">TRG-${n.id.substring(0,6).toUpperCase()}</td>
                                    <td class="py-3.5 px-5 flex items-center gap-2"><div class="w-2 h-2 rounded-full ${n.urgencyScore > 80 ? 'bg-red-500' : 'bg-orange-500'}"></div> ${n.category.toUpperCase()}</td>
                                    <td class="py-3.5 px-5 text-right border-l border-brand-dark-border/30 ${n.urgencyScore > 80 ? 'text-red-400 opacity-100 font-bold' : 'text-orange-400 opacity-90'}">${n.urgencyScore} / 100</td>
                                    <td class="py-3.5 px-5 text-right border-l border-brand-dark-border/30 font-bold ${n.assignedTo ? 'text-brand-green-light' : 'text-brand-dark-border group-hover:text-red-400'}">${n.assignedTo ? 'RESOLVING' : 'PENDING DEPLOY'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;

    setTimeout(() => {
        initCharts();
    }, 100);
}

function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = '#25303D';
    Chart.defaults.font.family = '"IBM Plex Sans", "Courier New", monospace';
    Chart.defaults.font.size = 11;
    
    // Category Chart - Dynamic aggregation from real-time data
    const categories = {};
    state.needs.forEach(n => {
        const cat = (n.category || 'Uncategorized').toUpperCase();
        categories[cat] = (categories[cat] || 0) + 1;
    });

    const catLabels = Object.keys(categories);
    const catData = Object.values(categories);

    const ctxCat = document.getElementById('categoryChart');
    if (ctxCat) {
        if(window.reportsCatInstance) window.reportsCatInstance.destroy();
        window.reportsCatInstance = new Chart(ctxCat.getContext('2d'), {
            type: 'bar',
            data: {
                labels: catLabels.length ? catLabels : ['NO INTEL'],
                datasets: [{
                    label: 'Active Targets',
                    data: catData.length ? catData : [0],
                    backgroundColor: catData.map(v => v > 0 ? 'rgba(240, 165, 0, 0.8)' : 'rgba(37, 48, 61, 0.2)'),
                    borderColor: catData.map(v => v > 0 ? '#F0A500' : 'rgba(37, 48, 61, 0.4)'),
                    borderWidth: 1,
                    borderRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(37,48,61,0.5)' },
                        ticks: { stepSize: 1, color: '#64748b' }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } }
                    }
                }
            }
        });
    }

    // Skills Chart - Using actual expertise array from volunteer profiles
    const skills = {};
    state.volunteers.forEach(v => {
        if (v.expertise && Array.isArray(v.expertise)) {
            v.expertise.forEach(s => {
                skills[s] = (skills[s] || 0) + 1;
            });
        }
    });

    const skillLabels = Object.keys(skills);
    const skillData = Object.values(skills);

    const ctxSkills = document.getElementById('skillsChart');
    if (ctxSkills) {
        if(window.reportsChartInstance) window.reportsChartInstance.destroy();

        window.reportsChartInstance = new Chart(ctxSkills.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: skillLabels.length ? skillLabels.map(l => l.toUpperCase()) : ['AWAITING OPERATIVES'],
                datasets: [{
                    data: skillData.length ? skillData : [1],
                    backgroundColor: skillData.length ? [
                        '#1A3C34', '#F0A500', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#64748b'
                    ] : ['#151C25'],
                    borderColor: '#0B0E14',
                    borderWidth: 3,
                    hoverOffset: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'right', 
                        labels: { 
                            color: '#cbd5e1', 
                            boxWidth: 12,
                            padding: 15,
                            font: { family: 'monospace', size: 10 }
                        } 
                    }
                },
                cutout: '75%',
                layout: { padding: 10 }
            }
        });
    }
}
