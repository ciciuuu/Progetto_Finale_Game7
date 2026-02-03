let img_bad_ending_asset;
let bad_ending_obj;
let home_asset4;
let home_button4;

function preload(s) {
  img_bad_ending_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/Bad_ending.jpg");
  home_asset4 = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi_tavole/pulsante_menu.png");
}

function setup_bottone(oggetto, scala_base, scala_zoom) {
  oggetto.geometry.scale_x = scala_base;
  oggetto.geometry.scale_y = scala_base;

  oggetto.tile_geometry.scroll_factor_x = 0;
  oggetto.tile_geometry.scroll_factor_y = 0;

  // Evento mouse sopra
  PP.interactive.mouse.add(oggetto, "pointerover", function (s) {
    // [PHASER] Cambio il cursore del mouse in "manina"
    s.input.manager.canvas.style.cursor = 'pointer';

    // Ingrandisco il bottone
    oggetto.geometry.scale_x = scala_zoom;
    oggetto.geometry.scale_y = scala_zoom;

    // [PHASER] Applico una tinta grigia per evidenziare la selezione
    oggetto.ph_obj.setTint(0xAAAAAA);
  });

  // Evento mouse esce
  PP.interactive.mouse.add(oggetto, "pointerout", function (s) {
    // [PHASER] Ripristino cursore normale
    s.input.manager.canvas.style.cursor = 'default';

    // Ripristino scala originale
    oggetto.geometry.scale_x = scala_base;
    oggetto.geometry.scale_y = scala_base;

    // [PHASER] Rimuovo la tinta
    oggetto.ph_obj.clearTint();
  });

  // Evento click premuto (effetto pressione)
  PP.interactive.mouse.add(oggetto, "pointerdown", function (s) {
    oggetto.geometry.scale_x = scala_base;
    oggetto.geometry.scale_y = scala_base;
  });

  // Evento click rilasciato
  PP.interactive.mouse.add(oggetto, "pointerup", function (s) {
    oggetto.geometry.scale_x = scala_zoom;
    oggetto.geometry.scale_y = scala_zoom;
  });
}

function create(s) {
  bad_ending_obj = PP.assets.image.add(s, img_bad_ending_asset, 0, 0, 0, 0);

  home_button4 = PP.assets.image.add(s, home_asset4, 100, 650, 0.5, 0.5);

  setup_bottone(home_button4, 1, 1.1);

  // Al click torno al menu principale
  PP.interactive.mouse.add(home_button4, "pointerup", function (s) {
    PP.scenes.start("main_menu");
  });
}

function update(s) {

}

function destroy(s) {
}

PP.scenes.add("bad_ending", preload, create, update, destroy);