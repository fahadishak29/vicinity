function renderTasks(container) {
    let html = `
        <div class="animate-fade-in flex flex-col h-[calc(100vh-140px)]">
            <div class="flex justify-between items-center mb-6 border-b border-brand-dark-border pb-4">
                <div>
                    <h2 class="text-2xl font-heading text-white tracking-wide">Active Ops Tracker</h2>
                    <p class="text-brand-green-light text-sm font-mono tracking-widest uppercase">Live Mission Board</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-mono text-brand-amber bg-brand-amber/10 px-3 py-1.5 rounded border border-brand-amber/30 uppercase tracking-widest font-bold animate-pulse">
                        <i class="fa-solid fa-satellite-dish mr-1"></i> Live Sync
                    </span>
                </div>
            </div>

            <div class="flex-1 overflow-x-auto custom-scrollbar">
                <div class="flex gap-6 h-full min-w-[1000px] pb-4">
                    <!-- Column 1 -->
                    <div class="flex-1 kanban-column flex flex-col" data-status="Critical">
                        <div class="flex justify-between items-center mb-4 px-2 border-b border-red-500/30 pb-2">
                            <h3 class="font-bold text-red-500 tracking-wider uppercase text-xs">Unassigned Crit-Level</h3>
                            <span class="bg-red-500/20 text-red-500 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border border-red-500/30">L1</span>
                        </div>
                        <div class="flex-1 space-y-4 kanban-dropzone p-1 rounded-lg" ondragover="window.kanban.allowDrop(event)" ondrop="window.kanban.drop(event)">
                            ${getTasksHtml('Critical', true)}
                        </div>
                    </div>
                    <!-- Column 2 -->
                    <div class="flex-1 kanban-column flex flex-col" data-status="Pending">
                        <div class="flex justify-between items-center mb-4 px-2 border-b border-orange-500/30 pb-2">
                            <h3 class="font-bold text-orange-400 tracking-wider uppercase text-xs">Assigned (Pending Start)</h3>
                            <span class="bg-orange-500/20 text-orange-400 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border border-orange-500/30">L2</span>
                        </div>
                        <div class="flex-1 space-y-4 kanban-dropzone p-1 rounded-lg" ondragover="window.kanban.allowDrop(event)" ondrop="window.kanban.drop(event)">
                            ${getTasksHtml('Open')}
                        </div>
                    </div>
                    <!-- Column 3 -->
                    <div class="flex-1 kanban-column flex flex-col" data-status="In Progress">
                        <div class="flex justify-between items-center mb-4 px-2 border-b border-blue-400/30 pb-2">
                            <h3 class="font-bold text-blue-400 tracking-wider uppercase text-xs">Engagement In Prog</h3>
                            <span class="bg-blue-500/20 text-blue-400 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border border-blue-500/30">L3</span>
                        </div>
                        <div class="flex-1 space-y-4 kanban-dropzone p-1 rounded-lg" ondragover="window.kanban.allowDrop(event)" ondrop="window.kanban.drop(event)">
                            ${getTasksHtml('In Progress')}
                        </div>
                    </div>
                    <!-- Column 4 -->
                    <div class="flex-1 kanban-column flex flex-col" data-status="Resolved">
                        <div class="flex justify-between items-center mb-4 px-2 border-b border-brand-green/30 pb-2">
                            <h3 class="font-bold text-brand-green-light tracking-wider uppercase text-xs">Mission Terminated</h3>
                            <span class="bg-brand-green/20 text-brand-green-light rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border border-brand-green/30">L4</span>
                        </div>
                        <div class="flex-1 space-y-4 kanban-dropzone p-1 rounded-lg" ondragover="window.kanban.allowDrop(event)" ondrop="window.kanban.drop(event)">
                            ${getTasksHtml('Resolved')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function getTasksHtml(status, criticalOnly = false) {
    let tasks = state.needs.filter(n => {
        if (criticalOnly) return n.status === 'Open' && n.urgencyLevel === 'Critical' && !n.assignedTo;
        if (status === 'Open') return n.status === 'Open' && n.assignedTo && n.urgencyLevel !== 'Critical';
        return n.status === status;
    });

    return tasks.map(t => `
        <div id="${t.id}" class="kanban-card p-4 rounded-xl border-l-[4px] ${t.urgencyLevel === 'Critical' ? 'border-l-red-500 hover:border-l-red-400' : 'border-l-brand-dark-border hover:border-l-brand-amber'} transition-colors" draggable="true" ondragstart="window.kanban.drag(event)">
            <div class="flex justify-between items-start mb-2.5">
                <span class="${t.urgencyLevel === 'Critical' ? 'text-red-400' : 'text-white'} font-bold tracking-wide uppercase text-xs">${t.category}</span>
                ${utils.getUrgencyBadge(t.urgencyLevel)}
            </div>
            <p class="text-[11px] text-gray-400 mb-3 line-clamp-2 leading-relaxed">${t.description}</p>
            <div class="flex items-center gap-1.5 text-[10px] text-brand-green-light font-mono font-semibold mb-3 bg-brand-dark-bg p-1.5 rounded border border-brand-dark-border">
                <i class="fa-solid fa-location-crosshairs text-gray-500"></i> ${t.location.toUpperCase()}
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-brand-dark-border text-[9px] uppercase font-bold tracking-widest font-mono">
                ${t.assignedTo ? `<div class="flex items-center gap-2" title="${t.assignedTo}"><div class="w-5 h-5 rounded-full bg-brand-dark-border text-gray-300 flex items-center justify-center border border-gray-600"><i class="fa-solid fa-user-astronaut text-[8px]"></i></div><span class="text-brand-amber">ASSIGNED</span></div>` : '<span class="text-gray-500 px-2 py-0.5 rounded border border-brand-dark-border border-dashed">NO AGENT</span>'}
                <span class="text-gray-600">ID: ${t.id.toUpperCase()}</span>
            </div>
        </div>
    `).join('');
}

window.kanban = {
    drag: (ev) => { ev.dataTransfer.setData("text", ev.target.id); ev.target.classList.add('dragging'); },
    allowDrop: (ev) => { ev.preventDefault(); ev.currentTarget.classList.add('drag-over'); },
    drop: (ev) => {
        ev.preventDefault();
        ev.currentTarget.classList.remove('drag-over');
        const data = ev.dataTransfer.getData("text");
        const node = document.getElementById(data);
        if (node) {
            node.classList.remove('dragging');
            ev.currentTarget.appendChild(node);
            
            // Sync with Server DB
            const col = ev.currentTarget.closest('.kanban-column');
            if(col && col.dataset.status) {
                const newStatus = col.dataset.status;
                const needId = node.id;
                
                const docRef = window.fsCore.doc(window.db, "needs", needId);
                window.fsCore.updateDoc(docRef, { status: newStatus }).catch(e => console.error("Firestore Sync Error:", e));
                
                // Real-time listener in app.js handles the re-rendering automatically
            }
        }
    }
};

document.addEventListener('dragend', (e) => {
    if(e.target.classList.contains('kanban-card')) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.kanban-dropzone').forEach(el => el.classList.remove('drag-over'));
    }
});
document.addEventListener('dragleave', (e) => {
    if(e.target && e.target.classList && e.target.classList.contains('kanban-dropzone')) e.target.classList.remove('drag-over');
});
