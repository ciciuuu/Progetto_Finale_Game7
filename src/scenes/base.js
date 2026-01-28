let img_player;
let player;
let layer_player;
let muri_livello;

let parallasse1; let parallasse2;
let ts_background_1; let ts_background_2;

let lista_trappole = [];

// caricamento assets zone segrete
let zona_pietra;
let zona_inizio_sinistra;
let zona_dopo_vecchietto;
let zona_fine_lvl1;

// Variabili Trappola Muri (Solo Destra rimasto)
let img_muro_destra;
let muro_destra_obj;
let trappola_attivata = false;

// Trigger Trappola (221 * 32)
const X_ATTIVAZIONE_TRAPPOLA = 221 * 32; 

// [CHECKPOINT] Variabili
let checkpoint_obj;
let checkpoint_preso = false;

let layer_tutorial;
let img_wasd;
let wasd;


// --- COORDINATE CHECKPOINT ---
const X_CHECKPOINT = 51 * 32; 
const Y_CHECKPOINT = 0 * 32;

// Variabile per l'immagine specifica di QUESTO livello
let img_zona_pietra;

function preload(s) {
    zona_pietra = PP.assets.image.load(s, "assets/images/MAPPA/ZS_pietra.png");
    zona_inizio_sinistra = PP.assets.image.load(s, "assets/images/MAPPA/ZS_inizio_sinistra.png");
    zona_dopo_vecchietto = PP.assets.image.load(s, "assets/images/MAPPA/ZS_dopo_vecchietto.png");
    zona_fine_lvl1 = PP.assets.image.load(s, "assets/images/MAPPA/ZS_fine_lvl1.png");


    img_wasd = PP.assets.image.load(s, "assets/images/MAPPA/Tutorial/wasd.png");

    // Caricamento Muro (Solo Destra)
    img_muro_destra = PP.assets.image.load(s, "assets/images/MAPPA/ZS_fine1_destra.png");

    if (typeof preload_zone_segrete === "function") preload_zone_segrete(s);
    if (typeof preload_blueprint === "function") preload_blueprint(s);
    
    // [NUOVO] Preload Checkpoint
    if (typeof preload_checkpoint === "function") preload_checkpoint(s);

    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);
    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2b.png");

    img_zona_pietra = PP.assets.image.load(s, "assets/images/MAPPA/ZS_pietra.png");

    if (window.godot_preload) window.godot_preload(s);
    
    preload_hud(s);
    preload_proiettili(s);
    preload_vecchietto(s);
    preload_enemy(s);
    preload_cactus(s);
    preload_player(s);
}

function create(s) {

    
    layer_tutorial = PP.layers.create(s);
    PP.layers.set_z_index(layer_tutorial, 1);
    
    wasd = PP.assets.image.add(s, img_wasd, -23*32, 0*32 , 0, 1);
    PP.layers.add_to_layer(layer_tutorial, wasd);


   /*  layer_player = PP.layers.create(s);
    PP.layers.set_z_index(layer_player, 5);
    
    PP.layers.add_to_layer(layer_player, player);


    //layer_trappole = PP.layers.create(s); */
    
    // [CHECKPOINT SYSTEM] Gestione Caricamento o Reset
    let final_spawn_x, final_spawn_y;
    
    let checkpoint_attivo = PP.game_state.get_variable("checkpoint_attivo");

    if (checkpoint_attivo) {
        console.log("CARICAMENTO DA CHECKPOINT (Sicuro)...");
        // [FIX] Usiamo le variabili CP dedicate
        final_spawn_x = PP.game_state.get_variable("cp_x");
        final_spawn_y = PP.game_state.get_variable("cp_y");
        
        let hp_salvati = PP.game_state.get_variable("HP_checkpoint");
        PP.game_state.set_variable("HP_player", hp_salvati);
        
        checkpoint_preso = true; 
        
    } else {
        // --- SETUP GLOBALE INIZIALE ---
        PP.game_state.set_variable("HP_player", 10);
        PP.game_state.set_variable("arma_sbloccata", false); 
        PP.game_state.set_variable("tot_blueprint", 0);
        PP.game_state.set_variable("tot_ingranaggi", 0);
        
        // Reset liste persistenza
        PP.game_state.set_variable("nemici_uccisi", []);
        PP.game_state.set_variable("collezionabili_presi", []);
        
        // --- COORDINATE SPAWN INIZIALE AGGIORNATE ---
        final_spawn_x = -20 * 32;
        final_spawn_y = -2 * 32;
        
        checkpoint_preso = false;
    }
    
    trappola_attivata = false;

    if (!s.gruppo_proiettili) {
        s.gruppo_proiettili = s.physics.add.group();
    }

    const PARALLAX_WIDTH = 15800;
    const PARALLAX_HEIGHT = 3000;

    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_1.geometry.scale_x = 0.6; ts_background_1.geometry.scale_y = 0.6;

    ts_background_2 = PP.assets.tilesprite.add(s, parallasse2, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_2.geometry.scale_x = 0.6; ts_background_2.geometry.scale_y = 0.6;

    ts_background_1.tile_geometry.scroll_factor_x = 0;
    ts_background_2.tile_geometry.scroll_factor_x = 0;

    if (window.godot_create && typeof LIV1 !== 'undefined') {
        muri_livello = window.godot_create(s, LIV1);
    } else {
        console.error("LIV1 non trovato.");
        muri_livello = null;
    }

    player = PP.assets.sprite.add(s, img_player, final_spawn_x, final_spawn_y, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);

    configure_player_animations(s, player);
    s.physics.world.TILE_BIAS = 32;

    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    // [NUOVO CHECKPOINT] Creazione Bandierina
    if (typeof crea_bandierina_checkpoint === "function") {
        checkpoint_obj = crea_bandierina_checkpoint(s, X_CHECKPOINT, Y_CHECKPOINT, checkpoint_preso);
    }

    PP.camera.start_follow(s, player, 0, 60);
    create_hud(s);
    create_vecchietto(s);

    // ===============================================
    // --- TRAPPOLA MURI CADENTI ---
    // ===============================================
    
    muro_destra_obj = PP.assets.image.add(s, img_muro_destra, 218 * 32, -27 * 32, 0, 0);
    PP.physics.add(s, muro_destra_obj, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(muro_destra_obj, false);
    PP.physics.set_immovable(muro_destra_obj, true);

    PP.physics.add_collider(s, player, muro_destra_obj);


    // --- CONFIGURAZIONE ZONE SEGRETE (LIV 1) ---

    let zone_liv1 = [
        {
            asset: zona_pietra,
            img_x: 79*32,
            img_y: -12*32,
            trigger_x: 79*32 - 32,
            trigger_y: -12*32 + 32,
            trigger_w: 32 * 8,
            trigger_h: 32 * 4
        },
        {
            asset: zona_inizio_sinistra,
            img_x: 448 - 64,
            img_y: 0,
            trigger_x: 449,
            trigger_y: 0,
            trigger_w: 32 * 15,
            trigger_h: 32 * 11
        },
        {
            asset: zona_dopo_vecchietto,
            img_x: 111 * 32,
            img_y: -2 * 32,
            trigger_x: 112 * 32,
            trigger_y: -2 * 32,
            trigger_w: 32 * 11,
            trigger_h: 32 * 4
        },
        {
            asset: zona_fine_lvl1,
            img_x: 219 * 32,
            img_y: -16 * 32,
            trigger_x: 219 * 32,
            trigger_y: -15 * 32,
            trigger_w: 32 * 5,
            trigger_h: 32 * 32
        }
    ];

    if(typeof create_zone_segrete === "function") create_zone_segrete(s, player, zone_liv1);
    
    // [PERSISTENZA] ID univoci
    let ragni_liv1 = [
        { x: 15*32+18, y: 27*32 , pattuglia: [15*32+18, 13*32+18], id: "ragno_1"},
        { x: 39*32+18, y: 19*32 , pattuglia: [39*32+18, 32*32+18], id: "ragno_2"},
        { x: 107*32+18, y: -1*32 , pattuglia: [107*32+18, 94*32+18], id: "ragno_3"},
        { x: 122*32+18, y: -4*32 , pattuglia: [122*32+18, 111*32+18], id: "ragno_4"},
        { x: 208*32+18, y: -16*32 , pattuglia: [208*32+18, 205*32+18], id: "ragno_5"},
        { x: 214*32+18, y: -17*32 , pattuglia: [214*32+18, 209*32+18], id: "ragno_6"},
    ];   
    create_enemy(s, muri_livello, ragni_liv1, player);

    let cactus_liv1 = [
        { x: 19*32, y: -1*32, id: "cactus_L3_1", raggio: 350},
        { x: 99*32, y: -7*32, id: "cactus_L3_2", raggio: 400},
        { x: 144*32, y: -2*32, id: "cactus_L3_3", raggio: 400},
        { x: 167*32, y: -8*32, id: "cactus_L3_4", raggio: 400},
        { x: 190*32, y: 1*32, id: "cactus_L3_5", raggio: 400},
        { x: 189*32, y: -14*32, id: "cactus_L3_5", raggio: 400},
    ];
    create_cactus(s, muri_livello, cactus_liv1);

    let bp_liv1 = [
        { x: 83*32, y: -8*32, id: "bp_1" },
        { x: 114*32, y: 0*32, id: "bp_2" },
        { x: 189*32, y: 1*32, id: "bp_3" },
    ];
    if (typeof create_blueprint === "function") create_blueprint(s, bp_liv1, player);
    
    let ing_liv1 = [
        { x: 41*32, y: 19*32, id: "ing_1" },
        { x: 156*32, y: -15*32, id: "ing_2" },
        { x: 210*32, y: -17*32, id: "ing_3" },
    ];
    if (typeof create_ingranaggi === "function") create_ingranaggi(s, ing_liv1, player);

    // --- CUORI LIVELLO 1 ---
    let cuori_liv1 = [
        { x: 102*32, y: -7*32, id: "cuore_1" }
    ];
    if (typeof create_cuore === "function") create_cuore(s, cuori_liv1, player);
    
    lista_trappole = [];
    aggiungi_trappola_manuale(s, 0, 32 * 1 + 16, 32 * 2, 32 * 5);
    aggiungi_trappola_manuale(s, 32 * 18, 32 * 31 + 16, 32 * 3, 32 * 8);
    aggiungi_trappola_manuale(s, 32 * 26, 32 * 27 + 16, 32 * 6, 32 * 12);
    aggiungi_trappola_manuale(s, 32 * 108, 32 * 1 + 16, 32 * 2, 160);
    aggiungi_trappola_manuale(s, 32 * 128, 32 * 1 + 16, 32 * 12, 32 * 5);
    aggiungi_trappola_manuale(s, 32 * 150, 32 * 1 + 16, 32 * 32, 32 * 8);
    aggiungi_trappola_manuale(s, 32 * 186, 32 * -10 + 16, 32 * 8, 32 * 2);
    aggiungi_trappola_manuale(s, 32 * 199, 32 * -12 + 16, 32 * 6, 32 * 15);

    for (let i = 0; i < lista_trappole.length; i++) {
        let tr = lista_trappole[i];
        PP.physics.add_overlap_f(s, player, tr, function () {
            morte_player(s, player, null);
        });
    }
}

// CHECKPOINT GLOBALE
function attiva_checkpoint(s) {
    // Questa funzione è mantenuta per compatibilità, ma la logica vera
    // ora è in checkpoint.js
    if (checkpoint_preso) return;
    
    if (typeof controlla_attivazione_checkpoint === "function" && checkpoint_obj) {
        if (controlla_attivazione_checkpoint(s, player, checkpoint_obj, X_CHECKPOINT, checkpoint_preso)) {
            checkpoint_preso = true;
        }
    }
}
window.attiva_checkpoint = attiva_checkpoint;

function update(s) {
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(0.2);
    } else if (PP.interactive.kb.is_key_up(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(2);
    }

    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2;
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.4;
    ts_background_1.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.1;
    ts_background_2.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.2;

    if (!trappola_attivata && player.ph_obj.x >= X_ATTIVAZIONE_TRAPPOLA) {
        trappola_attivata = true;
    }

    if (trappola_attivata) {
        let velocityY = 5*32/0.1;
        let targetY = -23 * 32; 
        if (muro_destra_obj.ph_obj.y < targetY) {
            PP.physics.set_velocity_y(muro_destra_obj, velocityY);
        } else {
            PP.physics.set_velocity_y(muro_destra_obj, 0);
            muro_destra_obj.ph_obj.y = targetY;
        }
    }

    // Cambio Livello
    if (player.geometry.x >= 219 * 32 && player.geometry.y > 0) {
        let vita_al_passaggio = PP.game_state.get_variable("HP_player");
        PP.game_state.set_variable("HP_checkpoint", vita_al_passaggio);

        PP.scenes.start("base_3");
        
        PP.game_state.set_variable("spawn_x", -27 * 32);
        PP.game_state.set_variable("spawn_y", -11 * 32);
    }

    if (player) manage_player_update(s, player, muri_livello);
    if (typeof update_zone_segrete === "function") update_zone_segrete(s);
    update_vecchietto(s, player);
    update_enemy(s);
    update_cactus(s, player, muri_livello);
    update_blueprint(s);
    update_hud(s);

    // [NUOVO CHECKPOINT] Logica Trigger
    // Passiamo checkpoint_preso come parametro e lo aggiorniamo se ritorna true
    if (typeof controlla_attivazione_checkpoint === "function" && checkpoint_obj) {
        if (controlla_attivazione_checkpoint(s, player, checkpoint_obj, X_CHECKPOINT, checkpoint_preso)) {
            checkpoint_preso = true;
        }
    }
}

function destroy(s) { destroy_enemy(s); }

function aggiungi_trappola_manuale(s, x, y, w, h) {
    let centerX = x + (w / 2);
    let centerY = y + (h / 2);
    let zona = PP.shapes.rectangle_add(s, centerX, centerY, w, h, "0xFF0000", 0);
    PP.physics.add(s, zona, PP.physics.type.STATIC);
    lista_trappole.push(zona);
}

function morte_player(s, player, trappola) {
    if (typeof window.morte_player === "function") { window.morte_player(s, player); return; }
    if (player.is_dead) return;
    player.is_dead = true;
    if (player && player.ph_obj.active) {
        player.ph_obj.setTint(0xFF0000);
        player.ph_obj.body.enable = false;
    }
    PP.scenes.start("game_over");
}

PP.scenes.add("base", preload, create, update, destroy);