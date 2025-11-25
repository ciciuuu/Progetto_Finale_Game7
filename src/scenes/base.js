let img_background;
let img_player;

let player;
let floor;
let txt_score;

function preload(s) {
    console.log("Executing preload() - SCENE");

    // Carichiamo gli asset grafici
    img_background = PP.assets.image.load(s, "assets/images/background.png");

    // Uso 8 variabili, ma un array sarebbe stato meglio (esercizio per casa: come fare?)
    img_background_1 = PP.assets.image.load(s, "assets/images/parallax/layer_01.png");
    img_background_2 = PP.assets.image.load(s, "assets/images/parallax/layer_02.png");
    img_background_3 = PP.assets.image.load(s, "assets/images/parallax/layer_03.png");
    img_background_4 = PP.assets.image.load(s, "assets/images/parallax/layer_04.png");
    img_background_5 = PP.assets.image.load(s, "assets/images/parallax/layer_05.png");
    img_background_6 = PP.assets.image.load(s, "assets/images/parallax/layer_06.png");
    img_background_7 = PP.assets.image.load(s, "assets/images/parallax/layer_07.png");
    img_background_8 = PP.assets.image.load(s, "assets/images/parallax/layer_08.png");

    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/spritesheet_player.png", 223, 190);

    // Preload dei vari elementi della scena
    preload_platforms(s);
    preload_mushrooms(s);
    preload_player(s);
    preload_enemy(s);
}

function collider_test(s, a, b) {
    console.log("Player colliding with the box!");
}

function create(s) {
    console.log("Executing create() - SCENE");

    // Inseriamo background e giocatore
    PP.assets.tilesprite.add(s, img_background, 0, 0, 10000, 800, 0, 0);

    player = PP.assets.sprite.add(s, img_player, 150, 620, 0.5, 1);
    // Aggiungiamo il giocatore alla fisica come entità dinamica
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);


    // Creiamo un pavimento "trasparente"
    floor = PP.shapes.rectangle_add(s, 640, 620, 10000, 1, "0x000000", 0);
    // Aggiungiamo il pavimento alla fisica come entità statica
    PP.physics.add(s, floor, PP.physics.type.STATIC);

    // Creiamo un collider tra pavimento e giocatore
    PP.physics.add_collider(s, player, floor);

    configure_player_animations(s, player); // Impostazione animazioni giocatore
    create_platforms(s, player);            // Creazione piattaforme
    create_mushrooms(s, player);            // Creazione funghetti
    create_enemy(s, floor);

    // Impostiamo la camera che segua il giocatore
    PP.camera.start_follow(s, player, 0, 220);

    console.log(PP.game_state.get_variable("coins"))

     // Qui le istruzioni su cosa creare e dove nel mondo di gioco
    console.log("Executing create() - SCENE 10");

    // Visualizzo i layer "statici" del background
    ts_background_8 = PP.assets.tilesprite.add(s, img_background_8, 0, 0, 1280, 800, 0, 0);
    ts_background_7 = PP.assets.tilesprite.add(s, img_background_7, 0, 0, 1280, 800, 0, 0);
    
    // Ora i layer che si sposteranno con il giocatore
    ts_background_6 = PP.assets.tilesprite.add(s, img_background_6, 0, 0, 1280, 800, 0, 0);
    ts_background_5 = PP.assets.tilesprite.add(s, img_background_5, 0, 0, 1280, 800, 0, 0);
    ts_background_4 = PP.assets.tilesprite.add(s, img_background_4, 0, 0, 1280, 800, 0, 0);
    ts_background_3 = PP.assets.tilesprite.add(s, img_background_3, 0, 0, 1280, 800, 0, 0);
    ts_background_2 = PP.assets.tilesprite.add(s, img_background_2, 0, 0, 1280, 800, 0, 0);
    ts_background_1 = PP.assets.tilesprite.add(s, img_background_1, 0, 0, 1280, 800, 0, 0);

    // Disabilitiamo il tilesprite scroll factor per tutti i background (lo gestiremo manualmente)
    ts_background_8.tile_geometry.scroll_factor_x = 0;
    ts_background_7.tile_geometry.scroll_factor_x = 0;
    ts_background_6.tile_geometry.scroll_factor_x = 0;
    ts_background_5.tile_geometry.scroll_factor_x = 0;
    ts_background_4.tile_geometry.scroll_factor_x = 0;
    ts_background_3.tile_geometry.scroll_factor_x = 0;
    ts_background_2.tile_geometry.scroll_factor_x = 0;
    ts_background_1.tile_geometry.scroll_factor_x = 0;

}

function update(s) {
    // Azioni che vengono eseguite a ogni frame del gioco


    ts_background_6.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.05; //imporstiamo  lo sfondo in foreground in modo che possa muoversi
    ts_background_5.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.1; //imporstiamo  lo sfondo in foreground in modo che possa muoversi
    ts_background_4.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2; //imporstiamo  lo sfondo in foreground in modo che possa muoversi
    ts_background_3.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.3; //imporstiamo  lo sfondo in foreground in modo che possa muoversi
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.4; //imporstiamo  lo sfondo in foreground in modo che possa muoversi
    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.5; //imporstiamo  lo sfondo in foreground in modo che possa muoversi



    ts_clouds.tile_geometry.x += 1;
    manage_player_update(s, player);    // Posizione del giocatore e animazioni
    update_platforms(s);                // Movimento piattaforme
    update_mushrooms(s);                // Azioni funghetti
    update_enemy(s);

}

function destroy(s) {
    console.log("Executing destroy() - SCENE");

}

PP.scenes.add("base", preload, create, update, destroy);