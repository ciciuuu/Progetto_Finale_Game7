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


function preload(s) {
    //HUD
    //ingranaggio
    asset_ingranaggio_0 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/0_ingranaggio.png");

    //blueprint
    asset_blueprint = PP.assets.image.load(s, "assets/images/HUD/Blueprint/BP_boh.png");

    //pistola
    asset_pistola = PP.assets.image.load(s, "assets/images/HUD/Pistola/Pistola_buona.png");


    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/Personaggio 52x52.png", 52, 52);

    // 1. CARICAMENTO TILESET DI GODOT (CHIAMATA CRITICA)
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
    PP.camera.start_follow(s, player, 0, 75);



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
    
    
    create_enemy(s);
}


function update(s) {
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(0.2);

    } else if (PP.interactive.kb.is_key_up(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(2);

    }


                // DEBUG: Premi 'L' per vedere la distanza in console
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



    }

    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.3;
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2;
    ts_background_3.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.1;

    ts_background_1.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.15;
    ts_background_2.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.5;
    ts_background_3.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.01;

    if (player) manage_player_update(s, player);

    update_enemy(s);


}

function destroy(s) { 

    destroy_enemy(s);

}

PP.scenes.add("base", preload, create, update, destroy);