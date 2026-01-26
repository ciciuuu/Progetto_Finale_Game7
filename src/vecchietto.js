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
    vecchietto = PP.assets.sprite.add(s, img_vecchietto, 2849, -192, 0.5, 1);
    PP.physics.add(s, vecchietto, PP.physics.type.STATIC);
    
    // [FIX] 2 Parametri: Layer, Oggetto
    PP.layers.add_to_layer(layer_game, vecchietto);

    PP.assets.sprite.animation_add_list(vecchietto, "idle", [0, 1, 2, 3], 6, -1);
    PP.assets.sprite.animation_add_list(vecchietto, "parla", [4, 5, 6, 7], 6, -1);
    PP.assets.sprite.animation_play(vecchietto, "idle");

    // 2. SENSORE DI CONTATTO (Shape)
    // Colore corretto "0xFF0000", Alpha 0 (invisibile)
    sensore_dialogo = PP.shapes.rectangle_add(s, 2849, -192, 250, 200, "0xFF0000", 0);
    PP.physics.add(s, sensore_dialogo, PP.physics.type.STATIC);

    // 3. TASTO S
    tasto_S = PP.assets.sprite.add(s, img_tasto_S, 2847, -240, 0.5, 1);
    // [FIX] 2 Parametri
    PP.layers.add_to_layer(layer_game, tasto_S);

    PP.assets.sprite.animation_add_list(tasto_S, "puntini", [0, 1], 2, -1);
    PP.assets.sprite.animation_add_list(tasto_S, "tasto", [2, 3], 2, -1);
    PP.assets.sprite.animation_play(tasto_S, "puntini");

    // 4. INTERFACCIA UTENTE
    
    // Sfondo (Rettangolo PoliPhaser)
    sfondo_testo = PP.shapes.rectangle_add(s, 640, 360, 800, 150, "0x000000", 0.3);
    // [FIX] 2 Parametri
    PP.layers.add_to_layer(layer_bg_ui, sfondo_testo);
    
    // [NATIVO NECESSARIO] ScrollFactor
    if(sfondo_testo.ph_obj) sfondo_testo.ph_obj.setScrollFactor(0);
    
    // Visibilità PoliPhaser
    sfondo_testo.visibility.hidden = true; 

    // Testo (Text Styled PoliPhaser)
    testo_schermo = PP.shapes.text_styled_add(
        s, 
        640, 
        360, 
        "", 
        20, 
        "Arial", 
        "bold", 
        "0xFFFFFF", 
        null, 
        0.5, 
        0.5
    );
    // [FIX] 2 Parametri
    PP.layers.add_to_layer(layer_fg_ui, testo_schermo);
    
    // [NATIVO NECESSARIO] ScrollFactor
    if(testo_schermo.ph_obj) testo_schermo.ph_obj.setScrollFactor(0);
    
    testo_schermo.visibility.hidden = true;
}

// Helper animazione
function cambia_animazione_sicura(oggetto, nome_animazione) {
    // [NATIVO NECESSARIO] Check animazione corrente
    if (oggetto.ph_obj.anims.currentAnim && oggetto.ph_obj.anims.currentAnim.key === nome_animazione) {
        return;
    }
    PP.assets.sprite.animation_play(oggetto, nome_animazione);
}

function update_vecchietto(s, player) {
  if (!player || !sensore_dialogo || !tasto_S || !vecchietto) return;

  // [NATIVO NECESSARIO] Gestione Depth dinamica
  if (player.ph_obj.depth <= 5) {
      player.ph_obj.setDepth(10);
  }

  // --- CASO 1: DIALOGO FINITO ---
  if (dialogo_finito) {
       tasto_S.visibility.hidden = true;
       testo_schermo.visibility.hidden = true;
       sfondo_testo.visibility.hidden = true;
       
       cambia_animazione_sicura(vecchietto, "idle");
       
       player.is_frozen = false;
       
       // Sblocco arma
       PP.game_state.set_variable("arma_sbloccata", true);
       return; 
  }

  // --- CASO 2: DIALOGO IN CORSO ---
  if (dialogo_iniziato) {
      player.is_frozen = true;
      cambia_animazione_sicura(vecchietto, "parla");

      let tasto_premuto = PP.interactive.kb.is_key_down(s, PP.key_codes.S) || 
                          PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) || 
                          PP.interactive.kb.is_key_down(s, PP.key_codes.ENTER);

      if (tasto_premuto) {
          if (tasto_rilasciato) {
              tasto_rilasciato = false; 

              if (indice_frase < frasi_vecchietto.length) {
                  sfondo_testo.visibility.hidden = false;
                  testo_schermo.visibility.hidden = false;
                  
                  // Cambio Testo PoliPhaser
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
      // [NATIVO NECESSARIO] Check overlap booleano
      let dentro_zona = s.physics.overlap(player.ph_obj, sensore_dialogo.ph_obj);

      if (dentro_zona) {
          cambia_animazione_sicura(tasto_S, "tasto");
          cambia_animazione_sicura(vecchietto, "idle");

          if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
              if (tasto_rilasciato) {
                  dialogo_iniziato = true;
                  player.is_frozen = true; 
                  PP.physics.set_velocity_x(player, 0);

                  tasto_S.visibility.hidden = true;
                  sfondo_testo.visibility.hidden = false;
                  testo_schermo.visibility.hidden = false;
                  
                  PP.shapes.text_change(testo_schermo, frasi_vecchietto[0]);
                  
                  indice_frase = 1;
                  tasto_rilasciato = false;
              }
          } else {
              tasto_rilasciato = true;
          }

      } else {
          cambia_animazione_sicura(vecchietto, "idle");
          cambia_animazione_sicura(tasto_S, "puntini");
      }
  }
}