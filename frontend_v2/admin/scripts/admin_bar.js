const logoUrl =
  "https://res.cloudinary.com/doriurxyu/image/upload/v1768020070/tcbkloltura2efoeg6pp.png";
const logoImg = document.querySelector(".logo img");

logoImg.style.opacity = "0";
logoImg.onload = () => {
  logoImg.style.transition = "opacity 0.5s ease";
  logoImg.style.opacity = "1";
};
logoImg.src = logoUrl;
logoImg.alt = "Getset Gadgets";
