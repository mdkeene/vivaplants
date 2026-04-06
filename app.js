let plants = [];

document.addEventListener("DOMContentLoaded", async () => {
    await initDB();

    plants = await getAllPlants();

    // Populate plant library select
    const plantTypeSelect = document.getElementById("plant-type");
    if (plantTypeSelect) {
        PLANT_LIBRARY.forEach(plant => {
            const option = document.createElement("option");
            option.value = plant.value;
            option.textContent = plant.label;
            plantTypeSelect.appendChild(option);
        });

        plantTypeSelect.onchange = () => {
            const customContainer = document.getElementById("custom-type-container");
            if (plantTypeSelect.value === "custom") {
                customContainer.classList.remove("hidden");
            } else {
                customContainer.classList.add("hidden");
                // Clear custom input if not used
                document.getElementById("plant-custom-type").value = "";
            }
        };
    }

    if (plants.length === 0) {
        plants = getDefaultPlants();
        await Promise.all(plants.map(p => savePlant(cleanPlant(p))));
    }

    // ✅ Render order (important)
    renderAttentionPlants();

    requestAnimationFrame(() => {
        setTimeout(() => {
            renderAllPlants();
        }, 50);
    });

    // ✅ THEN attach ALL event listeners here

    // Onboarding
    if (!localStorage.getItem("viva_onboarding_complete")) {
        const onboardingOverlay = document.getElementById("onboarding-overlay");
        if (onboardingOverlay) {
            onboardingOverlay.classList.remove("hidden");
            document.body.classList.add("modal-open");
        }
    }

    const finishOnboardingBtn = document.getElementById("finish-onboarding-btn");
    if (finishOnboardingBtn) {
        finishOnboardingBtn.onclick = () => {
            localStorage.setItem("viva_onboarding_complete", "true");
            document.getElementById("onboarding-overlay").classList.add("hidden");
            document.body.classList.remove("modal-open");

            const tooltip = document.getElementById("first-plant-tooltip");
            if (tooltip) tooltip.classList.remove("hidden");
        };
    }

    // Photo buttons
    const btnChoosePhoto = document.getElementById("btn-choose-photo");
    if (btnChoosePhoto) {
        btnChoosePhoto.onclick = (e) => {
            e.preventDefault();
            const fileInput = document.getElementById("plant-image-file");
            fileInput.removeAttribute("capture");
            fileInput.click();
        };
    }

    const btnTakePhoto = document.getElementById("btn-take-photo");
    if (btnTakePhoto) {
        btnTakePhoto.onclick = (e) => {
            e.preventDefault();
            const fileInput = document.getElementById("plant-image-file");
            fileInput.setAttribute("capture", "environment");
            fileInput.click();
        };
    }

    const plantImageFile = document.getElementById("plant-image-file");
    if (plantImageFile) {
        plantImageFile.addEventListener("change", function () {
            const file = this.files[0];
            const preview = document.getElementById("image-preview");
            if (file) {
                preview.src = URL.createObjectURL(file);
                preview.classList.remove("hidden");
            } else {
                preview.src = "";
                preview.classList.add("hidden");
            }
        });
    }

    // Modal controls
    const closeModalBtn = document.getElementById("close-modal-btn");
    if (closeModalBtn) {
        closeModalBtn.onclick = () => {
            document.getElementById("add-plant-modal").classList.add("hidden");
            document.body.classList.remove("modal-open");
        };
    }

    const addPlantModal = document.getElementById("add-plant-modal");
    if (addPlantModal) {
        addPlantModal.addEventListener("click", (e) => {
            if (e.target.id === "add-plant-modal") {
                addPlantModal.classList.add("hidden");
                document.body.classList.remove("modal-open");
            }
        });
    }

    // Mode Toggling Logic
    const toggleBtn = document.getElementById("toggle-edit-mode");
    const modal = document.getElementById("add-plant-modal");
    if (toggleBtn && modal) {
        toggleBtn.onclick = () => {
            const isEditing = modal.classList.toggle("edit-mode");
            toggleBtn.textContent = isEditing ? "Done" : "Edit";
        };
    }

    // Light Reading Logic
    const addLightBtn = document.getElementById("add-light-btn");
    if (addLightBtn) {
        addLightBtn.onclick = async () => {
            if (!editingPlantId) return;
            const plant = plants.find(p => p.id === editingPlantId);
            if (!plant) return;

            const timeSelect = document.getElementById("light-time");
            const luxInput = document.getElementById("light-lux");
            const lux = parseInt(luxInput.value);

            if (isNaN(lux)) return;

            if (!plant.lightHistory || !Array.isArray(plant.lightHistory)) {
                plant.lightHistory = [];
            }

            plant.lightHistory.push({
                time: timeSelect.value,
                lux: lux,
                date: new Date().toISOString().split("T")[0]
            });

            // Cap at 20 entries
            plant.lightHistory = plant.lightHistory.slice(-20);

            await savePlant(cleanPlant(plant));
            
            // Clear inputs
            luxInput.value = "";
            timeSelect.selectedIndex = 0;

            // Refresh view (behind the scenes)
            renderLightHistory(plant);
            if (navigator.vibrate) navigator.vibrate(20);
        };
    }

    // Progress Photo Logic
    const addProgressBtn = document.getElementById("add-progress-btn");
    const progressInput = document.getElementById("progress-photo-input");
    
    if (addProgressBtn && progressInput) {
        addProgressBtn.onclick = () => progressInput.click();
        
        progressInput.onchange = async () => {
            if (!editingPlantId || !progressInput.files[0]) return;
            const plant = plants.find(p => p.id === editingPlantId);
            if (!plant) return;

            const base64 = await getImageBase64(progressInput.files[0]);
            
            if (!plant.photos || !Array.isArray(plant.photos)) {
                plant.photos = [];
            }

            plant.photos.push({
                date: new Date().toISOString().split("T")[0],
                image: base64
            });

            // Cap at 10 photos
            plant.photos = plant.photos.slice(-10);

            await savePlant(cleanPlant(plant));
            
            // Clear input
            progressInput.value = "";
            
            // Immediate re-render
            renderProgressPhotos(plant);
            if (navigator.vibrate) navigator.vibrate(30);
        };
    }

    const addPlantBtn = document.getElementById("add-plant-btn");
    if (addPlantBtn) {
        addPlantBtn.onclick = () => {
            editingPlantId = null;
            document.getElementById("plant-image-file").value = "";

            const preview = document.getElementById("image-preview");
            preview.src = "";
            preview.classList.add("hidden");

            const tooltip = document.getElementById("first-plant-tooltip");
            if (tooltip) tooltip.classList.add("hidden");

            document.querySelector(".modal-header h3").textContent = "Add a Plant";
            document.getElementById("plant-name").value = "";
            document.getElementById("plant-location").value = "";
            
            const typeSelect = document.getElementById("plant-type");
            typeSelect.value = "";
            document.getElementById("custom-type-container").classList.add("hidden");
            document.getElementById("plant-custom-type").value = "";
            
            document.getElementById("plant-preference").value = "";
            document.getElementById("plant-frequency").value = "";
            document.getElementById("plant-last-watered").value = new Date().toISOString().split("T")[0];
            document.getElementById("delete-plant-btn").style.display = "none";
            document.getElementById("add-plant-modal").classList.add("edit-mode");
            const toggleBtn = document.getElementById("toggle-edit-mode");
            if (toggleBtn) toggleBtn.textContent = "Done";

            document.getElementById("add-plant-modal").classList.remove("hidden");
            document.body.classList.add("modal-open");
        };
    }

    // Copy Plant Report Logic
    const copyReportBtn = document.getElementById("copy-plant-report-btn");
    if (copyReportBtn) {
        copyReportBtn.onclick = async () => {
            if (!editingPlantId) return;
            const plant = plants.find(p => p.id === editingPlantId);
            if (!plant) return;
            const report = generatePlantReport(plant);
            try {
                await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
                copyReportBtn.textContent = "Report Copied! ✅";
                setTimeout(() => {
                    copyReportBtn.textContent = "Copy Plant Report";
                }, 2000);
            } catch (err) {
                console.error("Failed to copy: ", err);
            }
        };
    }

    // Care Guide Toggle
    const toggleCareBtn = document.getElementById("toggle-care-guide");
    if (toggleCareBtn) {
        toggleCareBtn.onclick = () => {
            const content = document.getElementById("care-guide-content");
            const isHidden = content.classList.toggle("hidden");
            toggleCareBtn.textContent = isHidden ? "Check Care Tips ▾" : "Close Care Tips ▴";
        };
    }

    // Import plants logic
    const importBtn = document.getElementById("import-plants-btn");
    const importInput = document.getElementById("import-plants-input");

    if (importBtn && importInput) {
        importBtn.onclick = () => importInput.click();

        importInput.onchange = async () => {
            const file = importInput.files[0];
            if (!file) return;

            let data;
            try {
                const text = await file.text();
                data = JSON.parse(text);
            } catch {
                alert("Invalid JSON file");
                return;
            }

            if (!Array.isArray(data)) {
                alert("File must contain an array of plants");
                return;
            }

            for (const plant of data) {
                const clean = cleanPlant({
                    id: "plant_" + Date.now() + "_" + Math.random(),
                    name: plant.name || "Unnamed",
                    location: plant.location || "",
                    type: plant.type || "",
                    preference: plant.preference || "",
                    frequency: plant.frequency || null,
                    lastWatered: plant.lastWatered || new Date().toISOString().split("T")[0],
                    wateringHistory: plant.wateringHistory || [],
                    lightHistory: plant.lightHistory || [],
                    photos: plant.photos || [],
                    comments: Array.isArray(plant.comments) ? plant.comments : []
                });

                plants.push(clean);
                await savePlant(clean);
            }

            renderAllPlants();
            renderAttentionPlants();
            alert("Plants imported successfully 🌿");
        };
    }

    // Add comment logic
    const addCommentBtn = document.getElementById("add-comment-btn");
    if (addCommentBtn) {
        addCommentBtn.onclick = async () => {
            if (!editingPlantId) return;

            const input = document.getElementById("plant-comment-input");
            const text = input.value.trim();
            if (!text) return;

            const plant = plants.find(p => p.id === editingPlantId);
            if (!plant) return;

            if (!plant.comments) plant.comments = [];
            plant.comments.push({
                text,
                date: new Date().toISOString().split("T")[0]
            });

            // Keep only last 90 days
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 90);
            plant.comments = plant.comments.filter(c => new Date(c.date) >= cutoff);

            await savePlant(cleanPlant(plant));
            input.value = "";
            renderComments(plant);
        };
    }

    const savePlantBtn = document.getElementById("save-plant");
    if (savePlantBtn) {
        savePlantBtn.onclick = async () => {
            const name = document.getElementById("plant-name").value;
            const location = document.getElementById("plant-location").value;
            
            // Handle plant type selection
            const typeSelect = document.getElementById("plant-type");
            const customTypeInput = document.getElementById("plant-custom-type");
            let type = typeSelect.value;
            if (type === "custom") {
                type = customTypeInput.value || "Custom Plant";
            }

            const preference = document.getElementById("plant-preference").value || "";
            const frequencyStr = document.getElementById("plant-frequency").value;
            const frequency = frequencyStr ? parseInt(frequencyStr) : null;
            let lastWatered = document.getElementById("plant-last-watered").value;

            if (!name) return;
            if (!lastWatered) lastWatered = new Date().toISOString().split("T")[0];

            const fileInput = document.getElementById("plant-image-file");
            let image = "https://images.unsplash.com/photo-1501004318641-b39e6451bec6";

            if (fileInput.files[0]) {
                image = await getImageBase64(fileInput.files[0]);
            }

            if (editingPlantId) {
                const index = plants.findIndex(p => p.id === editingPlantId);
                if (index !== -1) {
                    const oldPlant = plants[index];
                    plants[index] = { ...oldPlant, name, location, type, preference, frequency, lastWatered };
                    if (fileInput.files[0]) plants[index].image = image;

                    if (oldPlant.lastWatered !== lastWatered) {
                        plants[index].skipUntil = null;
                    }

                    await savePlant(cleanPlant(plants[index]));
                }
            } else {
                const newPlant = {
                    id: "plant_" + Date.now(),
                    name,
                    location,
                    type,
                    preference,
                    frequency,
                    lastWatered,
                    image
                };
                plants.push(newPlant);

                await savePlant(cleanPlant(newPlant));
            }

            fileInput.value = "";

            renderAllPlants();
            renderAttentionPlants();

            document.getElementById("add-plant-modal").classList.add("hidden");
            document.body.classList.remove("modal-open");
        };
    }
});

let editingPlantId = null;

function daysSinceDate(dateString) {
    if (!dateString) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = dateString.split("-");
    const past = new Date(y, m - 1, d);
    const diffTime = today - past;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

function getDaysUntilNextCheck(plant) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (plant.skipUntil) {
        const [y, m, d] = plant.skipUntil.split("-");
        const skipDate = new Date(y, m - 1, d);
        if (skipDate >= today) {
            const diffTime = skipDate - today;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
    }

    if (!plant.frequency || isNaN(plant.frequency)) {
        return null;
    }

    const days = daysSinceDate(plant.lastWatered);
    return plant.frequency - days;
}

function getPlantStatus(plant) {
    const daysLeft = getDaysUntilNextCheck(plant);
    if (daysLeft === null) return "ok";
    if (daysLeft <= 0) return "needs_water";
    return "ok";
}

function renderAllPlants() {
    const container = document.getElementById("all-plants-grid");

    // Get existing cards to reuse
    const existingCards = new Map();
    Array.from(container.children).forEach(child => {
        if (child.dataset.id) existingCards.set(child.dataset.id, child);
    });

    const newIds = new Set(plants.map(p => p.id));

    // Remove cards not in the new list (e.g. deleted)
    existingCards.forEach((card, id) => {
        if (!newIds.has(id)) container.removeChild(card);
    });

    plants.forEach((plant, index) => {
        const status = getPlantStatus(plant);
        let statusClass = "text-ok";
        let nextWaterText = "";

        const daysLeft = getDaysUntilNextCheck(plant);
        const isRecentlyWatered = (plant.lastWateredTimestamp && (Date.now() - plant.lastWateredTimestamp < 120000));

        if (isRecentlyWatered) {
            statusClass = "text-ok";
            nextWaterText = "Just watered 🌿";
        } else if (daysLeft === null) {
            nextWaterText = "No schedule set";
        } else if (daysLeft <= 0) {
            statusClass = "text-danger";
            nextWaterText = "Check today";
        } else if (daysLeft === 1) {
            statusClass = "text-warning";
            nextWaterText = "Check tomorrow";
        } else {
            nextWaterText = `Check in ${daysLeft} days`;
        }

        let card = existingCards.get(plant.id);
        const isNew = !card;

        if (isNew) {
            card = document.createElement("article");
            card.className = "plant-card-small";
            card.dataset.id = plant.id;
        }

        card.style.setProperty("--d", index);

        // Suppress entry animation if already exists
        if (!isNew) {
            card.style.animation = "none";
        } else {
            card.style.animation = "";
        }

        card.innerHTML = `
            <img src="${plant.image}" class="card-image" alt="${plant.name}" loading="lazy">
            <div class="card-content">
                <div class="grid-card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 class="plant-name">${plant.name}</h3>
                    <button class="grid-water-btn" onclick="waterPlant('${plant.id}', event)"><span class="icon">💧</span></button>
                </div>
                <p class="plant-meta">
                    ${plant.location}<br>
                    <span class="status-strong ${statusClass}">${nextWaterText}</span>
                </p>
            </div>
        `;

        card.onclick = (e) => editPlant(plant.id, e);

        if (isNew) {
            container.appendChild(card);
        }
    });
}

function getPlantsNeedingAttention() {
    return plants.filter(p => {
        const status = getPlantStatus(p);

        // keep it visible briefly if just watered
        return status !== "ok";
    });
}

let previousAttentionCount = -1;
let plantIdToHighlight = null;

function renderAttentionPlants() {
    const container = document.getElementById("attention-plants");
    const attentionPlants = getPlantsNeedingAttention();
    const section = container.closest("section");
    const subtitle = document.querySelector(".subtitle");
    const currentCount = attentionPlants.length;

    // Always ensure section is visible and not faded
    section.style.display = "block";
    section.style.maxHeight = "none";
    section.classList.remove("fade-out");

    if (currentCount === 0) {
        subtitle.textContent = "Nothing needs attention right now";
        // Only set innerHTML if not already in empty state to avoid resetting animation
        if (!container.querySelector(".empty-state")) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>All set for today 🌿</h3>
                    <p>Your plants are happy and taken care of.</p>
                </div>
            `;
        }

        // trigger celebration animation if coming from a non-zero state
        if (previousAttentionCount > 0) {
            subtitle.classList.remove("celebrate");
            void subtitle.offsetWidth; // trigger reflow
            subtitle.classList.add("celebrate");
            if (navigator.vibrate) navigator.vibrate(30);
        }
    } else {
        const word = currentCount === 1 ? "plant needs" : "plants need";
        subtitle.textContent = `${currentCount} ${word} attention today`;

        // Remove empty state if it exists
        const empty = container.querySelector(".empty-state");
        if (empty) container.removeChild(empty);
    }

    const existingCards = new Map();
    Array.from(container.children).forEach(child => {
        if (child.dataset.id) existingCards.set(child.dataset.id, child);
    });

    const newIds = new Set(attentionPlants.map(p => p.id));

    // Remove cards not in the new list
    existingCards.forEach((card, id) => {
        if (!newIds.has(id)) {
            container.removeChild(card);
        }
    });

    previousAttentionCount = currentCount;

    attentionPlants.forEach((plant, index) => {
        let instructions = "";
        if (plant.preference === "moist") instructions = "Keep soil slightly moist 💧";
        if (plant.preference === "moderate") instructions = "Let top soil dry out 🪴";
        if (plant.preference === "dry") instructions = "Allow soil to fully dry 🌵";

        const isJustWatered = plant.justWatered;
        const avg = getAverageWateringInterval(plant);
        let memoryText = "";

        if (plant.frequency && avg && Math.abs(avg - plant.frequency) >= 2) {
            memoryText = `You usually water every ~${avg} days`;
        }

        const status = getPlantStatus(plant);
        const badgeClass = "status-badge danger";
        const badgeText = isJustWatered ? "Done" : "Needs attention";

        let card = existingCards.get(plant.id);
        const isNew = !card;

        if (isNew) {
            card = document.createElement("article");
            card.className = "plant-card-large";
            card.dataset.id = plant.id;
        }

        // Always update the stagger index for positioning
        card.style.setProperty("--d", index);

        // If it's not new, suppress the entrance animation so it just slides
        if (!isNew) {
            card.style.animation = "none";
        } else {
            card.style.animation = "";
        }

        const highlightClass = (plant.id === plantIdToHighlight) ? "highlight-next" : "";
        if (highlightClass) {
            card.classList.add("highlight-next");
            setTimeout(() => card.classList.remove("highlight-next"), 4500);
            plantIdToHighlight = null;
        }

        if (isJustWatered) card.classList.add("watering");
        else card.classList.remove("watering");

        // 🛡️ Animation Guard: If the card is currently playing its watering sequence,
        // we skip the innerHTML update entirely to prevent the animation from resetting.
        if (card.dataset.animating === "true" || card.classList.contains("attention-exit")) return;

        const contentHtml = `
        <img src="${plant.image}" class="card-image" alt="${plant.name}" loading="lazy">
        <div class="water-overlay"></div>
        <div class="card-overlay">
            ${!isJustWatered ? `<span class="${badgeClass}"> ${badgeText} </span>` : ""}
            <div class="card-content">
                <div>
                    <h3 class="plant-name">${plant.name}</h3>
                    ${!isJustWatered && instructions ? `<p class="plant-instruction" style="color: #ffffff; font-size: 1rem; font-weight: 500; margin-bottom: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.6); opacity: 0.95;">${instructions}</p>` : ""}
                    ${memoryText ? `<p class="plant-memory" style="color: #ffffff; font-size: 0.85rem; opacity: 0.85; margin-bottom: 4px; font-weight: 500;">${memoryText}</p>` : ""}
                    <p class="plant-meta" style="margin-bottom: 4px; opacity: 0.85; font-size: 0.8rem;">
                        ${(plant.lastWateredTimestamp && (Date.now() - plant.lastWateredTimestamp < 120000)) ? "Just watered 🌿" : `Last watered ${daysSinceDate(plant.lastWatered)} days ago`}
                    </p>
                    ${!isJustWatered ? `<button class="delay-btn" onclick="delayPlant('${plant.id}', event)">Check in 2 days</button>` : ""}
                </div>
                ${!isJustWatered ? `<button class="action-btn" onclick="waterPlant('${plant.id}', event)">💧</button>` : ""}
            </div>
        </div>
        `;

        card.innerHTML = contentHtml;

        if (isNew) {
            container.appendChild(card);
        }
    });
}





function editPlant(id, event) {
    if (event) event.stopPropagation();
    const plant = plants.find(p => p.id === id);
    if (!plant) return;

    editingPlantId = id;

    // Reset to View Mode on open
    const modal = document.getElementById("add-plant-modal");
    if (modal) modal.classList.remove("edit-mode");
    
    const toggleBtn = document.getElementById("toggle-edit-mode");
    if (toggleBtn) toggleBtn.textContent = "Edit";

    // Set Header
    document.querySelector(".modal-header h3").textContent = "Plant details";

    // Populate Inputs AND View Labels
    const setField = (id, val) => {
        const input = document.getElementById(`plant-${id}`);
        const view = document.getElementById(`view-plant-${id}`);
        if (input) input.value = val || "";
        if (view) {
            if (id === 'preference') {
                const prefMap = { moist: "Keep soil moist (💧)", moderate: "Moderate drying (🪴)", dry: "Let soil dry (🌵)" };
                view.textContent = prefMap[val] || "No preference set";
            } else if (id === 'frequency') {
                view.textContent = val ? `Every ${val} days` : "No frequency set";
            } else if (id === 'last-watered') {
                const date = new Date(val);
                view.textContent = date.toLocaleDateString(undefined, { dateStyle: 'medium' });
            } else {
                view.textContent = val || "Not specified";
            }
        }
    };

    setField('name', plant.name);
    setField('location', plant.location);
    
    const typeSelect = document.getElementById("plant-type");
    const customTypeInput = document.getElementById("plant-custom-type");
    const customContainer = document.getElementById("custom-type-container");
    const typeView = document.getElementById("view-plant-type");

    const matchedProfile = findPlantTypeMatch(plant.type);
    if (matchedProfile) {
        typeSelect.value = matchedProfile.value;
        customContainer.classList.add("hidden");
        if (typeView) typeView.textContent = matchedProfile.label;
    } else {
        typeSelect.value = "custom";
        customContainer.classList.remove("hidden");
        customTypeInput.value = plant.type || "";
        if (typeView) typeView.textContent = plant.type || "Unknown Type";
    }

    setField('preference', plant.preference);
    setField('frequency', plant.frequency);
    setField('last-watered', plant.lastWatered);

    // Dynamic Care Status Line
    const statusView = document.getElementById("view-plant-status");
    if (statusView) {
        const days = getDaysUntilNextCheck(plant);
        if (days === null) {
            statusView.textContent = "All good for now";
        } else if (days <= 0) {
            statusView.textContent = "Check today 💧";
            statusView.style.color = "var(--danger-red, #e74c3c)"; // Fallback to red if needed
        } else if (days === 1) {
            statusView.textContent = "Next check tomorrow";
            statusView.style.color = "var(--accent-green)";
        } else {
            statusView.textContent = `Next check in ${days} days`;
            statusView.style.color = "var(--accent-green)";
        }
    }

    document.getElementById("plant-image-file").value = "";

    const preview = document.getElementById("image-preview");
    if (plant.image) {
        preview.src = plant.image;
        preview.classList.remove("hidden");
    } else {
        preview.src = "";
        preview.classList.add("hidden");
    }

    const delBtn = document.getElementById("delete-plant-btn");
    delBtn.onclick = () => deletePlant(id);

    // Populate watering history
    const historyList = document.getElementById("watering-history-list");
    historyList.innerHTML = "";
    if (plant.wateringHistory && plant.wateringHistory.length > 0) {
        // Show last 7 entries, most recent first (slice last 7, then reverse)
        [...plant.wateringHistory].slice(-7).reverse().forEach(dateStr => {
            const li = document.createElement("li");
            const dateObj = new Date(dateStr);
            li.textContent = dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short" });
            historyList.appendChild(li);
        });
    } else {
        const emptyLi = document.createElement("li");
        emptyLi.textContent = "No watering history yet";
        emptyLi.style.opacity = "0.6";
        historyList.appendChild(emptyLi);
    }

    const avgDisplay = document.getElementById("watering-average");
    const avg = getAverageWateringInterval(plant);
    if (avg) {
        avgDisplay.textContent = `Usually every ${avg} days`;
    } else {
        avgDisplay.textContent = "";
    }

    // Populate light history
    renderLightHistory(plant);

    // Populate progress photos
    renderProgressPhotos(plant);

    // Populate and potentially show care guide
    renderCareGuide(plant.type);

    // Populate and show Insights
    renderInsights(plant);

    // Populate and show comments
    renderComments(plant);

    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function renderLightHistory(plant) {
    const container = document.getElementById("view-light-history");
    if (!container) return;

    if (!plant.lightHistory || plant.lightHistory.length === 0) {
        container.innerHTML = "<p style='opacity: 0.5;'>No light readings yet</p>";
        return;
    }

    // Last 5 entries, most recent first
    const recent = [...plant.lightHistory].slice(-5).reverse();
    
    container.innerHTML = recent.map(entry => {
        const dateObj = new Date(entry.date);
        const dateStr = dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short" });
        return `<div>${entry.time} · ${entry.lux} lux <span style="font-size: 0.8rem; opacity: 0.6; margin-left: 8px;">(${dateStr})</span></div>`;
    }).join("");
}

function renderProgressPhotos(plant) {
    const container = document.getElementById("view-progress-photos");
    if (!container) return;

    if (!plant.photos || plant.photos.length === 0) {
        container.innerHTML = "<p style='opacity: 0.5;'>No progress photos yet</p>";
        return;
    }

    // Newest first
    const photos = [...plant.photos].reverse();
    const hero = photos[0];
    const thumbnails = photos.slice(1, 4); // next 3

    let html = `<img src="${hero.image}" class="progress-hero" alt="Latest progress">`;
    
    if (thumbnails.length > 0) {
        html += `<div class="progress-thumbs">`;
        html += thumbnails.map(p => `<img src="${p.image}" class="progress-thumb" alt="Previous progress">`).join("");
        html += `</div>`;
    }

    container.innerHTML = html;
}

function renderCareGuide(type) {
    const section = document.getElementById("care-guide-section");
    const content = document.getElementById("care-guide-content");
    if (!section || !content) return;

    const profile = findPlantTypeMatch(type);
    
    if (!profile || !profile.care) {
        section.style.display = "none";
        return;
    }

    section.style.display = "block";
    content.innerHTML = `
        <div style="margin-bottom: 8px;"><strong>Scientific:</strong> <em>${profile.scientific}</em></div>
        <div style="margin-bottom: 4px;"><strong>Light:</strong> ${profile.care.light}</div>
        <div style="margin-bottom: 4px;"><strong>Watering:</strong> ${profile.care.watering}</div>
        <div style="margin-bottom: 4px;"><strong>Humidity:</strong> ${profile.care.humidity}</div>
        <div style="margin-top: 8px; font-style: italic; opacity: 0.8;">${profile.care.notes}</div>
    `;
    
    // Always start collapsed when opening plant
    content.classList.add("hidden");
    document.getElementById("toggle-care-guide").textContent = "Check Care Tips ▾";
}

function renderInsights(plant) {
    const section = document.getElementById("insights-section");
    const list = document.getElementById("view-insights-list");
    if (!section || !list) return;

    const profile = getPlantProfile(plant.type);
    const messages = [
        getLightInsight(plant, profile),
        getWateringInsight(plant),
        getSuitabilityInsight(plant)
    ].filter(msg => msg !== null);

    if (messages.length === 0) {
        section.classList.add("hidden");
        return;
    }

    section.classList.remove("hidden");
    list.innerHTML = messages.map(msg => `<li>${msg}</li>`).join("");
}

function generatePlantReport(plant) {
    const daysLeft = getDaysUntilNextCheck(plant);
    let status = "ok";
    if (daysLeft !== null) {
        if (daysLeft < 0) status = "overdue";
        else if (daysLeft === 0) status = "due";
    }

    const luxValues = (plant.lightHistory || []).map(h => h.lux);
    const lightSummary = luxValues.length > 0 ? {
        maxLux: Math.max(...luxValues),
        minLux: Math.min(...luxValues),
        averageLux: Math.round(luxValues.reduce((a, b) => a + b, 0) / luxValues.length)
    } : null;

    // Calculate intervals for trend
    let wateringTrend = "insufficient_data";
    if (plant.wateringHistory && plant.wateringHistory.length >= 4) {
        const intervals = [];
        for (let i = 1; i < plant.wateringHistory.length; i++) {
            const diff = Math.round((new Date(plant.wateringHistory[i]) - new Date(plant.wateringHistory[i - 1])) / (1000 * 60 * 60 * 24));
            intervals.push(diff);
        }
        const recent = intervals.slice(-3);
        if (recent.length === 3) {
            const first = recent[0];
            const last = recent[recent.length - 1];
            if (Math.abs(first - last) <= 1) wateringTrend = "consistent";
            else if (last > first) wateringTrend = "increasing";
            else wateringTrend = "decreasing";
        }
    }

    return {
        name: plant.name,
        location: plant.location,
        type: plant.type || "Not specified",
        soilPreference: plant.preference || "Not specified",
        wateringStatus: status,
        daysSinceWatered: daysSinceDate(plant.lastWatered),
        watering: {
            frequencyDays: plant.frequency || "Not set",
            lastWatered: plant.lastWatered,
            averageInterval: getAverageWateringInterval(plant) || "Not enough data",
            history: plant.wateringHistory || []
        },
        wateringTrend,
        light: plant.lightHistory || [],
        lightSummary,
        photoCount: (plant.photos || []).length,
        photos: (plant.photos || []).map(p => ({
            date: p.date
        }))
    };
}

async function deletePlant(id) {
    if (confirm("Delete this plant?")) {
        plants = plants.filter(p => p.id !== id);
        await deletePlantDB(id);
        renderAllPlants();
        renderAttentionPlants();
        document.getElementById("add-plant-modal").classList.add("hidden");
        document.body.classList.remove("modal-open");
    }
}

function delayPlant(id, event) {
    if (event) event.stopPropagation();
    const plant = plants.find(p => p.id === id);
    if (!plant) return;

    if (navigator.vibrate) navigator.vibrate(20);

    const date = new Date();
    date.setDate(date.getDate() + 2); // delay 2 days
    plant.skipUntil = date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, '0') + "-" +
        String(date.getDate()).padStart(2, '0');

    const card = event.target.closest(".plant-card-large");
    if (card) {
        card.style.transition = "all 0.3s ease";
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';

        const nextCard = card.nextElementSibling;
        if (nextCard && nextCard.dataset.id) {
            plantIdToHighlight = nextCard.dataset.id;
        }
    }

    setTimeout(async () => {
        await savePlant(cleanPlant(plant));

        const card = document.querySelector(`[data-id="${id}"]`);
        if (card && card.parentNode) {
            card.parentNode.removeChild(card);
        }

        renderAttentionPlants();
    }, 300);
}

function addWaterFeedbackAndHighlightNext(card, plant) {
    let instructions = "";
    if (plant.preference === "moist") instructions = "Keep soil slightly moist 💧";
    if (plant.preference === "moderate") instructions = "Let top soil dry out 🪴";
    if (plant.preference === "dry") instructions = "Allow soil to fully dry 🌵";

    const feedback = document.createElement("div");
    feedback.className = "water-feedback";
    feedback.innerHTML = `<h3 style="margin-bottom:6px;font-size:1.4rem;">Watered 🌿</h3><p style="opacity:0.95;font-weight:600;font-size:1rem;">${instructions}</p>`;
    card.appendChild(feedback);

    setTimeout(() => {
        if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
    }, 3200);

    const nextCard = card.nextElementSibling;
    if (nextCard && nextCard.dataset && nextCard.dataset.id) {
        plantIdToHighlight = nextCard.dataset.id;
        nextCard.classList.add("highlight-next");

        setTimeout(() => {
            if (nextCard && nextCard.parentNode) nextCard.classList.remove("highlight-next");
        }, 4500);
    }
}

async function waterPlant(id, event) {
    if (event) event.stopPropagation();

    const plant = plants.find(p => p.id === id);
    if (!plant) return;

    if (navigator.vibrate) navigator.vibrate(20);

    const today = new Date().toISOString().split("T")[0];
    plant.lastWatered = today;
    plant.lastWateredTimestamp = Date.now();
    
    if (!plant.wateringHistory) plant.wateringHistory = [];
    plant.wateringHistory.push(today);
    plant.wateringHistory = plant.wateringHistory.slice(-20);
    
    delete plant.skipUntil;

    // Handle Attention Card Context (Detailed fill animation)
    const attentionCard = event?.target?.closest(".plant-card-large");
    
    if (attentionCard) {
        // Trigger detailed Fill+Pop animation
        attentionCard.dataset.animating = "true";
        setTimeout(() => {
            if (attentionCard) delete attentionCard.dataset.animating;
        }, 3600);
        attentionCard.classList.add("watering");
        addWaterFeedbackAndHighlightNext(attentionCard, plant);

        setTimeout(async () => {
            await savePlant(cleanPlant(plant));

            if (attentionCard) attentionCard.remove();

            requestAnimationFrame(() => {
                renderAttentionPlants();

                setTimeout(() => {
                    renderAllPlants();
                }, 50);
            });

        }, 3500); // Sequence duration
        
        return;
    }

    // Handle Grid Card Context (Clean icon swap + fade removal)
    const gridBtn = event?.target?.closest(".grid-water-btn");
    if (gridBtn) {
        gridBtn.classList.add("active");
        const icon = gridBtn.querySelector(".icon");
        if (icon) icon.textContent = "✓";
        gridBtn.disabled = true;

        const gridCard = gridBtn.closest(".plant-card-small");
        if (gridCard) {
            const statusSpan = gridCard.querySelector(".status-strong");
            if (statusSpan) {
                statusSpan.textContent = "Done 🌿";
                statusSpan.className = "status-strong text-ok";
            }
        }

        setTimeout(() => {
            if (icon) icon.textContent = "💧";
            gridBtn.classList.remove("active");
            gridBtn.disabled = false;
        }, 5000);
    }

    // Save data immediately for grid flow
    await savePlant(cleanPlant(plant));

    // Sync attention section (no animation)
    setTimeout(() => {
        renderAttentionPlants();
    }, 300);
}

function getImageBase64(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement("canvas");

            const MAX_WIDTH = 800;
            const scale = Math.min(1, MAX_WIDTH / img.width);

            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Refined compression: JPEG with 0.7 quality
            const compressed = canvas.toDataURL("image/jpeg", 0.7);

            URL.revokeObjectURL(url);
            resolve(compressed);
        };

        img.src = url;
    });
}

function cleanPlant(plant) {
    const { justWatered, ...clean } = plant;
    return clean;
}

function getAverageWateringInterval(plant) {
    if (!plant.wateringHistory || plant.wateringHistory.length < 2) {
        return null;
    }

    let intervals = [];

    for (let i = 1; i < plant.wateringHistory.length; i++) {
        const prev = plant.wateringHistory[i - 1];
        const curr = plant.wateringHistory[i];

        const prevDate = new Date(prev);
        const currDate = new Date(curr);

        const diffTime = currDate - prevDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        intervals.push(diffDays);
    }

    if (intervals.length === 0) return null;

    const sum = intervals.reduce((a, b) => a + b, 0);
    return Math.round(sum / intervals.length);
}

// --- PWA Pull Struggle Effect ---
let startY = 0;
let isDragging = false;
let pullContainer = null;

document.addEventListener('touchstart', (e) => {
    if (window.scrollY <= 0) {
        startY = e.touches[0].clientY;
        isDragging = true;
        pullContainer = document.querySelector('.container');
        if (pullContainer) pullContainer.classList.add('is-dragging');
    }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!isDragging || !pullContainer) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0 && window.scrollY <= 0) {
        if (e.cancelable) e.preventDefault();

        const resistance = Math.min(Math.log(deltaY + 1) * 15, 60);
        pullContainer.style.transform = `translateY(${resistance}px)`;
    } else if (deltaY < 0) {
        pullContainer.style.transform = `translateY(0px)`;
    }
}, { passive: false });

const endDrag = () => {
    if (!isDragging || !pullContainer) return;
    isDragging = false;
    pullContainer.classList.remove('is-dragging');
    pullContainer.style.transform = 'translateY(0px)';
};

document.addEventListener('touchend', endDrag);
document.addEventListener('touchcancel', endDrag);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js");
    });
}

function renderComments(plant) {
    const container = document.getElementById("view-comments");
    if (!container) return;

    if (!plant.comments || plant.comments.length === 0) {
        container.innerHTML = "<p style='opacity:0.5;'>No notes yet</p>";
        return;
    }

    const recent = [...plant.comments].slice(-5).reverse();
    container.innerHTML = recent.map(c => `
        <div>
            <strong>${c.date}</strong>
            <span>${c.text}</span>
        </div>
    `).join("");
}