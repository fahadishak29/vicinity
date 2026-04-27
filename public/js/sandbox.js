import { collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./firebase-config.js"; // Needs to use standard import if module

// Bind to window so operator.html button can hit it
window.runSandboxSimulation = async function() {
    const btn = document.getElementById('sandbox-btn');
    if(btn) btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-purple-400"></i> <span class="text-purple-400 font-mono text-xs uppercase ml-2 tracking-widest">Injecting Chaos...</span>';
    
    try {
        // Base Bengaluru Coords: 12.9716, 77.5946
        const randLat = () => 12.9716 + (Math.random() * 0.08 - 0.04);
        const randLng = () => 77.5946 + (Math.random() * 0.08 - 0.04);

        const scenarios = [
            {
                category: "Structural Collapse", subCategory: "Commercial High-Rise",
                description: "Massive 12-story localized structural failure. Multiple load-bearing columns compromised. Thermal signatures isolated on 4th floor.",
                urgencyLevel: "Critical", urgencyScore: 98,
                location: "Indiranagar Core Sector",
                lat: randLat(), lng: randLng(),
                status: "Pending", timestamp: new Date().toISOString(),
                reportedDate: new Date().toLocaleDateString('en-GB')
            },
            {
                category: "Medical Emergency", subCategory: "Mass Casualty Triage",
                description: "Highway pile-up involving chemical tanker. Severe lacerations and acute respiratory distress reported among 14 immobilized civilians.",
                urgencyLevel: "Critical", urgencyScore: 94,
                location: "Outer Ring Road Alpha",
                lat: randLat(), lng: randLng(),
                status: "Pending", timestamp: new Date().toISOString(),
                reportedDate: new Date().toLocaleDateString('en-GB')
            },
            {
                category: "Logistics Blockade", subCategory: "Utility Grid Offline",
                description: "Substation delta exploded. Power grid offline across 4 sectors. Medical refrigeration failing at local clinics.",
                urgencyLevel: "High", urgencyScore: 82,
                location: "Koramangala Block 5",
                lat: randLat(), lng: randLng(),
                status: "Pending", timestamp: new Date().toISOString(),
                reportedDate: new Date().toLocaleDateString('en-GB')
            }
        ];

        // 1. Inject Scenarios into Needs collection
        const injectedIds = [];
        for (const s of scenarios) {
            const docRef = await addDoc(collection(db, "needs"), s);
            injectedIds.push(docRef.id);
        }

        // 2. Fetch all Volunteers to auto-assign one of them!
        const volSnap = await getDocs(collection(db, "volunteers"));
        if(!volSnap.empty) {
            // Assign the first scenario to the first active volunteer (jimi) so they always have something to test!
            const volDoc = volSnap.docs[0];
            await updateDoc(doc(db, "needs", injectedIds[0]), {
                status: "In Progress",
                assignedTo: volDoc.id,
                assignedAt: new Date().toISOString()
            });
            console.log("Auto-assigned Sandbox Crisis to Volunteer ID:", volDoc.id);
        }

        if(btn) {
            btn.innerHTML = '<i class="fa-solid fa-check text-brand-green"></i> <span class="text-brand-green font-mono text-xs uppercase ml-2 tracking-widest">Sandbox Engaged</span>';
            setTimeout(() => btn.innerHTML = '<i class="fa-solid fa-biohazard text-purple-500"></i> <span class="font-medium tracking-wide ml-2 group-hover:text-purple-400">Launch Sandbox</span>', 4000);
        }

    } catch(err) {
        console.error("Sandbox failure:", err);
        if(btn) btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-red-500"></i> <span class="text-red-500 ml-2 text-xs">Sandbox Error</span>';
    }
};
