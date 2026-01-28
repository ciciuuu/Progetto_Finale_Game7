// proiettili.js

// Variabili per gli asset caricati con PoliPhaser
let asset_proiettile_normale;
let asset_proiettile_inquinante;

function preload_proiettili(s) {
  // Carichiamo le immagini usando PoliPhaser
  asset_proiettile_normale = PP.assets.image.load(s, "assets/images/PLAYER/Proiettile.png");
  asset_proiettile_inquinante = PP.assets.image.load(s, "assets/images/PLAYER/Proiettile_inquinante.png");
}

function gestisci_sparo(s, entita, muri_livello) {

  //-----------------------------------
  //-----------------------------------
  //-----------------------------------
  // ----- FARE IN POLIPHASER --------- (anche la collisione in fondo)
  //-----------------------------------
  //----------------------------------- 
  //-----------------------------------

  let time_now = Date.now();

  if (time_now > entita.last_fired + entita.fire_rate) {
    entita.last_fired = time_now;
    let Y_OFFSET_SPARO = 36;
    let velocita = 600;

    let img_da_usare = asset_proiettile_normale;
    if (entita.modalita_inquinante) {
      img_da_usare = asset_proiettile_inquinante;

      // --- NUOVA LOGICA: IL PLAYER PRENDE DANNO ---
      let hp_attuali = PP.game_state.get_variable("HP_player");
      let nuovo_hp = hp_attuali - 1;
      PP.game_state.set_variable("HP_player", nuovo_hp);

      console.log("Sparo inquinante usato! HP rimanenti: " + nuovo_hp);

      // --- ATTIVAZIONE VIGNETTA VIOLA ---
      if (typeof vignette_dannoviola !== 'undefined' && vignette_dannoviola.ph_obj) {
        s.tweens.killTweensOf(vignette_dannoviola.ph_obj); // Ferma animazioni precedenti
        vignette_dannoviola.ph_obj.alpha = 0; // Reset
        s.tweens.add({
          targets: vignette_dannoviola.ph_obj,
          alpha: 1,
          duration: 100,
          yoyo: true,
          hold: 50,
          ease: 'Power2'
        });
      }

      // Feedback visivo sul player (facoltativo: lo facciamo diventare viola/nero per un istante)
      if (entita.ph_obj) {
        entita.ph_obj.setTint(0x8e44ad); // Un viola scuro per richiamare l'inquinamento
        s.time.delayedCall(100, () => {
          if (!entita.is_dead) entita.ph_obj.clearTint();
        });
      }

      // Se finisce la vita sparando, attiviamo la morte
      if (nuovo_hp <= 0 && typeof morte_player === "function") {
        morte_player(s, entita);
      }

    }

    let colpo = PP.assets.image.add(s, img_da_usare, entita.geometry.x, entita.geometry.y - Y_OFFSET_SPARO, 0.5, 0.5);

    // Se è inquinante fa 3 danni (morte istantanea), altrimenti 1
    colpo.punti_danno = entita.modalita_inquinante ? 5 : 1;

    PP.physics.add(s, colpo, PP.physics.type.DYNAMIC);
    colpo.ph_obj.body.allowGravity = false;

    if (entita.geometry.flip_x) {
      PP.physics.set_velocity_x(colpo, -velocita);
      colpo.geometry.flip_x = true;
    } else {
      PP.physics.set_velocity_x(colpo, velocita);
      colpo.geometry.flip_x = false;
    }

    PP.timers.add_timer(s, 2000, function () {
      if (colpo.ph_obj.active) {
        PP.assets.destroy(colpo);
      }
    }, false);


    // --- COLLISIONI ---

    // 1. COLLISIONE CON I MURI
    if (typeof muri_livello !== 'undefined' && muri_livello) {
      s.physics.add.collider(colpo.ph_obj, muri_livello, function (b, m) {
        PP.assets.destroy(colpo);
      });
    }

    /* // 2. COLLISIONE CON I NEMICI (RAGNI)
    if (typeof gruppo_ragni !== 'undefined' && gruppo_ragni) {
      s.physics.add.overlap(colpo.ph_obj, gruppo_ragni, function (bullet_native, enemy_native) {
        
        // Controllo validità
        if(!colpo.ph_obj.active || !enemy_native.active) return;

        PP.assets.destroy(colpo);

        enemy_native.body.enable = false;
        enemy_native.anims.play("morte", true);

        PP.timers.add_timer(s, 1000, function () {
          if (enemy_native.active) {
            enemy_native.destroy();
            console.log("Nemico rimosso dopo animazione morte.");
          }
        }, false);
      });
    } */

    //Nuovo collisione ragni
    if (typeof gruppo_ragni !== 'undefined' && gruppo_ragni) {
      s.physics.add.overlap(colpo.ph_obj, gruppo_ragni, function (bullet_native, enemy_native) {
        if (!colpo.ph_obj.active) return;

        // Prendiamo il valore del danno che abbiamo salvato nel proiettile
        let danno_da_infliggere = colpo.punti_danno;

        PP.assets.destroy(colpo);

        if (typeof damage_ragno === "function") {
          // Passiamo anche il valore del danno alla funzione
          damage_ragno(s, enemy_native, danno_da_infliggere);
        }
      });
    }

    // 3. COLLISIONE CON I CACTUS (Aggiornato per HP)
    if (typeof gruppo_cactus !== 'undefined' && gruppo_cactus) {
      s.physics.add.overlap(colpo.ph_obj, gruppo_cactus, function (bullet_native, enemy_native) {

        // Se il proiettile è già stato distrutto in questo frame, esci
        if (!colpo.ph_obj.active) return;

        // 1. Distruggi il proiettile
        PP.assets.destroy(colpo);

        // 2. Applica il danno (1 o 5 a seconda dell'arma)
        // Usiamo 5 per l'inquinante così killa il cactus (che ha 5 HP) in un colpo
        let danno_da_infliggere = entita.modalita_inquinante ? 5 : 1;

        if (typeof damage_cactus === "function") {
          damage_cactus(s, enemy_native, danno_da_infliggere);
        }
      });
    }
  }
}