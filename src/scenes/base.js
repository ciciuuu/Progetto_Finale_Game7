let img_player;
let img_player_sparo;

let player;
let muri_livello; // Variabile per ricevere i muri da Godot

let parallasse1;
let parallasse2;
let parallasse3;

let ts_background_1;
let ts_background_2;
let ts_background_3;
let sfondo_caverna;

// Nota: Le variabili dell'HUD sono ora gestite in HUD.js
// Nota: La logica dei proiettili è in proiettili.js

let gruppo_trappole;

function preload(s) {

    // 1. PRELOAD ESTERNI
    preload_hud(s);
    preload_proiettili(s);

    // Caricamento Player
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);

    
    // s.load.image("sfondo_caverna_asset", "assets/images/sfondo_caverna.png");
   //  sfondo_caverna = PP.assets.sprite.load(s, "assets/images/sfondo_caverna ")

    // CARICAMENTO TILESET DI GODOT
    if (window.godot_preload) {
        window.godot_preload(s);
    }

    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2b.png");

    preload_enemy(s);
    preload_player(s);
    preload_blueprint(s);
}

function create(s) {

    const PARALLAX_WIDTH = 15800;
    const PARALLAX_HEIGHT = 3000;

    // TS 1: Immagine più vicina
    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_1.geometry.scale_x = 0.6;
    ts_background_1.geometry.scale_y = 0.6;

    // TS 2: Immagine media
    ts_background_2 = PP.assets.tilesprite.add(s, parallasse2, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    ts_background_2.geometry.scale_x = 0.6;
    ts_background_2.geometry.scale_y = 0.6;

    ts_background_1.tile_geometry.scroll_factor_x = 0;
    ts_background_2.tile_geometry.scroll_factor_x = 0;

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // s.cameras.main.setZoom(2); --- RIMETTERLO QUANDO ANDIAMO A TOGLIERE IL TASTO M
















    // 2. COSTRUZIONE MAPPA
    if (window.godot_create) {
        // LIV1 viene dal file livello_dati.js
        if (typeof LIV1 !== 'undefined') {
            muri_livello = window.godot_create(s, LIV1);
        } else {
            console.error("LIV1 non trovato. Hai caricato livello_dati.js?");
        }
    }

    // 3. RECUPERO SPAWN POINT E CREAZIONE PLAYER
    let startX = PP.game_state.get_variable("spawn_x") || 150;
    let startY = PP.game_state.get_variable("spawn_y") || 620;

    player = PP.assets.sprite.add(s, img_player, startX, startY, 0.5, 1);
    PP.physics.add(s, player, PP.physics.type.DYNAMIC);

    // Inizializza stato morte
    player.is_dead = false;

    s.physics.world.TILE_BIAS = 32;

    // 4. COLLISIONI: Player contro i Muri di Godot
    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    configure_player_animations(s, player);

    // 5. CAMERA
    PP.camera.start_follow(s, player, 0, 75);

    // 6. HUD
    create_hud(s);

    // 7. NEMICI E OGGETTI
    create_enemy(s, muri_livello); // Passiamo i muri ai nemici
    create_blueprint(s, player);


    // --- TRAPPOLE MANUALI ---
    gruppo_trappole = s.physics.add.staticGroup();

    // per aggiungere una trappola (s, X, Y, Larghezza, Altezza)
    aggiungi_trappola_manuale(s, 6 - 5, 0 + 16, 32 * 2, 32 * 5);
    aggiungi_trappola_manuale(s, 582 - 5, 960 + 16, 32 * 3, 32 * 8);
    aggiungi_trappola_manuale(s, 838 - 5, 832 + 16, 32 * 6, 32 * 12);
    aggiungi_trappola_manuale(s, 3462 - 5, 0 + 16, 70, 160);
    aggiungi_trappola_manuale(s, 4102 - 5, 0 + 16, 32 * 12, 32 * 5);
    aggiungi_trappola_manuale(s, 4806 - 5, 0 + 16, 32 * 32, 32 * 8);
    aggiungi_trappola_manuale(s, 6374 - 5, -352 + 16, 32 * 6, 32 * 15);

    // Attiva la collisione mortale
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

    // Gestione Parallasse
    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2;
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.4;
    ts_background_1.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.1;
    ts_background_2.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.2;

    // LOGICA CAMBIO LIVELLO
    if (player.ph_obj.x > 6800) {
        console.log("Fine Livello 1! Caricamento Livello 2...");
        PP.scenes.start("base_2");
    }

    // UPDATE PLAYER (Passiamo muri_livello per i proiettili)
    if (player) manage_player_update(s, player, muri_livello);

    update_enemy(s);
    update_blueprint(s);
    update_hud(s);
}

function destroy(s) {
    destroy_enemy(s);
}

// Crea il rettangolo invisibile mortale
function aggiungi_trappola_manuale(s, x, y, w, h) {
    let zona = s.add.zone(x, y, w, h);
    zona.setOrigin(0, 0);
    s.physics.add.existing(zona, true); // true = Statico
    gruppo_trappole.add(zona);
}

// Funzione che scatta quando muori
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