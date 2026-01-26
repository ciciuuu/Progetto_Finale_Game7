// ok

let asset_ingranaggio_0;
let asset_ingranaggio_1;
let asset_ingranaggio_2;
let asset_ingranaggio_3;
let ingranaggio;

let asset_health_bar;
let asset_healthbar_sheet;
let health_bar;

let asset_bordo_danno;
let vignette_danno;

let asset_blueprint;
let blueprint;

let asset_pistole;
let pistola;

// Asset per la pistola statica (solo inquinante)
let asset_pistola_fissa;
let pistola_fissa;

// 1. DICHIARAZIONE VARIABILE LAYER
let livello_HUD;

// Variabili interne dell'HUD
let hud_tasto_R_rilasciato = true;
let hud_modalita_inquinante = false;

function preload_hud(s) {
    // HUD Assets
    asset_ingranaggio_0 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/0_ingranaggio.png");
    asset_ingranaggio_1 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/1_ingranaggio.png");
    asset_ingranaggio_2 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/2_ingranaggio.png");
    asset_ingranaggio_3 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/3_ingranaggio.png");

    asset_blueprint = PP.assets.image.load(s, "assets/images/HUD/Blueprint/BP_boh.png");
    
    // Sprite animato
    asset_pistole = PP.assets.sprite.load_spritesheet(s, "assets/images/HUD/Pistola/Pistole_sheet.png", 50, 40);
    // Immagine fissa
    asset_pistola_fissa = PP.assets.image.load(s, "assets/images/HUD/Pistola/Pistola_inquinante.png");

    asset_health_bar = PP.assets.image.load(s, "assets/images/HUD/HEALTHBAR/health_bar.png");
    asset_healthbar_sheet = PP.assets.sprite.load_spritesheet(s, "assets/images/HUD/HEALTHBAR/healthbar_sheet.png", 195, 32);

    asset_bordo_danno = PP.assets.image.load(s, "assets/images/HUD/HEALTHBAR/bordodannoviola.png");
}

function create_hud(s) {
    
    // 2. CREAZIONE DEL LAYER (POLIPHASER)
    livello_HUD = PP.layers.create(s);
    // Z-index alto per stare sopra tutto
    PP.layers.set_z_index(livello_HUD, 1000);

    // --- SFUMATURA VIOLA DANNO ---
    vignette_danno = PP.assets.image.add(s, asset_bordo_danno, 640, 360, 0.5, 0.5);
    vignette_danno.geometry.scale_x = 0.5;
    vignette_danno.geometry.scale_y = 0.5;
    
    
    // Fissiamola allo schermo
    vignette_danno.tile_geometry.scroll_factor_x = 0;
    vignette_danno.tile_geometry.scroll_factor_y = 0;
    
    // Trasparente all'inizio
    vignette_danno.ph_obj.alpha = 0;



    /* ingranaggio = PP.assets.image.add(s, asset_ingranaggio_0, 885, 210, 0, 0, 0, 0);
    ingranaggio.ph_obj.setScrollFactor(0); 
    PP.layers.add_to_layer(livello_HUD, ingranaggio);


    // --- BLUEPRINT ---
    blueprint = PP.assets.image.add(s, asset_blueprint, 885, 255, 0, 0, 0, 0);
    blueprint.ph_obj.setScrollFactor(0);
    PP.layers.add_to_layer(livello_HUD, blueprint);


    // --- PISTOLA ANIMATA (Rinnovabile/Inquinante) ---
    pistola = PP.assets.sprite.add(s, asset_pistole, 332, 210, 0, 0);
    pistola.ph_obj.setScrollFactor(0);
    pistola.geometry.scale_x = 1.3;
    pistola.geometry.scale_y = 1.3;
    PP.layers.add_to_layer(livello_HUD, pistola);

    // --- PISTOLA FISSA (Solo Inquinante - Inizialmente visibile) ---
    pistola_fissa = PP.assets.image.add(s, asset_pistola_fissa, 332, 210, 0, 0, 0, 0);
    pistola_fissa.ph_obj.setScrollFactor(0);
    pistola_fissa.geometry.scale_x = 1.3;
    pistola_fissa.geometry.scale_y = 1.3;
    PP.layers.add_to_layer(livello_HUD, pistola_fissa);


    // --- HEALTH BAR ---
    health_bar = PP.assets.sprite.add(s, asset_healthbar_sheet, 1280/2, 220, 0.5, 0.5);
    health_bar.ph_obj.setScrollFactor(0);
    PP.layers.add_to_layer(livello_HUD, health_bar) */


    // --- INGRANAGGIO (Alto a Destra - Alzato di 20px) ---
    // Posizione X: 1150 (Destra), Y: 190 (Era 210, -20px)
    ingranaggio = PP.assets.image.add(s, asset_ingranaggio_0, 885, 190, 0, 0, 0, 0);
    
    // [POLIPHASER] Scroll Factor tramite tile_geometry (invece di setScrollFactor)
    ingranaggio.tile_geometry.scroll_factor_x = 0;
    ingranaggio.tile_geometry.scroll_factor_y = 0;
    
    PP.layers.add_to_layer(livello_HUD, ingranaggio, vignette_danno);


    // --- BLUEPRINT (Alto a Destra - Sotto ingranaggio - Alzato di 20px) ---
    // Posizione X: 1150, Y: 235 (Era 255, -20px)
    blueprint = PP.assets.image.add(s, asset_blueprint, 885, 235, 0, 0, 0, 0);
    
    // [POLIPHASER] Scroll Factor
    blueprint.tile_geometry.scroll_factor_x = 0;
    blueprint.tile_geometry.scroll_factor_y = 0;
    
    PP.layers.add_to_layer(livello_HUD, blueprint);


    // --- PISTOLA ANIMATA (Alto a Sinistra) ---
    pistola = PP.assets.sprite.add(s, asset_pistole, 332, 190, 0, 0);
    
    // [POLIPHASER] Scroll Factor & Scala
    pistola.tile_geometry.scroll_factor_x = 0;
    pistola.tile_geometry.scroll_factor_y = 0;
    pistola.geometry.scale_x = 1.3;
    pistola.geometry.scale_y = 1.3;
    
    PP.layers.add_to_layer(livello_HUD, pistola);


    // --- PISTOLA FISSA (Alto a Sinistra - Stessa posizione) ---
    pistola_fissa = PP.assets.image.add(s, asset_pistola_fissa, 332, 190, 0, 0);
    
    // [POLIPHASER] Scroll Factor & Scala
    pistola_fissa.tile_geometry.scroll_factor_x = 0;
    pistola_fissa.tile_geometry.scroll_factor_y = 0;
    pistola_fissa.geometry.scale_x = 1.3;
    pistola_fissa.geometry.scale_y = 1.3;
    
    PP.layers.add_to_layer(livello_HUD, pistola_fissa);


    // --- HEALTH BAR
    health_bar = PP.assets.sprite.add(s, asset_healthbar_sheet, 1280/2, 220, 0.5, 0.5);
    
    // [POLIPHASER] Scroll Factor
    health_bar.tile_geometry.scroll_factor_x = 0;
    health_bar.tile_geometry.scroll_factor_y = 0;
    
    PP.layers.add_to_layer(livello_HUD, health_bar);


    // --- ANIMAZIONI ---
    PP.assets.sprite.animation_add_list(pistola, "anim_normale", [1], 1, 0);
    PP.assets.sprite.animation_add_list(pistola, "anim_inquinante", [0], 1, 0);
    PP.assets.sprite.animation_play(pistola, "anim_normale");

    PP.assets.sprite.animation_add_list(health_bar, "health_10", [0], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_9", [1], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_8", [2], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_7", [3], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_6", [4], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_5", [5], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_4", [6], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_3", [7], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_2", [8], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_1", [9], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_0", [10], 1, 0);
    PP.assets.sprite.animation_play(health_bar, "health_10");
}

function update_hud(s, player) {
    
    // Controllo stato sblocco arma
    let is_arma_sbloccata = PP.game_state.get_variable("arma_sbloccata");

    if (is_arma_sbloccata) {
        // --- ARMA SBLOCCATA: Logica normale ---
        
        // Gestione visibilità
        pistola_fissa.visibility.hidden = true;
        pistola.visibility.hidden = false;

        // Gestione tasto L
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.L)) {
            if (hud_tasto_R_rilasciato) {
                hud_modalita_inquinante = !hud_modalita_inquinante;
                if (hud_modalita_inquinante) {
                    PP.assets.sprite.animation_play(pistola, "anim_inquinante");
                } else {
                    PP.assets.sprite.animation_play(pistola, "anim_normale");
                }
                hud_tasto_R_rilasciato = false;
            }
        } else {
            hud_tasto_R_rilasciato = true;
        }

    } else {
        
        // --- ARMA BLOCCATA: Solo Inquinante ---
        
        // [POLIPHASER] Visibilità
        pistola_fissa.visibility.hidden = false;
        pistola.visibility.hidden = true;

        // Forziamo la variabile globale dell'HUD su inquinante
        hud_modalita_inquinante = true;
    }

    // --- HEALTH BAR ---
    let vita_attuale = PP.game_state.get_variable("HP_player");
    if (vita_attuale !== undefined) {
        let nome_anim = "health_" + vita_attuale;
        PP.assets.sprite.animation_play(health_bar, nome_anim);
    }
}

function destroy_hud(s) {
}