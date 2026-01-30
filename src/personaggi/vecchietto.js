// --- VARIABILI GLOBALI VECCHIETTO ---
let img_vecchietto;
let vecchietto;
let sensore_dialogo; 
let img_tasto_S;
let tasto_S;         

// --- ELEMENTI UI ---
let testo_schermo;   
let sfondo_testo;    

// --- LAYERS ---
let layer_bg_ui; 
let layer_fg_ui; 
let layer_game;  

// --- STATI DEL DIALOGO ---
let dialogo_iniziato = false;
let dialogo_finito = false;
let tasto_rilasciato = true; 
let indice_frase = 0;
let tutorial_finale_attivo = false;

// Variabili di stato per gestire le animazioni senza reset continui
let animazione_corrente_vecchietto = ""; 
let animazione_corrente_tasto = "";

// Variabile per disabilitare totalmente il vecchietto se arma già presa
let vecchietto_disabilitato = false;

// ==========================================
// --- CONFIGURAZIONE BOX E TESTO ---
// ==========================================

// Dimensioni e aspetto del rettangolo dietro il testo
const BOX_WIDTH = 800;
const BOX_HEIGHT = 120;
const BOX_ALPHA = 0.3; // Trasparenza
const BOX_COLOR = "0x000000"; // Nero

// Dopo quanti caratteri andare a capo
const MAX_CHARS_DIALOGO = 60; 


// --- FRASI DEL DIALOGO ---
let frasi_vecchietto = [
    { id: "GEM", testo: "GEM: Ciao giovane macchinista, cosa fai fuori dalle mura?" },
    { id: "EREN", testo: "EREN: Sto andando a cercare i meccanismi andati perduti nell’esplosione della Grande Fornace." },
    { id: "GEM", testo: "GEM: Ho capito, ho visto l’esplosione." },
    { id: "GEM", testo: "GEM: Allora ti potrebbero essere utili i miei progetti per migliorare la Grande Fornace, sono nascosti nelle vicinanze." },
    { id: "GEM", testo: "GEM: Io non posso venire con te: sono troppo vecchio e i mostri del deserto mi hanno ferito alla gamba." },
    { id: "GEM", testo: "GEM: Ma posso darti questa quest’arma a carica solare." },
    { id: "GEM", testo: "GEM: Non sarà potente come la pistola a combustione che hai con te adesso, ma quantomeno non ti danneggia con la sua fiammata tossica." },
    { id: "GEM", testo: "GEM: Vai adesso, che il destino sia con te!" },
    { id: "EREN", testo: "EREN: Ok grazie mille." }
];

// Funzione helper per il word-wrap manuale
function formatta_testo_dialogo(testo, max_chars) {
    let paragrafi = testo.split("\n");
    let risultato_finale = "";

    for (let k = 0; k < paragrafi.length; k++) {
        let parole = paragrafi[k].split(" ");
        let riga_corrente = "";

        for (let i = 0; i < parole.length; i++) {
            let parola = parole[i];
            if ((riga_corrente + parola).length > max_chars) {
                risultato_finale += riga_corrente + "\n";
                riga_corrente = "";
            }
            riga_corrente += parola + " ";
        }
        risultato_finale += riga_corrente.trim();
        if (k < paragrafi.length - 1) risultato_finale += "\n";
    }
    return risultato_finale;
}

function preload_vecchietto(s) {
    img_vecchietto = PP.assets.sprite.load_spritesheet(s, "assets/images/VECCHIETTO/Vecchietto.png", 28, 43);
    img_tasto_S = PP.assets.sprite.load_spritesheet(s, "assets/images/VECCHIETTO/Tasto S.png", 22, 37);
}

function create_vecchietto(s) {
    
    // [CHECKPOINT] Se l'arma è già sbloccata, il vecchietto è solo decorativo
    let arma_gia_presa = PP.game_state.get_variable("arma_sbloccata");
    vecchietto_disabilitato = arma_gia_presa;

    // Reset stati
    dialogo_iniziato = false;
    dialogo_finito = arma_gia_presa; // Se già presa, consideriamo il dialogo "finito"
    tutorial_finale_attivo = false;
    
    // --- CREAZIONE LAYERS ---
    layer_game = PP.layers.create(s);
    PP.layers.set_z_index(layer_game, 5);

    layer_bg_ui = PP.layers.create(s);
    PP.layers.set_z_index(layer_bg_ui, 1000);

    layer_fg_ui = PP.layers.create(s);
    PP.layers.set_z_index(layer_fg_ui, 1001);

    // 1. VECCHIETTO
    vecchietto = PP.assets.sprite.add(s, img_vecchietto, 70 *32, 0*32, 0.5, 1);
    PP.physics.add(s, vecchietto, PP.physics.type.STATIC);
    PP.layers.add_to_layer(layer_game, vecchietto);

    PP.assets.sprite.animation_add_list(vecchietto, "idle", [0, 1, 2, 3], 6, -1);
    PP.assets.sprite.animation_add_list(vecchietto, "parla", [4, 5, 6, 7], 6, -1);
    
    PP.assets.sprite.animation_play(vecchietto, "idle");
    animazione_corrente_vecchietto = "idle";

    // 2. SENSORE DI CONTATTO (Solo se non disabilitato)
    if (!vecchietto_disabilitato) {
        sensore_dialogo = PP.shapes.rectangle_add(s, 70*32, 0*32, 250, 200, "0xFF0000", 0);
        PP.physics.add(s, sensore_dialogo, PP.physics.type.STATIC);
        if(sensore_dialogo.visibility) sensore_dialogo.visibility.alpha = 0;
    } else {
        sensore_dialogo = null;
    }

    // 3. TASTO S (Solo se non disabilitato)
    if (!vecchietto_disabilitato) {
        tasto_S = PP.assets.sprite.add(s, img_tasto_S, 70*32-1, -40, 0.5, 1);
        PP.layers.add_to_layer(layer_game, tasto_S);

        PP.assets.sprite.animation_add_list(tasto_S, "puntini", [0, 1], 2, -1);
        PP.assets.sprite.animation_add_list(tasto_S, "tasto", [2, 3], 2, -1);
        
        PP.assets.sprite.animation_play(tasto_S, "puntini");
        animazione_corrente_tasto = "puntini";
    } else {
        tasto_S = null;
    }

    // 4. INTERFACCIA UTENTE (UI) - Usa le costanti configurabili
    sfondo_testo = PP.shapes.rectangle_add(s, 640, 360, BOX_WIDTH, BOX_HEIGHT, BOX_COLOR, BOX_ALPHA);
    PP.layers.add_to_layer(layer_bg_ui, sfondo_testo);
    
    if (sfondo_testo.tile_geometry) {
        sfondo_testo.tile_geometry.scroll_factor_x = 0;
        sfondo_testo.tile_geometry.scroll_factor_y = 0;
    }
    if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = true;

    testo_schermo = PP.shapes.text_styled_add(s, 640, 360, "", 20, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5);
    
    // [MODIFICA RICHIESTA] Interlinea
    testo_schermo.ph_obj.setLineSpacing(7); 
    
    PP.layers.add_to_layer(layer_fg_ui, testo_schermo);
    
    if (testo_schermo.tile_geometry) {
        testo_schermo.tile_geometry.scroll_factor_x = 0;
        testo_schermo.tile_geometry.scroll_factor_y = 0;
    }
    if (testo_schermo.visibility) testo_schermo.visibility.hidden = true;
}

function cambia_animazione_vecchietto(nuova_animazione) {
    if (animazione_corrente_vecchietto === nuova_animazione) return;
    PP.assets.sprite.animation_play(vecchietto, nuova_animazione);
    animazione_corrente_vecchietto = nuova_animazione;
}

function cambia_animazione_tasto(nuova_animazione) {
    if (!tasto_S) return;
    if (animazione_corrente_tasto === nuova_animazione) return;
    PP.assets.sprite.animation_play(tasto_S, nuova_animazione);
    animazione_corrente_tasto = nuova_animazione;
}

function update_vecchietto(s, player) {
    if (vecchietto_disabilitato) return;
    if (!player || !sensore_dialogo || !tasto_S || !vecchietto) return;
  
    // --- CASO 1: DIALOGO FINITO E TUTORIAL FINITO ---
    if (dialogo_finito && !tutorial_finale_attivo) {
         if (tasto_S.visibility) tasto_S.visibility.hidden = true;
         if (testo_schermo.visibility) testo_schermo.visibility.hidden = true;
         if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = true;
         
         cambia_animazione_vecchietto("idle");
         // Assicuriamoci che il player non sia bloccato
         if(player.is_frozen) player.is_frozen = false;
         return; 
    }
  
    // --- CASO 2: DIALOGO IN CORSO ---
    if (dialogo_iniziato) {
        player.is_frozen = true;
        
        // [GESTIONE ANIMAZIONI OTTIMIZZATA]
        if (indice_frase < frasi_vecchietto.length) {
            let interlocutore = frasi_vecchietto[indice_frase].id;

            if (interlocutore === "GEM") {
                cambia_animazione_vecchietto("parla");
                if (player.ph_obj.anims.currentAnim && player.ph_obj.anims.currentAnim.key !== "idle") {
                    PP.assets.sprite.animation_play(player, "idle");
                }
            } else if (interlocutore === "EREN") {
                cambia_animazione_vecchietto("idle");
                if (player.ph_obj.anims.currentAnim && player.ph_obj.anims.currentAnim.key !== "parla") {
                    PP.assets.sprite.animation_play(player, "parla");
                }
            }
        }

        if (tasto_S.visibility) tasto_S.visibility.hidden = true;
  
        let tasto_premuto = PP.interactive.kb.is_key_down(s, PP.key_codes.S) || 
                            PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) || 
                            PP.interactive.kb.is_key_down(s, PP.key_codes.ENTER);
  
        if (tasto_premuto) {
            if (tasto_rilasciato) {
                tasto_rilasciato = false; 
  
                // Se non siamo all'ultima frase, avanza
                if (indice_frase < frasi_vecchietto.length - 1) {
                    indice_frase++; 
                    
                    if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = false;
                    if (testo_schermo.visibility) testo_schermo.visibility.hidden = false;
                    
                    // Formatta e mostra
                    let testo_formattato = formatta_testo_dialogo(frasi_vecchietto[indice_frase].testo, MAX_CHARS_DIALOGO);
                    PP.shapes.text_change(testo_schermo, testo_formattato);
                    
                } else {
                    // --- FINE DIALOGO ---
                    dialogo_iniziato = false;
                    dialogo_finito = true;
                    
                    // Sblocca il player e ferma le animazioni
                    player.is_frozen = false;
                    PP.assets.sprite.animation_play(player, "idle");
                    cambia_animazione_vecchietto("idle");

                    PP.game_state.set_variable("arma_sbloccata", true);
                    if (typeof hud_modalita_inquinante !== 'undefined') {
                        hud_modalita_inquinante = false; 
                    }
                    
                    if (typeof window.attiva_checkpoint === "function") {
                        window.attiva_checkpoint(s);
                    }

                    // --- MESSAGGIO TUTORIAL FINALE ---
                    tutorial_finale_attivo = true;
                    if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = false;
                    if (testo_schermo.visibility) testo_schermo.visibility.hidden = false;
                    
                    // [MODIFICA RICHIESTA] Rimpicciolisci il box
                    if (sfondo_testo.ph_obj) sfondo_testo.ph_obj.displayHeight = 60;

                    // Formatta e mostra messaggio finale
                    let testo_tut = formatta_testo_dialogo("Utilizza il tasto L per cambiare arma", MAX_CHARS_DIALOGO);
                    PP.shapes.text_change(testo_schermo, testo_tut);
                    
                    // Timer per nascondere tutto dopo 2 secondi
                    PP.timers.add_timer(s, 2000, function() {
                        tutorial_finale_attivo = false;
                        if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = true;
                        if (testo_schermo.visibility) testo_schermo.visibility.hidden = true;
                    }, false);
                        
                }
            }
        } else {
            tasto_rilasciato = true;
        }
    } 
    // --- CASO 3: AVVICINAMENTO ---
    else {
        // Se il tutorial finale è attivo, non permettere di riaprire il dialogo
        if(tutorial_finale_attivo) return;

        let dentro_zona = false;
        if (player.ph_obj && sensore_dialogo.ph_obj) {
            dentro_zona = s.physics.overlap(player.ph_obj, sensore_dialogo.ph_obj);
        }
        if (dentro_zona) {
            if (tasto_S.visibility) tasto_S.visibility.hidden = false;
            cambia_animazione_tasto("tasto");
            cambia_animazione_vecchietto("idle");
            if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
              if (tasto_rilasciato) {
                  dialogo_iniziato = true;
                  player.is_frozen = true; 
                  PP.physics.set_velocity_x(player, 0);
                  
                  // Orientamento player
                  if (player.ph_obj.x < vecchietto.ph_obj.x) {
                      player.geometry.flip_x = false; 
                      player.facing_right = true; 
                      PP.physics.set_collision_rectangle(player, 20, 44, 14, 8);
                  } else {
                      player.geometry.flip_x = true;
                      player.facing_right = false; 
                      PP.physics.set_collision_rectangle(player, 20, 44, 20, 8);
                  }

                  if (tasto_S.visibility) tasto_S.visibility.hidden = true;
                  if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = false;
                  if (testo_schermo.visibility) testo_schermo.visibility.hidden = false;
                  
                  // [MODIFICA RICHIESTA] Ripristina altezza box
                  if (sfondo_testo.ph_obj) sfondo_testo.ph_obj.displayHeight = BOX_HEIGHT;

                  // Inizio Dialogo (Indice 0)
                  indice_frase = 0;
                  let testo_init = formatta_testo_dialogo(frasi_vecchietto[0].testo, MAX_CHARS_DIALOGO);
                  PP.shapes.text_change(testo_schermo, testo_init);
                  
                  tasto_rilasciato = false;
              }
          } else {
              tasto_rilasciato = true; 
          }
        } else {
            if (tasto_S.visibility) tasto_S.visibility.hidden = false;
            cambia_animazione_tasto("puntini");
            cambia_animazione_vecchietto("idle");
        }
    }
}