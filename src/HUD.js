// HUD.js - MERGE: Base HUD1 (Stabile) + Funzionalità HUD2 (Blueprint/Ingranaggi)

// --- VARIABILI ASSET ---
let asset_ingranaggio_0;
let asset_ingranaggio_1;
let asset_ingranaggio_2;
let asset_ingranaggio_3;

let asset_blueprint_0;
let asset_blueprint_1;
let asset_blueprint_2;
let asset_blueprint_3;

let asset_pistole;
let asset_pistola_fissa;

let asset_health_bar;
let asset_healthbar_sheet;
let asset_bordo_dannorosso;
let asset_bordo_dannoviola;

// --- OGGETTI IN SCENA ---
// Variabili per gli oggetti separati (prese da HUD2)
let ingranaggio_sfondo;
let ingranaggio_1;
let ingranaggio_2;
let ingranaggio_3;

let blueprint_sfondo;
let blueprint_1;
let blueprint_2;
let blueprint_3;

let pistola;
let pistola_fissa;
let health_bar;
let vignette_dannorosso;
let vignette_dannoviola;

// --- LAYER E STATO ---
let livello_HUD;
let hud_tasto_R_rilasciato = true;
let hud_modalita_inquinante = false;

function preload_hud(s) {
    // 1. INGRANAGGI (Caricamento separato da HUD2)
    asset_ingranaggio_0 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/0_ingranaggio.png");
    asset_ingranaggio_1 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/1_ingranaggio.png");
    asset_ingranaggio_2 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/2_ingranaggio.png");
    asset_ingranaggio_3 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/3_ingranaggio.png");

    // 2. BLUEPRINT (Caricamento separato da HUD2)
    asset_blueprint_0 = PP.assets.image.load(s, "assets/images/HUD/Blueprint/0_blueprint.png");
    asset_blueprint_1 = PP.assets.image.load(s, "assets/images/HUD/Blueprint/1_blueprint.png");
    asset_blueprint_2 = PP.assets.image.load(s, "assets/images/HUD/Blueprint/2_blueprint.png");
    asset_blueprint_3 = PP.assets.image.load(s, "assets/images/HUD/Blueprint/3_blueprint.png");

    // 3. PISTOLE (Da HUD1/HUD2)
    asset_pistole = PP.assets.sprite.load_spritesheet(s, "assets/images/HUD/Pistola/Pistole_sheet.png", 50, 40);
    asset_pistola_fissa = PP.assets.image.load(s, "assets/images/HUD/Pistola/Pistola_inquinante.png");

    // 4. BARRA VITA ED EFFETTI (Da HUD1)
    asset_health_bar = PP.assets.image.load(s, "assets/images/HUD/HEALTHBAR/health_bar.png");
    asset_healthbar_sheet = PP.assets.sprite.load_spritesheet(s, "assets/images/HUD/HEALTHBAR/healthbar_sheet.png", 195, 32);

    asset_bordo_dannorosso = PP.assets.image.load(s, "assets/images/HUD/HEALTHBAR/bordodannorosso.png");
    asset_bordo_dannoviola = PP.assets.image.load(s, "assets/images/HUD/HEALTHBAR/bordodannoviola.png");
}

function create_hud(s) {
    
    // LAYER HUD (Sopra tutto)
    livello_HUD = PP.layers.create(s);
    PP.layers.set_z_index(livello_HUD, 1000);

    // --- EFFETTI DANNO ---
    vignette_dannorosso = PP.assets.image.add(s, asset_bordo_dannorosso, 640, 360, 0.5, 0.5);
    vignette_dannorosso.geometry.scale_x = 0.5; vignette_dannorosso.geometry.scale_y = 0.5;
    vignette_dannorosso.tile_geometry.scroll_factor_x = 0; vignette_dannorosso.tile_geometry.scroll_factor_y = 0;
    vignette_dannorosso.ph_obj.alpha = 0;

    vignette_dannoviola = PP.assets.image.add(s, asset_bordo_dannoviola, 640, 360, 0.5, 0.5);
    vignette_dannoviola.geometry.scale_x = 0.5; vignette_dannoviola.geometry.scale_y = 0.5;
    vignette_dannoviola.tile_geometry.scroll_factor_x = 0; vignette_dannoviola.tile_geometry.scroll_factor_y = 0;
    vignette_dannoviola.ph_obj.alpha = 0;

    // --- INGRANAGGI (Logica HUD2 inserita qui) ---
    // Usiamo le coordinate di HUD2 (855, 192) per i pezzi separati
    
    // Sfondo (Sempre visibile)
    ingranaggio_sfondo = PP.assets.image.add(s, asset_ingranaggio_0, 855, 192, 0, 0);
    ingranaggio_sfondo.tile_geometry.scroll_factor_x = 0; ingranaggio_sfondo.tile_geometry.scroll_factor_y = 0;
    PP.layers.add_to_layer(livello_HUD, ingranaggio_sfondo);

    // Pezzi (Inizialmente invisibili)
    ingranaggio_1 = PP.assets.image.add(s, asset_ingranaggio_1, 855, 192, 0, 0);
    ingranaggio_1.tile_geometry.scroll_factor_x = 0; ingranaggio_1.tile_geometry.scroll_factor_y = 0;
    ingranaggio_1.ph_obj.alpha = 0;
    PP.layers.add_to_layer(livello_HUD, ingranaggio_1);

    ingranaggio_2 = PP.assets.image.add(s, asset_ingranaggio_2, 855, 192, 0, 0);
    ingranaggio_2.tile_geometry.scroll_factor_x = 0; ingranaggio_2.tile_geometry.scroll_factor_y = 0;
    ingranaggio_2.ph_obj.alpha = 0;
    PP.layers.add_to_layer(livello_HUD, ingranaggio_2);

    ingranaggio_3 = PP.assets.image.add(s, asset_ingranaggio_3, 855, 192, 0, 0);
    ingranaggio_3.tile_geometry.scroll_factor_x = 0; ingranaggio_3.tile_geometry.scroll_factor_y = 0;
    ingranaggio_3.ph_obj.alpha = 0;
    PP.layers.add_to_layer(livello_HUD, ingranaggio_3);

    // --- BLUEPRINT (Logica HUD2 inserita qui) ---
    // Usiamo le coordinate di HUD2 (885, 228) per i pezzi separati
    
    // Sfondo
    blueprint_sfondo = PP.assets.image.add(s, asset_blueprint_0, 885, 228, 0, 0);
    blueprint_sfondo.tile_geometry.scroll_factor_x = 0; blueprint_sfondo.tile_geometry.scroll_factor_y = 0;
    PP.layers.add_to_layer(livello_HUD, blueprint_sfondo);

    // Pezzi
    blueprint_1 = PP.assets.image.add(s, asset_blueprint_1, 885, 228, 0, 0);
    blueprint_1.tile_geometry.scroll_factor_x = 0; blueprint_1.tile_geometry.scroll_factor_y = 0;
    blueprint_1.ph_obj.alpha = 0;
    PP.layers.add_to_layer(livello_HUD, blueprint_1);

    blueprint_2 = PP.assets.image.add(s, asset_blueprint_2, 885, 228, 0, 0);
    blueprint_2.tile_geometry.scroll_factor_x = 0; blueprint_2.tile_geometry.scroll_factor_y = 0;
    blueprint_2.ph_obj.alpha = 0;
    PP.layers.add_to_layer(livello_HUD, blueprint_2);

    blueprint_3 = PP.assets.image.add(s, asset_blueprint_3, 885, 228, 0, 0);
    blueprint_3.tile_geometry.scroll_factor_x = 0; blueprint_3.tile_geometry.scroll_factor_y = 0;
    blueprint_3.ph_obj.alpha = 0;
    PP.layers.add_to_layer(livello_HUD, blueprint_3);

    // --- PISTOLE ---
    pistola = PP.assets.sprite.add(s, asset_pistole, 332, 190, 0, 0);
    pistola.tile_geometry.scroll_factor_x = 0; pistola.tile_geometry.scroll_factor_y = 0;
    pistola.geometry.scale_x = 1.3; pistola.geometry.scale_y = 1.3;
    PP.layers.add_to_layer(livello_HUD, pistola);

    pistola_fissa = PP.assets.image.add(s, asset_pistola_fissa, 332, 190, 0, 0);
    pistola_fissa.tile_geometry.scroll_factor_x = 0; pistola_fissa.tile_geometry.scroll_factor_y = 0;
    pistola_fissa.geometry.scale_x = 1.3; pistola_fissa.geometry.scale_y = 1.3;
    PP.layers.add_to_layer(livello_HUD, pistola_fissa);

    // --- HEALTH BAR ---
    health_bar = PP.assets.sprite.add(s, asset_healthbar_sheet, 1280/2, 220, 0.5, 0.5);
    health_bar.tile_geometry.scroll_factor_x = 0; health_bar.tile_geometry.scroll_factor_y = 0;
    PP.layers.add_to_layer(livello_HUD, health_bar);

    // --- ANIMAZIONI ---
    PP.assets.sprite.animation_add_list(pistola, "anim_normale", [1], 1, 0);
    PP.assets.sprite.animation_add_list(pistola, "anim_inquinante", [0], 1, 0);
    PP.assets.sprite.animation_play(pistola, "anim_normale");

    // Animazioni Vita
    PP.assets.sprite.animation_add_list(health_bar, "health_10", [0], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_9", [1], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_8", [2], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_7", [3], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_6", [4], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_5", [5], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_4", [6], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_3", [7], 1, 0);
    PP.assets.sprite.animation_add_list(health_bar, "health_2", [8], 1, 0);
    
    // [IMPOSTAZIONE DA HUD1] Frame 9 e 14
    PP.assets.sprite.animation_add_list(health_bar, "health_critical", [9, 11], 3, -1);
    
    PP.assets.sprite.animation_add_list(health_bar, "health_0", [10], 1, 0);
    PP.assets.sprite.animation_play(health_bar, "health_10");
}

function update_hud(s, player) {

    // --- 1. GESTIONE GRAFICA INGRANAGGI (Logica presa da HUD2) ---
    if (typeof is_collezionabile_preso === "function") {
        
        if (s.scene.key === "base") {
            ingranaggio_1.ph_obj.alpha = is_collezionabile_preso("ing_1") ? 1 : 0;
            ingranaggio_2.ph_obj.alpha = is_collezionabile_preso("ing_2") ? 1 : 0;
            ingranaggio_3.ph_obj.alpha = is_collezionabile_preso("ing_3") ? 1 : 0;

            blueprint_1.ph_obj.alpha = is_collezionabile_preso("bp_1") ? 1 : 0;
            blueprint_2.ph_obj.alpha = is_collezionabile_preso("bp_2") ? 1 : 0;
            blueprint_3.ph_obj.alpha = is_collezionabile_preso("bp_3") ? 1 : 0;
        } 
        else if (s.scene.key === "base_3") {
            ingranaggio_1.ph_obj.alpha = is_collezionabile_preso("ing_L3_1") ? 1 : 0;
            ingranaggio_2.ph_obj.alpha = is_collezionabile_preso("ing_L3_2") ? 1 : 0;
            ingranaggio_3.ph_obj.alpha = is_collezionabile_preso("ing_L3_3") ? 1 : 0;

            blueprint_1.ph_obj.alpha = is_collezionabile_preso("bp_L3_1") ? 1 : 0;
            blueprint_2.ph_obj.alpha = is_collezionabile_preso("bp_L3_2") ? 1 : 0;
            blueprint_3.ph_obj.alpha = is_collezionabile_preso("bp_L3_3") ? 1 : 0;
        }
    }
    
    // --- 2. CONTROLLO ARMA ---
    let is_arma_sbloccata = PP.game_state.get_variable("arma_sbloccata");

    if (is_arma_sbloccata) {
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

        let anim_pistola_target = hud_modalita_inquinante ? "anim_inquinante" : "anim_normale";
        let anim_pistola_curr = pistola.ph_obj.anims.currentAnim ? pistola.ph_obj.anims.currentAnim.key : "";
        
        if (anim_pistola_curr !== anim_pistola_target) {
            PP.assets.sprite.animation_play(pistola, anim_pistola_target);
        }

    } else {
        pistola_fissa.visibility.hidden = false;
        pistola.visibility.hidden = true;
        hud_modalita_inquinante = true;
    }

    // --- 3. HEALTH BAR (Logica presa da HUD1 che NON crasha) ---
    let vita_attuale = PP.game_state.get_variable("HP_player");
    
    // Questo controllo if(vita_attuale !== undefined) era presente nel codice che hai indicato come funzionante
    if (vita_attuale !== undefined) {
        let anim_target = "";

        if (vita_attuale === 1) {
            anim_target = "health_critical";
        } 
        else if (vita_attuale >= 0 && vita_attuale <= 10) {
            anim_target = "health_" + vita_attuale;
        }

        // Logica di controllo per non riavviare l'animazione se è già in corso
        let anim_corrente = health_bar.ph_obj.anims.currentAnim ? health_bar.ph_obj.anims.currentAnim.key : "";

        if (anim_target !== "" && anim_corrente !== anim_target) {
            PP.assets.sprite.animation_play(health_bar, anim_target);
        }
    }
}

function destroy_hud(s) {
}