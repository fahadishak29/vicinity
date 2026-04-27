window.renderComms = function(container) {
    container.innerHTML = `
        <div class="glass-dark border border-brand-dark-border rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-160px)]">
            <div class="px-6 py-4 border-b border-brand-dark-border bg-brand-dark-bg flex items-center justify-between shadow-lg shrink-0">
                <div class="text-xs font-bold text-brand-amber uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-tower-broadcast text-lg"></i> Command Secure Channel</div>
                <div class="text-[9px] text-brand-green-light font-bold flex items-center gap-1 animate-pulse"><div class="w-1.5 h-1.5 rounded-full bg-brand-green-light"></div> Uplink Active</div>
            </div>
            
            <div id="admin-chat-messages" class="flex-1 overflow-y-auto px-6 py-6 space-y-4 font-mono pb-8">
                <div class="text-center text-[9px] text-gray-600 my-4 tracking-widest border-b border-brand-dark-border pb-2 mx-6">ENCRYPTED HANDSHAKE ESTABLISHED<br>AWAITING OPERATIVE TRANSMISSIONS</div>
            </div>
            
            <div class="p-4 border-t border-brand-dark-border bg-brand-dark-bg shrink-0 w-full">
                <form id="admin-chat-form" class="relative flex items-center m-0">
                    <input id="admin-chat-input" type="text" placeholder="Transmit to field operatives..." class="w-full bg-[#151C25] border border-brand-dark-border text-white text-sm px-6 py-4 rounded-xl focus:outline-none focus:border-brand-amber font-mono font-bold tracking-wide pr-16 shadow-inner">
                    <button type="submit" id="admin-btn-send-chat" class="absolute right-3 text-brand-amber hover:text-white transition-colors p-3 text-xl bg-brand-dark-panel border border-brand-amber/30 rounded-lg shadow-[0_0_10px_rgba(240,165,0,0.2)] hover:bg-brand-amber hover:shadow-[0_0_15px_rgba(240,165,0,0.4)]"><i class="fa-solid fa-satellite-dish mr-1"></i></button>
                </form>
            </div>
        </div>
    `;

    const { onSnapshot, collection, query, orderBy, addDoc } = window.fsCore;
    const db = window.db;

    if (!db) return;

    // Listen to comms
    const q = query(collection(db, "comms"), orderBy("timestamp", "asc"));
    
    // Cleanup any existing listener if this view is re-rendered
    if (window.adminCommsUnsubscribe) {
        window.adminCommsUnsubscribe();
    }

    window.adminCommsUnsubscribe = onSnapshot(q, (snapshot) => {
        const chatBox = document.getElementById('admin-chat-messages');
        if(!chatBox) return;
        
        // clear old messages except header
        Array.from(chatBox.children).forEach(c => {
            if(!c.innerHTML.includes('ENCRYPTED HANDSHAKE')) c.remove();
        });

        snapshot.forEach(docSnap => {
            const msg = docSnap.data();
            const isMe = msg.sender === 'Command';
            
            const div = document.createElement('div');
            div.className = `flex flex-col max-w-[70%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`;
            
            const senderName = document.createElement('span');
            senderName.className = `text-[9px] font-bold tracking-widest uppercase mb-1 ${isMe ? 'text-brand-amber' : 'text-gray-400'}`;
            senderName.innerText = isMe ? 'COMMAND' : msg.sender;
            
            const bubble = document.createElement('div');
            bubble.className = `px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${isMe ? 'bg-brand-dark-panel border border-brand-amber text-brand-amber rounded-br-sm' : 'bg-brand-green/20 border border-brand-green/50 text-white rounded-bl-sm'}`;
            bubble.innerText = msg.text;
            
            div.appendChild(senderName);
            div.appendChild(bubble);
            chatBox.appendChild(div);
        });
        
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    const chatForm = document.getElementById('admin-chat-form');
    if (chatForm) {
        chatForm.onsubmit = async (e) => {
            e.preventDefault();
            const input = document.getElementById('admin-chat-input');
            const txt = input.value.trim();
            if(!txt) return;
            
            try {
                await addDoc(collection(db, "comms"), {
                    text: txt,
                    sender: 'Command',
                    timestamp: new Date().toISOString()
                });
                input.value = '';
            } catch(e) {
                console.error("Msg fail", e);
            }
        };
    }
};
