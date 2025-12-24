let img_player;
let player;
let muri_livello; 

// Variabili Sfondo (puoi cambiarle per il livello 2)
let parallasse1;
let ts_background_1;

function preload(s) {
    // Caricamento Player (se non è già in cache)
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);
    
    // Caricamento Tileset e pre-caricamenti generali
    if (window.godot_preload) {
        window.godot_preload(s);
    }
    preload_player(s);
    
    // Eventuale sfondo diverso per livello 2
    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png"); 
}

function create(s) {
    // 1. Sfondo
    const PARALLAX_WIDTH = 15800;
    const PARALLAX_HEIGHT = 3000;
    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 500, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_1.geometry.scale_x = 0.6;
    ts_background_1.geometry.scale_y = 0.6;
    ts_background_1.tile_geometry.scroll_factor_x = 0;
    
    s.cameras.main.setZoom(2);

    // 2. COSTRUZIONE MAPPA - LIVELLO 2
    // Passiamo esplicitamente LIV2 (che deve trovarsi in livello_2.js)
    if (window.godot_create) {
        if (typeof LIV2 !== 'undefined') {
            muri_livello = window.godot_create(s, LIV2);
        } else {
            console.error("ERRORE: LIV2 non trovato. Hai caricato livello_2.js nell'HTML?");
        }
    }

    // 3. RECUPERO SPAWN POINT (Impostato da godot_create leggendo LIV2)
    // Se non trova lo spawn nel file Godot, usa coordinate di default
    let startX = PP.game_state.get_variable("spawn_x") || 100;
    let startY = PP.game_state.get_variable("spawn_y") || 100;

    // Creazione Player
    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);
    s.physics.world.TILE_BIAS = 32;

    // Collisioni
    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    configure_player_animations(s, player);
    PP.camera.start_follow(s, player, 0, 50);
}

function update(s) {
    // Gestione Parallasse Semplice
    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.3;
    
    // Update Player
    if (player) manage_player_update(s, player);

    // LOGICA CAMBIO LIVELLO -> Verso Livello 3
    // Sostituisci 3000 con la coordinata X di fine livello 2
    if (player.ph_obj.x > 3000) { 
        console.log("Fine Livello 2! Caricamento Livello 3...");
        PP.scenes.start("base_3"); 
    }
}

function destroy(s) {
    // Pulizia
}

// Registriamo la scena con nome "base_2"
PP.scenes.add("base_2", preload, create, update, destroy);