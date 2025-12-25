let img_player;

let player;
let muri_livello; // Variabile per ricevere i muri da Godot

let parallasse1;
let parallasse2;
let parallasse3;

let ts_background_1;
let ts_background_2;
let ts_background_3;

// Nota: Le variabili dell'HUD sono ora gestite in HUD.js

let asset_proiettile;
// Nota: La logica di sparo (tasto N) e il gruppo proiettili sono ora gestiti in player.js

let gruppo_trappole;

function preload(s) {
    
    // 1. RICHIESTA HUD ESTERNA
    preload_hud(s);

    // Caricamento Player
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);

    // Carichiamo l'asset del proiettile con un nome chiave che userà player.js
    s.load.image("proiettile_asset", "assets/images/PLAYER/Proiettile.png");
    s.load.image("proiettile_inquinante_asset", "assets/images/PLAYER/Proiettile_inquinante.png");
    

    // CARICAMENTO TILESET DI GODOT
    if (window.godot_preload) {
        window.godot_preload(s);
    }

        parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
        parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2b.png");


        // Caricamento asset standard
        // Aggiungi i layer dal più “profondo”
        // (Nota: hai già caricato proiettile sopra, questa riga è ridondante ma la lascio per rispetto dei commenti)
        s.load.image("proiettile_asset", "assets/images/PLAYER/Proiettile.png");


        preload_enemy(s);
        preload_player(s);
        preload_blueprint(s);
}

function create(s) {


    const PARALLAX_WIDTH = 15800;
    const PARALLAX_HEIGHT = 3000;


    // TS 1: Immagine più vicina
    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);

    // CORREZIONE: Applica la scala al Tilesprite ORA
    ts_background_1.geometry.scale_x = 0.6;
    ts_background_1.geometry.scale_y = 0.6;

    // TS 2: Immagine media
    ts_background_2 = PP.assets.tilesprite.add(s, parallasse2, 0, 450, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);

    // CORREZIONE: Applica la scala anche al secondo Tilesprite (esempio)
    ts_background_2.geometry.scale_x = 0.6;
    ts_background_2.geometry.scale_y = 0.6;

    // TS 3: Immagine più lontana (Non ha bisogno di scala in questo esempio)

    ts_background_1.tile_geometry.scroll_factor_x = 0;
    ts_background_2.tile_geometry.scroll_factor_x = 0;


    //ZOOM IN PHASER
    s.cameras.main.setZoom(2);


    // 2. COSTRUIONE MAPPA
    // Eseguiamo la creazione e salviamo il gruppo di muri restituito
    if (window.godot_create) {
        // LIV1 viene dal file livello_dati.js
        if(typeof LIV1 !== 'undefined') {
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
        // [PHASER NATIVO] Colleghiamo il player nativo (.ph_obj) al gruppo di muri
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    configure_player_animations(s, player);

    // 5. CAMERA
    PP.camera.start_follow(s, player, 0, 50);

    // 6. HUD (CREAZIONE DA FILE ESTERNO)
    create_hud(s);

    // --- MODIFICA IMPORTANTE: Passiamo i muri ai nemici ---
    create_enemy(s, muri_livello);
    
    create_blueprint(s, player);


    // --- TRAPPOLE MANUALI ---
    gruppo_trappole = s.physics.add.staticGroup();

    // ESEMPIO: Aggiungi una trappola (s, X, Y, Larghezza, Altezza)
    // Usa il tasto P per trovare le coordinate giuste

    // Scrivo -5 perché uso il player per vedere le coordinate e lei ha un pivot centrale (quindi spostato di 5 pixel)
    // dove invece moltiplico *32 è perché faccio la dimensione dei blocchi (32px) * il numero di blocchi
    // Dove invece faccio +16 è per non far morire il giocatore immediatamente appena tocca la "lava" ma solo se ci entra almeno con metà corpo
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
    // Se supero la X 6800 (Fine livello 1), passo a base_2
    if (player.ph_obj.x > 6800 ) { 
        console.log("Fine Livello 1! Caricamento Livello 2...");
        
        // Passaggio alla scena successiva (base_2.js)
        PP.scenes.start("base_2"); 
    }

    // MODIFICA: Passiamo muri_livello a manage_player_update così il player può passare i muri al proiettile
    if (player) manage_player_update(s, player, muri_livello);

    update_enemy(s);
    update_blueprint(s);
    update_hud(s); // Opzionale: aggiorna HUD se c'è logica dinamica

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
    
    // Controllo sicurezza: se è già morto, esci
    if (player.is_dead) return;
    
    player.is_dead = true;
    console.log("SEI MORTO!");

    // 1. Fermiamo o nascondiamo il player subito
    if(player && player.ph_obj.active) {
        player.ph_obj.setVisible(false); // Nasconde il personaggio
        player.ph_obj.body.enable = false; // Disattiva la fisica
        player.ph_obj.body.setVelocity(0,0); // Blocca movimento
    }

    // 2. Impostiamo il timer per il Game Over
    // Usa function() vuota per mantenere il riferimento corretto alle scene
    PP.timers.add_timer(s, 1000, function() {
        
        // Tutto ciò che scriviamo qui dentro accadrà tra 1 secondo
        // Passa alla scena Game Over
        PP.scenes.start("game_over"); 

    }, false);
}


PP.scenes.add("base", preload, create, update, destroy);