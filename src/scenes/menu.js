// ok
let asset_sfondo_menu;
let sfondo_menu_obj;

function preload(s) {
    asset_sfondo_menu = PP.assets.image.load(s, "assets/images/sfondo_menu.jpg");
}

function create(s) {
    // Aggiungo lo sfondo (usa variabili diverse per asset e oggetto)
    sfondo_menu_obj = PP.assets.image.add(s, asset_sfondo_menu, 0, 0, 0, 0);

    // Titolo
    PP.shapes.text_styled_add(s, 
                PP.game.config.canvas_width / 2,
                PP.game.config.canvas_height / 2,
                "Main Menu",
                100,
                "Helvetica",
                "normal",
                "0xFFFFFF", // Formato colore corretto
                null,
                0.5,
                0.5);

    // Istruzioni
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
    // Gestione Input PoliPhaser
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
        // Resetta lo stato di gioco e l'HUD quando inizi una nuova partita
        PP.game_state.set_variable("HP_player", 10);
        PP.game_state.set_variable("tot_blueprint", 0);
        PP.game_state.set_variable("tot_ingranaggi", 0);
        PP.game_state.set_variable("arma_sbloccata", false);
        
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