let img_player;
let player;
let muri_livello; 

// Variabili Sfondo
let parallasse1;
let parallasse2;
let ts_background_1;
let ts_background_2;

let lista_trappole = [];

function preload(s) {
    // 1. PRELOAD ESTERNI
    preload_hud(s);
    preload_proiettili(s); // Carica le immagini dei proiettili
    preload_enemy(s);
    preload_cactus(s);
    preload_player(s);
    
    if(typeof preload_blueprint === "function") preload_blueprint(s);

    // 2. ASSETS
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);
    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2b.png");

    if (window.godot_preload) window.godot_preload(s);
}

function create(s) {
    let hp_start = PP.game_state.get_variable("HP_checkpoint") || 10;
    PP.game_state.set_variable("HP_player", hp_start);

    // Inizializzazione gruppo proiettili
    if (!s.gruppo_proiettili) {
        s.gruppo_proiettili = s.physics.add.group();
    }

    const PARALLAX_WIDTH = 15800;
    const PARALLAX_HEIGHT = 3000;

    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_1.geometry.scale_x = 0.6; ts_background_1.geometry.scale_y = 0.6;
    ts_background_2 = PP.assets.tilesprite.add(s, parallasse2, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_2.geometry.scale_x = 0.6; ts_background_2.geometry.scale_y = 0.6;
    ts_background_1.tile_geometry.scroll_factor_x = 0; ts_background_2.tile_geometry.scroll_factor_x = 0;

    // --- COSTRUZIONE MAPPA ---
    if (window.godot_create && typeof LIV3 !== 'undefined') {
        // [MODIFICA] Niente wrapper {ph_obj}. Usiamo l'oggetto nativo come in base.js
        muri_livello = window.godot_create(s, LIV3);
    } else {
        console.error("ERRORE: LIV3 non trovato.");
        muri_livello = null;
    }

    let startX = PP.game_state.get_variable("spawn_x") || 100;
    let startY = PP.game_state.get_variable("spawn_y") || 100;

    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);
    
    configure_player_animations(s, player);
    s.physics.world.TILE_BIAS = 32;

    // [MODIFICA] Collisione Player-Muri NATIVA (perché muri_livello è nativo)
    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello);
    }
    
    PP.camera.start_follow(s, player, 0, 75);
    create_hud(s);
    create_blueprint(s, player);

    // --- NEMICI LIV3 ---
    let ragni_liv3 = [
        { x: 500, y: 10, pattuglia: [400, 600] },
        { x: 1200, y: 100, pattuglia: [1000, 1400] }
    ];
    // Passiamo muri_livello (che ora è l'oggetto nativo)
    create_enemy(s, muri_livello, ragni_liv3, player);

    let cactus_liv3 = [
        { x: 1500, y: 300 },
        { x: 2500, y: 300 }
    ];
    create_cactus(s, muri_livello, cactus_liv3);

    // --- COLLEZIONABILI LIV3 ---
    let bp_liv3 = [ { x: 600, y: 150 }, { x: 700, y: 150 } ];
    if(typeof create_blueprint === "function") create_blueprint(s, bp_liv3, player);

    let ing_liv3 = [ { x: 2000, y: 200 }, { x: 2200, y: 200 } ];
    if(typeof create_ingranaggi === "function") create_ingranaggi(s, ing_liv3, player);

    // --- TRAPPOLE ---
    lista_trappole = [];
    for (let i = 0; i < lista_trappole.length; i++) {
        let tr = lista_trappole[i];
        PP.physics.add_overlap_f(s, player, tr, function () {
            if(typeof morte_player === "function") morte_player(s, player);
            else if(typeof window.morte_player === "function") window.morte_player(s, player);
        });
    }
}

function update(s) {
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.M)) s.cameras.main.setZoom(0.2);
    else if (PP.interactive.kb.is_key_up(s, PP.key_codes.M)) s.cameras.main.setZoom(2);

    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2;
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.4;
    ts_background_1.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.1;
    ts_background_2.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.2;

    if (player.ph_obj.x > 10000) {
        if(typeof check_collezionabili_vittoria === "function") check_collezionabili_vittoria();
        player.ph_obj.x = -9999; 
    }

    if (player) manage_player_update(s, player, muri_livello);

    update_enemy(s);
    update_cactus(s, player, muri_livello);
    update_blueprint(s);
    update_hud(s);
}

function destroy(s) { destroy_enemy(s); }
function aggiungi_trappola_manuale(s, x, y, w, h) {
    let zona = PP.shapes.rectangle_add(s, x + w/2, y + h/2, w, h, "0xFF0000", 0);
    PP.physics.add(s, zona, PP.physics.type.STATIC);
    lista_trappole.push(zona);
}
function morte_player(s, player) {
    if(typeof window.morte_player === "function") { window.morte_player(s, player); return; }
    if (player.is_dead) return; 
    player.is_dead = true;
    if (player.ph_obj) {
        player.ph_obj.setTint(0xFF0000); 
        player.ph_obj.body.enable = false; 
    }
    PP.scenes.start("game_over");
}
PP.scenes.add("base_3", preload, create, update, destroy);