// --- VARIABILI GLOBALI VECCHIETTO ---
let img_vecchietto;
let vecchietto;
let sensore_dialogo; // Ora sarà un oggetto PoliPhaser
let img_tasto_S;
let tasto_S;         

// --- ELEMENTI UI (DEVONO RIMANERE NATIVI PER ORA) ---
let testo_schermo;   
let sfondo_testo;    

// --- LAYERS (NUOVO POLIPHASER) ---
let layer_bg_ui; // Sfondo testo
let layer_fg_ui; // Testo sopra
let layer_game;  // Vecchietto e fumetto

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

    // 1. VECCHIETTO (PoliPhaser)
    vecchietto = PP.assets.sprite.add(s, img_vecchietto, 2849, -192, 0.5, 1);
    PP.physics.add(s, vecchietto, PP.physics.type.STATIC);
    
    // Aggiunta al layer invece di setDepth nativo
    PP.layers.add_to_layer(layer_game, vecchietto);

    PP.assets.sprite.animation_add_list(vecchietto, "idle", [0, 1, 2, 3], 6, -1);
    PP.assets.sprite.animation_add_list(vecchietto, "parla", [4, 5, 6, 7], 6, -1);
    PP.assets.sprite.animation_play(vecchietto, "idle");

    // 2. SENSORE DI CONTATTO (PoliPhaser)

    sensore_dialogo = PP.shapes.rectangle_add(s, 2849, -192, 250, 200, "0xFF0000", 0);
    PP.physics.add(s, sensore_dialogo, PP.physics.type.STATIC);


    // 3. TASTO S (PoliPhaser)

    tasto_S = PP.assets.sprite.add(s, img_tasto_S, 2847, -240, 0.5, 1);
    // Layer per z-index
    PP.layers.add_to_layer(layer_game, tasto_S);

    PP.assets.sprite.animation_add_list(tasto_S, "puntini", [0, 1], 2, -1);
    PP.assets.sprite.animation_add_list(tasto_S, "tasto", [2, 3], 2, -1);
    PP.assets.sprite.animation_play(tasto_S, "puntini");


    // 4. INTERFACCIA UTENTE (NATIVO NECESSARIO)
    
    sfondo_testo = s.add.rectangle(640, 360, 800, 150, 0x000000, 0.3);
    sfondo_testo.setScrollFactor(0); 
    // Usiamo il layer PoliPhaser per la profondità anche degli oggetti nativi
    PP.layers.add_to_layer(layer_bg_ui, { ph_obj: sfondo_testo }); // Wrapper manuale per compatibilità
    sfondo_testo.setVisible(false);

    testo_schermo = s.add.text(640, 360, "", {
        fontSize: '20px', 
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#FFFFFF',
        align: 'center',
        wordWrap: { width: 600 }
    });
    
    testo_schermo.setOrigin(0.5, 0.5); 
    testo_schermo.setScrollFactor(0);  
    PP.layers.add_to_layer(layer_fg_ui, { ph_obj: testo_schermo }); // Wrapper manuale
    testo_schermo.setVisible(false);
}

// Funzione Helper (Nativo necessario per check animazione corrente)
function cambia_animazione_sicura(oggetto, nome_animazione) {
    if (oggetto.ph_obj.anims.currentAnim && oggetto.ph_obj.anims.currentAnim.key === nome_animazione) {
        return;
    }
    PP.assets.sprite.animation_play(oggetto, nome_animazione);
}

function update_vecchietto(s, player) {
  if (!player || !sensore_dialogo || !tasto_S || !vecchietto) return;

  // --- CASO 1: DIALOGO FINITO ---
  if (dialogo_finito) {
       // [NATIVO] Gestione visibilità
       if (tasto_S.ph_obj.visible) tasto_S.ph_obj.setVisible(false);
       if (testo_schermo.visible) testo_schermo.setVisible(false);
       if (sfondo_testo.visible) sfondo_testo.setVisible(false);
       
       cambia_animazione_sicura(vecchietto, "idle");
       
       player.is_frozen = false;
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
                  sfondo_testo.setVisible(true);
                  testo_schermo.setVisible(true);
                  // [NATIVO] setText non esiste in PoliPhaser
                  testo_schermo.setText(frasi_vecchietto[indice_frase]);
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
      // [POLIPHASER] Verifica Sovrapposizione
      // Usiamo PP.physics.add_overlap_f solo nel create, ma qui siamo nell'update e vogliamo
      // solo sapere SE si toccano, senza triggerare un evento una tantum.
      // PoliPhaser NON ha una funzione `check_overlap` booleana.
      // Quindi dobbiamo usare il nativo per questo check continuo.
      
      let dentro_zona = s.physics.overlap(player.ph_obj, sensore_dialogo.ph_obj);

      if (dentro_zona) {
          cambia_animazione_sicura(tasto_S, "tasto");
          cambia_animazione_sicura(vecchietto, "idle");

          if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
              if (tasto_rilasciato) {
                  dialogo_iniziato = true;
                  player.is_frozen = true; 
                  PP.physics.set_velocity_x(player, 0);

                  tasto_S.ph_obj.setVisible(false);
                  sfondo_testo.setVisible(true);
                  testo_schermo.setVisible(true);
                  testo_schermo.setText(frasi_vecchietto[0]);
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