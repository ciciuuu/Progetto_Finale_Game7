let img_player;

let player;
let txt_mushrooms;
let muri_livello; // Variabile per ricevere i muri da Godot

let parallasse1;
let parallasse2;
let parallasse3;


let ts_background_1;
let ts_background_2;
let ts_background_3;


function preload(s) {
    console.log("Executing preload() - SCENE");


    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/Personaggio 52x52.png", 52, 52);

    // 1. CARICAMENTO TILESET DI GODOT (CHIAMATA CRITICA)
    if (window.godot_preload) {
        window.godot_preload(s);
    }

    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2.png");
    parallasse3 = PP.assets.image.load(s, "assets/images/parallax/parallasse_3.png");


    // Caricamento asset standard
    // Aggiungi i layer dal più “profondo”





    preload_player(s);
}


// ... (omissis: preload function)

function create(s) {
    console.log("Executing create() - SCENE");


    const PARALLAX_WIDTH = 12800;
    const PARALLAX_HEIGHT = 23000;

    // TS 1: Immagine più vicina
    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 0 , PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.45 );

    // CORREZIONE: Applica la scala al Tilesprite ORA
    ts_background_1.geometry.scale_x = 0.3;
    ts_background_1.geometry.scale_y = 0.3;

    // TS 2: Immagine media
    ts_background_2 = PP.assets.tilesprite.add(s, parallasse2, 0, -100, 0, 0, 0, 0.22 );

    // CORREZIONE: Applica la scala anche al secondo Tilesprite (esempio)
    ts_background_2.geometry.scale_x = 0.3;
    ts_background_2.geometry.scale_y = 0.3;

    // TS 3: Immagine più lontana (Non ha bisogno di scala in questo esempio)
    ts_background_3 = PP.assets.tilesprite.add(s, parallasse3, 0, 0, 1280, 800, 0, 0);

    ts_background_1.tile_geometry.scroll_factor_x = 0;
    ts_background_2.tile_geometry.scroll_factor_x = 0;
    ts_background_3.tile_geometry.scroll_factor_x = 0;

    // ... (omissis: resto della funzione create)

    //ZOOM IN PHASER
    s.cameras.main.setZoom(2);
    // 2. COSTRUIONE MAPPA
    // Eseguiamo la creazione e salviamo il gruppo di muri restituito
    if (window.godot_create) {
        muri_livello = window.godot_create(s);
    }

    // 3. RECUPERO SPAWN POINT E CREAZIONE PLAYER
    let startX = PP.game_state.get_variable("spawn_x") || 150;
    let startY = PP.game_state.get_variable("spawn_y") || 620;

    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);

    s.physics.world.TILE_BIAS = 32;
    // 4. COLLISIONI: Player contro i Muri di Godot
    if (muri_livello) {
        // [PHASER NATIVO] Colleghiamo il player nativo (.ph_obj) al gruppo di muri
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    configure_player_animations(s, player);

    // 5. CAMERA
    PP.camera.start_follow(s, player, 0, 75);

    txt_mushrooms = PP.shapes.text_add(s, 50, 50, "Mushrooms: " + (PP.game_state.get_variable("mushrooms") || 0));
    txt_mushrooms.ph_obj.setScrollFactor(0);

}


function update(s) {

    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.3;
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2;
    ts_background_3.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.1;

    ts_background_1.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.15;
    ts_background_2.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.5;
    ts_background_3.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.01;

    if (player) manage_player_update(s, player);

    let mushrooms = PP.game_state.get_variable("mushrooms") || 0;
    PP.shapes.text_change(txt_mushrooms, "Mushrooms: " + mushrooms);

}

function destroy(s) { }

PP.scenes.add("base", preload, create, update, destroy);