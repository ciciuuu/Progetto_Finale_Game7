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
let ingranaggio;

let asset_blueprint;
let blueprint;

let asset_pistola;
let pistola;

let asset_proiettile;
let proiettile; // Gruppo fisico per i proiettili
let last_fired = 0; // Per gestire il tempo tra uno sparo e l'altro
let può_sparare = false; // Semaforo per il cooldown


function preload(s) {
    //HUD
    //ingranaggio
    asset_ingranaggio_0 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/0_ingranaggio.png");

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
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2.png");
    parallasse3 = PP.assets.image.load(s, "assets/images/parallax/parallasse_3.png");


    // Caricamento asset standard
    // Aggiungi i layer dal più “profondo”


    preload_enemy(s)
    preload_player(s);
    preload_blueprint(s);
}

function create(s) {


    const PARALLAX_WIDTH = 12800;
    const PARALLAX_HEIGHT = 23000;



    // TS 1: Immagine più vicina
    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 0, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.45);

    // CORREZIONE: Applica la scala al Tilesprite ORA
    ts_background_1.geometry.scale_x = 0.3;
    ts_background_1.geometry.scale_y = 0.3;

    // TS 2: Immagine media
    ts_background_2 = PP.assets.tilesprite.add(s, parallasse2, 0, -100, 0, 0, 0, 0.22);

    // CORREZIONE: Applica la scala anche al secondo Tilesprite (esempio)
    ts_background_2.geometry.scale_x = 0.3;
    ts_background_2.geometry.scale_y = 0.3;

    // TS 3: Immagine più lontana (Non ha bisogno di scala in questo esempio)
    ts_background_3 = PP.assets.tilesprite.add(s, parallasse3, 0, 0, 1280, 800, 0, 0);

    ts_background_1.tile_geometry.scroll_factor_x = 0;
    ts_background_2.tile_geometry.scroll_factor_x = 0;
    ts_background_3.tile_geometry.scroll_factor_x = 0;


    //ZOOM IN PHASER
    s.cameras.main.setZoom(2);


    // 2. COSTRUIONE MAPPA
    // Eseguiamo la creazione e salviamo il gruppo di muri restituito
    if (window.godot_create) {
        muri_livello = window.godot_create(s);
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

}


function update(s) {
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(0.2);

    } else if (PP.interactive.kb.is_key_up(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(2);

    }





    // PROIETTILE

    /* if (PP.interactive.kb.is_key_down(s, PP.key_codes.N) && può_sparare) {

        può_sparare = false;

        let offset_sparo = 25;
        let velocità = 600;
        let colpo = proiettile.create(spawn_x, spawn_y, asset_proiettile);

        colpo.setScale(1); // Scala
        colpo.body.setAllowGravity(false); // Niente gravità


        if (player.geometry.flip_x == true) {
            colpo.setVelocityX(-velocità); // Sinistra
            colpo.setFlipX(true);
        } else {
            colpo.setVelocityX(velocità);  // Destra
            colpo.setFlipX(false);
        }

        // Timer
         PP.timers.add_timer(s, 500, function () {
            sparo = false;
        }, false);

        PP.timers.add_timer(s, 2000, function () {
            if (colpo.active) {
                colpo.destroy();
            }
        }, false); 
    } */


     /* if (PP.interactive.kb.is_key_down(s, PP.key_codes.N) && sparo) {

        let offset_sparo = 25;
        let spawn_x = player.geometry.x;
        let spawn_y = player.geometry.y - altezza_sparo;

        // 2. Creazione corretta usando il gruppo fisico
        let colpo = proiettile.create(spawn_x, spawn_y, asset_proiettile);

        // Impostazioni fisiche
        colpo.setScale(0.1); // Scala
        colpo.body.setAllowGravity(false); // Niente gravità

        let velocita = 600;

        // 3. Direzione
        if (player.geometry.flip_x == true) {
            colpo.setVelocityX(-velocita); // Sinistra
            colpo.setFlipX(true);
        } else {
            colpo.setVelocityX(velocita);  // Destra
            colpo.setFlipX(false);
        }

        // 4. Timer Ricarica (Cooldown) - AGGIUNTO 'false' per evitare loop
        PP.timers.add_timer(s, 500, function () {
            sparo = false;
        }, false);

        // 5. Timer Distruzione - AGGIUNTO 'false' per evitare loop
        PP.timers.add_timer(s, 2000, function () {
            if (colpo.active) {
                colpo.destroy();
            }
        }, false);
    } */
 



    /* // --- SPARO PROIETTILE (Tasto N) ---
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.N) && sparo) {
        sparo = false;

        let altezza_sparo_dal_terreno = 25;
        let spawn_x = player.ph_obj.x;
        let spawn_y = player.ph_obj.y - altezza_sparo_dal_terreno;

        let crea_proiettile = proiettile.create(spawn_x, spawn_y, asset_proiettile);

        let velocita_proiettile = 600;
        crea_proiettile.body.setAllowGravity(false);

        if (player.geometry.flip_x) {
            crea_proiettile.setVelocityX(-velocita_proiettile);
            crea_proiettile.setFlipX(true);
        } else {
            crea_proiettile.setVelocityX(velocita_proiettile);
            crea_proiettile.setFlipX(false);
        }

        // TIMER
        PP.timers.add_timer(s, 200, function () {
            if (crea_proiettile) {
                crea_proiettile.destroy();
            }
        }, false);

        // --- CORREZIONE TIMER 2 (Ricarica) ---
        // Aggiunto 'false' alla fine (parametro loop)
        PP.timers.add_timer(s, 500, function () {
            sparo = true;
        }, false);
    } */


    /* // PROIETTILE
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.N)) {

        let sparo = true;
        let altezza_sparo_dal_terreno = 25
        let spawn_x = player.ph_obj.x;
        let spawn_y = player.ph_obj.y - altezza_sparo_dal_terreno;

        let crea_proiettile = proiettile.create(spawn_x, spawn_y, proiettile);

        let velocita_proiettile = 100;
        // crea_proiettile.setScale(1);
        crea_proiettile.body.setAllowGravity(false);

        if (player.geometry.flip_x) {
            crea_proiettile.setVelocityX(-velocita_proiettile); // Spara a Sinistra

        } else {
            crea_proiettile.setVelocityX(velocita_proiettile);  // Spara a Destra
        }

        PP.timers.add_timer(s, 2000, function() {
            if(sparo.active) {
                crea_proiettile.destroy();
            }
        })
    } */

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


    /* //  SPARO PROIETTILE (Tasto N) -- RENDERE TUTTO IN PHASER
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
     } */


    /*  // DEBUG: Premi 'L' per vedere la distanza in console
     if (PP.interactive.kb.is_key_down(s, PP.key_codes.L)) {
 
         // 1. CONFIGURAZIONE: CAMBIA SOLO IL NOME QUI SOTTO
         let OGGETTO_TARGET = ingranaggio; // <--- Sostituisci 'ingranaggio' con 'enemy1' o altro
 
 
         // 2. Otteniamo gli oggetti nativi
         let p_obj = player.ph_obj;
         let t_obj = OGGETTO_TARGET.ph_obj; // t_obj sta per Target Object
         let cam = s.cameras.main;
 
         // 3. Calcolo Posizione "Mondo" Intelligente
         // Se l'oggetto ha scrollFactor 0 (è un HUD fisso), dobbiamo sommare la camera.
         // Se l'oggetto è normale (si muove col livello), usiamo la sua coordinata diretta.
         let target_world_x = (t_obj.scrollFactorX === 0) ? cam.scrollX + t_obj.x : t_obj.x;
         let target_world_y = (t_obj.scrollFactorY === 0) ? cam.scrollY + t_obj.y : t_obj.y;
 
         // 4. Calcolo Distanza
         let dist_x = Math.abs(p_obj.x - target_world_x);
         let dist_y = Math.abs(p_obj.y - target_world_y);
 
         console.clear();
         console.log("--- DEBUG DISTANZA ---");
         console.log(`Player: x=${p_obj.x.toFixed(0)}, y=${p_obj.y.toFixed(0)}`);
         console.log(`Target (${OGGETTO_TARGET == ingranaggio ? "HUD" : "World"}): x=${target_world_x.toFixed(0)}, y=${target_world_y.toFixed(0)}`);
         console.log(`%cDISTANZA X: ${dist_x.toFixed(2)}`, "color: yellow; font-weight: bold;");
         console.log(`%cDISTANZA Y: ${dist_y.toFixed(2)}`, "color: yellow; font-weight: bold;");
     } */


    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.3;
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2;
    ts_background_3.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.1;

    ts_background_1.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.15;
    ts_background_2.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.5;
    ts_background_3.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.01;

    if (player) manage_player_update(s, player);

    update_enemy(s);
    update_blueprint(s);

}

function destroy(s) {

    destroy_enemy(s);

}

PP.scenes.add("base", preload, create, update, destroy);