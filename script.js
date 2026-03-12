// =======================
// DROPDOWN MENU
// =======================

function toggleMenu(){

document
.getElementById("dropdownMenu")
.classList
.toggle("active")

}



// =======================
// QR SCANNER
// =======================

const scanBtn=document.getElementById("scanBtn")
const video=document.getElementById("camera")

const instructionDiv=document.getElementById("instruction")
const debugDiv=document.getElementById("debug")

let stream
let scanning=false



scanBtn.addEventListener("click",async()=>{

instructionDiv.innerHTML="📷 Rikta kameran mot QR-koden"

if("BarcodeDetector" in window){

const detector=new BarcodeDetector({formats:["qr_code"]})

try{

stream=await navigator.mediaDevices.getUserMedia({

video:{facingMode:"environment"}

})

video.srcObject=stream
video.style.display="block"

await video.play()

scanning=true

scanLoop(detector)

}

catch{

alert("Kunde inte öppna kameran")

}

}

else{

alert("Din webbläsare stödjer inte QR-skanning.")

}

})



async function scanLoop(detector){

if(!scanning)return

try{

const codes=await detector.detect(video)

if(codes.length>0){

scanning=false

instructionDiv.innerHTML="✅ QR kod skannad"

setTimeout(()=>{

video.srcObject.getTracks().forEach(t=>t.stop())

window.location.href=codes[0].rawValue

},1000)

return

}

}

catch{}

setTimeout(()=>scanLoop(detector),120)

}



// =======================
// STAR RATING SYSTEM
// =======================

// =======================
// LOAD REVIEWS + GENOMSNITTSBETYG
// =======================
async function loadReviews(){
    const list = document.getElementById("reviewsList");
    list.innerHTML = "";

    const q = query(collection(db,"reviews"), orderBy("date","desc"));
    const snapshot = await getDocs(q);

    let totalRating = 0;
    let ratingCount = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        const rating = Number(data.rating) || 0; // default 0 om ingen rating finns

        if(rating > 0){
            totalRating += rating;
                       ratingCount++;
        }

        // Skapa review-element
        const div = document.createElement("div");
        div.className = "review";
        div.innerHTML = `
            <b>${data.name}</b>
            <div class="review-stars">${"★".repeat(rating)}${"☆".repeat(5-rating)}</div>
            <p>${data.text}</p>
        `;
        list.appendChild(div);
    });

    // Beräkna genomsnitt
    const avg = ratingCount ? (totalRating / ratingCount).toFixed(1) : "0";
    document.getElementById("averageRating").innerHTML = `⭐ ${avg} / 5 (${ratingCount} recensioner)`;
}

// Anropa för att ladda recensioner direkt när sidan öppnas
loadReviews();

// Funktion för att skicka review (använder stjärnor)
async function submitReview() {
    const name = document.getElementById("name").value || "Anonym";
    const text = document.getElementById("reviewText").value.trim();
    const rating = Number(window.getSelectedRating()) || 0;

    if (!text || rating === 0) {
        alert("Välj antal stjärnor och skriv en recension.");
        return;
    }

    // Spara i Firebase
    await addDoc(collection(db, "reviews"), {
        name: name,
        text: text,
        rating: rating,
        date: Date.now()
    });

    // Rensa formuläret och rating
    document.getElementById("name").value = "";
    document.getElementById("reviewText").value = "";
    window.resetRating();

    // Ladda om recensioner
    loadReviews();
}
