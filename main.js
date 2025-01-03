import AOS from "aos";
import "flowbite";
import "aos/dist/aos.css";
import Typed from "typed.js";



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
  useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
  disableMutationObserver: false, // disables automatic mutations' detections (advanced)
  debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
  throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)

  // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
  offset: 120, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 400, // values from 0 to 3000, with step 50ms
  easing: "ease", // default easing for AOS animations
  once: false, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
  anchorPlacement: "top-bottom",
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
  ).innerHTML = `@${timeZone} all right reversed`;
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
    ? alert("message is required")
    : window.open(urlToWhatsApp, "_blank");
});
// window.onload = function () {
//   setTimeout(function () {
//     document.getElementById("wafePath").classList.add("waveMotion");
//   }, 5000);
// };

