let rightpressed = false
let tavola_attiva
let tavolalunga

function preload(s) {
  // Carico i 6 sfondi
  
  tavolalunga = PP.assets.image.load(s, "assets/images/tavole_storia.jpg");
}

function create(s) {
  // Mostro il primo sfondo
  
  tavola_attiva = PP.assets.image.add(s, tavolalunga, 0, 0, 0, 0);
   
    
}

function update(s) {

  if(PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
    PP.scenes.start("main_menu");
  }

  if(PP.interactive.kb.is_key_down(s, PP.key_codes.RIGHT) && rightpressed == false && tavola_attiva.geometry.x > -5120) {
    
    tavola_attiva.geometry.x -= 1280;
    rightpressed = true;

  }

  if(PP.interactive.kb.is_key_up(s, PP.key_codes.RIGHT) && rightpressed == true) {
    rightpressed = false;
  }
}



function destroy(s) {

}

PP.scenes.add("storia", preload, create, update, destroy);