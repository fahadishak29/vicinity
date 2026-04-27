import re

with open("public/volunteer.html", "r") as f:
    text = f.read()

# 1. Add getFunctions, httpsCallable to imports
text = text.replace(
    'import { getFirestore', 
    'import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-functions.js";\n            import { getFirestore'
)

# 2. Re-write window.processReconImage
def replacer(match):
    prefix = match.group(0)
    new_body = """
                if(!file) return;
                
                const btn = document.getElementById(`btn-recon-${needId}`);
                if(btn) {
                    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Uplinking...';
                    btn.disabled = true;
                    btn.classList.add('opacity-80', 'cursor-wait');
                }

                try {
                    // 1. Compress Image via Canvas
                    const compressedBase64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (event) => {
                            const img = new Image();
                            img.src = event.target.result;
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 1000;
                                const scaleSize = MAX_WIDTH / img.width;
                                canvas.width = MAX_WIDTH;
                                canvas.height = img.height * scaleSize;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                resolve(canvas.toDataURL('image/jpeg', 0.7));
                            };
                            img.onerror = error => reject(error);
                        };
                    });

                    const base64Data = compressedBase64.split(',')[1];

                    // 2. Call Secure Backend API
                    const functions = getFunctions(appFirebase);
                    const processReconIntel = httpsCallable(functions, 'process_recon_intel');
                    
                    await processReconIntel({
                        needId: needId,
                        image: base64Data
                    });

                    if(btn) {
                        btn.innerHTML = '<i class="fa-solid fa-check"></i> Intel Synced';
                        btn.classList.replace('bg-purple-600/20', 'bg-brand-green');
                        btn.classList.replace('border-purple-500', 'border-brand-green');
                        btn.classList.replace('text-purple-400', 'text-white');
                        btn.disabled = false;
                        btn.classList.remove('opacity-80', 'cursor-wait');
                    }

                } catch(error) {
                    console.error("Backend Recon Failure: ", error);
                    alert("Recon Uplink Failed: " + error.message);
                    if(btn) {
                        btn.innerHTML = '<i class="fa-solid fa-camera-viewfinder"></i> Retry Recon';
                        btn.disabled = false;
                        btn.classList.remove('opacity-80', 'cursor-wait');
                    }
                }
            };
"""
    return "window.processReconImage = async function(file, needId) {" + new_body

# We regex find `window.processReconImage = async function(file, needId) {` up to `};` and replace it
text = re.sub(r"window\.processReconImage = async function\(file, needId\) \{.*?\};\n", replacer, text, flags=re.DOTALL)

with open("public/volunteer.html", "w") as f:
    f.write(text)
