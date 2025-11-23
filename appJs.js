// BUILDING TRAVEL TIMES (Option A)
const BUILDING_TRAVEL = {
  "Nicely Hall": {
    "Nicely Hall": 0,
    "West Hall": 1,
    "OSB": 5,
    "Jafet Library": 2
  },
  "West Hall": {
    "Nicely Hall": 1,
    "West Hall": 0,
    "OSB": 5,
    "Jafet Library": 2
  },
  "OSB": {
    "Nicely Hall": 5,
    "West Hall": 5,
    "OSB": 0,
    "Jafet Library": 5
  },
  "Jafet Library": {
    "Nicely Hall": 2,
    "West Hall": 2,
    "OSB": 5,
    "Jafet Library": 0
  }
};

// Fixed current bus location
let BUS_CURRENT_LOCATION = "OSB"; 

const GATE_TRAVEL = {
  "OSB Gate": {
    "OSB Gate": 0,
    "Main Gate": 5,
    "Bliss Gate": 6,
    "Sea Gate": 3,
    "CHSC Gate": 2,
    "Medical Gate": 4,
    "Women’s Dorm Gate": 2
  },
  "Main Gate": {
    "OSB Gate": 5,
    "Main Gate": 0,
    "Bliss Gate": 2,
    "Sea Gate": 4,
    "CHSC Gate": 5,
    "Medical Gate": 3,
    "Women’s Dorm Gate": 6
  },
  "Bliss Gate": {
    "OSB Gate": 4,
    "Main Gate": 3,
    "Bliss Gate": 0,
    "Sea Gate": 4,
    "CHSC Gate": 5,
    "Medical Gate": 3,
    "Women’s Dorm Gate": 6
  },
  "Sea Gate": {
    "OSB Gate": 2,
    "Main Gate": 5,
    "Bliss Gate": 6,
    "Sea Gate": 0,
    "CHSC Gate": 1,
    "Medical Gate": 3,
    "Women’s Dorm Gate": 2
  },
  "CHSC Gate": {
    "OSB Gate": 1,
    "Main Gate": 5,
    "Bliss Gate": 6,
    "Sea Gate": 1,
    "CHSC Gate": 0,
    "Medical Gate": 4,
    "Women’s Dorm Gate": 3
  },
  "Medical Gate": {
    "OSB Gate": 6,
    "Main Gate": 1,
    "Bliss Gate": 2,
    "Sea Gate": 5,
    "CHSC Gate": 5,
    "Medical Gate": 0,
    "Women’s Dorm Gate": 6
  },
  "Women’s Dorm Gate": {
    "OSB Gate": 2,
    "Main Gate": 4,
    "Bliss Gate": 5,
    "Sea Gate": 3,
    "CHSC Gate": 3,
    "Medical Gate": 3,
    "Women’s Dorm Gate": 0
  }
};
const screenRoot = document.getElementById("screenRoot");
const menuToggle = document.getElementById("menuToggle");
const menuBackdrop = document.getElementById("menuBackdrop");
const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");

let activeScreen = "home";
let countdownTimers = {};
let navStack = ["home"];

const AUB_LOCATIONS = {
  gates: [
    "Main Gate",
    "Bliss Gate",
    "Sea Gate",
    "OSB Gate",
    "CHSC Gate",
    "Medical Gate",
    "Women’s Dorm Gate"
  ],
  buildings: [
    "Nicely Hall",
    "West Hall",
    "OSB",
    "Jafet Library"
  ]
};

// All drivers + their home gates
const DRIVERS = [
  {
    id: 1,
    initials: "K",
    name: "Karim",
    rating: 4.9,
    vehicle: "Yamaha NMAX",
    gate: "OSB Gate"
  },
  {
    id: 2,
    initials: "D",
    name: "Dana",
    rating: 4.8,
    vehicle: "Honda ADV",
    gate: "Main Gate"
  },
  {
    id: 3,
    initials: "M",
    name: "Maher",
    rating: 4.7,
    vehicle: "Scooter",
    gate: "Sea Gate"
  }
];


const SCOOTERS = [
  {
    id: 1,
    label: "S1",
    battery: 78,
    distance: "160 m",
    position: { top: "54%", left: "38%" }
  },
  {
    id: 2,
    label: "S2",
    battery: 52,
    distance: "260 m",
    position: { top: "36%", left: "65%" }
  },
  {
    id: 3,
    label: "S3",
    battery: 91,
    distance: "90 m",
    position: { top: "68%", left: "52%" }
  }
];

// Moto state
let motoRidesLeft = 5;
let lastPickupGate = null;
let lastDriver = null;
let driverStatusInterval = null;

function getDriversForGate(gate) {
  const list = DRIVERS_BY_GATE[gate];
  if (list && list.length) return list;
  return DRIVERS;
}

function clearCountdown(id) {
  if (countdownTimers[id]) {
    clearInterval(countdownTimers[id].intervalId);
    delete countdownTimers[id];
  }
}

function startCountdown(id, initialMinutes) {
  clearCountdown(id);
  const el = document.getElementById(id);
  if (!el) return;

  let remainingSeconds = initialMinutes * 60;

  const update = () => {
    const stillThere = document.getElementById(id);
    if (!stillThere) {
      clearCountdown(id);
      return;
    }
    if (remainingSeconds <= 0) {
      el.textContent = "Arriving now";
      clearCountdown(id);
      return;
    }
    const mins = Math.ceil(remainingSeconds / 60);
    el.textContent = `${mins} min away`;
    remainingSeconds -= 60;
  };

  update();
  const intervalId = setInterval(update, 60_000);
  countdownTimers[id] = { intervalId };
}

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 5000);
}

function setStatusTime() {
  const el = document.getElementById("status-time");
  if (!el) return;
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  const mm = m.toString().padStart(2, "0");
  el.textContent = `${h}:${mm}`;
}

function renderScreen(screen) {
  activeScreen = screen;
  Object.keys(countdownTimers).forEach(clearCountdown);

  switch (screen) {
    case "home":
      screenRoot.innerHTML = renderHomeScreen();
      break;

    case "bus":
      screenRoot.innerHTML = renderBusScreen();
      wireBusScreen();
      break;

    case "moto":
      screenRoot.innerHTML = renderMotoScreen();
      wireMotoScreen();
      break;

    case "motoConfirm":
      screenRoot.innerHTML = renderMotoConfirmScreen();
      wireMotoConfirmScreen();
      break;

    case "scooter":
      screenRoot.innerHTML = renderScooterScreen();
      wireScooterScreen();
      break;

    case "scooterUnlock":
      screenRoot.innerHTML = renderScooterUnlockScreen(lastScooter);
      wireScooterUnlockScreen(lastScooter);
      break;

    case "pricing":
      screenRoot.innerHTML = renderPricingScreen();
      wirePricingScreen();
      break;

    case "driverStatus":
      screenRoot.innerHTML = renderDriverStatusScreen();
      startDriverStatusCountdown();
      break;

    case "busStatus":
      screenRoot.innerHTML = renderBusStatusScreen();
      startCountdown("busStatusEta", 5);
      break;

    default:
      screenRoot.innerHTML = renderHomeScreen();
      break;
  }
}

function navigateTo(screen) {
  if (activeScreen === screen) {
    renderScreen(screen);
    return;
  }
  navStack.push(screen);
  renderScreen(screen);
}

function goBack() {
  if (navStack.length > 1) {
    navStack.pop();
  }
  const prev = navStack[navStack.length - 1] || "home";
  renderScreen(prev);
}

function renderHomeScreen() {
  return `
    <div>
      <div class="section-title">Mohamad, where are you heading?</div>
      <div class="section-subtitle">Choose how you want to move between upper and lower campus.</div>

      <br><br><br><br>

      <div class="service-grid">
        <div class="card" data-screen="bus">
          <div class="card-icon bus">
            <span>🚌</span>
          </div>
          <div class="card-body">
            <div class="card-title">Campus bus / van</div>
            <div class="card-text">Pick your pickup spot and class building. We handle the route.</div>
            <div class="card-meta">Runs on fixed loops between gates & major buildings.</div>
          </div>
        </div>

        <div class="card" data-screen="scooter">
          <div class="card-icon scooter">
            <span>🛴</span>
          </div>
          <div class="card-body">
            <div class="card-title">Electric scooter</div>
            <div class="card-text">Free-floating scooters across campus. Find one, unlock, ride.</div>
            <div class="card-meta">Designed for quick hops between lectures.</div>
          </div>
        </div>

        <div class="card" data-screen="moto">
          <div class="card-icon moto">
            <span>🏍️</span>
          </div>
          <div class="card-body">
            <div class="card-title">Moto taxi</div>
            <div class="card-text">Fast rides from AUB gates to nearby streets and back.</div>
            <div class="card-meta">Licensed riders stationed by main gates.</div>
          </div>
        </div>
      </div>

    </div>
  `;
}

function renderLocationSelectOptions(list) {
  return ["", ...list]
    .map((item, idx) => {
      if (idx === 0) return '<option value="">Select…</option>';
      return `<option value="${item}">${item}</option>`;
    })
    .join("");
}

/* BUS */
function renderBusScreen() {
  const buildingOptions = renderLocationSelectOptions(AUB_LOCATIONS.buildings);

  return `
    <div>
      <div class="section-title">Campus bus / van</div>
      <div class="section-subtitle">Choose your pickup spot and class building.</div>
      <br> <br> <br>

      <div class="field-group">
        <div class="field-label">Pickup building</div>
        <div class="input-row">
  <select id="busPickup" class="select">
    ${buildingOptions}
  </select>
  <button class="btn btn-secondary use-location-btn" id="busUseLocation">Use current</button>
</div>
      </div>

      <div class="field-group">
        <div class="field-label">Destination building</div>
        <select id="busDestination" class="select">
          ${buildingOptions}
        </select>
      </div>

      <div id="busEtaSection" style="display:none;">
        <div class="field-group">
          <div class="field-label">Arrival time</div>
          <div class="status-eta-line">
            <span>ETA:</span>
            <span class="status-eta-pill" id="busEtaLabel">5 min to destination</span>
          </div>
        </div>
      </div>

      <div class="center-row" id="busConfirmRow" style="display:none; gap: 8px;">
  <button class="btn btn-outline" data-action="back">Back</button>
  <button class="btn btn-primary" id="busConfirm">Reserve van</button>
</div>
    </div>
  `;
}

function wireBusScreen() {
    const confirmRow = document.getElementById("busConfirmRow");

  const pickupSelect = document.getElementById("busPickup");
  const destSelect = document.getElementById("busDestination");
  const useLocBtn = document.getElementById("busUseLocation");
  const confirmBtn = document.getElementById("busConfirm");
  const etaSection = document.getElementById("busEtaSection");
  const etaLabel = document.getElementById("busEtaLabel");

  function hideEta() {
    etaSection.style.display = "none";
    etaLabel.textContent = "";
  }

  function showEta() {
    etaSection.style.display = "block";
  }

  function computeBusEta(pickupBuilding) {
    const eta = BUILDING_TRAVEL[BUS_CURRENT_LOCATION][pickupBuilding];
    return eta;
  }

  function checkReady() {
  const p = pickupSelect.value;
  const d = destSelect.value;

  if (!p || !d) {
    hideEta();
    confirmRow.style.display = "none";
    return;
  }

  const eta = computeBusEta(p);
  showEta();
  etaLabel.textContent = eta === 0 ? "Arriving now" : `${eta} min away`;

  // Now show the confirm row
  confirmRow.style.display = "flex";
}

  pickupSelect.addEventListener("change", checkReady);
  destSelect.addEventListener("change", checkReady);

  if (useLocBtn) {
    useLocBtn.addEventListener("click", () => {
      pickupSelect.value = "OSB";
      showToast("Your current location is OSB");
      checkReady();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!pickupSelect.value || !destSelect.value) {
        showToast("Choose pickup and destination to continue.");
        return;
      }
      navigateTo("busStatus");
    });
  }

  hideEta();
}


function renderBusStatusScreen() {
  return `
    <div>
      <div class="section-title">Van reserved</div>
      <div class="section-subtitle">Your campus bus is on its way.</div>

      <div class="status-pane">
        <div class="status-label">Pickup spot</div>
        <div class="status-main">We’ll meet you at your chosen gate.</div>
        <div class="status-meta">Show this screen if you need to prove your booking during the presentation.</div>
        <div class="status-eta-line">
          <span>ETA:</span>
          <span class="status-eta-pill" id="busStatusEta">5 min away</span>
        </div>

        <div class="status-map-mini">
          <div class="status-path-line"></div>
          <div class="status-marker start"><span>🚌</span></div>
          <div class="status-marker end"><span>📍</span></div>
        </div>
      </div>

      <div class="center-row">
        <button class="btn btn-outline" data-screen="home">Back to home</button>
      </div>
    </div>
    ${/* QR SECTION */""}
<div class="qr-block">
  <div class="qr-caption">Show this QR code to your rider before the trip</div>
  <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=demo" />
</div>
  `;
}

/* MOTO */

function renderMotoScreen() {
  const gateOptions = renderLocationSelectOptions(AUB_LOCATIONS.gates);

  return `
    <div>
      <div class="section-title">Get a moto taxi</div>
        <br><br><br><br>
      <div class="field-group">
        <div class="field-label">Pickup gate</div>
        <div class="input-row">
          <select id="motoPickup" class="select">
            ${gateOptions}
          </select>
          <button class="btn btn-secondary use-location-btn" id="motoUseLocation">Use current</button>
        </div>
      </div>

      <div class="field-group">
        <div class="field-label">Destination gate</div>
        <select id="motoDestination" class="select">
          ${gateOptions}
        </select>
      </div>

      <div id="driversSection" style="display:none;">
  <div class="field-group">
    <div class="field-label">Drivers nearby</div>
    <div class="card-list" id="driverList"></div>
  </div>
</div>

      <div class="center-row">
        <button class="btn btn-outline" data-action="back">Back</button>
      </div>
    </div>
  `;
}

function renderDriverCards(drivers) {
  return drivers
    .map(
      (d) => `
        <div class="driver-card" data-driver-id="${d.id}">
          <div class="driver-avatar">${d.initials}</div>
          <div class="driver-body">
            <div class="driver-name-row">
              <span class="driver-name">${d.name}</span>
              <span class="driver-rating">⭐ ${d.rating.toFixed(1)}</span>
            </div>
            <div class="driver-meta">${d.vehicle} · Waiting at ${d.gate}</div>
            <div class="driver-eta">Pickup ETA: ${d.etaToPickup} min • Total: ${d.totalEta} min</div>
          </div>
        </div>
      `
    )
    .join("");
}


function wireMotoScreen() {
  const pickupSelect = document.getElementById("motoPickup");
  const destSelect = document.getElementById("motoDestination");
  const useLocBtn = document.getElementById("motoUseLocation");
  const driversSection = document.getElementById("driversSection");
  const list = document.getElementById("driverList");
  const ridesLabel = document.getElementById("motoRidesLabel");

  if (ridesLabel) ridesLabel.textContent = motoRidesLeft;

  function hideDrivers() {
    driversSection.style.display = "none";
    list.innerHTML = "";
  }

  function showDrivers() {
    driversSection.style.display = "block";
  }

  function etaBetween(g1, g2) {
    if (!GATE_TRAVEL[g1] || !GATE_TRAVEL[g1][g2]) return 5;
    return GATE_TRAVEL[g1][g2];
  }

  function computeETA(driverGate, pickupGate, destinationGate) {
    const toPickup = GATE_TRAVEL[driverGate][pickupGate];
    const toDest = GATE_TRAVEL[pickupGate][destinationGate];

    return {
      toPickup,
      total: toPickup + toDest
    };
  }

  function loadDrivers(pickupGate, destGate) {
    list.innerHTML = `
      <div class="status-pane">
        <div class="status-label">Finding drivers</div>
        <div class="status-meta">Locating your closest riders…</div>
      </div>
    `;

    setTimeout(() => {
      const drivers = DRIVERS.map(d => {
        const eta = computeETA(d.gate, pickupGate, destGate);
        return { ...d, etaToPickup: eta.toPickup, totalEta: eta.total };
      });

      list.innerHTML = renderDriverCards(drivers);

      list.querySelectorAll(".driver-card").forEach((card) => {
        card.addEventListener("click", () => {
          const id = card.getAttribute("data-driver-id");
          const chosen = drivers.find((d) => d.id.toString() === id);

          lastDriver = chosen;
          lastPickupGate = pickupGate;
          lastDestinationGate = destGate;

          navigateTo("motoConfirm");
        });
      });

    }, 2000);
  }

  function checkReady() {
    const p = pickupSelect.value;
    const d = destSelect.value;

    if (!p || !d) {
      hideDrivers();
      return;
    }

    showDrivers();
    loadDrivers(p, d);
  }

  pickupSelect.addEventListener("change", checkReady);
  destSelect.addEventListener("change", checkReady);

  useLocBtn.addEventListener("click", () => {
    pickupSelect.value = "OSB Gate";
    checkReady();
    showToast("Closest gate found is OSB gate.");
  });

  // Start hidden on load
  hideDrivers();
}

function renderMotoConfirmScreen() {
  const pickup = lastPickupGate;
  const dest = lastDestinationGate;
  const driver = lastDriver;

  const etaToPickup = GATE_TRAVEL[driver.gate][pickup];
  const rideTime = GATE_TRAVEL[pickup][dest];
  const totalEta = etaToPickup + rideTime;

  const arrivalTime = new Date();
  arrivalTime.setMinutes(arrivalTime.getMinutes() + totalEta);
  const arrivalStr = arrivalTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

  const current = motoRidesLeft;
  const after = Math.max(current - 1, 0);

  return `
    <div>
      <div class="section-title">Confirm your ride</div>
      <div class="section-subtitle">
        Pickup at ${pickup}, drop-off at ${dest}. Arrival at ${arrivalStr}.
      </div>

      <div class="status-pane">
        <div class="status-label">Your rider</div>
        <div class="status-main">${driver.name}</div>
        <div class="status-meta">${driver.vehicle} · ${driver.rating.toFixed(1)} rating</div>

        <div class="status-eta-line">
          <span>ETA:</span>
          <span class="status-eta-pill">${totalEta} min</span>
        </div>

        <div class="status-meta" style="margin-top:6px;">
          Credits: <strong>${current} → ${after}</strong>
        </div>
      </div>

      <div class="center-row" style="gap: 8px;">
        <button class="btn btn-outline" data-action="back">Cancel</button>
        <button class="btn btn-primary" id="confirmRideBtn">Confirm ride</button>
      </div>
    </div>
  `;
}


function wireMotoConfirmScreen() {
  const currentEl = document.getElementById("motoConfirmRidesCurrent");
  const afterEl = document.getElementById("motoConfirmRidesAfter");
  const confirmBtn = document.getElementById("confirmRideBtn");

  if (currentEl) currentEl.textContent = motoRidesLeft;
  if (afterEl) afterEl.textContent = motoRidesLeft > 0 ? motoRidesLeft - 1 : 0;

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Confirming…";
      showToast("Confirming your ride…");

      showRideConfirmedPopup(lastDriver.name, lastDriver.etaToPickup);

      setTimeout(() => {
        if (motoRidesLeft > 0) motoRidesLeft -= 1;
        navigateTo("driverStatus");
      }, 5000);
    });
  }
}

function renderDriverStatusScreen() {
  const name = lastDriver ? lastDriver.name : "Driver";
  const meta = lastDriver
    ? `${lastDriver.vehicle} · ${lastDriver.rating.toFixed(1)} rating`
    : "Moto details & rating";
  const gateLabel = lastPickupGate || "your gate";

  return `
    <div>
      <div class="section-title">Rider on the way</div>
      <div class="section-subtitle">Helmet on, backpack zipped. You’re almost moving.</div>

      <div class="status-pane">
        <div class="status-label">Your rider</div>
        <div class="status-main" id="driverStatusName">${name}</div>
        <div class="status-meta" id="driverStatusMeta">${meta}</div>
        <div class="status-meta" id="driverStatusGateText" style="margin-top: 2px;">
          Pickup at ${gateLabel}.
        </div>
        <div class="status-eta-line">
          <span>ETA:</span>
          <span class="status-eta-pill" id="driverStatusEta">5 min away</span>
        </div>
        <div class="status-map-mini">
          <div class="status-path-line"></div>
          <div class="status-marker start"><span>🏍️</span></div>
          <div class="status-marker end" id="driverMarker"><span>📍</span></div>
        </div>
      </div>

      <div class="center-row">
        <button class="btn btn-outline" data-screen="home">Back to home</button>
      </div>
    </div>
    ${/* QR SECTION */""}
<div class="qr-block">
  <div class="qr-caption">Show this QR code to your rider before the trip</div>
  <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=demo" />
</div>
  `;
}

function startDriverStatusCountdown() {
  if (driverStatusInterval) {
    clearInterval(driverStatusInterval);
    driverStatusInterval = null;
  }

  const etaEl = document.getElementById("driverStatusEta");
  const marker = document.getElementById("driverMarker");
  if (!etaEl || !marker) return;

  let remaining = 5;
  // Positions for the 🏍 moving towards the gate
  const positions = ["80%", "65%", "50%", "35%", "22%"];

  const gateLabel = lastPickupGate || "the gate";

  const tick = () => {
    const stillEta = document.getElementById("driverStatusEta");
    const stillMarker = document.getElementById("driverMarker");
    if (!stillEta || !stillMarker) {
      clearInterval(driverStatusInterval);
      driverStatusInterval = null;
      return;
    }

    if (remaining <= 0) {
      etaEl.textContent = "Arriving now";
      marker.style.left = "18%";
      showToast(`Your rider is waiting for you at ${gateLabel}.`);
      clearInterval(driverStatusInterval);
      driverStatusInterval = null;
      return;
    }

    etaEl.textContent = `${remaining} min to destination`;
    const idx = 5 - remaining;
    if (positions[idx]) {
      marker.style.left = positions[idx];
    }
    remaining -= 1;
  };

  tick();
  driverStatusInterval = setInterval(tick, 60_000);
}

/* SCOOTER */

function wireScooterUnlockScreen(scooter) {
  const unlockBtn = document.getElementById("unlockScooterBtn");
  const qrSection = document.getElementById("qrSection");

  if (!unlockBtn) return;

  unlockBtn.addEventListener("click", () => {
    unlockBtn.disabled = true;
    unlockBtn.textContent = "Unlocking…";

    setTimeout(() => {
      unlockBtn.style.display = "none";
      qrSection.style.display = "block";
      showToast(`Scooter ${scooter.label} unlocked.`);
    }, 1200);
  });
}
function renderScooterScreen() {
    const gateOptions = renderLocationSelectOptions(AUB_LOCATIONS.gates);
  return `
    <div>
      <div class="section-title">Rent a scooter</div>   

      <div class="select-stack">
  
</div>

      <div class="map-shell" id="scooterMap">
        <div class="map-overlay-label">AUB campus (AUB Map Showing Scooter Locations)</div>
        ${SCOOTERS.map(
          (s) => `
          <button class="scooter-dot" data-scooter-id="${s.id}" style="top: ${s.position.top}; left: ${s.position.left};">
            <span>🛴</span>
          </button>
        `
        ).join("")}
      </div>

      <div class="card-list" style="margin-top: 10px;">
        ${SCOOTERS.map(
          (s) => `
          <div class="driver-card" data-scooter-id="${s.id}">
            <div class="driver-avatar">${s.label}</div>
            <div class="driver-body">
              <div class="driver-name-row">
                <span class="driver-name">Scooter ${s.label}</span>
                <span class="driver-rating">${s.battery}% battery</span>
              </div>
              <div class="driver-meta">Approx. ${s.distance} from you.</div>

            </div>
          </div>
        `
        ).join("")}
      </div>

      <div class="center-row">
        <button class="btn btn-outline" data-action="back">Back</button>
      </div>
    </div>
  `;
}

function wireScooterScreen() {
  const triggers = screenRoot.querySelectorAll("[data-scooter-id]");

  triggers.forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-scooter-id");
      const s = SCOOTERS.find((sc) => sc.id.toString() === id);
      if (!s) return;

      lastScooter = s;
      navigateTo("scooterUnlock");
    });
  });
}

function renderScooterUnlockScreen(scooter) {
  return `
    <div>
      <div class="section-title">Scooter ${scooter.label}</div>
      <div class="section-subtitle">
        Battery: ${scooter.battery}% · ${scooter.distance} away
      </div>

      <div class="status-pane">
    

        <div class="center-row" style="margin-top: 20px;">
          <button class="btn btn-primary" id="unlockScooterBtn">Unlock</button>
        </div>

        <div id="qrSection" style="display:none; margin-top: 30px; text-align:center;">
          <div class="status-label" style="margin-bottom:10px;">Scan to unlock</div>
          <div class="qr-wrapper" style="display:flex; justify-content:center;">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AUB-Scooter-Unlock"
              alt="QR Code"
              class="qr-image"
            />
          </div>

        </div>
      </div>

      <div class="center-row" style="margin-top: 20px;">
        <button class="btn btn-outline" data-action="back">Back</button>
      </div>
    </div>
  `;
}

/* PRICING */

function renderPricingScreen() {
  return `
    <div>
      <div class="section-title">Monthly passes</div>
      <div class="section-subtitle">Placeholder prices – update these numbers later.</div>

      <div class="pricing-list">
        <div class="pricing-card">
          <div class="pricing-header-row">
            <div class="pricing-name">Campus bus / van pass</div>
            <div>
              <span class="pricing-price">$XX</span>
              <span class="pricing-cycle"> / month</span>
            </div>
          </div>
          <div class="pricing-footnote">Unlimited rides between registered gates and buildings.</div>
        </div>

        <div class="pricing-card">
          <div class="pricing-header-row">
            <div class="pricing-name">Scooter access</div>
            <div>
              <span class="pricing-price">$XX</span>
              <span class="pricing-cycle"> / month</span>
            </div>
          </div>
          <div class="pricing-footnote">Unlock any scooter on campus for short rides.</div>
        </div>

        <div class="pricing-card">
          <div class="pricing-header-row">
            <div class="pricing-name">Moto taxi credit bundle</div>
            <div>
              <span class="pricing-price">$XX</span>
              <span class="pricing-cycle"> / month</span>
            </div>
          </div>
          <div class="pricing-footnote">Pre-loaded credit for fast point-to-point trips.</div>
        </div>
      </div>

      <div class="center-row">
        <button class="btn btn-primary" id="manageSubscriptionBtn">Manage my subscription</button>
      </div>
    </div>
    
  `;
}

function wirePricingScreen() {
  const btn = document.getElementById("manageSubscriptionBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      showToast("Subscription management is part of the full product, not this prototype.");
    });
  }
}

/* GLOBAL NAV & MENU */

function wireGlobalNav() {
  screenRoot.addEventListener("click", (event) => {
    // Back buttons
    const backBtn = event.target.closest("[data-action='back']");
    if (backBtn) {
      goBack();
      return;
    }

    // Screen navigation
    const target = event.target.closest("[data-screen]");
    if (!target) return;
    const screen = target.getAttribute("data-screen");
    if (screen) {
      navigateTo(screen);
    }
  });
}

function openMenu() {
  menuBackdrop.classList.add("show");
}

function closeMenu() {
  menuBackdrop.classList.remove("show");
}

function initMenu() {
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (menuBackdrop.classList.contains("show")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", (event) => {
      const isSheet = event.target.closest(".menu-sheet");
      if (!isSheet) {
        closeMenu();
        return;
      }
    });

    menuBackdrop.querySelectorAll(".menu-item-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const screen = btn.getAttribute("data-screen");
        if (screen) {
          closeMenu();
          setTimeout(() => navigateTo(screen), 40);
        }
      });
    });
  }
}

/* INIT */

function initApp() {
  navStack = ["home"];
  setStatusTime();
  setInterval(setStatusTime, 60_000);
  initMenu();
  wireGlobalNav();
  renderScreen("home");
}

document.addEventListener("DOMContentLoaded", initApp);
function showRideConfirmedPopup(driverName, eta) {
  const div = document.createElement("div");
  div.className = "ride-confirm-popup";
  div.innerHTML = `
    <div class="popup-icon">✔️</div>
    <div class="popup-text">
      Ride confirmed.<br>
      ${driverName} will reach you in ${eta} min.
    </div>
  `;

  document.body.appendChild(div);

  setTimeout(() => {
    div.classList.add("visible");
  }, 10);

  setTimeout(() => {
    div.classList.remove("visible");
    setTimeout(() => div.remove(), 300);
  }, 2200);
}
