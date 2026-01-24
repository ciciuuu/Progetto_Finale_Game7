let img_player;
let img_player_sparo;

let player;
let muri_livello; 

let parallasse1;
let parallasse2;
let parallasse3;

let ts_background_1;
let ts_background_2;
let ts_background_3;
let sfondo_caverna;

let gruppo_trappole;

function preload(s) {
    // 1. PRELOAD ESTERNI
    preload_hud(s);
    preload_proiettili(s);
    
    // NUOVO: Preload Vecchietto
    preload_vecchietto(s);

    // Caricamento Immagini
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);

    // CARICAMENTO TILESET DI GODOT
    if (window.godot_preload) {
        window.godot_preload(s);
    }

    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2b.png");

    preload_enemy(s);
    preload_cactus(s);
    preload_player(s);
    preload_blueprint(s);
}

function create(s) {

    PP.game_state.set_variable("HP_player", 10);
    set_vulnerable(s, true);

    const PARALLAX_WIDTH = 15800;
    const PARALLAX_HEIGHT = 3000;

    // SFONDI PARALLASSE
    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_1.geometry.scale_x = 0.6;
    ts_background_1.geometry.scale_y = 0.6;

    ts_background_2 = PP.assets.tilesprite.add(s, parallasse2, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_2.geometry.scale_x = 0.6;
    ts_background_2.geometry.scale_y = 0.6;

    ts_background_1.tile_geometry.scroll_factor_x = 0;
    ts_background_2.tile_geometry.scroll_factor_x = 0;

    // 2. COSTRUZIONE MAPPA
    if (window.godot_create) {
        if (typeof LIV1 !== 'undefined') {
            muri_livello = window.godot_create(s, LIV1);
        } else {
            console.error("LIV1 non trovato.");
        }
    }

    // 3. CREAZIONE PLAYER
    let startX = PP.game_state.get_variable("spawn_x") || 150;
    let startY = PP.game_state.get_variable("spawn_y") || 620;

    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);

    // ------------------------------------------
    // --- VECCHIETTO (Nuovo File) ---
    // ------------------------------------------
    create_vecchietto(s);
    // ------------------------------------------

    player.is_dead = false;
    s.physics.world.TILE_BIAS = 32;

    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    configure_player_animations(s, player);
    PP.camera.start_follow(s, player, 0, 75);
    create_hud(s);

    // NEMICI E OGGETTI
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

    create_blueprint(s, player);

    // TRAPPOLE
    gruppo_trappole = s.physics.add.staticGroup();
    aggiungi_trappola_manuale(s, 6 - 5, 0 + 16, 32 * 2, 32 * 5);
    aggiungi_trappola_manuale(s, 582 - 5, 960 + 16, 32 * 3, 32 * 8);
    aggiungi_trappola_manuale(s, 838 - 5, 832 + 16, 32 * 6, 32 * 12);
    aggiungi_trappola_manuale(s, 3462 - 5, 0 + 16, 70, 160);
    aggiungi_trappola_manuale(s, 4102 - 5, 0 + 16, 32 * 12, 32 * 5);
    aggiungi_trappola_manuale(s, 4806 - 5, 0 + 16, 32 * 32, 32 * 8);
    aggiungi_trappola_manuale(s, 6374 - 5, -352 + 16, 32 * 6, 32 * 15);

    s.physics.add.overlap(player.ph_obj, gruppo_trappole, function () {
        morte_player(s, player, null);
    })
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

    if (player.ph_obj.x > 6800) {
        PP.scenes.start("base_2");
    }

    if (player) manage_player_update(s, player, muri_livello);

    // ------------------------------------------
    // --- VECCHIETTO UPDATE (Nuovo File) ---
    // ------------------------------------------
    update_vecchietto(s, player);
    // ------------------------------------------

    update_enemy(s);
    update_cactus(s, player, muri_livello);
    update_blueprint(s);
    update_hud(s);
}

function destroy(s) {
    destroy_enemy(s);
}

function aggiungi_trappola_manuale(s, x, y, w, h) {
    let zona = s.add.zone(x, y, w, h);
    zona.setOrigin(0, 0);
    s.physics.add.existing(zona, true); 
    gruppo_trappole.add(zona);
}

function morte_player(s, player, trappola) {
    if (player.is_dead) return;
    player.is_dead = true;
    console.log("SEI MORTO!");

    if (player && player.ph_obj.active) {
        player.ph_obj.setVisible(false);
        player.ph_obj.body.enable = false;
        player.ph_obj.body.setVelocity(0, 0);
    }

    PP.timers.add_timer(s, 1000, function () {
        PP.scenes.start("game_over");
    }, false);
}

PP.scenes.add("base", preload, create, update, destroy);