let sfondi = [];
let current_bg;
let bg_index = 0;

function preload(s) {
  // Carico i 6 sfondi
  sfondi[0] = PP.assets.image.load(s, "assets/images/tavola1.jpeg");
  sfondi[2] = PP.assets.image.load(s, "assets/images/testo1.pdf");
  sfondi[1] = PP.assets.image.load(s, "assets/images/tavola2.jpeg");
  sfondi[3] = PP.assets.image.load(s, "assets/images/testo2.pdf");
  sfondi[4] = PP.assets.image.load(s, "assets/images/testo3.pdf");
}

function create(s) {
  // Mostro il primo sfondo
  current_bg = PP.assets.image.add(s, sfondi[bg_index], 0, 0, 0, 0);

  PP.shapes.text_styled_add(s, 
    PP.game.config.canvas_width / 2,
    PP.game.config.canvas_height / 2,
    "Crediti: premi M per tornare al menu",
    50,
    "Helvetica",
    "normal",
    "0xFFFFFF",
    null,
    0.5,
    0.5);
}

function update(s) {
  if(PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
    PP.scenes.start("main_menu");
  }

  if(PP.interactive.kb.is_key_down(s, PP.key_codes.RIGHT)) {

    // Incremento l’indice e lo faccio tornare a 0 se supera 5
    bg_index = (bg_index + 1);

    // Mostro il nuovo sfondo
    current_bg = PP.assets.image.add(s, sfondi[bg_index], 0, 0, 0, 0);
  }
}



function destroy(s) {

}

PP.scenes.add("storia", preload, create, update, destroy);