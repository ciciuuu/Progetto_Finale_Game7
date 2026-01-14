let rightpressed = false;
let leftpressed = false;
let tavola_attiva;
let tavolalunga;
let home_asset;
let home_button;
let end_button;

let arrow_left; 
let arrow_right;

let arrow_left_asset; 
let arrow_right_asset;

// SCROLL
const LARGHEZZA_SCHERMO = 1280;
const NUMERO_TAVOLE = 5;

// CALCOLO LIMITE: -(NumeroTavole - 1) * Larghezza
// Esempio con 5 tavole: -(4 * 1280) = -5120. 
// Edo, per aggiungere una tavola (e farne 6), basta cambiare NUMERO_TAVOLE a 6 e il limite diventerà -6400.
const LIMITE_SCROLL = -(NUMERO_TAVOLE - 1) * LARGHEZZA_SCHERMO; 


function preload(s) {
    tavolalunga = PP.assets.image.load(s, "assets/images/tavole_storia.jpg");
    home_asset = PP.assets.image.load(s, "assets/images/PLAYER/player.png");
    arrow_left_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Freccia_sinistra.png");
    arrow_right_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Freccia_destra.png");
    

}

function create(s) {
    tavola_attiva = PP.assets.image.add(s, tavolalunga, 0, 0, 0, 0);

    // CREAZIONE BOTTONE HOME
    home_button = PP.assets.image.add(s, home_asset, 20, 550, 0, 0);
    home_button.geometry.scale_x = 0.2;
    home_button.geometry.scale_y = 0.2;

    home_button.tile_geometry.scroll_factor_x = 0; // per non farla muovere con lo scroll
    home_button.tile_geometry.scroll_factor_y = 0;

    // CREAZIONE BOTTONE FINALE (Appare solo alla fine)
    // Lo posiziono a destra (1150) per differenziarlo
    end_button = PP.assets.image.add(s, home_asset, 1150, 550, 0, 0);
    end_button.geometry.scale_x = 0.2;
    end_button.geometry.scale_y = 0.2;
    
    end_button.tile_geometry.scroll_factor_x = 0; 
    end_button.tile_geometry.scroll_factor_y = 0;
    
    // Lo nascondiamo subito, apparirà solo nell'update
    end_button.visibility.hidden = true; 

    // CREAZIONE FRECCE LATERALI
    // Freccia Sinistra
    arrow_left = PP.assets.image.add(s, arrow_left_asset, 50, 400, 0.5, 0.5);
    arrow_left.geometry.scale_x = 0.15;
    arrow_left.geometry.scale_y = 0.15;
    arrow_left.tile_geometry.scroll_factor_x = 0;
    arrow_left.tile_geometry.scroll_factor_y = 0;


    // Freccia Destra
    arrow_right = PP.assets.image.add(s, arrow_right_asset, 1230, 400, 0.5, 0.5);
    arrow_right.geometry.scale_x = 0.15;
    arrow_right.geometry.scale_y = 0.15;
    arrow_right.tile_geometry.scroll_factor_x = 0;
    arrow_right.tile_geometry.scroll_factor_y = 0;


    // INTERAZIONI MOUSE HOME BUTTON ------------------------------------
    
    // 1. CLICK (Vecchia Maniera)
    PP.interactive.mouse.add(home_button, "pointerdown", function(s) {
        PP.scenes.start("main_menu");
    });

    // 2. MOUSE SOPRA (Vecchia Maniera)
    PP.interactive.mouse.add(home_button, "pointerover", function(s) {
        s.input.manager.canvas.style.cursor = 'pointer'; 
        home_button.ph_obj.setTint(0xAAAAAA);
    });

    // 3. MOUSE FUORI (Vecchia Maniera)
    PP.interactive.mouse.add(home_button, "pointerout", function(s) {
        s.input.manager.canvas.style.cursor = 'default'; 
        home_button.ph_obj.clearTint();
    });


    // INTERAZIONI MOUSE END BUTTON ------------------------------------
    
    // 1. CLICK
    PP.interactive.mouse.add(end_button, "pointerdown", function(s) {
        PP.scenes.start("base");
    });

    // 2. MOUSE SOPRA
    PP.interactive.mouse.add(end_button, "pointerover", function(s) {
        s.input.manager.canvas.style.cursor = 'pointer'; 
        end_button.ph_obj.setTint(0xA94F93);
    });

    // 3. MOUSE FUORI
    PP.interactive.mouse.add(end_button, "pointerout", function(s) {
        s.input.manager.canvas.style.cursor = 'default'; 
        end_button.ph_obj.clearTint();
    });

    // INTERAZIONI MOUSE FRECCE ------------------------------------

    // Click Freccia Destra
    PP.interactive.mouse.add(arrow_right, "pointerdown", function(s) {
        if (tavola_attiva.geometry.x > LIMITE_SCROLL) {
            tavola_attiva.geometry.x -= LARGHEZZA_SCHERMO;
        }
    });

    // Click Freccia Sinistra
    PP.interactive.mouse.add(arrow_left, "pointerdown", function(s) {
        if (tavola_attiva.geometry.x < 0) {
            tavola_attiva.geometry.x += LARGHEZZA_SCHERMO;
        }
    });

    // Feedback visivo per le frecce (SOPRA/FUORI)
    let frecce = [arrow_left, arrow_right];
    frecce.forEach(function(f) {
        PP.interactive.mouse.add(f, "pointerover", function(s) {
            s.input.manager.canvas.style.cursor = 'pointer'; 
            f.ph_obj.setTint(0xA94F93);
        });
        PP.interactive.mouse.add(f, "pointerout", function(s) {
            s.input.manager.canvas.style.cursor = 'default'; 
            f.ph_obj.clearTint();
        });
    });

}

function update(s) {

    // LOGICA VISIBILITÀ BOTTONE FINALE E FRECCE
    // Se la tavola ha raggiunto (o superato per sicurezza) il limite di scroll, mostra il bottone
    if (tavola_attiva.geometry.x <= LIMITE_SCROLL) {
        end_button.visibility.hidden = false;
        arrow_right.visibility.hidden = true; // Nascondo la freccia se sono alla fine
    } else {
        end_button.visibility.hidden = true;
        arrow_right.visibility.hidden = false;
    }

    // Gestione visibilità Freccia Sinistra (sparisce se siamo all'inizio)
    if (tavola_attiva.geometry.x >= 0) {
        arrow_left.visibility.hidden = true;
    } else {
        arrow_left.visibility.hidden = false;
    }


    // Tasto M per menu
   /* if(PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
        PP.scenes.start("main_menu");
    } */

    // SCROLL A DESTRA
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.RIGHT) && rightpressed == false && tavola_attiva.geometry.x > LIMITE_SCROLL) {
        tavola_attiva.geometry.x -= LARGHEZZA_SCHERMO;
        rightpressed = true;
    }

    // Rilascio tasto Destra
    if(PP.interactive.kb.is_key_up(s, PP.key_codes.RIGHT) && rightpressed == true) {
        rightpressed = false;
    }


    // SCROLL A SINISTRA
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.LEFT) && leftpressed == false && tavola_attiva.geometry.x < 0) {
        tavola_attiva.geometry.x += LARGHEZZA_SCHERMO;
        leftpressed = true;
    }

    // Rilascio tasto Sinistra
    if(PP.interactive.kb.is_key_up(s, PP.key_codes.LEFT) && leftpressed == true) {
        leftpressed = false;
    }
}

function destroy(s) { }

PP.scenes.add("storia", preload, create, update, destroy);