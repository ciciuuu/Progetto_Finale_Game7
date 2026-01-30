let img_sfondo_credits;
let home_asset2;
let home_button2;

function preload(s) {

  img_sfondo_credits = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/credits.jpg");
  home_asset2 = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/pulsante menu.png");

}

function setup_bottone(oggetto, scala_base, scala_zoom) {
  oggetto.geometry.scale_x = scala_base;
  oggetto.geometry.scale_y = scala_base;

  oggetto.tile_geometry.scroll_factor_x = 0;
  oggetto.tile_geometry.scroll_factor_y = 0;

  PP.interactive.mouse.add(oggetto, "pointerover", function (s) {
    s.input.manager.canvas.style.cursor = 'pointer';
    oggetto.geometry.scale_x = scala_zoom;
    oggetto.geometry.scale_y = scala_zoom;
    oggetto.ph_obj.setTint(0xAAAAAA);
  });

  PP.interactive.mouse.add(oggetto, "pointerout", function (s) {
    s.input.manager.canvas.style.cursor = 'default';
    oggetto.geometry.scale_x = scala_base;
    oggetto.geometry.scale_y = scala_base;
    oggetto.ph_obj.clearTint();
  });

  PP.interactive.mouse.add(oggetto, "pointerdown", function (s) {
    oggetto.geometry.scale_x = scala_base;
    oggetto.geometry.scale_y = scala_base;
  });

  PP.interactive.mouse.add(oggetto, "pointerup", function (s) {
    oggetto.geometry.scale_x = scala_zoom;
    oggetto.geometry.scale_y = scala_zoom;
  });
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

  // HOME BUTTON
  home_button2 = PP.assets.image.add(s, home_asset2, -70, 570, 0, 0);
  setup_bottone(home_button2, 1, 1.01);


  PP.interactive.mouse.add(home_button2, "pointerup", function (s) {
    PP.scenes.start("main_menu");
  });


}

function update(s) {

  if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
    PP.scenes.start("base");
  }

  if (PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
    PP.scenes.start("main_menu");
  }
}



function destroy(s) {

}

PP.scenes.add("credits", preload, create, update, destroy);