// HUD.js

let asset_ingranaggio_0;
let asset_ingranaggio_1;
let asset_ingranaggio_2;
let asset_ingranaggio_3;
let ingranaggio;

let asset_health_bar;
let asset_healthbar_sheet;
let health_bar;

let asset_blueprint;
let blueprint;

let asset_pistole;
let pistola;

// 1. DICHIARAZIONE VARIABILE LAYER (Globale)
// Il nuovo livello restituito deve essere salvato in una variabile [cite: 36, 48]
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
    asset_pistole = PP.assets.sprite.load_spritesheet(s, "assets/images/HUD/Pistola/Pistole_sheet.png", 50, 40);

    asset_health_bar = PP.assets.image.load(s, "assets/images/HUD/HEALTHBAR/health_bar.png");
    asset_healthbar_sheet = PP.assets.sprite.load_spritesheet(s, "assets/images/HUD/HEALTHBAR/healthbar_sheet.png", 195, 32);
}

function create_hud(s) {
    
    // -------------------------------------------------------------
    // 2. CREAZIONE DEL LAYER (Tassativo secondo PDF)
    // -------------------------------------------------------------
    // Creiamo un nuovo livello vuoto [cite: 33]
    livello_HUD = PP.layers.create(s);

    // Assegniamo un z-index specifico al layer [cite: 59]
    // 1000 assicura che sia davanti a tutto (background, player, nemici)
    PP.layers.set_z_index(livello_HUD, 1000);


    // --- INGRANAGGIO ---
    ingranaggio = PP.assets.image.add(s, asset_ingranaggio_0, 885, 210, 0, 0, 0, 0);
    ingranaggio.ph_obj.setScrollFactor(0); 
    
    // Aggiungiamo l'oggetto al livello [cite: 40]
    PP.layers.add_to_layer(livello_HUD, ingranaggio);


    // --- BLUEPRINT ---
    blueprint = PP.assets.image.add(s, asset_blueprint, 885, 255, 0, 0, 0, 0);
    blueprint.ph_obj.setScrollFactor(0);
    
    // Aggiungiamo l'oggetto al livello 
    PP.layers.add_to_layer(livello_HUD, blueprint);


    // --- PISTOLA ---
    pistola = PP.assets.sprite.add(s, asset_pistole, 332, 210, 0, 0);
    pistola.ph_obj.setScrollFactor(0);
    pistola.geometry.scale_x = 1.3;
    pistola.geometry.scale_y = 1.3;
    
    // Aggiungiamo l'oggetto al livello [cite: 42]
    PP.layers.add_to_layer(livello_HUD, pistola);


    // --- HEALTH BAR ---
    health_bar = PP.assets.sprite.add(s, asset_healthbar_sheet, 332, 550, 0, 0);
    health_bar.ph_obj.setScrollFactor(0);
    
    // Aggiungiamo l'oggetto al livello [cite: 55]
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
    // --- LOGICA INDIPENDENTE ---
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

    // --- HEALTH BAR ---
    let vita_attuale = PP.game_state.get_variable("HP_player");
    if (vita_attuale !== undefined) {
        let nome_anim = "health_" + vita_attuale;
        PP.assets.sprite.animation_play(health_bar, nome_anim);
    }
}

function destroy_hud(s) {
}