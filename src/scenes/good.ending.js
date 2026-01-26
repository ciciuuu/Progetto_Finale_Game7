let img_good_ending_asset;
let good_ending_obj;

function preload(s) {
    // Carica l'immagine per il finale buono
    img_good_ending_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Good ending.jpeg");
}

function create(s) {
    // Sfondo a tutto schermo (0,0 con origin 0,0)
    good_ending_obj = PP.assets.image.add(s, img_good_ending_asset, 0, 0, 0, 0);
    
    // Adatta l'immagine allo schermo se necessario (opzionale)
    // good_ending_obj.geometry.scale_x = ... 

    // Testo informativo (opzionale)
    PP.shapes.text_styled_add(s, 
        PP.game.config.canvas_width / 2, 
        PP.game.config.canvas_height - 50, 
        "Premi SPAZIO per tornare al menu", 
        30, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5
    );
}

function update(s) {
    // Torna al menu principale premendo Spazio
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
        PP.scenes.start("main_menu");
    }
}

function destroy(s) {
}

PP.scenes.add("good_ending", preload, create, update, destroy);