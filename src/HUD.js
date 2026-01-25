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

// Variabili interne dell'HUD per gestire il tasto R indipendentemente dal player
let hud_tasto_R_rilasciato = true;
let hud_modalita_inquinante = false;

function preload_hud(s) {
    // HUD
    // Ingranaggi
    asset_ingranaggio_0 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/0_ingranaggio.png");
    asset_ingranaggio_1 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/1_ingranaggio.png");
    asset_ingranaggio_2 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/2_ingranaggio.png");
    asset_ingranaggio_3 = PP.assets.image.load(s, "assets/images/HUD/Ingranaggi/3_ingranaggio.png");

    // Blueprint
    asset_blueprint = PP.assets.image.load(s, "assets/images/HUD/Blueprint/BP_boh.png");

    // Pistola
    asset_pistole = PP.assets.sprite.load_spritesheet(s, "assets/images/HUD/Pistola/Pistole_sheet.png", 50, 40);

    //Health_bar
    asset_health_bar = PP.assets.image.load(s, "assets/images/HUD/HEALTHBAR/health_bar.png");
    asset_healthbar_sheet = PP.assets.sprite.load_spritesheet(s, "assets/images/HUD/HEALTHBAR/healthbar_sheet.png", 195, 32);

}


function create_hud(s) {
    // HUD

    // Ingranaggio
    ingranaggio = PP.assets.image.add(s, asset_ingranaggio_0, 885, 210, 0, 0, 0, 0);
    ingranaggio.ph_obj.setScrollFactor(0);

    // Blueprint
    blueprint = PP.assets.image.add(s, asset_blueprint, 885, 255, 0, 0, 0, 0);
    blueprint.ph_obj.setScrollFactor(0);

    // --- PISTOLA ---
    // 1. Creiamo lo sprite
    pistola = PP.assets.sprite.add(s, asset_pistole, 332, 210, 0, 0);
    pistola.ph_obj.setScrollFactor(0);

    // --- HEALTH BAR ---
    health_bar = PP.assets.sprite.add(s, asset_healthbar_sheet, 332, 550, 0, 0);
    health_bar.ph_obj.setScrollFactor(0);
    


    // DA SISTEMARE ASSOLUTAMENTE PERCHÈ fa schifo la pixel art ingrandita
    pistola.geometry.scale_x = 1.3;
    pistola.geometry.scale_y = 1.3;

    // 2. Definiamo le animazioni

    PP.assets.sprite.animation_add_list(pistola, "anim_normale", [1], 1, 0);
    PP.assets.sprite.animation_add_list(pistola, "anim_inquinante", [0], 1, 0);

    // Avviamo con quella normale
    PP.assets.sprite.animation_play(pistola, "anim_normale");

    // Animazioni Healthbar
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

    // --- LOGICA INDIPENDENTE (Usa variabili interne hud_*) ---
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.L)) {

        if (hud_tasto_R_rilasciato) {

            // 1. Inverto la modalità interna dell'HUD
            hud_modalita_inquinante = !hud_modalita_inquinante;

            // 2. Riproduco l'animazione corretta
            if (hud_modalita_inquinante) {
                PP.assets.sprite.animation_play(pistola, "anim_inquinante");
            } else {
                PP.assets.sprite.animation_play(pistola, "anim_normale");
            }

            // Blocco il tasto finché non viene rilasciato
            hud_tasto_R_rilasciato = false;
        }

    } else {
        // Quando rilascio il tasto R, riarmo il grilletto
        hud_tasto_R_rilasciato = true;
    }

    // Cambi di health bar in base alla vita del player
    let vita_attuale = PP.game_state.get_variable("HP_player");

    // 2. Controllo di sicurezza: se la variabile esiste, cambiamo animazione
    if (vita_attuale !== undefined) {
        
        // Componiamo il nome dell'animazione (es: se vita è 10, diventa "health_10")
        let nome_anim = "health_" + vita_attuale;
        
        // Eseguiamo l'animazione corrispondente
        PP.assets.sprite.animation_play(health_bar, nome_anim);
    }

    

    // Qui puoi mettere la logica per cambiare l'ingranaggio se serve
    /* if (ingranaggio_coll = 1){
         asset_ingranaggio_0 = asset_ingranaggio_1
     } */
}

function destroy_hud(s) {

}