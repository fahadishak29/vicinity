function renderLogistics(container) {
    let html = `
        <div class="animate-fade-in flex flex-col h-full space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-dark-border pb-4">
                <div>
                    <h2 class="text-2xl font-heading text-white tracking-wide">Predictive Supply Forecast</h2>
                    <p class="text-brand-green-light text-sm font-mono tracking-widest uppercase">AI Material Pipeline Intelligence</p>
                </div>
            </div>

            <div class="flex-1 dark-card border border-brand-dark-border shadow-2xl rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                <!-- Background ambient glow -->
                <div class="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-transparent pointer-events-none"></div>
                <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

                <div class="text-center z-10 w-full max-w-4xl flex flex-col items-center">
                    <i class="fa-solid fa-boxes-stacked text-5xl text-brand-dark-border mb-6"></i>
                    <h3 class="text-white text-xl font-heading tracking-wide mb-2">Global Logistics & Medical Supply Chain</h3>
                    <p class="text-gray-400 text-xs font-mono mb-8 max-w-lg text-center leading-relaxed">The AI Quartermaster analyzes every active structural and medical trauma variable across all sectors to predict specific material bottlenecks before they occur.</p>
                    
                    <button onclick="window.runGeminiQuartermaster()" id="btn-run-logistics" class="bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_50px_rgba(147,51,234,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-3">
                        <i class="fa-solid fa-microchip text-xl"></i> INITIATE AI QUARTERMASTER
                    </button>
                    
                    <!-- Forecast Container -->
                    <div id="forecast-container" class="mt-12 w-full text-left bg-brand-dark-bg/80 border border-purple-500/30 rounded-xl p-6 hidden">
                        <div class="flex items-center gap-3 mb-4 pb-4 border-b border-purple-500/20">
                            <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                <i class="fa-solid fa-radar text-lg"></i>
                            </div>
                            <div>
                                <h4 class="text-purple-400 font-bold uppercase tracking-widest text-sm">Tactical Forecast Generated</h4>
                                <p class="text-[10px] text-gray-500 font-mono" id="forecast-timestamp"></p>
                            </div>
                        </div>
                        <div id="forecast-content" class="text-gray-300 font-sans text-sm leading-relaxed space-y-4"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

window.runGeminiQuartermaster = async function() {
    const btn = document.getElementById('btn-run-logistics');
    const container = document.getElementById('forecast-container');
    const content = document.getElementById('forecast-content');
    const timeLabel = document.getElementById('forecast-timestamp');
    
    if(!btn || !container || !content) return;
    
    // Aggregating data
    const activeNeeds = window.state.needs.filter(n => n.status !== 'Resolved');
    
    if(activeNeeds.length === 0) {
        alert("No active emergencies in the database to forecast. Add emergencies or run the Sandbox first!");
        return;
    }

    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-xl"></i> PROCESSING SECTOR DATA...';
    btn.classList.add('opacity-80', 'cursor-wait');
    btn.disabled = true;

    container.classList.remove('hidden');
    content.innerHTML = '<div class="text-center py-8 text-purple-400 font-mono animate-pulse uppercase tracking-widest"><i class="fa-solid fa-satellite-dish mr-2"></i> Uplinking to Gemini AI Core...</div>';
    
    const payload = activeNeeds.map(n => `Category: ${n.category} | Trauma/Threat Details: ${n.description}`).join('\n');
    
    const prompt = `You are the Chief Military Quartermaster and Medical Supply chain manager for a massive disaster relief operation.
We currently have ${activeNeeds.length} active emergency variables in the field:
--- 
${payload}
---
TASK: Based ONLY on the active injury and structural descriptions above, predict exactly what 3 highly specific medical/hardware items we are going to run out of in the next 12 hours. Do not hallucinate basic supplies if they don't match the specific traumas (e.g. if there are no crush injuries, don't request tourniquets). 
FORMAT: Output a high-urgency, military-style brief. Use EXACTLY THREE bullet points. Be extremely brief, punchy, and sound like a tactical commander. 
Do not wrap your output in markdown code blocks. Replace any bold markdown ** with HTML <strong class="text-white"> tags.`;

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
        
        // Clean formatting
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white tracking-wider">$1</strong>');
        text = text.replace(/\*/g, '<span class="text-purple-500 mr-2 text-lg leading-none">&bull;</span>');
        
        content.innerHTML = text.split('\n').filter(l => l.trim() !== '').map(l => `<p class="border-l-2 border-purple-500/20 pl-4 py-1">${l}</p>`).join('');
        
    } catch(err) {
        console.error("Forecast Error:", err);
        content.innerHTML = `<div class="text-red-400 font-mono text-center"><i class="fa-solid fa-triangle-exclamation mr-2"></i> UPLINK FAILED: ${err.message}</div>`;
    }
    
    timeLabel.innerText = new Date().toISOString();
    btn.innerHTML = '<i class="fa-solid fa-check text-xl"></i> FORECAST GENERATED';
    btn.classList.replace('bg-purple-600', 'bg-brand-green');
    btn.classList.replace('hover:bg-purple-500', 'hover:bg-brand-green-light');
    btn.classList.replace('shadow-[0_0_30px_rgba(147,51,234,0.3)]', 'shadow-[0_0_30px_rgba(26,60,52,0.8)]');
};
