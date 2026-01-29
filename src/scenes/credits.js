let img_sfondo_credits

function preload(s) {
  
  img_sfondo_credits = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/credits.jpg");

}




function create(s) {


    // aggiungo lo sfondo
    img_sfondo_credits = PP.assets.image.add(s, img_sfondo_credits, 0, 0, 0, 0);
    
    
    
    // Questa scena di game over contiene solamente
    // il testo centrato.

   /*  PP.shapes.text_styled_add(s, 
                PP.game.config.canvas_width / 2,
                PP.game.config.canvas_height / 2,
                "credits",
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
                "Press M to Menu",
                50,
                "Helvetica",
                "normal",
                "0xFFFFFF",
                null,
                0.5,
                0.5); */

  
}

function update(s) {
 
  if(PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
    PP.scenes.start("base");
  }

  if(PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
    PP.scenes.start("main_menu");
  }
}



function destroy(s) {

}

PP.scenes.add("credits", preload, create, update, destroy);