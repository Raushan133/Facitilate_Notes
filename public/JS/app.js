let cards = document.querySelectorAll(".Hero-section");
cards.forEach((card) => {
  card.onmousemove = function (e) {
    let x = e.pageX - card.offsetLeft;
    let y = e.pageY - card.offsetTop;

    card.style.setProperty("--x", x + "px");
    card.style.setProperty("--y", y + "px");
  };
});
// =============================================
var con = document.querySelector(".containershow");
var love = document.querySelector("img");
var main = document.querySelector(".main");

document.addEventListener("DOMContentLoaded", function () {
  love.style.transform = "translate(-50%,-50%) scale(0)";
  love.style.opacity = 0.8;
  // love.style.filter = "blur(0.2px)";

  setTimeout(function () {
    love.style.transform = "translate(-50%,-50%) scale(8)";
  }, 1000);

  setTimeout(function () {
    love.style.opacity = 0;
  }, 1000);

  setTimeout(() => {
    main.style.transform = "scale(1)";
    main.style.opacity = 1;
  }, 1600);
});

// ============================================================================

window.onload = function () {
  const slider = document.querySelector("#SearchNotes");
  let scrollPosition = 0;
  const stepSize = 319;
  const pauseTime = 2000;
  let intervalId = null;

  function scrollOneStep() {
    if (scrollPosition < slider.scrollWidth - slider.clientWidth) {
      scrollPosition += stepSize;
    } else {
      scrollPosition = 0;
    }
    slider.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  }

  function startScrolling() {
    if (!intervalId) {
      intervalId = setInterval(scrollOneStep, pauseTime);
    }
  }
  function stopScrolling() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  startScrolling();

  slider.addEventListener("mouseenter", stopScrolling);
  slider.addEventListener("mouseleave", startScrolling);
};
