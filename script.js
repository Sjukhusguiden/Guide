// script.js



// =======================
// DROPDOWN MENU
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const dropdownMenu = document.getElementById("dropdownMenu");

  menuToggle.addEventListener("click", (e) => {
    dropdownMenu.classList.toggle("active");
    e.stopPropagation();
  });

  document.addEventListener("click", (e) => {
    if (!dropdownMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      dropdownMenu.classList.remove("active");
    }
  });

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

  // Global functions for rating access
  window.getSelectedRating = () => selectedRating;
  window.resetRating = () => {
    selectedRating = 0;
    stars.forEach((s) => s.classList.remove("selected"));
  };

  // =======================
  // REVIEW FORM
  // =======================
  const submitBtn = document.getElementById("submitReviewBtn");

  submitBtn.addEventListener("click", submitReview);

  async function submitReview() {
    const name = document.getElementById("name").value || "Anonym";
    const text = document.getElementById("reviewText").value.trim();
    const rating = window.getSelectedRating();

    if (!text || rating === 0) {
      alert("Välj antal stjärnor och skriv en recension.");
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        name: name,
        text: text,
        rating: rating,
        date: Date.now(),
      });

      document.getElementById("name").value = "";
      document.getElementById("reviewText").value = "";
      window.resetRating();
      loadReviews();
    } catch (err) {
      console.error("Error saving review:", err);
      alert("Något gick fel, försök igen.");
    }
  }

  // =======================
  // LOAD REVIEWS
  // =======================
  async function loadReviews() {
    const list = document.getElementById("reviewsList");
    list.innerHTML = "";

    try {
      const q = query(collection(db, "reviews"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);

      let totalRating = 0;
      let count = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const rating = Number(data.rating) || 0;
        if (rating > 0) totalRating += rating;
        if (rating > 0) count++;

        const div = document.createElement("div");
        div.className = "review";
        div.innerHTML = `
          <b>${data.name}</b>
          <div class="review-stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>
          <p>${data.text}</p>
        `;
        list.appendChild(div);
      });

      const avg = count ? (totalRating / count).toFixed(1) : "0";
      document.getElementById(
        "averageRating"
      ).textContent = `⭐ ${avg} / 5 (${count} recensioner)`;
    } catch (err) {
      console.error("Error loading reviews:", err);
    }
  }

  // Load reviews on page load
  loadReviews();

// =======================
// QR SCANNER
// =======================
  const instructionDiv = document.getElementById("instruction");
const scanBtn = document.getElementById("scanBtn");
const video = document.getElementById("camera");
let scanning = false;
scanBtn.addEventListener("click", async () => {
  instructionDiv.innerHTML = "📷 Rikta kameran mot QR-koden";

  // Show camera and QR box
  video.style.display = "block";
  document.getElementById("html5-qrcode").style.display = "block";

  // Wait for a short delay so elements finish rendering
  setTimeout(() => {
    // Scroll to bottom smoothly
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, 500); // 500ms delay can be adjusted if needed

  if (scanning) return;

  if ("BarcodeDetector" in window) {
    scanning = true;
    const detector = new BarcodeDetector({ formats: ["qr_code"] });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      video.srcObject = stream;
      await video.play();

      (async function loop() {
        if (!scanning) return;
        const codes = await detector.detect(video);
        if (codes.length) {
          scanning = false;
          stream.getTracks().forEach(track => track.stop());
          window.location.href = codes[0].rawValue;
          return;
        }
        setTimeout(loop, 150);
      })();

    } catch (err) {
      instructionDiv.innerHTML = "❌ Kunde inte starta kameran. Kontrollera åtkomst.";
      scanning = false;
    }
  } else {
    instructionDiv.innerHTML = "❌ Din enhet stöder inte BarcodeDetector.";
  }
});
