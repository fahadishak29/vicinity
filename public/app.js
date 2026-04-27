import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, addDoc, getDoc, increment, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvVEFO_GxfCC-FzrvfagEf9NoiAd1zR8w",
    authDomain: "vicinity-8b34f.firebaseapp.com",
    projectId: "vicinity-8b34f",
    storageBucket: "vicinity-8b34f.firebasestorage.app",
    messagingSenderId: "551409509601",
    appId: "1:551409509601:web:432f2ff6567b037e23c3a0",
    measurementId: "G-GLPPNBGYEJ"
};

let appFirebase, auth, db;
if (firebaseConfig.apiKey) {
    appFirebase = initializeApp(firebaseConfig);
    auth = getAuth(appFirebase);
    setPersistence(auth, browserSessionPersistence).catch(console.error);
    db = getFirestore(appFirebase);
    window.db = db;
    window.fsCore = { doc, updateDoc, addDoc, collection, getDoc, increment, onSnapshot, query, orderBy, limit, where };
}


const state = {
    needs: [],
    volunteers: [],
    currentView: 'dashboard',
    isAuthenticated: false
};
window.state = state; // Expose module-level state to view scripts

// Utilities
const utils = {
    highlightCriticalTerms: (text) => {
        if (!text) return text;
        const colorMap = {};
        
        const mapping = {
            'bg-red-500/20 text-red-500 border-red-500/30 shadow-[0_0_5px_rgba(239,68,68,0.2)]': [
                "injured","bleeding","wound","sick","fever","infection","unconscious","critical","doctor","hospital","ambulance","trauma","urgent","immediately","asap","dying","life threatening","severe","help now","right now","dangerous","risk","heart attack","stroke","burns","amputation","seizure","choking","poison","overdose","hemorrhage","cardiac arrest","asthma","anaphylaxis","broken bone","head injury","spinal injury","laceration","hypothermia","heat stroke","shock","convulsions","chest pain","shortness of breath","respiratory failure","unresponsive","gunshot","stab wound","crush injury","dislocation","concussion","coma","severe pain"
            ],
            'bg-brand-amber/20 text-brand-amber border-brand-amber/30 shadow-[0_0_5px_rgba(240,165,0,0.2)]': [
                "homeless","no shelter","roof collapsed","house destroyed","evacuation","displaced","unsafe home","flood inside house","trapped","stuck","missing","rescue","stranded","cannot move","blocked","collapsed building","buried","help me","evacuate","no transport","need vehicle","relocation","cannot escape","earthquake","fire","storm","cyclone","explosion","rubble","debris","collapsing"
            ],
            'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_5px_rgba(59,130,246,0.2)]': [
                "water","no water","thirst","dehydration","drinking water","clean water","contaminated water"
            ],
            'bg-green-500/20 border-green-500/30 text-green-400 shadow-[0_0_5px_rgba(34,197,94,0.2)]': [
                "food","hungry","starving","ration","meals","malnutrition","no food","groceries","rice","wheat","no electricity","power outage","blackout","no signal","network down","communication lost","toilet","sanitation","hygiene","dirty","waste","garbage","no toilets","disease spreading"
            ],
            'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_5px_rgba(168,85,247,0.2)]': [
                "children","kids","elderly","pregnant","disabled","many people","crowd","family","flood","heatwave","smoke","needed","required","soon","quickly","struggling","spreading","worsening","clothes","nausea","headache","vomiting","vomitting","cold"
            ]
        };

        let allTerms = [];
        for (const [color, terms] of Object.entries(mapping)) {
            terms.forEach(t => {
                colorMap[t.toLowerCase()] = color;
                allTerms.push(t.toLowerCase());
            });
        }
        
        allTerms.sort((a, b) => b.length - a.length);

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedTerms = allTerms.map(escapeRegExp);
        const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');
        
        return text.replace(regex, (match) => {
            const colorClass = colorMap[match.toLowerCase()];
            return `<span class="${colorClass} px-1.5 py-0.5 mx-0.5 rounded font-bold uppercase tracking-wider text-[10px]">${match}</span>`;
        });
    },
    SUB_OFFICES: {
        "Hoskote": {lat: 13.0713, lng: 77.7997},
        "Marathahalli": {lat: 12.9569, lng: 77.7011},
        "Whitefield": {lat: 12.9698, lng: 77.7499},
        "Indiranagar": {lat: 12.9784, lng: 77.6408},
        "Koramangala": {lat: 12.9279, lng: 77.6271},
        "Jayanagar": {lat: 12.9298, lng: 77.5824},
        "Electronic City": {lat: 12.8452, lng: 77.6602},
        "Malleshwaram": {lat: 13.0031, lng: 77.5701},
        "Yeshwanthpur": {lat: 13.0245, lng: 77.5410},
        "Yelahanka": {lat: 13.1007, lng: 77.5963}
    },
    getDistanceKM: (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },
    getUrgencyBadge: (level) => {
        const colors = {
            'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
            'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'Low': 'bg-brand-green border-brand-green/30 text-white'
        };
        return `<span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${colors[level]}">${level}</span>`;
    },
    getStatusBadge: (status) => {
        const colors = {
            'Open': 'bg-slate-800 text-slate-300 border-slate-700',
            'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'Resolved': 'bg-brand-green border-brand-green/30 text-emerald-400'
        };
        return `<span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${colors[status]}">${status}</span>`;
    },
    getScoreColorClass: (score) => {
        if (score >= 80) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]';
        if (score >= 60) return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]';
        if (score >= 40) return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]';
        return 'bg-brand-green shadow-[0_0_10px_rgba(26,60,52,0.6)]';
    }
};
window.utils = utils; // Expose module-level utilities to view scripts

// Application Auth & Init
window.app = {
    toggleAuthMode: function (mode) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const tabLogin = document.getElementById('tab-login');
        const tabSignup = document.getElementById('tab-signup');
        const tabsContainer = document.querySelector('.flex.border-b');

        tabsContainer.classList.remove('hidden');

        if (mode === 'login') {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            tabLogin.className = "flex-1 py-3 text-xs font-bold uppercase tracking-widest text-brand-amber border-b-2 border-brand-amber transition-colors";
            tabSignup.className = "flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 border-b-2 border-transparent hover:text-gray-300 transition-colors";
        } else {
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            tabSignup.className = "flex-1 py-3 text-xs font-bold uppercase tracking-widest text-brand-amber border-b-2 border-brand-amber transition-colors";
            tabLogin.className = "flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 border-b-2 border-transparent hover:text-gray-300 transition-colors";
        }
    },

    init: async function () {
        // Realtime Firestore Data Sync
        if (db) {
            onSnapshot(collection(db, "needs"), (snapshot) => {
                state.needs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                if (state.isAuthenticated && document.getElementById('views-container') && document.getElementById('views-container').innerHTML !== '') {
                    if (state.currentView === 'dashboard' && window.updateDashboardData) {
                        window.updateDashboardData();
                    } else if (state.currentView === 'fusion') {
                        // Prevent re-render to save upload progress UI
                    } else {
                        renderView(state.currentView, document.getElementById('views-container'));
                    }
                }
            }, (error) => console.error("[VICINITY ERR] Needs Sync:", error));

            onSnapshot(collection(db, "volunteers"), (snapshot) => {
                state.volunteers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                if (state.isAuthenticated && document.getElementById('views-container') && document.getElementById('views-container').innerHTML !== '') {
                    if (state.currentView === 'dashboard' && window.updateDashboardData) {
                        window.updateDashboardData();
                    } else if (state.currentView === 'fusion') {
                        // Prevent re-render to save upload progress UI
                    } else {
                        renderView(state.currentView, document.getElementById('views-container'));
                    }
                }
            }, (error) => console.error("[VICINITY ERR] Volunteers Sync:", error));
        } else {
            console.error("[VICINITY ERR] API disconnected. Data unsynced.");
        }

        // Firebase Session check
        if (auth) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    state.isAuthenticated = true;
                    // Inject real user info into nav
                    const navName = document.querySelector('.grid-text');
                    if (navName) navName.textContent = user.displayName || user.email;

                    window.app.showMainApp();
                    // Don't call renderCurrentView() directly if it's undefined, we handle it in showMainApp
                } else {
                    state.isAuthenticated = false;
                    window.app.showAuth();
                }
            });
        } else {
            console.warn("[VICINITY WARN] Firebase Config Missing in app.js. Falling back to simple simulator.");
            if (localStorage.getItem('vicinity_auth')) {
                this.showMainApp();
            } else {
                this.showAuth();
            }
        }

        // Setup clock
        setInterval(() => {
            const now = new Date();
            document.getElementById('time-val').textContent = now.toLocaleTimeString('en-US', { hour12: false });
        }, 1000);
    },

    loginWithFirebase: async function () {
        if (!auth) {
            alert("Firebase is not configured! Check app.js.");
            localStorage.setItem('vicinity_auth', 'true');
            return location.reload();
        }
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');
        const err = document.getElementById('login-error');

        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
        btn.disabled = true;

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            err.classList.add('hidden');
        } catch (error) {
            err.classList.remove('hidden');
            document.getElementById('login-error-msg').innerText = "Access Denied: " + error.message;
        }

        btn.innerHTML = 'Authenticate Session <i class="fa-solid fa-fingerprint ml-1"></i>';
        btn.disabled = false;
    },

    registerWithFirebase: async function () {
        if (!auth) return alert("Firebase is not configured! Check app.js.");
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const pass = document.getElementById('signup-password').value;
        const btn = document.getElementById('signup-btn');
        const err = document.getElementById('signup-error');

        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Integrating...';
        btn.disabled = true;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(userCredential.user, { displayName: name });
            err.classList.add('hidden');
        } catch (error) {
            err.classList.remove('hidden');
            document.getElementById('signup-error-msg').innerText = "Integration Failed: " + error.message;
        }

        btn.innerHTML = 'Create Operative Profile <i class="fa-solid fa-user-plus ml-1"></i>';
        btn.disabled = false;
    },

    showAuth: () => {
        const mainApp = document.getElementById('main-app');
        if (mainApp) mainApp.classList.add('hidden');
        const authOverlay = document.getElementById('auth-overlay');
        if (authOverlay) authOverlay.classList.remove('hidden');
    },

    handleLogout: async () => {
        if (auth) { await signOut(auth); }
        else { localStorage.removeItem('vicinity_auth'); }
        const mainApp = document.getElementById('main-app');
        if (mainApp) mainApp.style.opacity = '0';
        setTimeout(() => {
            if (mainApp) mainApp.classList.add('hidden');
            const authOverlay = document.getElementById('auth-overlay');
            if (authOverlay) authOverlay.classList.remove('hidden');
            // Reset routing view
            const viewsContainer = document.getElementById('views-container');
            if (viewsContainer) viewsContainer.innerHTML = '';
        }, 500);
    },

    showMainApp: () => {
        const authOverlay = document.getElementById('auth-overlay');
        if (authOverlay) authOverlay.classList.add('hidden');
        const main = document.getElementById('main-app');
        if (main) {
            main.classList.remove('hidden');
            // Trigger reflow
            void main.offsetWidth;
            main.style.opacity = '1';
        }

        // Init navigation bindings
        initNavigation();

        // Init notifications if available
        if (typeof window.initNotifications === 'function') {
            window.initNotifications();
        }

        // Render Initial Dashboard
        const viewsContainer = document.getElementById('views-container');
        if (viewsContainer) renderView('dashboard', viewsContainer);
    }
};

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const container = document.getElementById('views-container');

    navLinks.forEach(link => {
        // Clone and replace to prevent duplicate listeners if init is called multiple times
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        newLink.addEventListener('click', (e) => {
            e.preventDefault();
            const view = newLink.dataset.view;
            if (state.currentView !== view) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                newLink.classList.add('active');

                document.getElementById('page-title').textContent = newLink.querySelector('span').textContent.trim();

                container.innerHTML = ''; // clear
                state.currentView = view;
                renderView(view, container);
            }
        });
    });

    // Set Dashboard active visually
    document.querySelector('[data-view="dashboard"]').classList.add('active');
}

function renderView(viewName, container) {
    if (typeof window.dashboardMapInstance !== 'undefined' && window.dashboardMapInstance) {
        window.dashboardMapInstance.remove();
        window.dashboardMapInstance = null;
    }
    if (typeof window.communityMapInstance !== 'undefined' && window.communityMapInstance) {
        window.communityMapInstance.remove();
        window.communityMapInstance = null;
    }
    // Also destroy chart instance if any to prevent canvas memory leaks
    if (window.reportsChartInstance) {
        window.reportsChartInstance.destroy();
        window.reportsChartInstance = null;
    }

    switch (viewName) {
        case 'dashboard': if (typeof renderDashboard === 'function') renderDashboard(container); break;
        case 'needs': if (typeof renderNeeds === 'function') renderNeeds(container); break;
        case 'volunteers': if (typeof renderVolunteers === 'function') renderVolunteers(container); break;
        case 'fusion': if (typeof renderFusion === 'function') renderFusion(container); break;
        case 'comms': if (typeof renderComms === 'function') renderComms(container); break;
        case 'match': if (typeof renderMatch === 'function') {
            // retain selection across live re-renders
            const oldTargetId = window.state.activeMatchTargetId;
            renderMatch(container);
            if(oldTargetId) window.state.activeMatchTargetId = oldTargetId;
        } break;
        case 'tasks': if (typeof renderTasks === 'function') renderTasks(container); break;
        case 'reports': if (typeof renderReports === 'function') renderReports(container); break;
        case 'logistics': if (typeof renderLogistics === 'function') renderLogistics(container); break;
        default: container.innerHTML = '<div class="dark-card p-8 text-center text-gray-400">View Module not loaded.</div>';
    }
}

// Bootstrap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app.init();
    });
} else {
    window.app.init();
}
