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

let selectedRating=0

const stars=document.querySelectorAll(".star")

stars.forEach(star=>{

star.addEventListener("click",()=>{

selectedRating=star.dataset.value

stars.forEach(s=>s.classList.remove("selected"))

for(let i=0;i<selectedRating;i++){
stars[i].classList.add("selected")
}

})

})



// gör rating tillgänglig för Firebase script

window.getSelectedRating=function(){

return selectedRating

}



// reset rating efter recension

window.resetRating=function(){

selectedRating=0

stars.forEach(s=>s.classList.remove("selected"))

}
