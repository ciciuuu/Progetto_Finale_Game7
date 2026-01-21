// HUD.js

let asset_ingranaggio_0;
let asset_ingranaggio_1;
let asset_ingranaggio_2;
let asset_ingranaggio_3;
let ingranaggio;
let asset_health_bar;

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

    health_bar = PP.assets.image.add(s, asset_health_bar, 332, 550, 0, 0);
    health_bar.ph_obj.setScrollFactor(0);
    


    // DA SISTEMARE ASSOLUTAMENTE PERCHÈ fa schifo la pixel art ingrandita
    pistola.geometry.scale_x = 1.3;
    pistola.geometry.scale_y = 1.3;

    // 2. Definiamo le animazioni

    PP.assets.sprite.animation_add_list(pistola, "anim_normale", [1], 1, 0);
    PP.assets.sprite.animation_add_list(pistola, "anim_inquinante", [0], 1, 0);

    // Avviamo con quella normale
    PP.assets.sprite.animation_play(pistola, "anim_normale");
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

    // Qui puoi mettere la logica per cambiare l'ingranaggio se serve
    /* if (ingranaggio_coll = 1){
         asset_ingranaggio_0 = asset_ingranaggio_1
     } */
}

function destroy_hud(s) {

}