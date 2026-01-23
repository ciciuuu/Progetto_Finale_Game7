let img_player;
let player;
let muri_livello;

// Variabili Sfondo
let parallasse1;
let ts_background_1;

function preload(s) {
    
    // 1. CARICAMENTO MODULI ESTERNI
    preload_hud(s);
    preload_proiettili(s);
    preload_cactus(s);
    preload_enemy(s); 

    // 2. CARICAMENTO PLAYER LOCALE
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);

    // Caricamento Tileset
    if (window.godot_preload) {
        window.godot_preload(s);
    }

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
    if (window.godot_create) {
        if (typeof LIV2 !== 'undefined') {
            muri_livello = window.godot_create(s, LIV2);
        } else {
            console.error("ERRORE: LIV2 non trovato. Hai caricato livello_2.js nell'HTML?");
        }
    }

    // 3. RECUPERO SPAWN POINT
    let startX = PP.game_state.get_variable("spawn_x") || 100;
    let startY = PP.game_state.get_variable("spawn_y") || 100;

    // 4. CREAZIONE PLAYER
    // Ora img_player esiste sicuramente perché l'abbiamo dichiarata e caricata sopra
    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);
    s.physics.world.TILE_BIAS = 32;

    // Collisioni
    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    // Configurazione Animazioni
    configure_player_animations(s, player);
    
    // Camera e HUD
    PP.camera.start_follow(s, player, 0, 50);
    create_hud(s);



    let ragni_liv2 = [
        { x: 2052, y: -87, pattuglia: [2000, 2100] },
        { x: 3742, y: -141, pattuglia: [3700, 3800] }
    ];
    create_enemy(s, muri_livello, ragni_liv2);


    // --- CONFIGURAZIONE CACTUS LIVELLO 2 ---
    let cactus_liv2 = [
        { x: 2500, y: 100 },
        { x: 3000, y: 200 },
        { x: 3200, y: 200 }
    ];
    create_cactus(s, muri_livello, cactus_liv2);

}

function update(s) {
    // Gestione Parallasse Semplice
    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.3;

    // Update Player
    // Passiamo muri_livello per far funzionare i proiettili
    if (player) manage_player_update(s, player, muri_livello);

    // LOGICA CAMBIO LIVELLO -> Verso Livello 3
    if (player.ph_obj.x > 176 * 32) {
        console.log("Fine Livello 2! Caricamento Livello 3...");
        PP.scenes.start("base_3");
    }
    
    // --- AGGIORNAMENTO NEMICI ---
    // [CITE: Logic logic missing in original base_2.js]
    update_hud(s);
    update_enemy(s); // Muove i ragni
    update_cactus(s, player, muri_livello); // Gestisce sparo cactus
}

function destroy(s) {
    // Pulizia
}

// Registriamo la scena con nome "base_2"
PP.scenes.add("base_2", preload, create, update, destroy);