let sfondi_storia
let tavola1 
let testo1 
let tavola2 
let testo2 
let testo3
let tavola_attiva
let tavolalunga

function preload(s) {
  // Carico i 6 sfondi
  tavola1 = PP.assets.image.load(s, "assets/images/tavola1.jpeg");
  testo1 = PP.assets.image.load(s, "assets/images/testo1.pdf");
  tavola2 = PP.assets.image.load(s, "assets/images/tavola2.jpeg");
  testo2 = PP.assets.image.load(s, "assets/images/testo2.pdf");
  testo3 = PP.assets.image.load(s, "assets/images/testo3.pdf");
  tavolalunga = PP.assets.image.load(s, "assets/images/tavole_storia.jpg");
}

function create(s) {
  // Mostro il primo sfondo
  
  let tavola_attiva = PP.assets.image.add(s, tavolalunga, 0, 0, 0, 0);
   
    
}

function update(s) {

  if(PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
    PP.scenes.start("main_menu");
  }

  if(PP.interactive.kb.is_key_down(s, PP.key_codes.RIGHT)) {
    
  }
}



function destroy(s) {

}

PP.scenes.add("storia", preload, create, update, destroy);