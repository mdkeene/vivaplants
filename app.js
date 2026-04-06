let plants = [];

document.addEventListener("DOMContentLoaded", async () => {
    await initDB();

    plants = await getAllPlants();

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
            document.getElementById("plant-type").value = "";
            document.getElementById("plant-preference").value = "";
            document.getElementById("plant-frequency").value = "";
            document.getElementById("plant-last-watered").value = new Date().toISOString().split("T")[0];
            document.getElementById("delete-plant-btn").style.display = "none";
            document.getElementById("add-plant-modal").classList.remove("hidden");
            document.body.classList.add("modal-open");
        };
    }

    const savePlantBtn = document.getElementById("save-plant");
    if (savePlantBtn) {
        savePlantBtn.onclick = async () => {
            const name = document.getElementById("plant-name").value;
            const location = document.getElementById("plant-location").value;
            const type = document.getElementById("plant-type").value || "";
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
        return status !== "ok" || p.justWatered;
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

    document.querySelector(".modal-header h3").textContent = "Edit Plant";
    document.getElementById("plant-name").value = plant.name;
    document.getElementById("plant-location").value = plant.location;
    document.getElementById("plant-type").value = plant.type || "";
    document.getElementById("plant-preference").value = plant.preference || "";
    document.getElementById("plant-frequency").value = plant.frequency || "";
    document.getElementById("plant-last-watered").value = plant.lastWatered;
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
    delBtn.style.display = "block";
    delBtn.onclick = () => deletePlant(id);

    document.getElementById("add-plant-modal").classList.remove("hidden");
    document.body.classList.add("modal-open");
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

function waterPlant(id, event) {
    if (event) event.stopPropagation();

    const isAttentionCard = event?.target?.closest(".plant-card-large");

    if (!isAttentionCard) {
        const plant = plants.find(p => p.id === id);
        if (!plant) return;

        if (navigator.vibrate) navigator.vibrate(15);

        const today = new Date().toISOString().split("T")[0];
        plant.lastWatered = today;
        plant.lastWateredTimestamp = Date.now();

        if (!plant.wateringHistory) {
            plant.wateringHistory = [];
        }

        plant.wateringHistory.push(today);
        plant.wateringHistory = plant.wateringHistory.slice(-5);

        delete plant.skipUntil;

        savePlant(cleanPlant(plant));

        const btn = event?.target?.closest(".grid-water-btn");
        if (btn) {
            btn.classList.add("active");
            const icon = btn.querySelector(".icon");

            if (icon) {
                icon.textContent = "✓";
                icon.style.color = "white";
                icon.style.fontWeight = "bold";
                icon.style.fontSize = "1.2rem";
            }

            btn.disabled = true;

            // Surgically update the status label in the grid card
            const gridCard = btn.closest(".plant-card-small");
            if (gridCard) {
                const statusSpan = gridCard.querySelector(".status-strong");
                if (statusSpan) {
                    statusSpan.textContent = "Just watered 🌿";
                    statusSpan.className = "status-strong text-ok";
                }
            }

            setTimeout(() => {
                if (icon) {
                    icon.textContent = "💧";
                    icon.style.color = "";
                    icon.style.fontWeight = "";
                    icon.style.fontSize = "";
                }
                btn.classList.remove("active");
                btn.disabled = false;
            }, 5000);
        }

        // Smoothly remove from attention if it exists there
        const attentionCard = document.querySelector(`.plant-card-large[data-id="${id}"]`);
        if (attentionCard) {
            const attentionSection = document.querySelector("#attention-plants")?.closest("section");
            const allPlantsSection = document.querySelector("#all-plants-grid")?.closest("section");
            
            // 1. Initial Anim: fade the card out
            attentionCard.classList.add("attention-exit");
            
            setTimeout(() => {
                if (!attentionSection) {
                    renderAttentionPlants();
                    return;
                }

                // 2. Capture "Before" state
                const oldHeight = attentionSection.offsetHeight;
                const oldGridRect = allPlantsSection?.getBoundingClientRect();
                
                // 3. Update DOM
                renderAttentionPlants();
                
                // 4. Capture "After" state
                const newHeight = attentionSection.scrollHeight;
                
                // 5. Coordinated Transition
                // Lock height to old and transform grid to old position
                attentionSection.style.height = oldHeight + "px";
                if (allPlantsSection && oldGridRect) {
                    const newGridRect = allPlantsSection.getBoundingClientRect();
                    const diffY = oldGridRect.top - newGridRect.top;
                    allPlantsSection.style.transform = `translateY(${diffY}px)`;
                    allPlantsSection.style.transition = "none"; 
                }

                // Force reflow
                void attentionSection.offsetWidth;

                // Trigger smooth slide
                attentionSection.style.height = (newHeight > 0 ? newHeight : 0) + "px";
                if (allPlantsSection) {
                    allPlantsSection.classList.add("waterfall-slide");
                    allPlantsSection.style.transform = "translateY(0)";
                }

                // 6. Cleanup after 800ms (match CSS)
                setTimeout(() => {
                    attentionSection.style.height = "";
                    if (allPlantsSection) {
                        allPlantsSection.classList.remove("waterfall-slide");
                        allPlantsSection.style.transform = "";
                        allPlantsSection.style.transition = "";
                    }
                }, 800);

            }, 550); 
        } else {
            renderAttentionPlants();
        }

        return;
    }

    const plant = plants.find(p => p.id === id);
    if (!plant) return;

    if (navigator.vibrate) {
        // Subtle click on start
        navigator.vibrate(15);
    }

    // mark visually first (no re-render yet)
    plant.justWatered = true;
    delete plant.skipUntil;

    // trigger animation WITHOUT rebuild
    if (event && event.target) {
        const card = event.target.closest(".plant-card-large");
        if (card) {
            card.classList.add("watering");
            addWaterFeedbackAndHighlightNext(card, plant);
        }
    } else {
        const card = document.querySelector(`[onclick*="waterPlant('${id}'"]`)?.closest(".plant-card-large");
        if (card) {
            card.classList.add("watering");
            addWaterFeedbackAndHighlightNext(card, plant);
        }
    }

    // update data slightly later
    setTimeout(async () => {
        const today = new Date().toISOString().split("T")[0];
        plant.lastWatered = today;
        plant.lastWateredTimestamp = Date.now();

        if (!plant.wateringHistory) {
            plant.wateringHistory = [];
        }

        plant.wateringHistory.push(today);

        // keep only last 5 entries
        plant.wateringHistory = plant.wateringHistory.slice(-5);

        await savePlant(cleanPlant(plant));
    }, 300);

    // re-render AFTER animation finishes
    setTimeout(() => {
        if (navigator.vibrate) {
            // Trigger completion pop!
            navigator.vibrate([50, 50, 50]);
        }
        // Remove card ONLY if there are others (prevents jitter on last card)
        const card = document.querySelector(`.plant-card-large[data-id="${id}"]`);
        const remaining = document.querySelectorAll("#attention-plants .plant-card-large");

        if (card && card.parentNode && remaining.length > 1) {
            card.parentNode.removeChild(card);
        }

        renderAttentionPlants();
        renderAllPlants();

    }, 3500);
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