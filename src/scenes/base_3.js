let img_player;
let player;
let muri_livello; 

// Variabili Sfondo
let parallasse1;
let ts_background_1;

function preload(s) {
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);
    if (window.godot_preload) window.godot_preload(s);
    preload_player(s);
    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png"); 
}

function create(s) {
    const PARALLAX_WIDTH = 15800;
    const PARALLAX_HEIGHT = 3000;
    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 500, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_1.geometry.scale_x = 0.6;
    ts_background_1.geometry.scale_y = 0.6;
    ts_background_1.tile_geometry.scroll_factor_x = 0;
    s.cameras.main.setZoom(2);

    // 2. COSTRUZIONE MAPPA - LIVELLO 3
    // Passiamo esplicitamente LIV3 (che deve trovarsi in livello_3.js)
    if (window.godot_create) {
        if (typeof LIV3 !== 'undefined') {
            muri_livello = window.godot_create(s, LIV3);
        } else {
            console.error("ERRORE: LIV3 non trovato.");
        }
    }

    let startX = PP.game_state.get_variable("spawn_x") || 100;
    let startY = PP.game_state.get_variable("spawn_y") || 100;

    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);
    s.physics.world.TILE_BIAS = 32;

    if (muri_livello) s.physics.add.collider(player.ph_obj, muri_livello);

    configure_player_animations(s, player);
    PP.camera.start_follow(s, player, 0, 50);
}

function update(s) {
    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.3;
    if (player) manage_player_update(s, player);

    // FINE GIOCO
    if (player.ph_obj.x > 3000) { 
        console.log("HAI VINTO IL GIOCO!");
        // Qui potresti mandare a una scena "credits" o "menu"
        // PP.scenes.start("menu"); 
    }
}

function destroy(s) {}

PP.scenes.add("base_3", preload, create, update, destroy);