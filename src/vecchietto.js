// ok

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

// Variabile di stato per evitare check nativi sull'animazione
let animazione_corrente_vecchietto = ""; 

// --- FRASI ---
let frasi_vecchietto = [
    "VECCHIETTO: Ciao viaggiatore! Benvenuto nella caverna.",
    "VECCHIETTO: Attento ai ragni, sono molto velenosi.",
    "VECCHIETTO: Usa i tasti Z e C per cambiare munizioni.",
    "VECCHIETTO: Buona fortuna per la tua avventura!"
];

function preload_vecchietto(s) {
    img_vecchietto = PP.assets.sprite.load_spritesheet(s, "assets/images/VECCHIETTO/Vecchietto.png", 28, 43);
    img_tasto_S = PP.assets.sprite.load_spritesheet(s, "assets/images/VECCHIETTO/Tasto S.png", 22, 37);
}

function create_vecchietto(s) {
    // --- CREAZIONE LAYERS ---
    layer_game = PP.layers.create(s);
    PP.layers.set_z_index(layer_game, 5);

    layer_bg_ui = PP.layers.create(s);
    PP.layers.set_z_index(layer_bg_ui, 100);

    layer_fg_ui = PP.layers.create(s);
    PP.layers.set_z_index(layer_fg_ui, 101);

    // 1. VECCHIETTO
    vecchietto = PP.assets.sprite.add(s, img_vecchietto, 2849, -128, 0.5, 1);
    PP.physics.add(s, vecchietto, PP.physics.type.STATIC);
    PP.layers.add_to_layer(layer_game, vecchietto);

    PP.assets.sprite.animation_add_list(vecchietto, "idle", [0, 1, 2, 3], 6, -1);
    PP.assets.sprite.animation_add_list(vecchietto, "parla", [4, 5, 6, 7], 6, -1);
    
    // Avvio animazione e tracciamento stato
    PP.assets.sprite.animation_play(vecchietto, "idle");
    animazione_corrente_vecchietto = "idle";

    // 2. SENSORE DI CONTATTO
    sensore_dialogo = PP.shapes.rectangle_add(s, 2849, -192, 250, 200, "0xFF0000", 0);
    PP.physics.add(s, sensore_dialogo, PP.physics.type.STATIC);
    // Nascondiamo il sensore (PoliPhaser visibility)
    if(sensore_dialogo.visibility) sensore_dialogo.visibility.alpha = 0;

    // 3. TASTO S
    tasto_S = PP.assets.sprite.add(s, img_tasto_S, 2847, -240, 0.5, 1);
    PP.layers.add_to_layer(layer_game, tasto_S);

    PP.assets.sprite.animation_add_list(tasto_S, "puntini", [0, 1], 2, -1);
    PP.assets.sprite.animation_add_list(tasto_S, "tasto", [2, 3], 2, -1);
    PP.assets.sprite.animation_play(tasto_S, "puntini");

    // 4. INTERFACCIA UTENTE (UI) - Refactoring PoliPhaser
    
    // Sfondo Testo
    sfondo_testo = PP.shapes.rectangle_add(s, 640, 360, 800, 150, "0x000000", 0.3);
    PP.layers.add_to_layer(layer_bg_ui, sfondo_testo);
    
    // [POLIPHASER] Blocco Scroll tramite tile_geometry
    if (sfondo_testo.tile_geometry) {
        sfondo_testo.tile_geometry.scroll_factor_x = 0;
        sfondo_testo.tile_geometry.scroll_factor_y = 0;
    }
    
    // [POLIPHASER] Nascondi tramite visibility
    if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = true;

    // Testo
    testo_schermo = PP.shapes.text_styled_add(s, 640, 360, "", 20, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5);
    PP.layers.add_to_layer(layer_fg_ui, testo_schermo);
    
    // [POLIPHASER] Blocco Scroll
    if (testo_schermo.tile_geometry) {
        testo_schermo.tile_geometry.scroll_factor_x = 0;
        testo_schermo.tile_geometry.scroll_factor_y = 0;
    }
    
    // [POLIPHASER] Nascondi
    if (testo_schermo.visibility) testo_schermo.visibility.hidden = true;
}

// Funzione Helper (PoliPhaser Puro: usa variabile di stato)
function cambia_animazione_vecchietto(nuova_animazione) {
    if (animazione_corrente_vecchietto === nuova_animazione) return;
    
    PP.assets.sprite.animation_play(vecchietto, nuova_animazione);
    animazione_corrente_vecchietto = nuova_animazione;
}

function update_vecchietto(s, player) {
  if (!player || !sensore_dialogo || !tasto_S || !vecchietto) return;

  // [NATIVO NECESSARIO] Depth sorting dinamico (Player passa davanti/dietro)
  if (player.ph_obj && player.ph_obj.depth <= 5) {
      player.ph_obj.setDepth(10);
  }

  // --- CASO 1: DIALOGO FINITO ---
  if (dialogo_finito) {
       // [POLIPHASER] Gestione visibilità
       if (tasto_S.visibility) tasto_S.visibility.hidden = true;
       if (testo_schermo.visibility) testo_schermo.visibility.hidden = true;
       if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = true;
       
       cambia_animazione_vecchietto("idle");
       player.is_frozen = false;
       
       PP.game_state.set_variable("arma_sbloccata", true);
       return; 
  }

  // --- CASO 2: DIALOGO IN CORSO ---
  if (dialogo_iniziato) {
      player.is_frozen = true;
      cambia_animazione_vecchietto("parla");

      let tasto_premuto = PP.interactive.kb.is_key_down(s, PP.key_codes.S) || 
                          PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) || 
                          PP.interactive.kb.is_key_down(s, PP.key_codes.ENTER);

      if (tasto_premuto) {
          if (tasto_rilasciato) {
              tasto_rilasciato = false; 

              if (indice_frase < frasi_vecchietto.length) {
                  // [POLIPHASER] Mostra UI
                  if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = false;
                  if (testo_schermo.visibility) testo_schermo.visibility.hidden = false;
                  
                  PP.shapes.text_change(testo_schermo, frasi_vecchietto[indice_frase]);
                  indice_frase++; 
              } else {
                  dialogo_finito = true;
              }
          }
      } else {
          tasto_rilasciato = true;
      }
  } 
  // --- CASO 3: IN ATTESA ---
  else {
      // [NATIVO NECESSARIO] Check overlap booleano (non esiste in PP.physics)
      let dentro_zona = false;
      if (player.ph_obj && sensore_dialogo.ph_obj) {
          dentro_zona = s.physics.overlap(player.ph_obj, sensore_dialogo.ph_obj);
      }

      if (dentro_zona) {
          // Animazione Tasto S (non tracciamo lo stato del tasto, solo play diretto)
          PP.assets.sprite.animation_play(tasto_S, "tasto");
          cambia_animazione_vecchietto("idle");

          if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
            if (tasto_rilasciato) {
                dialogo_iniziato = true;
                player.is_frozen = true; 
                PP.physics.set_velocity_x(player, 0);

                // [FIX MOONWALK + HITBOX]
                if (player.ph_obj.x < vecchietto.ph_obj.x) {
                    player.geometry.flip_x = false; 
                    player.facing_right = true; // Aggiorna stato logico
                    PP.physics.set_collision_rectangle(player, 20, 44, 14, 8);
                } else {
                    player.geometry.flip_x = true;
                    player.facing_right = false; // Aggiorna stato logico
                    PP.physics.set_collision_rectangle(player, 20, 44, 20, 8);
                }

                // [POLIPHASER] Nascondi Tasto, Mostra UI
                if (tasto_S.visibility) tasto_S.visibility.hidden = true;
                if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = false;
                if (testo_schermo.visibility) testo_schermo.visibility.hidden = false;
                
                PP.shapes.text_change(testo_schermo, frasi_vecchietto[0]);
                
                indice_frase = 1;
                tasto_rilasciato = false;
            }
        }

      } else {
          cambia_animazione_vecchietto("idle");
          // Animazione puntini tasto S
          PP.assets.sprite.animation_play(tasto_S, "puntini");
      }
  }
}