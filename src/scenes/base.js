let img_player;
let player;
let muri_livello;

let parallasse1; let parallasse2;
let ts_background_1; let ts_background_2;

let lista_trappole = [];

// caricamento assets zone segrete
let zona_pietra;
let zona_inizio_sinistra;
let zona_dopo_vecchietto;
let zona_fine_lvl1;

function preload(s) {
    zona_pietra = PP.assets.image.load(s, "assets/images/MAPPA/ZS_pietra.png");
    zona_inizio_sinistra = PP.assets.image.load(s, "assets/images/MAPPA/ZS_inizio_sinistra.png");
    zona_dopo_vecchietto = PP.assets.image.load(s, "assets/images/MAPPA/ZS_dopo_vecchietto.png");
    zona_fine_lvl1 = PP.assets.image.load(s, "assets/images/MAPPA/ZS_fine_lvl1.png");


    // Caricamento script esterni
    if (typeof preload_zone_segrete === "function") preload_zone_segrete(s);
    if (typeof preload_blueprint === "function") preload_blueprint(s);

    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);
    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2b.png");

    if (window.godot_preload) window.godot_preload(s);
    
    
    preload_hud(s);
    preload_proiettili(s);
    preload_vecchietto(s);
    preload_enemy(s);
    preload_cactus(s);
    preload_player(s);
}

function create(s) {
    // --- SETUP GLOBALE ---
    PP.game_state.set_variable("HP_player", 10);
    PP.game_state.set_variable("arma_sbloccata", false);
    PP.game_state.set_variable("tot_blueprint", 0);
    PP.game_state.set_variable("tot_ingranaggi", 0);


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

    let startX = PP.game_state.get_variable("spawn_x") || 150;
    let startY = PP.game_state.get_variable("spawn_y") || 620;

    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);

    configure_player_animations(s, player);
    s.physics.world.TILE_BIAS = 32;

    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    PP.camera.start_follow(s, player, 0, 75);
    create_hud(s);
    create_vecchietto(s);

    // ===============================================
    // --- CONFIGURAZIONE ZONE SEGRETE (LIV 1) ---
    // ===============================================
    let zone_liv1 = [
        { 
            asset: zona_pietra, 
            img_x: 1664, 
            img_y: -288,
            trigger_x: 1664-32, 
            trigger_y: -288+32, 
            trigger_w: 32*8,  
            trigger_h: 32*4   
        },
        { 
            asset: zona_inizio_sinistra, 
            img_x: 448-64, 
            img_y: 0,
            trigger_x: 449, 
            trigger_y: 0, 
            trigger_w: 32*15,  
            trigger_h: 32*11   
        },
        { 
            asset: zona_dopo_vecchietto, 
            img_x: 111*32, 
            img_y: -2*32,
            trigger_x: 112*32, 
            trigger_y: -2*32, 
            trigger_w: 32*11,  
            trigger_h: 32*4   
        },
        { 
            asset: zona_fine_lvl1, 
            img_x: 227*32, 
            img_y: -16*32,
            trigger_x: 227*32, 
            trigger_y: -15*32, 
            trigger_w: 32*3,  
            trigger_h: 32*32   
        },

    ];

    if(typeof create_zone_segrete === "function") {
        create_zone_segrete(s, player, zone_liv1);
    }
    // ===============================================

    let ragni_liv1 = [
        { x: -8, y: 0, pattuglia: [-234, -15] },
        { x: 182, y: -64, pattuglia: [70, 180] },
        { x: -30, y: 0, pattuglia: [-200, -50] },
        { x: 3142, y: 0, pattuglia: [3000, 3447] },
    ];
    create_enemy(s, muri_livello, ragni_liv1, player);

    let cactus_liv1 = [
        { x: 100, y: 400 },
        { x: 1200, y: 350 }
    ];
    create_cactus(s, muri_livello, cactus_liv1);

    let bp_liv1 = [{ x: 100, y: -100 }, { x: 3684, y: 29 }];
    if (typeof create_blueprint === "function") create_blueprint(s, bp_liv1, player);

    let ing_liv1 = [{ x: 200, y: -100 }, { x: 1820, y: -165 }];
    if (typeof create_ingranaggi === "function") create_ingranaggi(s, ing_liv1, player);

    lista_trappole = [];
    aggiungi_trappola_manuale(s, 6 - 5, 0 + 16, 32 * 2, 32 * 5);
    aggiungi_trappola_manuale(s, 582 - 5, 960 + 16, 32 * 3, 32 * 8);
    aggiungi_trappola_manuale(s, 838 - 5, 832 + 16, 32 * 6, 32 * 12);
    aggiungi_trappola_manuale(s, 3462 - 5, 0 + 16, 70, 160);
    aggiungi_trappola_manuale(s, 4102 - 5, 0 + 16, 32 * 12, 32 * 5);
    aggiungi_trappola_manuale(s, 4806 - 5, 0 + 16, 32 * 32, 32 * 8);
    aggiungi_trappola_manuale(s, 6374 - 5, -352 + 16, 32 * 6, 32 * 15);

    for (let i = 0; i < lista_trappole.length; i++) {
        let tr = lista_trappole[i];
        PP.physics.add_overlap_f(s, player, tr, function () {
            morte_player(s, player, null);
        });
    }
}

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

    if (player.ph_obj.x > 227 * 32 & player.ph_obj.y > 0) {
        let vita_al_passaggio = PP.game_state.get_variable("HP_player");
        PP.game_state.set_variable("HP_checkpoint", vita_al_passaggio);
        PP.game_state.set_variable("arma_sbloccata", true);
        PP.scenes.start("base_3");
        PP.game_state.set_variable("spawn_x", 100);
        PP.game_state.set_variable("spawn_y", 100);
    }

    if (player) manage_player_update(s, player, muri_livello);

    // [NUOVO] Update Zone
    if (typeof update_zone_segrete === "function") update_zone_segrete(s);

    update_vecchietto(s, player);
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