window.addEventListener("DOMContentLoaded", () => {
    const loadingBefore = document.getElementById("loading-before");
    const loadingAfter = document.getElementById("loading-after");
    const typeText = "Loading ...";
    
    const typeWriter = (type) => {
      let speed = 50;
      let i = 0;
      
      const typeFn = () => {
        if (i < type.length) {
          loadingBefore.innerHTML += type.charAt(i);
          i++;
          setTimeout(typeFn, speed);
        }
      };
      
      typeFn();
    };
    
    loadingBefore.style.display = "flex";
    loadingAfter.style.display = "none";
    

    loadingBefore.style.fontSize="2rem"
    setTimeout(() => {
      loadingBefore.style.display = "none";
      loadingAfter.style.display = "flex";
    }, 2000);
    
    typeWriter(typeText);
  });
  