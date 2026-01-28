// ok

let asset_ingranaggio_0;
let asset_ingranaggio_1;
let asset_ingranaggio_2;
let asset_ingranaggio_3;

let ingranaggio_sfondo;
let ingranaggio_1;
let ingranaggio_2;
let ingranaggio_3;
let ingranaggio;

let asset_health_bar;
let asset_healthbar_sheet;
let health_bar;

let asset_bordo_dannorosso;
let vignette_dannorosso;
let asset_bordo_dannoviola;
let vignette_dannoviola;

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

    asset_bordo_dannorosso = PP.assets.image.load(s, "assets/images/HUD/HEALTHBAR/bordodannorosso.png");
    asset_bordo_dannoviola = PP.assets.image.load(s, "assets/images/HUD/HEALTHBAR/bordodannoviola.png");
}

function create_hud(s) {
    
    // 2. CREAZIONE DEL LAYER (POLIPHASER)
    livello_HUD = PP.layers.create(s);
    // Z-index alto per stare sopra tutto
    PP.layers.set_z_index(livello_HUD, 1000);

    // --- SFUMATURA ROSSA DANNO ---
    vignette_dannorosso = PP.assets.image.add(s, asset_bordo_dannorosso, 640, 360, 0.5, 0.5);
    vignette_dannorosso.geometry.scale_x = 0.5;
    vignette_dannorosso.geometry.scale_y = 0.5;
    
    // Fissiamola allo schermo
    vignette_dannorosso.tile_geometry.scroll_factor_x = 0;
    vignette_dannorosso.tile_geometry.scroll_factor_y = 0;
    
    // Trasparente all'inizio
    vignette_dannorosso.ph_obj.alpha = 0;

    // --- SFUMATURA VIOLA DANNO ---
    vignette_dannoviola = PP.assets.image.add(s, asset_bordo_dannoviola, 640, 360, 0.5, 0.5);
    vignette_dannoviola.geometry.scale_x = 0.5;
    vignette_dannoviola.geometry.scale_y = 0.5;
    
    // Fissiamola allo schermo
    vignette_dannoviola.tile_geometry.scroll_factor_x = 0;
    vignette_dannoviola.tile_geometry.scroll_factor_y = 0;
    
    // Trasparente all'inizio
    vignette_dannoviola.ph_obj.alpha = 0;


    // 1. Lo sfondo (asset_ingranaggio_0) sempre visibile
    ingranaggio_sfondo = PP.assets.image.add(s, asset_ingranaggio_0, 855, 185, 0, 0);
    ingranaggio_sfondo.tile_geometry.scroll_factor_x = 0;
    ingranaggio_sfondo.tile_geometry.scroll_factor_y = 0;
    PP.layers.add_to_layer(livello_HUD, ingranaggio_sfondo);

    // 2. I tre ingranaggi sovrapposti, inizialmente trasparenti
    ingranaggio_1 = PP.assets.image.add(s, asset_ingranaggio_1, 855, 185, 0, 0);
    ingranaggio_1.tile_geometry.scroll_factor_x = 0;
    ingranaggio_1.tile_geometry.scroll_factor_y = 0;
    ingranaggio_1.ph_obj.alpha = 0; // Invisibile
    PP.layers.add_to_layer(livello_HUD, ingranaggio_1);

    ingranaggio_2 = PP.assets.image.add(s, asset_ingranaggio_2, 855, 185, 0, 0);
    ingranaggio_2.tile_geometry.scroll_factor_x = 0;
    ingranaggio_2.tile_geometry.scroll_factor_y = 0;
    ingranaggio_2.ph_obj.alpha = 0; // Invisibile
    PP.layers.add_to_layer(livello_HUD, ingranaggio_2);

    ingranaggio_3 = PP.assets.image.add(s, asset_ingranaggio_3, 855, 185, 0, 0);
    ingranaggio_3.tile_geometry.scroll_factor_x = 0;
    ingranaggio_3.tile_geometry.scroll_factor_y = 0;
    ingranaggio_3.ph_obj.alpha = 0; // Invisibile
    PP.layers.add_to_layer(livello_HUD, ingranaggio_3);


    /* // --- BLUEPRINT (Alto a Destra - Sotto ingranaggio - Alzato di 20px) ---
    blueprint = PP.assets.image.add(s, asset_blueprint, 885, 235, 0, 0, 0, 0);
    blueprint.tile_geometry.scroll_factor_x = 0;
    blueprint.tile_geometry.scroll_factor_y = 0;
    PP.layers.add_to_layer(livello_HUD, blueprint); */


    // --- PISTOLA ANIMATA (Alto a Sinistra) ---
    pistola = PP.assets.sprite.add(s, asset_pistole, 332, 190, 0, 0);
    pistola.tile_geometry.scroll_factor_x = 0;
    pistola.tile_geometry.scroll_factor_y = 0;
    pistola.geometry.scale_x = 1.3;
    pistola.geometry.scale_y = 1.3;
    PP.layers.add_to_layer(livello_HUD, pistola);


    // --- PISTOLA FISSA (Alto a Sinistra - Stessa posizione) ---
    pistola_fissa = PP.assets.image.add(s, asset_pistola_fissa, 332, 190, 0, 0);
    pistola_fissa.tile_geometry.scroll_factor_x = 0;
    pistola_fissa.tile_geometry.scroll_factor_y = 0;
    pistola_fissa.geometry.scale_x = 1.3;
    pistola_fissa.geometry.scale_y = 1.3;
    PP.layers.add_to_layer(livello_HUD, pistola_fissa);


    // --- HEALTH BAR
    health_bar = PP.assets.sprite.add(s, asset_healthbar_sheet, 1280/2, 220, 0.5, 0.5);
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
    
    // [MODIFICA] Animazione Critica
    // Usiamo [9, 14] per un lampeggio più netto (Rosso -> Vuoto -> Rosso)
    // 4 frames per second = lampeggio visibile e non troppo frenetico
    PP.assets.sprite.animation_add_list(health_bar, "health_critical", [9, 14], 3, -1);
    
    PP.assets.sprite.animation_add_list(health_bar, "health_0", [10], 1, 0);
    PP.assets.sprite.animation_play(health_bar, "health_10");
}

function update_hud(s, player) {

    // --- 1. GESTIONE GRAFICA INGRANAGGI (SISTEMA A ID) ---
    // Controlliamo se la funzione di verifica esiste (definita nel file collezionabili)
    if (typeof is_collezionabile_preso === "function") {
        
        let id_prefisso = "";
        
        // Identifichiamo in che livello siamo (cambia i nomi con quelli delle tue scene)
        if (s.scene.key === "base") {
            // Nel livello 1 cerchiamo gli ID: ing_1, ing_2, ing_3
            ingranaggio_1.ph_obj.alpha = is_collezionabile_preso("ing_1") ? 1 : 0;
            ingranaggio_2.ph_obj.alpha = is_collezionabile_preso("ing_2") ? 1 : 0;
            ingranaggio_3.ph_obj.alpha = is_collezionabile_preso("ing_3") ? 1 : 0;
        } 
        else if (s.scene.key === "base_3") {
            // Nel livello 2 l'HUD torna "vuoto" e cerca gli ID: ing_4, ing_5, ing_6
            ingranaggio_1.ph_obj.alpha = is_collezionabile_preso("ing_L3_1") ? 1 : 0;
            ingranaggio_2.ph_obj.alpha = is_collezionabile_preso("ing_L3_2") ? 1 : 0;
            ingranaggio_3.ph_obj.alpha = is_collezionabile_preso("ing_L3_3") ? 1 : 0;
        }
    
    }
    
    // Controllo stato sblocco arma
    let is_arma_sbloccata = PP.game_state.get_variable("arma_sbloccata");

    if (is_arma_sbloccata) {
        // --- ARMA SBLOCCATA ---
        pistola_fissa.visibility.hidden = true;
        pistola.visibility.hidden = false;

        if (PP.interactive.kb.is_key_down(s, PP.key_codes.L)) {
            if (hud_tasto_R_rilasciato) {
                hud_modalita_inquinante = !hud_modalita_inquinante;
                hud_tasto_R_rilasciato = false;
            }
        } else {
            hud_tasto_R_rilasciato = true;
        }

        // Check animazione pistola per non riavviarla
        let anim_pistola_target = hud_modalita_inquinante ? "anim_inquinante" : "anim_normale";
        let anim_pistola_curr = pistola.ph_obj.anims.currentAnim ? pistola.ph_obj.anims.currentAnim.key : "";
        
        if (anim_pistola_curr !== anim_pistola_target) {
            PP.assets.sprite.animation_play(pistola, anim_pistola_target);
        }

    } else {
        // --- ARMA BLOCCATA ---
        pistola_fissa.visibility.hidden = false;
        pistola.visibility.hidden = true;
        hud_modalita_inquinante = true;
    }

    // --- HEALTH BAR (FIXED) ---
    let vita_attuale = PP.game_state.get_variable("HP_player");
    
    if (vita_attuale !== undefined) {
        let anim_target = "";

        if (vita_attuale === 1) {
            anim_target = "health_critical";
        } 
        else if (vita_attuale >= 0 && vita_attuale <= 10) {
            anim_target = "health_" + vita_attuale;
        }

        // [FIX FONDAMENTALE] 
        // Controlliamo quale animazione sta girando ORA.
        // Se è diversa da quella che vogliamo, ALLORA la facciamo partire.
        // Altrimenti non facciamo nulla (lasciando che il loop dell'animazione prosegua).
        let anim_corrente = health_bar.ph_obj.anims.currentAnim ? health_bar.ph_obj.anims.currentAnim.key : "";

        if (anim_target !== "" && anim_corrente !== anim_target) {
            PP.assets.sprite.animation_play(health_bar, anim_target);
        }
    }
}

function destroy_hud(s) {
}