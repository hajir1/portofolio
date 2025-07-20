import AOS from "aos";
import "flowbite";
import "aos/dist/aos.css";
import Typed from "typed.js";
import Alpine from "alpinejs";

window.Alpine = Alpine;
Alpine.start();

document.addEventListener("DOMContentLoaded", function () {
  var typed = new Typed("#typed", {
    strings: ["junior frontend Developer", "junior backend Developer"], // Teks yang akan ditampilkan
    typeSpeed: 100, // Kecepatan pengetikan (dalam milliseconds)
    backSpeed: 50, // Kecepatan penghapusan teks (dalam milliseconds)
    loop: true, // Apakah teks akan diulang secara terus-menerus
    cursorChar: "",
  });
});
AOS.init({
  disable: false,
  startEvent: "DOMContentLoaded", // name of the event dispatched on the document, that AOS should initialize on
  initClassName: "aos-init", // class applied after initialization
  animatedClassName: "aos-animate", // class applied on animation
  disableMutationObserver: false, // disables automatic mutations' detections (advanced)
  offset: "120",
});
const hamburger = document.getElementById("hamburger"),
  nama = document.getElementById("nama"),
  pesan = document.getElementById("pesan"),
  wa = document.getElementById("wa"),
  scrollbar = document.getElementById("scrollbar");

setInterval(() => {
  const date = new Date();
  const getYears = date.getFullYear();
  const getMonth = date.toLocaleDateString("id-ID", { month: "long" });
  const getDate = date.getDate();
  const getDay = date.toLocaleDateString("id-ID", { weekday: "long" });

  const timeZone = ` ${getDay},${getDate}-${getMonth}-${getYears}  `;

  document.getElementById(
    "footer_timer"
  ).innerHTML = `@${timeZone} all right all rights reserved`;
}, 1000);
// window.addEventListener("scroll", () => {
//   const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
//   const scroll = (scrollTop / (scrollHeight - clientHeight)) * 100;
//   scrollbar.style.width = `${scroll}%`;
// });
wa.addEventListener("click", (e) => {
  e.preventDefault();
  let urlToWhatsApp = `https://wa.me/6285606522246?text=hallo saya ${nama.value} \t ${pesan.value}`;
  document.getElementById("pesan").value === ""
    ? alert("Pesan Wajib Diisi")
    : window.open(urlToWhatsApp, "_blank");
});
// window.onload = function () {
//   setTimeout(function () {
//     document.getElementById("wafePath").classList.add("waveMotion");
//   }, 5000);
// };
