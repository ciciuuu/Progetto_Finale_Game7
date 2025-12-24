let img_player;

let player;
let muri_livello; // Variabile per ricevere i muri da Godot

let parallasse1;
let parallasse2;
let parallasse3;

let ts_background_1;
let ts_background_2;
let ts_background_3;

//HUD
let asset_ingranaggio_0;
let asset_ingranaggio_1;
let asset_ingranaggio_2;
let asset_ingranaggio_3;
let ingranaggio;

let asset_blueprint;
let blueprint;

let asset_pistola;
let pistola;

let asset_proiettile;
let proiettile; // Gruppo fisico per i proiettili
let last_fired = 0; // Per gestire il tempo tra uno sparo e l'altro
let può_sparare = false; // Semaforo per il cooldown

let gruppo_trappole;

function preload(s) {
    //HUD
    //ingranaggio
    asset_ingranaggio_0 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/0_ingranaggio.png");
    asset_ingranaggio_1 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/1_ingranaggio.png");
    asset_ingranaggio_2 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/2_ingranaggio.png");
    asset_ingranaggio_3 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/3_ingranaggio.png");


    //blueprint
    asset_blueprint = PP.assets.image.load(s, "assets/images/HUD/Blueprint/BP_boh.png");

    //pistola
    asset_pistola = PP.assets.image.load(s, "assets/images/HUD/Pistola/Pistola_buona.png");


    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/sparo 52x52.png", 52, 52);


    proiettile = asset_proiettile = PP.assets.image.load(s, "assets/images/PLAYER/Proiettile.png");



    // CARICAMENTO TILESET DI GODOT
    if (window.godot_preload) {
        window.godot_preload(s);
    }

    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png");
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2b.png");


    // Caricamento asset standard
    // Aggiungi i layer dal più “profondo”


    preload_enemy(s)
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

    s.physics.world.TILE_BIAS = 32;
    // 4. COLLISIONI: Player contro i Muri di Godot
    if (muri_livello) {
        // [PHASER NATIVO] Colleghiamo il player nativo (.ph_obj) al gruppo di muri
        s.physics.add.collider(player.ph_obj, muri_livello);
    }

    configure_player_animations(s, player);

    // 5. CAMERA
    PP.camera.start_follow(s, player, 0, 50);



    // 6. HUD
    //ingranaggio
    ingranaggio = PP.assets.image.add(s, asset_ingranaggio_0, 885, 210, 0, 0, 0, 0);
    ingranaggio.ph_obj.setScrollFactor(0);
    //Blueprint
    blueprint = PP.assets.image.add(s, asset_blueprint, 885, 255, 0, 0, 0, 0);
    blueprint.ph_obj.setScrollFactor(0);
    //Pistola
    pistola = PP.assets.image.add(s, asset_pistola, 332, 210, 0, 0, 0, 0);
    pistola.ph_obj.setScrollFactor(0);



    create_enemy(s, player, muri_livello);
    create_blueprint(s, player);


    // PROIETTILI 
    proiettile = s.physics.add.group(); // 'proiettile' è il GRUPPO FISICO

    // Collisione Proiettili contro Muri (si distruggono se toccano il muro)
    if (muri_livello) {
        s.physics.add.collider(proiettile, muri_livello, function (b, m) {
            b.destroy(); // Distruggi il proiettile
        });
    }



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

    //  SPARO PROIETTILE (Tasto N)

    if (PP.interactive.kb.is_key_down(s, PP.key_codes.N)) {


        let time_now = Date.now();
        let fire_rate = 500; // Millisecondi tra uno sparo e l'altro (0.5 secondi)

        // Offset in pixel sopra il centro del player
        const Y_OFFSET_SPARO = 25;

        // Se è passato abbastanza tempo dall'ultimo sparo
        if (time_now > last_fired) {

            // 1. Calcola posizione di partenza (con offset Y corretto)
            let spawn_x = player.ph_obj.x;
            let spawn_y = player.ph_obj.y - Y_OFFSET_SPARO; // Sposta in alto

            // 2. Crea il proiettile usando il GRUPPO FISICO 'proiettile'
            let b = proiettile.create(spawn_x, spawn_y, asset_proiettile);

            // 3. Imposta la scala 
            b.setScale(0.1);
            b.body.setAllowGravity(false);

            // 4. Gestione Direzione (Destra/Sinistra)
            let velocita_proiettile = 600;
            if (player.geometry.flip_x) {
                b.setVelocityX(-velocita_proiettile); // Spara a Sinistra
                b.setFlipX(true);
            } else {
                b.setVelocityX(velocita_proiettile);  // Spara a Destra
                b.setFlipX(false);
            }

            // 5. Autodistruzione dopo 2 secondi
            s.time.delayedCall(2000, () => {
                if (b.active) b.destroy();
            });

            // Aggiorna il tempo dell'ultimo sparo
            last_fired = time_now + fire_rate;
        }
    }

    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2;
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.4;

    ts_background_1.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.1;
    ts_background_2.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.2;


    // LOGICA CAMBIO LIVELLO
    // Se supero la X 3000 (o quella che vuoi tu), passo a base_2
    if (player.ph_obj.x > 6800 ) { 
        console.log("Fine Livello 1! Caricamento Livello 2...");
        
        // Passaggio alla scena successiva (base_2.js)
        PP.scenes.start("base_2"); 
    }


    if (player) manage_player_update(s, player);

    update_enemy(s);
    update_blueprint(s);

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
    console.log("SEI MORTO!");

    // 1. (Opzionale) Fermiamo o nascondiamo il player subito,
    // altrimenti nei 2 secondi di attesa il giocatore può ancora muoversi!
    if(player && player.ph_obj.active) {
        player.ph_obj.setVisible(false); // Nasconde il personaggio
        // PP.physics.set_immovable(player, true) // il comando Immobile non funziona
        player.ph_obj.body.enable = false; // Disattiva la fisica (non cade, non collide)
    }

    // 2. Impostiamo il timer
    // Sintassi: PP.timers.add_timer(scena, millisecondi, funzione_da_fare_dopo, loop?)
    PP.timers.add_timer(s, 1000, function(s) {
        
        // Tutto ciò che scriviamo qui dentro accadrà tra 1 secondo
        // Riavvia il livello corrente (per ora) o vai al Game Over
        PP.scenes.start("base"); 

    }, false);
}


PP.scenes.add("base", preload, create, update, destroy);