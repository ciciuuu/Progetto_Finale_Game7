let img_sfondo_menu

function preload(s) {
  
  img_sfondo_menu = PP.assets.image.load(s, "assets/images/sfondo_menu.jpg");

}




function create(s) {


    // aggiungo lo sfondo
    img_sfondo_menu = PP.assets.image.add(s, img_sfondo_menu, 0, 0, 0, 0);

    
    
    
    
    // Questa scena di game over contiene solamente
    // il testo centrato.

    PP.shapes.text_styled_add(s, 
                PP.game.config.canvas_width / 2,
                PP.game.config.canvas_height / 2,
                "Main Menu",
                100,
                "Helvetica",
                "normal",
                "0xFFFFFF",
                null,
                0.5,
                0.5);

  PP.shapes.text_styled_add(s, 
                PP.game.config.canvas_width / 2,
                PP.game.config.canvas_height / 5 * 4,
                "Press Spacebar to Begin",
                50,
                "Helvetica",
                "normal",
                "0xFFFFFF",
                null,
                0.5,
                0.5);

  
}

function update(s) {
 
  if(PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
    PP.scenes.start("base");
  }
  
  if(PP.interactive.kb.is_key_down(s, PP.key_codes.C)) {
    PP.scenes.start("credits");
  }

  if(PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
    PP.scenes.start("storia");
  }
}



function destroy(s) {

}

PP.scenes.add("main_menu", preload, create, update, destroy);