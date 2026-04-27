window.initNotifications = function() {
    const { onSnapshot, collection, query, orderBy, limit } = window.fsCore;
    const db = window.db;

    if (!db) return;

    let notifications = [];

    function renderNotifications() {
        const list = document.getElementById('notification-list');
        const indicator = document.getElementById('notification-indicator');
        
        if (!list) return;

        // Sort by time descending
        notifications.sort((a, b) => b.time - a.time);

        if (notifications.length === 0) {
            list.innerHTML = '<div class="p-4 text-center text-gray-500 text-xs font-mono">No active alerts.</div>';
            if (indicator) indicator.classList.add('hidden');
        } else {
            if (indicator) indicator.classList.remove('hidden');
            list.innerHTML = notifications.slice(0, 10).map(n => `
                <div class="px-4 py-3 border-b border-brand-dark-border hover:bg-white/5 cursor-pointer transition-colors notification-item" data-view="${n.targetView}">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded bg-${n.color}-500/20 text-${n.color}-400 flex items-center justify-center shrink-0 mt-0.5 border border-${n.color}-500/30">
                            <i class="${n.icon}"></i>
                        </div>
                        <div>
                            <div class="text-xs font-bold text-gray-200 mb-0.5">${n.title}</div>
                            <div class="text-[10px] text-gray-400 line-clamp-2">${n.desc}</div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Bind clicks
            document.querySelectorAll('.notification-item').forEach(el => {
                el.addEventListener('click', () => {
                    const view = el.dataset.view;
                    const navLink = document.querySelector(`[data-view="${view}"]`);
                    if (navLink) navLink.click();
                    
                    // close dropdown
                    document.getElementById('notification-dropdown').classList.add('hidden');
                });
            });
        }
    }

    // Since Firebase doesn't allow compound queries without an index by default,
    // we'll just listen to the latest needs and filter locally.
    onSnapshot(query(collection(db, "needs"), orderBy("timestamp", "desc"), limit(10)), (snapshot) => {
        notifications = notifications.filter(n => n.type !== 'need');
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.status === 'Open') {
                notifications.push({
                    id: docSnap.id,
                    type: 'need',
                    targetView: 'needs',
                    time: new Date(data.timestamp || Date.now()).getTime(),
                    title: `New Target: ${data.category}`,
                    desc: data.location || 'Location tracking active...',
                    color: 'red',
                    icon: 'fa-solid fa-crosshairs'
                });
            }
        });
        renderNotifications();
    });

    // Listen to comms
    onSnapshot(query(collection(db, "comms"), orderBy("timestamp", "desc"), limit(10)), (snapshot) => {
        notifications = notifications.filter(n => n.type !== 'comm');
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.sender !== 'Command' && data.sender !== 'System') {
                notifications.push({
                    id: docSnap.id,
                    type: 'comm',
                    targetView: 'comms',
                    time: new Date(data.timestamp || Date.now()).getTime(),
                    title: `Intel: ${data.sender}`,
                    desc: data.text,
                    color: 'brand-amber',
                    icon: 'fa-solid fa-walkie-talkie'
                });
            }
        });
        renderNotifications();
    });

    // Setup dropdown toggle
    const btn = document.getElementById('notification-btn');
    const dropdown = document.getElementById('notification-dropdown');
    if (btn && dropdown) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
            if (!dropdown.classList.contains('hidden')) {
                dropdown.style.display = 'flex';
            } else {
                dropdown.style.display = '';
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
                dropdown.classList.add('hidden');
                dropdown.style.display = '';
            }
        });
    }

    const clearBtn = document.getElementById('clear-notifications');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifications = [];
            renderNotifications();
        });
    }
};
