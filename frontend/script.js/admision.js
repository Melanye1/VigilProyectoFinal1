document.addEventListener("DOMContentLoaded", () => {

const preguntas=document.querySelectorAll(".pregunta-faq-admision");

preguntas.forEach((pregunta)=>{

pregunta.addEventListener("click",()=>{

const item=pregunta.parentElement;

document.querySelectorAll(".item-faq-admision").forEach((faq)=>{

if(faq!==item){
faq.classList.remove("activo");
faq.querySelector(".pregunta-faq-admision").setAttribute("aria-expanded","false");
}

});

item.classList.toggle("activo");

const abierto=item.classList.contains("activo");

pregunta.setAttribute("aria-expanded",abierto);

});

});

});