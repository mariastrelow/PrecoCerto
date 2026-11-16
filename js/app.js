document.getElementById("copiar").addEventListener("click", () => {
  const texto = document.querySelector(".resultado").innerText;
  navigator.clipboard.writeText(texto);
});
