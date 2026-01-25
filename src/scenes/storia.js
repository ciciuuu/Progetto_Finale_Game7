let rightpressed = false;
let leftpressed = false;
let tavola_attiva;
let tavolalunga;
let home_asset;
let home_button;
let end_button;

let slide_curr_sheet;
let slide_curr;

let arrow_left;
let arrow_right;

let arrow_left_asset;
let arrow_right_asset;

// SCROLL
const LARGHEZZA_SCHERMO = 1280;
const NUMERO_TAVOLE = 5;
const LIMITE_SCROLL = -(NUMERO_TAVOLE - 1) * LARGHEZZA_SCHERMO;


function preload(s) {
    tavolalunga = PP.assets.image.load(s, "assets/images/tavole_storia.jpg");
    home_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Cartello_menù.png");
    arrow_left_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Freccia_sinistra.png");
    arrow_right_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Freccia_destra.png");
    slide_curr_sheet= PP.assets.sprite.load_spritesheet(s, "assets/images/TAVOLE/puntitavole_sheet.png", 300, 100);
}

function create(s) {
    tavola_attiva = PP.assets.image.add(s, tavolalunga, 0, 0, 0, 0);

    function setup_bottone(oggetto, scala_base, scala_zoom) {
        oggetto.geometry.scale_x = scala_base; // scala iniziale
        oggetto.geometry.scale_y = scala_base;
        
        oggetto.tile_geometry.scroll_factor_x = 0;
        oggetto.tile_geometry.scroll_factor_y = 0;

        // Mouse over
        PP.interactive.mouse.add(oggetto, "pointerover", function (s) {
            s.input.manager.canvas.style.cursor = 'pointer';
            oggetto.geometry.scale_x = scala_zoom;
            oggetto.geometry.scale_y = scala_zoom;
            oggetto.ph_obj.setTint(0xAAAAAA);
        });

        // Mouse out
        PP.interactive.mouse.add(oggetto, "pointerout", function (s) {
            s.input.manager.canvas.style.cursor = 'default';
            oggetto.geometry.scale_x = scala_base;
            oggetto.geometry.scale_y = scala_base;
            oggetto.ph_obj.clearTint();
        });

        // Click
        PP.interactive.mouse.add(oggetto, "pointerdown", function (s) {
            oggetto.geometry.scale_x = scala_base;
            oggetto.geometry.scale_y = scala_base;
        });
        
        // Rilascio click
        PP.interactive.mouse.add(oggetto, "pointerup", function (s) {
            oggetto.geometry.scale_x = scala_zoom;
            oggetto.geometry.scale_y = scala_zoom;
        });
    }

    // HOME BUTTON
    home_button = PP.assets.image.add(s, home_asset, 20, 550, 0, 0);
    setup_bottone(home_button, 0.2, 0.25); // Scala normale 0.2, Zoom 0.25
    
    // Click per andare alla Home
    PP.interactive.mouse.add(home_button, "pointerup", function (s) {
        PP.scenes.start("main_menu");
    });


    // END BUTTON
    end_button = PP.assets.image.add(s, home_asset, 1150, 550, 0, 0);
    end_button.visibility.hidden = true;
    setup_bottone(end_button, 0.2, 0.25);

    // Click per avvio gioco
    PP.interactive.mouse.add(end_button, "pointerup", function (s) {
        PP.scenes.start("base");
    });


    // FRECCIA SINISTRA
    arrow_left = PP.assets.image.add(s, arrow_left_asset, 50, 400, 0.5, 0.5);
    setup_bottone(arrow_left, 0.15, 0.18);

    // Click freccia sinistra
    PP.interactive.mouse.add(arrow_left, "pointerdown", function (s) {
        if (tavola_attiva.geometry.x < 0) {
            tavola_attiva.geometry.x += LARGHEZZA_SCHERMO;
        }
    });


    // FRECCIA DESTRA
    arrow_right = PP.assets.image.add(s, arrow_right_asset, 1230, 400, 0.5, 0.5);
    setup_bottone(arrow_right, 0.15, 0.18);

    // Click freccia destra
    PP.interactive.mouse.add(arrow_right, "pointerdown", function (s) {
        if (tavola_attiva.geometry.x > LIMITE_SCROLL) {
            tavola_attiva.geometry.x -= LARGHEZZA_SCHERMO;
        }
    });

    // INDICATORE TAVOLE
    slide_curr = PP.assets.sprite.add(s, slide_curr_sheet, 490, 700, 0, 0);
    

    // Animazioni indicatore tavole
    PP.assets.sprite.animation_add_list(slide_curr, "slide_1", [0], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_2", [1], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_3", [2], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_4", [3], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_5", [4], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_6", [5], 1, 0);

}

function update(s) {

    // LOGICA VISIBILITÀ BOTTONE FINALE E FRECCE
    if (tavola_attiva.geometry.x <= LIMITE_SCROLL) {
        end_button.visibility.hidden = false;
        arrow_right.visibility.hidden = true; 
    } else {
        end_button.visibility.hidden = true;
        arrow_right.visibility.hidden = false;
    }

    if (tavola_attiva.geometry.x >= 0) {
        arrow_left.visibility.hidden = true;
    } else {
        arrow_left.visibility.hidden = false;
    }

    // --- LOGICA TASTIERA (Mantenuta uguale) ---

    // SCROLL A DESTRA
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.RIGHT) && rightpressed == false && tavola_attiva.geometry.x > LIMITE_SCROLL) {
        tavola_attiva.geometry.x -= LARGHEZZA_SCHERMO;
        rightpressed = true;
    }
    if (PP.interactive.kb.is_key_up(s, PP.key_codes.RIGHT) && rightpressed == true) {
        rightpressed = false;
    }

    // SCROLL A SINISTRA
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.LEFT) && leftpressed == false && tavola_attiva.geometry.x < 0) {
        tavola_attiva.geometry.x += LARGHEZZA_SCHERMO;
        leftpressed = true;
    }
    if (PP.interactive.kb.is_key_up(s, PP.key_codes.LEFT) && leftpressed == true) {
        leftpressed = false;
    }

    // AGGIORNAMENTO ANIMAZIONE INDICATORE TAVOLE    
    // Calcoliamo l'indice della tavola (0, 1, 2, 3, 4)
    // Usiamo Math.abs per rendere il numero positivo e dividiamo per la larghezza
    let indice_tavola = Math.abs(tavola_attiva.geometry.x) / LARGHEZZA_SCHERMO;
    
    // Arrotondiamo per sicurezza
    indice_tavola = Math.round(indice_tavola);

    // Poiché le tue animazioni si chiamano "slide_1", "slide_2", ecc.
    // ma l'indice parte da 0, aggiungiamo +1
    let nome_animazione = "slide_" + (indice_tavola + 1);

    // Cambiamo l'animazione dell'indicatore
    PP.assets.sprite.animation_play(slide_curr, nome_animazione);
}

function destroy(s) { }

PP.scenes.add("storia", preload, create, update, destroy);