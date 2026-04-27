        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
        import { getFirestore, collection, onSnapshot, doc, getDoc, updateDoc, increment, query, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAvVEFO_GxfCC-FzrvfagEf9NoiAd1zR8w",
            authDomain: "vicinity-8b34f.firebaseapp.com",
            projectId: "vicinity-8b34f",
            storageBucket: "vicinity-8b34f.firebasestorage.app"
        };

        const appFirebase = initializeApp(firebaseConfig);
        const auth = getAuth(appFirebase);
        const db = getFirestore(appFirebase);
        let currentUser = null;

        // Disconnect Button
        window.disconnect = async function() {
            await signOut(auth);
            window.location.href = 'volunteer.html';
        };

        // Render Icons Helper
        function getIcon(category) {
            switch(category) {
                case 'Healthcare': return '<i class="fa-solid fa-suitcase-medical"></i>';
                case 'Food': return '<i class="fa-solid fa-bowl-food"></i>';
                case 'Water': return '<i class="fa-solid fa-bottle-water"></i>';
                case 'Shelter': return '<i class="fa-solid fa-tent"></i>';
                case 'Rescue': return '<i class="fa-solid fa-person-falling"></i>';
                default: return '<i class="fa-solid fa-triangle-exclamation"></i>';
            }
        }
        function getColorBadge(score) {
            if(score >= 80) return 'bg-red-500/10 text-red-400 border border-red-500/20';
            if(score >= 50) return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
            return 'bg-brand-green/20 text-brand-green-light border border-brand-green/30';
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                window.globalNeeds = [];
                window.volunteerName = "Operative";
                
                onSnapshot(doc(db, "volunteers", user.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        window.volunteerName = data.name || "Operative";
                        document.getElementById('op-name').innerText = data.name || "Unknown Asset";
                        document.getElementById('op-rank').innerText = `${data.rating || 0} PTS | ${data.status ? data.status.toUpperCase() : 'ACTIVE'} STATUS`;
                    }
                });

                // Listen to Needs
                onSnapshot(collection(db, "needs"), (snapshot) => {
                    const needs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                    window.globalNeeds = needs;
                    updateRadarNodes(needs);
                    
                    // Filter Open Targets
                    const openTargets = needs.filter(n => n.status === 'Open').sort((a,b) => (b.urgencyScore||0) - (a.urgencyScore||0)).slice(0, 5);
                    const openContainer = document.getElementById('open-targets-container');
                    
                    if(openTargets.length === 0) {
                        openContainer.innerHTML = '<div class="text-center py-6 text-gray-600 font-mono text-[10px] uppercase">Grid Clear. No Targets.</div>';
                    } else {
                        openContainer.innerHTML = openTargets.map(n => \`
                            <div class="glass-panel rounded-2xl p-4 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer border border-brand-dark-border hover:border-brand-amber/30 group shadow-sm bg-gradient-to-r hover:from-[rgba(240,165,0,0.05)] to-transparent">
                                <div class="w-12 h-12 rounded-xl bg-brand-dark-bg border border-brand-dark-border text-gray-400 flex items-center justify-center shrink-0 relative overflow-hidden">
                                    <div class="text-xl relative z-10 group-hover:scale-110 group-hover:text-brand-amber transition-all">\${getIcon(n.category)}</div>
                                </div>
                                <div class="flex-1 min-w-0 py-0.5">
                                    <div class="flex justify-between items-start mb-1.5">
                                        <h4 class="font-bold text-gray-200 truncate tracking-wide text-sm">\${n.category}</h4>
                                        <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 shadow-sm \${getColorBadge(n.urgencyScore)}">THREAT: \${n.urgencyScore||0}</span>
                                    </div>
                                    <p class="text-xs text-gray-500 font-medium truncate tracking-wide"><i class="fa-solid fa-location-dot mr-1.5 opacity-60"></i>\${n.location} • \${n.source === 'NGO_BATCH_SYNC' ? '<i class="fa-solid fa-cloud-arrow-down text-brand-amber"></i> NGO Feed' : 'Local Request'}</p>
                                </div>
                            </div>
                        \`).join('');
                    }

                    // Render Directive
                    const activeMission = needs.find(n => (n.assignedTo === user.uid || (n.assignedTo && n.assignedTo.includes(user.uid))) && n.status !== 'Resolved');
                    const directiveContainer = document.getElementById('primary-directive-container');
                    
                    if(activeMission) {
                        directiveContainer.innerHTML = \`
                            <div class="bg-[#151C25] rounded-3xl p-5 border border-brand-amber/40 shadow-[0_8px_30px_rgba(240,165,0,0.15)] relative overflow-hidden group">
                                <div class="absolute top-0 right-0 bg-brand-amber/10 border-b border-l border-brand-amber/30 text-brand-amber text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl z-10 font-mono shadow-sm">Assigned Objective</div>
                                <div class="flex items-start gap-4 mb-5 relative z-10">
                                    <div class="w-14 h-14 rounded-2xl bg-brand-dark-bg border border-brand-dark-border text-brand-amber flex items-center justify-center text-2xl shrink-0 drop-shadow-[0_0_15px_rgba(240,165,0,0.3)]">
                                        \${getIcon(activeMission.category)}
                                    </div>
                                    <div class="pt-1">
                                        <h3 class="font-bubbly font-black text-white text-xl leading-tight tracking-wide">\${activeMission.category} Crisis</h3>
                                        <p class="text-gray-400 text-[10px] font-mono font-bold tracking-widest mt-1.5 uppercase"><i class="fa-solid fa-satellite mr-1"></i> Dispatched via Smart OS</p>
                                    </div>
                                </div>
                                <div class="space-y-2.5 mb-6 relative z-10">
                                    <div class="bg-brand-dark-bg border border-brand-dark-border rounded-2xl p-3.5 flex items-center gap-4">
                                        <div class="w-8 h-8 rounded-full bg-brand-dark-panel flex items-center justify-center shrink-0">
                                            <i class="fa-solid fa-location-arrow text-brand-amber text-sm"></i>
                                        </div>
                                        <div>
                                            <p class="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-0.5">Vector Location</p>
                                            <p class="text-sm text-gray-200 font-bold tracking-wide">\${activeMission.location}</p>
                                        </div>
                                    </div>
                                    <div class="bg-brand-dark-bg border border-brand-dark-border rounded-2xl p-3.5">
                                        <p class="text-[10px] text-gray-500 font-bold tracking-widest mb-1.5 uppercase"><i class="fa-solid fa-file-waveform mr-1 text-brand-amber"></i> Live Feed Intel</p>
                                        <p class="text-xs text-gray-300 font-medium leading-relaxed font-mono">\${activeMission.description}</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-3 relative z-10">
                                    <a href="https://www.google.com/maps/dir/?api=1&destination=\${activeMission.lat||\'\'},\${activeMission.lng||\'\'}" target="_blank" class="bg-brand-dark-bg border border-brand-dark-border text-white hover:border-brand-amber font-bubbly font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors tracking-wide text-lg">
                                        <i class="fa-solid fa-map text-brand-amber text-sm mb-0.5"></i> Nav
                                    </a>
                                    <button onclick="window.resolveMission('\${activeMission.id}')" id="op-resolve-btn" class="bg-brand-green hover:bg-brand-green-light border border-brand-green-light text-white font-bubbly font-black py-4 rounded-xl shadow-[0_4px_15px_rgba(26,60,52,0.5)] flex items-center justify-center gap-2 transition-colors tracking-wide text-lg">
                                        <i class="fa-solid fa-check-double text-xs mb-0.5"></i> Resolve
                                    </button>
                                </div>
                                <i class="fa-solid fa-fingerprint absolute -right-6 -bottom-6 text-9xl text-white opacity-[0.02] transform -rotate-12 pointer-events-none"></i>
                            </div>
                        \`;
                    } else {
                        directiveContainer.innerHTML = \`
                            <div class="bg-brand-dark-bg/50 border border-brand-dark-border rounded-3xl p-6 text-center text-gray-500 text-xs font-mono font-bold tracking-widest uppercase">
                                <i class="fa-solid fa-mug-hot text-3xl mb-3 opacity-60"></i><br>
                                No Active Directive.<br>Awaiting Deploy Orders from Command OS.
                            </div>
                        \`;
                    }
                });

            } else {
                window.location.href = 'volunteer.html'; // Redirect to login
            }
        });

        window.resolveMission = async function(needId) {
            const btn = document.getElementById('op-resolve-btn');
            if(btn) { btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>'; btn.disabled = true; }
            try {
                await updateDoc(doc(db, "needs", needId), { status: 'Resolved' });
                await updateDoc(doc(db, "volunteers", currentUser.uid), { points: increment(50), missionsCompleted: increment(1) });
            } catch(e) {
                console.error("Resolve failed", e);
                if(btn) { btn.innerHTML = '<i class="fa-solid fa-xmark text-red-500"></i> Error'; }
            }
        };

        // --- NEW FEATURES IMPLEMENTATION ---

        window.switchOpTab = function(tabName, btnElement) {
            // Hide all views
            document.querySelectorAll('.op-view').forEach(el => {
                el.classList.remove('block', 'flex');
                el.classList.add('hidden');
            });
            
            // Show target view
            const targetEl = document.getElementById('view-' + tabName);
            if(targetEl) {
                if(tabName === 'comms') targetEl.classList.add('flex');
                else targetEl.classList.add('block');
                targetEl.classList.remove('hidden');
            }

            // Update bottom dock styles
            document.querySelectorAll('.op-dock-btn').forEach(btn => {
                btn.classList.remove('text-brand-amber');
                btn.classList.add('text-gray-500');
            });
            if(btnElement) {
                btnElement.classList.remove('text-gray-500');
                btnElement.classList.add('text-brand-amber');
            }

            // Trigger Map render if Switching to Radar
            if(tabName === 'radar' && window.opMapInstance) {
                setTimeout(() => window.opMapInstance.invalidateSize(), 150);
            }
        };

        // Initialize Tactical Radar Map
        window.opMapInstance = null;
        window.opMapLayers = null;
        const initMap = () => {
             const mapEl = document.getElementById('op-map');
             if(!mapEl || window.opMapInstance) return;
             
             window.opMapInstance = L.map('op-map', { zoomControl: false, attributionControl: false }).setView([12.9716, 77.5946], 11);
             window.opMapLayers = L.layerGroup().addTo(window.opMapInstance);
             L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(window.opMapInstance);
        };
        setTimeout(initMap, 1000);

        // Update Radar Markers dynamically
        function updateRadarNodes(needsList) {
            if(!window.opMapLayers) return;
            window.opMapLayers.clearLayers();

            let activeLat = null, activeLng = null;

            needsList.forEach(need => {
                if(need.status === 'Resolved') return;
                
                let color = '#10b981';
                let radius = 6;
                let isMine = (need.assignedTo === currentUser.uid);

                if (need.urgencyLevel === 'Critical') { color = '#ef4444'; radius = 10; }
                else if (need.urgencyLevel === 'High') { color = '#f97316'; radius = 8; }
                
                if (isMine) {
                    activeLat = need.lat; activeLng = need.lng;
                    // Tactical Pulse Marker for my target
                    const pulseIcon = L.divIcon({
                        className: 'target-marker',
                        html: `<div class="w-8 h-8 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-ping relative z-50"><i class="fa-solid fa-crosshairs text-xs"></i></div>`,
                        iconSize: [32, 32], iconAnchor: [16, 16]
                    });
                    L.marker([need.lat, need.lng], { icon: pulseIcon }).addTo(window.opMapLayers);
                } else {
                    L.circleMarker([need.lat, need.lng], {
                        radius: radius, fillColor: color, color: color, weight: 1.5, opacity: 0.9, fillOpacity: 0.5
                    }).addTo(window.opMapLayers);
                }
            });

            if(activeLat && window.opMapInstance) {
                window.opMapInstance.setView([activeLat, activeLng], 14);
            }
        }

        // Comms Chat Module Database Sync
        const q = query(collection(db, "comms"), orderBy("timestamp", "asc"));
        onSnapshot(q, (snapshot) => {
            const chatBox = document.getElementById('chat-messages');
            if(!chatBox) return;
            
            // clear old messages except header
            Array.from(chatBox.children).forEach(c => {
                if(!c.innerHTML.includes('ENCRYPTED HANDSHAKE')) c.remove();
            });

            snapshot.forEach(docSnap => {
                const msg = docSnap.data();
                const isMe = msg.sender === window.volunteerName;
                
                const div = document.createElement('div');
                div.className = `flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`;
                
                const senderName = document.createElement('span');
                senderName.className = `text-[8px] font-bold tracking-widest uppercase mb-1 ${isMe ? 'text-brand-amber' : 'text-gray-500'}`;
                senderName.innerText = isMe ? 'YOU' : msg.sender;
                
                const bubble = document.createElement('div');
                bubble.className = `px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-md ${isMe ? 'bg-brand-amber text-brand-dark-bg rounded-br-sm' : 'bg-brand-dark-panel border border-brand-dark-border text-gray-300 rounded-bl-sm'}`;
                bubble.innerText = msg.text;
                
                div.appendChild(senderName);
                div.appendChild(bubble);
                chatBox.appendChild(div);
            });
            
            chatBox.scrollTop = chatBox.scrollHeight;
        });

        // Chat Form Submit
        document.getElementById('chat-form').onsubmit = async (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input');
            const txt = input.value.trim();
            if(!txt || !currentUser) return;
            
            try {
                await addDoc(collection(db, "comms"), {
                    text: txt,
                    sender: window.volunteerName || 'Operative',
                    timestamp: new Date().toISOString()
                });
                input.value = '';
            } catch(e) {
                console.error("Msg fail", e);
            }
        };

