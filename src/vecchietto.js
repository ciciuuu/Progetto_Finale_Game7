// --- VARIABILI GLOBALI VECCHIETTO ---
let img_vecchietto;
let vecchietto;
let sensore_dialogo; // Il rettangolo invisibile per la collisione
let img_tasto_S;
let tasto_S;         // Lo sprite del fumetto

// --- ELEMENTI UI ---
let testo_schermo;   // Il testo
let sfondo_testo;    // Il rettangolo nero semitrasparente

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
    // ----------------------------------------
    // 1. VECCHIETTO
    // ----------------------------------------
    vecchietto = PP.assets.sprite.add(s, img_vecchietto, 2849, -192, 0.5, 1);
    // vecchietto.geometry.scale_x = 1.1;
    // vecchietto.geometry.scale_y = 1.1;

    PP.physics.add(s, vecchietto, PP.physics.type.STATIC);
    
    // [MODIFICA Z-INDEX] Mettiamo il vecchietto su un livello medio
    vecchietto.ph_obj.setDepth(5); 

    PP.assets.sprite.animation_add_list(vecchietto, "idle", [0, 1, 2, 3], 6, -1);
    PP.assets.sprite.animation_add_list(vecchietto, "parla", [4, 5, 6, 7], 6, -1);
    
    // Parte subito in IDLE
    PP.assets.sprite.animation_play(vecchietto, "idle");

    // ----------------------------------------
    // 2. SENSORE DI CONTATTO
    // ----------------------------------------
    sensore_dialogo = s.add.rectangle(2849, -192, 250, 200, 0xFF0000, 0); 
    s.physics.add.existing(sensore_dialogo, true); // Statico

    // ----------------------------------------
    // 3. TASTO S (Fumetto)
    // ----------------------------------------
    tasto_S = PP.assets.sprite.add(s, img_tasto_S, 2847, -240, 0.5, 1);
    // [MODIFICA Z-INDEX] Il tasto sopra il vecchietto
    tasto_S.ph_obj.setDepth(6); 

    PP.assets.sprite.animation_add_list(tasto_S, "puntini", [0, 1], 2, -1);
    PP.assets.sprite.animation_add_list(tasto_S, "tasto", [2, 3], 2, -1);
    
    // Parte subito con PUNTINI
    PP.assets.sprite.animation_play(tasto_S, "puntini");

    // ----------------------------------------
    // 4. INTERFACCIA UTENTE (Testo + Sfondo)
    // ----------------------------------------
    
    // Sfondo Nero Opaco al 30% (0.3)
    sfondo_testo = s.add.rectangle(640, 360, 800, 150, 0x000000, 0.3);
    sfondo_testo.setScrollFactor(0); 
    sfondo_testo.setDepth(100); // UI sempre sopra tutto
    sfondo_testo.setVisible(false);

    // Testo Bianco al centro
    // [MODIFICA] Font più piccolo (20px) e larghezza ridotta (600px)
    testo_schermo = s.add.text(640, 360, "", {
        fontSize: '20px', 
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#FFFFFF',
        align: 'center',
        wordWrap: { width: 600 } // A capo se supera 600px
    });
    
    testo_schermo.setOrigin(0.5, 0.5); 
    testo_schermo.setScrollFactor(0);  
    testo_schermo.setDepth(101); // UI sopra sfondo
    testo_schermo.setVisible(false);
}

// Funzione Helper per evitare di resettare l'animazione
function cambia_animazione_sicura(oggetto, nome_animazione) {
    if (oggetto.ph_obj.anims.currentAnim && oggetto.ph_obj.anims.currentAnim.key === nome_animazione) {
        return;
    }
    PP.assets.sprite.animation_play(oggetto, nome_animazione);
}

function update_vecchietto(s, player) {
  if (!player || !sensore_dialogo || !tasto_S || !vecchietto) return;

  // [MODIFICA Z-INDEX] Player sempre davanti
  if (player.ph_obj.depth <= 5) {
      player.ph_obj.setDepth(10);
  }

  // --- CASO 1: DIALOGO FINITO ---
  if (dialogo_finito) {
       if (tasto_S.ph_obj.visible) tasto_S.ph_obj.setVisible(false);
       if (testo_schermo.visible) testo_schermo.setVisible(false);
       if (sfondo_testo.visible) sfondo_testo.setVisible(false);
       
       cambia_animazione_sicura(vecchietto, "idle");
       
       // [NUOVO] SCONGELA IL PLAYER
       player.is_frozen = false;

       return; 
  }

  // --- CASO 2: DIALOGO IN CORSO ---
  if (dialogo_iniziato) {
      
      // [NUOVO] CONGELA IL PLAYER
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
                  testo_schermo.setText(frasi_vecchietto[indice_frase]);
                  indice_frase++; 
              } else {
                  dialogo_finito = true;
                  // Nota: Lo scongelamento avviene al prossimo frame nel CASO 1
              }
          }
      } else {
          tasto_rilasciato = true;
      }
  } 
  // --- CASO 3: IN ATTESA ---
  else {
      let dentro_zona = s.physics.overlap(player.ph_obj, sensore_dialogo);

      if (dentro_zona) {
          cambia_animazione_sicura(tasto_S, "tasto");
          cambia_animazione_sicura(vecchietto, "idle");

          if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
              if (tasto_rilasciato) {
                  dialogo_iniziato = true;
                  // [NUOVO] CONGELA SUBITO
                  player.is_frozen = true; 
                  // [NUOVO] Ferma subito il player visivamente per evitare scivolamenti
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