function toggleMenu(){

document
.getElementById("dropdownMenu")
.classList
.toggle("active")

}



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

})



async function scanLoop(detector){

if(!scanning)return

try{

const codes=await detector.detect(video)

if(codes.length>0){

scanning=false

instructionDiv.innerHTML="QR kod skannad"

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



function addReview(){

const name=document.getElementById("name").value
const text=document.getElementById("reviewText").value

if(!name||!text){

alert("Fyll i allt")

return

}

const div=document.createElement("div")

div.className="review-item"

div.innerHTML="<b>"+name+"</b><p>"+text+"</p>"

document.getElementById("reviewList").prepend(div)

}