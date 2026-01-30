let img_good_ending_asset;
let good_ending_obj;
let home_asset3;
let home_button3;

function preload(s) {
    img_good_ending_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/Good ending.jpg");
    home_asset3 = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/pulsante menu.png");
}

function setup_bottone(oggetto, scala_base, scala_zoom) {
    oggetto.geometry.scale_x = scala_base;
    oggetto.geometry.scale_y = scala_base;

    oggetto.tile_geometry.scroll_factor_x = 0;
    oggetto.tile_geometry.scroll_factor_y = 0;

    // Quando il mouse entra nel bottone
    PP.interactive.mouse.add(oggetto, "pointerover", function (s) {
        // [PHASER] Cambio il cursore del browser in "manina" per far capire che è cliccabile
        s.input.manager.canvas.style.cursor = 'pointer';
        
        oggetto.geometry.scale_x = scala_zoom;
        oggetto.geometry.scale_y = scala_zoom;
        
        // [PHASER] Applico una tinta grigia per evidenziare
        oggetto.ph_obj.setTint(0xAAAAAA);
    });

    // Quando il mouse esce dal bottone
    PP.interactive.mouse.add(oggetto, "pointerout", function (s) {
        // [PHASER] Torno al cursore freccia standard
        s.input.manager.canvas.style.cursor = 'default';
        
        oggetto.geometry.scale_x = scala_base;
        oggetto.geometry.scale_y = scala_base;
        
        // [PHASER] Tolgo la tinta grigia
        oggetto.ph_obj.clearTint();
    });

    // Effetto click premuto
    PP.interactive.mouse.add(oggetto, "pointerdown", function (s) {
        oggetto.geometry.scale_x = scala_base;
        oggetto.geometry.scale_y = scala_base;
    });

    // Effetto click rilasciato
    PP.interactive.mouse.add(oggetto, "pointerup", function (s) {
        oggetto.geometry.scale_x = scala_zoom;
        oggetto.geometry.scale_y = scala_zoom;
    });
}

function create(s) {
    good_ending_obj = PP.assets.image.add(s, img_good_ending_asset, 0, 0, 0, 0);

    home_button3 = PP.assets.image.add(s, home_asset3, 100, 625, 0.5, 0.5);
    
    setup_bottone(home_button3, 1, 1.01);

    // Al click torno al menu principale
    PP.interactive.mouse.add(home_button3, "pointerup", function (s) {
        PP.scenes.start("main_menu");
    });
}

function update(s) {
    
}

function destroy(s) {
}

PP.scenes.add("good_ending", preload, create, update, destroy);