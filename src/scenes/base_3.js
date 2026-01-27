let img_player;
let player;
let muri_livello;

let parallasse1; let parallasse2;
let ts_background_1; let ts_background_2;
let lista_trappole = [];

let fine_livello_triggerata = false;

const X_FINE_LIVELLO = 107 * 32;

// [CHECKPOINT] Variabili Livello 3
let checkpoint_obj;
let checkpoint_preso = false;

// --- COORDINATE CHECKPOINT L3 (Trigger) ---
const X_CHECKPOINT_L3_TRIGGER = 66 * 32;
const Y_CHECKPOINT_L3_TRIGGER = -6 * 32;

let zona3_blocco_terra;
let zona3_terra_sotterranea;

function preload(s) {
    zona3_blocco_terra = PP.assets.image.load(s, "assets/images/MAPPA/ZS_blocco_terra.png");
    zona3_terra_sotterranea = PP.assets.image.load(s, "assets/images/MAPPA/ZS_terra_sotterranea.png");

    preload_hud(s);
    preload_proiettili(s);
    preload_enemy(s);
    preload_cactus(s);
    preload_player(s);

    if (typeof preload_zone_segrete === "function") preload_zone_segrete(s);
    if (typeof preload_blueprint === "function") preload_blueprint(s);

    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);
    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2b.png");

    if (window.godot_preload) window.godot_preload(s);
}

function create(s) {

    // [CHECKPOINT SYSTEM] Gestione Spawn Sicuro
    let final_spawn_x, final_spawn_y;

    let checkpoint_attivo = PP.game_state.get_variable("checkpoint_attivo");
    let ultimo_livello = PP.game_state.get_variable("ultimo_livello");

    // Controllo se il checkpoint attivo appartiene a QUESTO livello
    if (checkpoint_attivo && ultimo_livello === "base_3") {
        console.log("CARICAMENTO CHECKPOINT LIV 3 (Sicuro)...");
        // Usiamo le variabili CP sicure
        final_spawn_x = PP.game_state.get_variable("cp_x");
        final_spawn_y = PP.game_state.get_variable("cp_y");

        let hp_salvati = PP.game_state.get_variable("HP_checkpoint");
        PP.game_state.set_variable("HP_player", hp_salvati);
        checkpoint_preso = true;
    }
    else {
        console.log("INIZIO LIVELLO 3 (O RESET)");

        // --- SPAWN INIZIALE LIVELLO 3 ---
        final_spawn_x = -27 * 32;
        final_spawn_y = -11 * 32;

        // Se arriviamo dal livello 1 (teletrasporto), usiamo le coordinate passate
        if (PP.game_state.get_variable("spawn_x") && ultimo_livello !== "base_3") {
            final_spawn_x = PP.game_state.get_variable("spawn_x");
            final_spawn_y = PP.game_state.get_variable("spawn_y");
        }

        let hp_start = PP.game_state.get_variable("HP_checkpoint") || 10;
        PP.game_state.set_variable("HP_player", hp_start);

        PP.game_state.set_variable("ultimo_livello", "base_3");
        checkpoint_preso = false;
    }

    fine_livello_triggerata = false;

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

    if (window.godot_create && typeof LIV3 !== 'undefined') {
        muri_livello = window.godot_create(s, LIV3);
    } else {
        console.error("ERRORE: LIV3 non trovato.");
        muri_livello = null;
    }

    // Spawn Player
    player = PP.assets.sprite.add(s, img_player, final_spawn_x, final_spawn_y, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);

    configure_player_animations(s, player);
    s.physics.world.TILE_BIAS = 32;

    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    // [CHECKPOINT] Creazione Trigger
    if (!checkpoint_preso) {
        checkpoint_obj = PP.shapes.rectangle_add(s, X_CHECKPOINT_L3_TRIGGER, Y_CHECKPOINT_L3_TRIGGER, 100, 500, "0x00FF00", 0);
        PP.physics.add(s, checkpoint_obj, PP.physics.type.STATIC);

        PP.physics.add_overlap_f(s, player, checkpoint_obj, function () {
            attiva_checkpoint_l3(s);
        });
    }

    PP.camera.start_follow(s, player, 0, 60);
    create_hud(s);
    create_blueprint(s, player);

    // ZONE SEGRETE

    let zone_liv3 = [
        { asset: zona3_blocco_terra, img_x: 32 * 86, img_y: 32 * -30, trigger_x: 32 * 93, trigger_y: 32 * -26, trigger_w: 32 * 9, trigger_h: 32 * 7 },
        { asset: zona3_terra_sotterranea, img_x: 32 * 40, img_y: 32 * 46, trigger_x: 32 * 40, trigger_y: 32 * 47, trigger_w: 32 * 21, trigger_h: 32 * 19 },
    ];
    if (typeof create_zone_segrete === "function") create_zone_segrete(s, player, zone_liv3);
    
    
    /*  RAGNI { x: posizione x tile su godot * 32 (pixel * tiles) + 18 (offset sprite ragno),
                y: posizione y tile su godot * 32 (pixel * tiles) (non serve il + 18 perché la y poggia per terra),
                pattuglia: [posizione destra(stessa x di prima) * 32 + 18, 
                            posizione sinistra * 32 + 18],
                id: "ragno_L3_1"}, */
    let ragni_liv3 = [
        { x: -14*32+18, y: -1*32 , pattuglia: [-14*32+18, -21*32+18], id: "ragno_L3_1"},
        { x: 17*32+18, y: -7*32 , pattuglia: [17*32+18, 8*32+18], id: "ragno_L3_2"},
        { x: 31*32+18, y: -1*32 , pattuglia: [31*32+18, 21*32+18], id: "ragno_L3_3"},
        { x: 38*32+18, y: -21*32 , pattuglia: [45*32+18, 38*32+18], id: "ragno_L3_4"},
        { x: 89*32+18, y: 22*32 , pattuglia: [89*32+18, 83*32+18], id: "ragno_L3_5"},
        { x: 94*32+18, y: 22*32 , pattuglia: [94*32+18, 88*32+18], id: "ragno_L3_6"},
        { x: 75*32+18, y: 22*32 , pattuglia: [75*32+18, 66*32+18], id: "ragno_L3_7"},
        { x: 94*32+18, y: 44*32 , pattuglia: [94*32+18, 87*32+18], id: "ragno_L3_8"},
        { x: 65*32+18, y: 81*32 , pattuglia: [65*32+18, 51*32+18], id: "ragno_L3_9"},
        
    ];
    create_enemy(s, muri_livello, ragni_liv3, player);


    // CACTUS

    let cactus_liv3 = [
        { x: -4*32, y: -8*32, id: "cactus_L3_1"},
        { x: 17*32, y: -23*32, id: "cactus_L3_2"},
        { x: 51*32, y: -4*32, id: "cactus_L3_3"},
        { x: 88*32, y: -14*32, id: "cactus_L3_4"},
        { x: 60*32, y: 27*32, id: "cactus_L3_5"},
        { x: 76*32, y: 40*32, id: "cactus_L3_6"},
        { x: 56*32, y: 55*32, id: "cactus_L3_7"},
        { x: 46*32, y: 55*32, id: "cactus_L3_8"},
        { x: 75*32, y: 76*32, id: "cactus_L3_9"},
        { x: 82*32, y: 81*32, id: "cactus_L3_10"},
    ];
    create_cactus(s, muri_livello, cactus_liv3);


    // COLL BLUEPRINT

    let bp_liv3 = [
        { x: 600, y: 150, id: "bp_L3_1" }, 
        { x: 700, y: 150, id: "bp_L3_2" }
    ];
    if (typeof create_blueprint === "function") create_blueprint(s, bp_liv3, player);


    // COLL INGRANAGGI
    
    let ing_liv3 = [
        { x: 2000, y: 200, id: "ing_L3_1" },
        { x: 2200, y: 200, id: "ing_L3_2" }
    ];
    if (typeof create_ingranaggi === "function") create_ingranaggi(s, ing_liv3, player);


    // TRAPPOLE LAVA INQUINATA

    lista_trappole = [];
    for (let i = 0; i < lista_trappole.length; i++) {
        let tr = lista_trappole[i];
        PP.physics.add_overlap_f(s, player, tr, function () {
            morte_player(s, player);
        });
    }
}

// CHECKPOINT Livello 3
function attiva_checkpoint_l3(s) {
    if (checkpoint_preso) return;
    checkpoint_preso = true;
    console.log("CHECKPOINT LIV 3 ATTIVATO!");

    // [FIX] Usa variabili protette
    PP.game_state.set_variable("cp_x", player.ph_obj.x);
    PP.game_state.set_variable("cp_y", player.ph_obj.y);

    let hp_now = PP.game_state.get_variable("HP_player");
    PP.game_state.set_variable("HP_checkpoint", hp_now);

    PP.game_state.set_variable("checkpoint_attivo", true);
    PP.game_state.set_variable("ultimo_livello", "base_3");

    if (checkpoint_obj) {
        checkpoint_obj.ph_obj.y = 99999;
    }
}
window.attiva_checkpoint_l3 = attiva_checkpoint_l3;

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

    if (!fine_livello_triggerata && player.ph_obj.x >= X_FINE_LIVELLO) {
        fine_livello_triggerata = true;
        if (typeof check_collezionabili_vittoria === "function") {
            check_collezionabili_vittoria(s, player);
        }
    }

    if (player.ph_obj.x > 10000) {
        player.ph_obj.x = -9999;
    }

    if (player) manage_player_update(s, player, muri_livello);

    if (typeof update_zone_segrete === "function") update_zone_segrete(s);

    update_enemy(s);
    update_cactus(s, player, muri_livello);
    update_blueprint(s);
    update_hud(s);
}

function destroy(s) { destroy_enemy(s); }

function aggiungi_trappola_manuale(s, x, y, w, h) {
    let centerX = x + (w / 2);
    let centerY = y + (h / 2);
    let zona = PP.shapes.rectangle_add(s, centerX, centerY, w, h, "0xFF0000", 0);
    PP.physics.add(s, zona, PP.physics.type.STATIC);
    lista_trappole.push(zona);
}

function morte_player(s, player) {
    if (typeof window.morte_player === "function") { window.morte_player(s, player); return; }
    if (player.is_dead) return;
    player.is_dead = true;
    if (player.ph_obj) {
        player.ph_obj.setTint(0xFF0000);
        player.ph_obj.body.enable = false;
    }
    PP.scenes.start("game_over");
}

PP.scenes.add("base_3", preload, create, update, destroy);