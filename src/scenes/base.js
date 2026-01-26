// quasi ok

let img_player;
let player;
let muri_livello; 

let parallasse1; let parallasse2;
let ts_background_1; let ts_background_2;

// Usiamo una lista semplice per gestire le trappole create con PoliPhaser
let lista_trappole = [];

function preload(s) {
    // Caricamento moduli esterni
    preload_hud(s);
    preload_proiettili(s);
    preload_vecchietto(s);
    preload_enemy(s);
    preload_cactus(s);
    preload_player(s);
    
    if(typeof preload_blueprint === "function") preload_blueprint(s);

    // Caricamento Assets Base (PoliPhaser)
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);
    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2b.png");

    // Preload Nativo Godot (Non toccare)
    if (window.godot_preload) window.godot_preload(s);
}

function create(s) {
    // Inizializzazione variabili di gioco
    PP.game_state.set_variable("HP_player", 10);
    PP.game_state.set_variable("arma_sbloccata", false);

    // [NATIVO NECESSARIO] Gruppo Proiettili
    // PoliPhaser non ha un metodo documentato per creare Gruppi Fisici vuoti per il pooling
    if (!s.gruppo_proiettili) {
        s.gruppo_proiettili = s.physics.add.group();
    }

    const PARALLAX_WIDTH = 15800;
    const PARALLAX_HEIGHT = 3000;

    // Sfondi (PoliPhaser)
    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_1.geometry.scale_x = 0.6; ts_background_1.geometry.scale_y = 0.6;
    
    ts_background_2 = PP.assets.tilesprite.add(s, parallasse2, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_2.geometry.scale_x = 0.6; ts_background_2.geometry.scale_y = 0.6;

    // [POLIPHASER] Scroll Factor tramite namespace tile_geometry
    ts_background_1.tile_geometry.scroll_factor_x = 0;
    ts_background_2.tile_geometry.scroll_factor_x = 0;

    // [NATIVO NECESSARIO] Generazione Mappa da Godot
    // Restituisce un StaticGroup nativo di Phaser
    if (window.godot_create && typeof LIV1 !== 'undefined') {
        muri_livello = window.godot_create(s, LIV1); 
    } else {
        console.error("LIV1 non trovato.");
        muri_livello = null;
    }

    let startX = PP.game_state.get_variable("spawn_x") || 150;
    let startY = PP.game_state.get_variable("spawn_y") || 620;

    // Player (PoliPhaser)
    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);
    
    configure_player_animations(s, player);
    
    // [NATIVO NECESSARIO] Configurazione Mondo
    // PoliPhaser non ha un wrapper per TILE_BIAS
    s.physics.world.TILE_BIAS = 32;

    // [NATIVO NECESSARIO] Collisione Player-Mappa
    // 'muri_livello' è un gruppo nativo Phaser, quindi PP.physics.add_collider non funzionerebbe
    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello);
    }
    
    // Camera (PoliPhaser)
    PP.camera.start_follow(s, player, 0, 75);
    
    // Creazione Elementi di Gioco
    create_hud(s);
    create_vecchietto(s);

    // Nemici
    let ragni_liv1 = [
        { x: -8, y: 0, pattuglia: [-234, -15] },
        { x: 182, y: -64, pattuglia: [70, 180] },
        { x: -30, y: 0, pattuglia: [-200, -50] },
        { x: 3142, y: 0, pattuglia: [3000, 3447] },
    ];
    create_enemy(s, muri_livello, ragni_liv1, player);

    // Cactus
    let cactus_liv1 = [
        { x: 100, y: 400 },
        { x: 1200, y: 350 }
    ];
    create_cactus(s, muri_livello, cactus_liv1);

    // Blueprint e Ingranaggi
    let bp_liv1 = [{ x: 100, y: -100 }, { x: 3684, y: 29 }];
    if(typeof create_blueprint === "function") create_blueprint(s, bp_liv1, player);

    let ing_liv1 = [{ x: 200, y: -100 }, { x: 1820, y: -165 }];
    if(typeof create_ingranaggi === "function") create_ingranaggi(s, ing_liv1, player);

    // --- TRAPPOLE (SISTEMA POLIPHASER) ---
    lista_trappole = []; 
    
    aggiungi_trappola_manuale(s, 6 - 5, 0 + 16, 32 * 2, 32 * 5);
    aggiungi_trappola_manuale(s, 582 - 5, 960 + 16, 32 * 3, 32 * 8);
    aggiungi_trappola_manuale(s, 838 - 5, 832 + 16, 32 * 6, 32 * 12);
    aggiungi_trappola_manuale(s, 3462 - 5, 0 + 16, 70, 160);
    aggiungi_trappola_manuale(s, 4102 - 5, 0 + 16, 32 * 12, 32 * 5);
    aggiungi_trappola_manuale(s, 4806 - 5, 0 + 16, 32 * 32, 32 * 8);
    aggiungi_trappola_manuale(s, 6374 - 5, -352 + 16, 32 * 6, 32 * 15);

    // Loop collisioni (PoliPhaser)
    for (let i = 0; i < lista_trappole.length; i++) {
        let tr = lista_trappole[i];
        PP.physics.add_overlap_f(s, player, tr, function () {
            morte_player(s, player, null);
        });
    }
}

function update(s) {
    // [NATIVO NECESSARIO] Zoom Camera (PoliPhaser non ha setZoom)
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(0.2);
    } else if (PP.interactive.kb.is_key_up(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(2);
    }

    // Parallasse (PoliPhaser)
    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2;
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.4;
    ts_background_1.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.1;
    ts_background_2.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.2;

    // Cambio Livello
    if (player.ph_obj.x > 6800) {
        let vita_al_passaggio = PP.game_state.get_variable("HP_player");
        PP.game_state.set_variable("HP_checkpoint", vita_al_passaggio);
        
        // Assicura sblocco arma
        PP.game_state.set_variable("arma_sbloccata", true); 
        
        PP.scenes.start("base_3");
        
        // Reset spawn per nuovo livello
        PP.game_state.set_variable("spawn_x", 100); 
        PP.game_state.set_variable("spawn_y", 100); 
    }

    if (player) manage_player_update(s, player, muri_livello);

    update_vecchietto(s, player);
    update_enemy(s);
    update_cactus(s, player, muri_livello);
    update_blueprint(s); 
    update_hud(s);
}

function destroy(s) { destroy_enemy(s); }

// Helper PoliPhaser per trappole
function aggiungi_trappola_manuale(s, x, y, w, h) {
    let centerX = x + (w / 2);
    let centerY = y + (h / 2);
    // Creazione Shape con PoliPhaser
    let zona = PP.shapes.rectangle_add(s, centerX, centerY, w, h, "0xFF0000", 0);
    PP.physics.add(s, zona, PP.physics.type.STATIC);
    lista_trappole.push(zona);
}

function morte_player(s, player, trappola) {
    if(typeof window.morte_player === "function") { window.morte_player(s, player); return; }
    
    if (player.is_dead) return; 
    player.is_dead = true;
    
    // [NATIVO NECESSARIO] Tint e Body disable
    if (player && player.ph_obj.active) {
        player.ph_obj.setTint(0xFF0000); 
        player.ph_obj.body.enable = false; 
    }
    PP.scenes.start("game_over");
}

PP.scenes.add("base", preload, create, update, destroy);