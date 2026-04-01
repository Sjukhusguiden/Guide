// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

    // =======================
    // DROPDOWN MENU
    // =======================
    const menuToggle = document.querySelector(".menu-toggle");
    const dropdownMenu = document.getElementById("dropdownMenu");

    menuToggle.addEventListener("click", e => {
        dropdownMenu.classList.toggle("active");
        e.stopPropagation();
    });

    document.addEventListener("click", e => {
        if (!dropdownMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            dropdownMenu.classList.remove("active");
        }
    });

    // =======================
    // QR SCANNER
    // =======================
    const scanBtn = document.getElementById("scanBtn");
    const video = document.getElementById("camera");
    const instructionDiv = document.getElementById("instruction");

    let scanning = false;
    let stream;

    scanBtn.addEventListener("click", async () => {
        instructionDiv.innerHTML = "📷 Rikta kameran mot QR-koden";

        if ("BarcodeDetector" in window) {
            const detector = new BarcodeDetector({ formats: ["qr_code"] });
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                video.srcObject = stream;
                video.style.display = "block";
                await video.play();
                scanning = true;
                scanLoop(detector);
            } catch {
                alert("Kunde inte öppna kameran");
            }
        } else {
            alert("Din webbläsare stödjer inte QR-skanning.");
        }
    });

    async function scanLoop(detector) {
        if (!scanning) return;
        try {
            const codes = await detector.detect(video);
            if (codes.length > 0) {
                scanning = false;
                instructionDiv.innerHTML = "✅ QR kod skannad";
                setTimeout(() => {
                    video.srcObject.getTracks().forEach(t => t.stop());
                    window.location.href = codes[0].rawValue;
                }, 1000);
                return;
            }
        } catch { }
        setTimeout(() => scanLoop(detector), 120);
    }

    // =======================
    // FIREBASE INIT
    // =======================
    const firebaseConfig = {
        apiKey: "AIzaSyCkHZ9nebsrLQg0ovigpxXi9DcoZWIVEhM",
        authDomain: "sjukhusguiden.firebaseapp.com",
        projectId: "sjukhusguiden",
        storageBucket: "sjukhusguiden.firebasestorage.app",
        messagingSenderId: "122348406165",
        appId: "1:122348406165:web:e698bf6d32ac22f339a29c",
        measurementId: "G-3G6D5DZD7Z"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // =======================
    // STAR RATING SYSTEM
    // =======================
    let selectedRating = 0;
    const stars = document.querySelectorAll(".star");

    stars.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = Number(star.dataset.value);
            stars.forEach(s => s.classList.remove("selected"));
            for (let i = 0; i < selectedRating; i++) {
                stars[i].classList.add("selected");
            }
        });
    });

    window.getSelectedRating = () => selectedRating;
    window.resetRating = () => {
        selectedRating = 0;
        stars.forEach(s => s.classList.remove("selected"));
    };

    // =======================
    // LOAD REVIEWS
    // =======================
    async function loadReviews() {
        const list = document.getElementById("reviewsList");
        list.innerHTML = "";

        const q = query(collection(db, "reviews"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        let totalRating = 0;
        let ratingCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const rating = Number(data.rating) || 0;
            if (rating > 0) {
                totalRating += rating;
                ratingCount++;
            }

            const div = document.createElement("div");
            div.className = "review";
            div.innerHTML = `
                <b>${data.name}</b>
                <div class="review-stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>
                <p>${data.text}</p>
            `;
            list.appendChild(div);
        });

        const avg = ratingCount ? (totalRating / ratingCount).toFixed(1) : "0";
        document.getElementById("averageRating").innerHTML = `⭐ ${avg} / 5 (${ratingCount} recensioner)`;
    }

    loadReviews();

    // =======================
    // SUBMIT REVIEW
    // =======================
    window.submitReview = async function () {
        const name = document.getElementById("name").value || "Anonym";
        const text = document.getElementById("reviewText").value.trim();
        const rating = Number(window.getSelectedRating()) || 0;

        if (!text || rating === 0) {
            alert("Välj antal stjärnor och skriv en recension.");
            return;
        }

        await addDoc(collection(db, "reviews"), {
            name: name,
            text: text,
            rating: rating,
            date: Date.now()
        });

        document.getElementById("name").value = "";
        document.getElementById("reviewText").value = "";
        window.resetRating();

        loadReviews();
    };
});
