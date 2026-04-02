// script.js

document.addEventListener("DOMContentLoaded", () => {
  // =======================
  // DROPDOWN MENU
  // =======================
  const menuToggle = document.querySelector(".menu-toggle");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (menuToggle && dropdownMenu) {
    menuToggle.addEventListener("click", (e) => {
      dropdownMenu.classList.toggle("active");
      e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
      if (!dropdownMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        dropdownMenu.classList.remove("active");
      }
    });
  }

  // =======================
  // STAR RATING SYSTEM
  // =======================
  const stars = document.querySelectorAll(".star");
  let selectedRating = 0;

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      stars.forEach((s) => s.classList.remove("selected"));
      for (let i = 0; i < selectedRating; i++) {
        stars[i].classList.add("selected");
      }
    });
  });

  window.getSelectedRating = () => selectedRating;
  window.resetRating = () => {
    selectedRating = 0;
    stars.forEach((s) => s.classList.remove("selected"));
  };

  // =======================
  // ROUTES & INSTRUCTIONS
  // =======================
  const routes = {
    entréA: {
      T4: {
        1: "🩻 T4: Ta trappan up 2 våningar",
        2: "🩻 T4: Gå rakt fram till trappan längst bort i korridoren",
        3: "🩻 T4: Ta rampen up till närmaste ingång till vänster",
        4: "🩻 T4: Du är nu framme i korridoren med T4 klassrummen"
      },
      akuten: {
        1: "🚑 Akuten: Gå rakt fram från entré A",
        2: "🚑 Akuten: Sväng höger",
        3: "🚑 Akuten: Följ röda linjen",
        4: "🚑 Akuten: Du är framme"
      }
    },
    entréB: {
      C303: {
        1: "🧪 C303: Gå till B205-227 korridoren och sväng höger",
        2: "🧪 C303: Gå till slutet av korridoren",
        3: "🧪 C303: Ta trappan upp till kopiatorn",
        4: "🧪 C303: Gå fram till tredje dörren i korridoren, på den står det C303",
        5: "🧪 C303: Du är nu framme"
      }
    }
  };

  const params = new URLSearchParams(window.location.search);
  let step = parseInt(params.get("step") || "1");

  if (params.get("route")) localStorage.setItem("route", params.get("route"));
  if (params.get("dest")) localStorage.setItem("dest", params.get("dest"));

  const route = localStorage.getItem("route");
  const dest = localStorage.getItem("dest");

  const instructionDiv = document.getElementById("instruction");
  const debugDiv = document.getElementById("debug");

  function showInstruction() {
    if (!route || !dest) {
      instructionDiv.textContent = "📍 Skanna en start-QR-kod i receptionen";
      return;
    }

    const routeData = routes[route]?.[dest];
    if (!routeData) {
      instructionDiv.textContent = "❌ Ingen väg hittades";
      return;
    }

    const maxStep = Math.max(...Object.keys(routeData).map(Number));
    if (step < 1) step = 1;
    if (step > maxStep) step = maxStep;

    instructionDiv.textContent = routeData[step];

    if (step === maxStep) {
      const formLink = document.createElement("a");
      formLink.href =
        "https://forms.office.com/Pages/ResponsePage.aspx?id=w-9zaNc360mUkFNgRBSBcPDwhgNalBlNg-rkgv_NWCBUQU5UV1pUSUxPMk9TREtNN1U1SVU2VVo1WS4u";
      formLink.textContent = "✅ Fyll i formuläret här";
      formLink.style.display = "block";
      formLink.style.marginTop = "20px";
      formLink.style.fontSize = "20px";
      instructionDiv.appendChild(formLink);
    }

    debugDiv.textContent = `Start: ${route} | Dest: ${dest} | Steg: ${step}`;
  }

  showInstruction();

  // =======================
  // QR SCANNER
  // =======================
  const scanBtn = document.getElementById("scanBtn");
  const video = document.getElementById("camera");
  let scanning = false;
  let stream;

  scanBtn.addEventListener("click", async () => {
    instructionDiv.innerHTML =
      "📷 Rikta kameran så <strong>hela QR-koden syns</strong><br><br>Håll lite avstånd";

    video.style.display = "block";
    document.getElementById("html5-qrcode").style.display = "block";

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 500);

    if (scanning) return;

    if ("BarcodeDetector" in window) {
      scanning = true;
      const detector = new BarcodeDetector({ formats: ["qr_code"] });

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        video.srcObject = stream;
        await video.play();

        (async function loop() {
          if (!scanning) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length) {
              scanning = false;
              stream.getTracks().forEach((track) => track.stop());
              window.location.href = codes[0].rawValue;
              return;
            }
          } catch {}
          setTimeout(loop, 150);
        })();
      } catch (err) {
        instructionDiv.innerHTML =
          "❌ Kunde inte starta kameran. Kontrollera åtkomst.";
        scanning = false;
      }
    } else {
      instructionDiv.innerHTML =
        "❌ Din enhet stöder inte BarcodeDetector. QR-skanning fungerar via HTML5-QR-code istället.";
      // Här kan du lägga in html5-qrcode fallback om du vill
    }
  });
});
