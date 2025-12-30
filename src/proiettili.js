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


  // ----- FARE IN POLIPHASER ----- 

  let time_now = Date.now(); 

  // Verifica Cooldown
  if (time_now > entita.last_fired + entita.fire_rate) {

    // Aggiorna tempo ultimo sparo
    entita.last_fired = time_now;

    let Y_OFFSET_SPARO = 25;
    let velocita = 600;

    // --- SELEZIONE ASSET (POLIPHASER) ---
    // Scegliamo quale variabile asset usare
    let img_da_usare = asset_proiettile_normale;
    if (entita.modalita_inquinante) {
      img_da_usare = asset_proiettile_inquinante;
    }

    // --- CREAZIONE (POLIPHASER) ---
    // Usiamo PP per aggiungere l'immagine alla scena
    let colpo = PP.assets.image.add(s, img_da_usare, entita.geometry.x, entita.geometry.y - Y_OFFSET_SPARO, 0.5, 0.5);

    // --- FISICA (POLIPHASER) ---
    // Aggiungiamo la fisica dinamica
    PP.physics.add(s, colpo, PP.physics.type.DYNAMIC);

    // Disabilitiamo la gravità (accesso diretto al body nativo per sicurezza)
    colpo.ph_obj.body.allowGravity = false;

    // --- DIREZIONE E VELOCITÀ (POLIPHASER) ---
    if (entita.geometry.flip_x) {
      PP.physics.set_velocity_x(colpo, -velocita);
      colpo.geometry.flip_x = true;
    } else {
      PP.physics.set_velocity_x(colpo, velocita);
      colpo.geometry.flip_x = false;
    }

    // --- TIMER DISTRUZIONE (POLIPHASER) ---
    PP.timers.add_timer(s, 2000, function () {
      // Controlliamo se esiste ancora prima di distruggerlo
      if (colpo.ph_obj.active) {
        PP.assets.destroy(colpo);
      }
    }, false);

    // --- COLLISIONI ---

    // 1. COLLISIONE CON I MURI
    // Usiamo la fisica nativa per il check, ma distruggiamo l'oggetto PoliPhaser
    if (typeof muri_livello !== 'undefined' && muri_livello) {
      s.physics.add.collider(colpo.ph_obj, muri_livello, function (b, m) {
        // b è l'oggetto nativo, ma noi distruggiamo il wrapper PP 'colpo'
        PP.assets.destroy(colpo);
      });
    }

    // 2. COLLISIONE CON I NEMICI (RAGNI)
    if (typeof gruppo_ragni !== 'undefined' && gruppo_ragni) {
      s.physics.add.overlap(colpo.ph_obj, gruppo_ragni, function (bullet_native, enemy_native) {

        // Distruggi il proiettile (usiamo il riferimento PP)
        PP.assets.destroy(colpo);

        // Distruggi il ragno (enemy_native è lo sprite nativo del gruppo)
        enemy_native.destroy();

        console.log("Nemico eliminato!");
      });
    }
  }
}