let rightpressed = false;
let leftpressed = false;
let tavola_attiva;
let tavolalunga;
let home_asset;
let home_button;
let gioca_button;
let gioca_asset

let slide_curr_sheet;
let slide_curr;

let arrow_left;
let arrow_right;

let arrow_left_asset;
let arrow_right_asset;

// SCROLL
const LARGHEZZA_SCHERMO = 1280;
const ALTEZZA_SCHERMO = 720; // Imposta l'altezza corretta del tuo gioco
const NUMERO_TAVOLE = 6;
const LIMITE_SCROLL = -(NUMERO_TAVOLE - 1) * LARGHEZZA_SCHERMO;

// --- VARIABILI TESTO (Aggiornate per 1, 3, 5) ---
let txt_tavola_1;
let txt_tavola_3;
let txt_tavola_5;

// --- CONFIGURAZIONE TESTO ---
const TEXT_SIZE = 30;           // Grandezza font
const MAX_CARATTERI_RIGA = 50;  // Larghezza riga (influisce sulla larghezza del blocco)
const COLORE_TESTO = "0x000000"; // Nero


function preload(s) {
    // tavolalunga = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/tavole_storia.jpg");
    tavolalunga = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/tavole_storia_wordless.jpg");
    home_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/pulsante menu.png");
    gioca_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/pulsante gioca.png");
    arrow_left_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/Freccia_sinistra.png");
    arrow_right_asset = PP.assets.image.load(s, "assets/images/TAVOLE/Elementi tavole/Freccia_destra.png");
    slide_curr_sheet= PP.assets.sprite.load_spritesheet(s, "assets/images/TAVOLE/Elementi tavole/puntitavole_sheet.png", 300, 100);
}

function create(s) {
    tavola_attiva = PP.assets.image.add(s, tavolalunga, 0, 0, 0, 0);

    // --- FUNZIONE PER MANDARE A CAPO IL TESTO (NO PHASER) ---
    function formatta_testo(testo, max_chars) {
        let paragrafi = testo.split("\n"); // Divide il testo dove hai messo \n
        let risultato_finale = "";

        for (let k = 0; k < paragrafi.length; k++) {
            let parole = paragrafi[k].split(" ");
            let riga_corrente = "";

            for (let i = 0; i < parole.length; i++) {
                let parola = parole[i];
                // Se la parola supera la lunghezza massima, manda a capo la riga corrente
                if ((riga_corrente + parola).length > max_chars) {
                    risultato_finale += riga_corrente + "\n";
                    riga_corrente = "";
                }
                riga_corrente += parola + " ";
            }
            // Aggiunge l'ultima riga del paragrafo corrente
            risultato_finale += riga_corrente.trim();
            
            // Se non è l'ultimo paragrafo, rimette il 'capo' originale
            if (k < paragrafi.length - 1) {
                risultato_finale += "\n"; 
            }
        }
        return risultato_finale;
    }

    // --- ESEMPIO CONTENUTI CON PARAGRAFI ---
    // Aggiornato per Tavole 1, 3, 5
    
    let stringa_t1 = "Il villaggio di Kale riceveva energia da un enorme macchinario alimentato da carbone e petrolio.\n\nTutti lo chiamavano la Grande Fornace, perché il suo calore garantiva la regolazione termica dell'interno villaggio durante le gelide notti del deserto.\n\nEra la loro luce, la loro sicurezza.";
    let stringa_t3 = "Un giorno, però, la Grande Fornace esplose.\n\nNello scoppio, dei componenti fondamentali furono scagliati lontano, dispersi nelle terre circostanti.";
    let stringa_t5 = "Il villaggio piombò nel caos.\n\nSi decise che sarebbe stata Eren, la tecnica del villaggio, a partire per recuperare i pezzi perduti.";

    // Creazione oggetti testo
    // Tavola 1, Tavola 3, Tavola 5
    
    txt_tavola_1 = PP.shapes.text_styled_add(s, 0, 0, formatta_testo(stringa_t1, MAX_CARATTERI_RIGA), TEXT_SIZE, "Cadeaux", "normal", COLORE_TESTO, null, 0.5, 0.5);
    txt_tavola_3 = PP.shapes.text_styled_add(s, 0, 0, formatta_testo(stringa_t3, MAX_CARATTERI_RIGA), TEXT_SIZE, "Cadeaux", "normal", COLORE_TESTO, null, 0.5, 0.5);
    txt_tavola_5 = PP.shapes.text_styled_add(s, 0, 0, formatta_testo(stringa_t5, MAX_CARATTERI_RIGA), TEXT_SIZE, "Cadeaux", "normal", COLORE_TESTO, null, 0.5, 0.5);


    function setup_bottone(oggetto, scala_base, scala_zoom) {
        oggetto.geometry.scale_x = scala_base; 
        oggetto.geometry.scale_y = scala_base;
        
        oggetto.tile_geometry.scroll_factor_x = 0;
        oggetto.tile_geometry.scroll_factor_y = 0;

        PP.interactive.mouse.add(oggetto, "pointerover", function (s) {
            s.input.manager.canvas.style.cursor = 'pointer';
            oggetto.geometry.scale_x = scala_zoom;
            oggetto.geometry.scale_y = scala_zoom;
            oggetto.ph_obj.setTint(0xAAAAAA);
        });

        PP.interactive.mouse.add(oggetto, "pointerout", function (s) {
            s.input.manager.canvas.style.cursor = 'default';
            oggetto.geometry.scale_x = scala_base;
            oggetto.geometry.scale_y = scala_base;
            oggetto.ph_obj.clearTint();
        });

        PP.interactive.mouse.add(oggetto, "pointerdown", function (s) {
            oggetto.geometry.scale_x = scala_base;
            oggetto.geometry.scale_y = scala_base;
        });
        
        PP.interactive.mouse.add(oggetto, "pointerup", function (s) {
            oggetto.geometry.scale_x = scala_zoom;
            oggetto.geometry.scale_y = scala_zoom;
        });
    }

    // HOME BUTTON
    home_button = PP.assets.image.add(s, home_asset, -70, 570, 0, 0);
    setup_bottone(home_button, 1, 1);
    
    
    PP.interactive.mouse.add(home_button, "pointerup", function (s) {
        PP.scenes.start("main_menu");
    });


    // END BUTTON
    gioca_button = PP.assets.image.add(s, gioca_asset, 1050, 570, 0, 0);
    gioca_button.visibility.hidden = true;
    setup_bottone(gioca_button, 1, 1);
    

    PP.interactive.mouse.add(gioca_button, "pointerup", function (s) {
        PP.scenes.start("base");
    });


    // FRECCIA SINISTRA
    arrow_left = PP.assets.image.add(s, arrow_left_asset, 50, 360, 0.5, 0.5);
    setup_bottone(arrow_left, 0.80, 0.80);

    PP.interactive.mouse.add(arrow_left, "pointerdown", function (s) {
        if (tavola_attiva.geometry.x < 0) {
            tavola_attiva.geometry.x += LARGHEZZA_SCHERMO;
        }
    });


    // FRECCIA DESTRA
    arrow_right = PP.assets.image.add(s, arrow_right_asset, 1230, 360, 0.5, 0.5);
    setup_bottone(arrow_right, 0.80, 0.80);

    PP.interactive.mouse.add(arrow_right, "pointerdown", function (s) {
        if (tavola_attiva.geometry.x > LIMITE_SCROLL) {
            tavola_attiva.geometry.x -= LARGHEZZA_SCHERMO;
        }
    });

    // INDICATORE TAVOLE
    slide_curr = PP.assets.sprite.add(s, slide_curr_sheet, 490, 608, 0, 0);
    
    PP.assets.sprite.animation_add_list(slide_curr, "slide_1", [0], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_2", [1], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_3", [2], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_4", [3], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_5", [4], 1, 0);
    PP.assets.sprite.animation_add_list(slide_curr, "slide_6", [5], 1, 0);

}

function update(s) {

    // LOGICA VISIBILITÀ
    if (tavola_attiva.geometry.x <= LIMITE_SCROLL) {
        gioca_button.visibility.hidden = false;
        arrow_right.visibility.hidden = true; 
    } else {
        gioca_button.visibility.hidden = true;
        arrow_right.visibility.hidden = false;
    }

    if (tavola_attiva.geometry.x >= 0) {
        arrow_left.visibility.hidden = true;
    } else {
        arrow_left.visibility.hidden = false;
    }

    // --- LOGICA TASTIERA ---
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.RIGHT) && rightpressed == false && tavola_attiva.geometry.x > LIMITE_SCROLL) {
        tavola_attiva.geometry.x -= LARGHEZZA_SCHERMO;
        rightpressed = true;
    }
    if (PP.interactive.kb.is_key_up(s, PP.key_codes.RIGHT) && rightpressed == true) {
        rightpressed = false;
    }

    if (PP.interactive.kb.is_key_down(s, PP.key_codes.LEFT) && leftpressed == false && tavola_attiva.geometry.x < 0) {
        tavola_attiva.geometry.x += LARGHEZZA_SCHERMO;
        leftpressed = true;
    }
    if (PP.interactive.kb.is_key_up(s, PP.key_codes.LEFT) && leftpressed == true) {
        leftpressed = false;
    }

    // --- AGGIORNAMENTO POSIZIONE TESTI (CENTRATI AUTOMATICAMENTE) ---
    // NOTA: Tavola 1 è indice 0, Tavola 3 è indice 2, Tavola 5 è indice 4
    
    // Tavola 1 (Indice 0)
    txt_tavola_1.geometry.x = tavola_attiva.geometry.x + (0 * LARGHEZZA_SCHERMO) + (LARGHEZZA_SCHERMO / 2);
    txt_tavola_1.geometry.y = ALTEZZA_SCHERMO / 2;

    // Tavola 3 (Indice 2)
    txt_tavola_3.geometry.x = tavola_attiva.geometry.x + (2 * LARGHEZZA_SCHERMO) + (LARGHEZZA_SCHERMO / 2);
    txt_tavola_3.geometry.y = ALTEZZA_SCHERMO / 2;

    // Tavola 5 (Indice 4)
    txt_tavola_5.geometry.x = tavola_attiva.geometry.x + (4 * LARGHEZZA_SCHERMO) + (LARGHEZZA_SCHERMO / 2);
    txt_tavola_5.geometry.y = ALTEZZA_SCHERMO / 2;


    // AGGIORNAMENTO ANIMAZIONE INDICATORE TAVOLE    
    let indice_tavola = Math.abs(tavola_attiva.geometry.x) / LARGHEZZA_SCHERMO;
    indice_tavola = Math.round(indice_tavola);
    let nome_animazione = "slide_" + (indice_tavola + 1);
    PP.assets.sprite.animation_play(slide_curr, nome_animazione);
}

function destroy(s) { }

PP.scenes.add("storia", preload, create, update, destroy);