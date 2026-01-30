let img_bad_ending_asset;
let bad_ending_obj;
let home_asset4;
let home_button4;

function preload(s) {
    // Carica l'immagine per il finale cattivo
    img_bad_ending_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/Bad ending.jpg");
    home_asset4 = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/pulsante menu.png");
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
    // Sfondo a tutto schermo
    bad_ending_obj = PP.assets.image.add(s, img_bad_ending_asset, 0, 0, 0, 0);

    // Testo informativo
    PP.shapes.text_styled_add(s, 
        PP.game.config.canvas_width / 2, 
        PP.game.config.canvas_height - 50, 
        "Premi SPAZIO per tornare al menu", 
        30, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5
    );

    // HOME BUTTON
    home_button4 = PP.assets.image.add(s, home_asset4, -70, 570, 0, 0);
    setup_bottone(home_button4, 1, 1.01);

    PP.interactive.mouse.add(home_button4, "pointerup", function (s) {
        PP.scenes.start("main_menu");
    });
}

function update(s) {
    // Torna al menu principale premendo Spazio
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
        // Puliamo le variabili anche qui per sicurezza
        PP.game_state.set_variable("checkpoint_attivo", false);
        PP.game_state.set_variable("ultimo_livello", null);

        PP.scenes.start("main_menu");
    }
}

function destroy(s) {
}

PP.scenes.add("bad_ending", preload, create, update, destroy);