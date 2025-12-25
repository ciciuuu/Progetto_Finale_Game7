function gestisci_sparo(s, entita, muri_livello) {
  
  let time_now = Date.now();

  // Verifica Cooldown
  if (time_now > entita.last_fired + entita.fire_rate) {

      // Aggiorna tempo ultimo sparo
      entita.last_fired = time_now;

      let Y_OFFSET_SPARO = 25;
      let velocita = 600;
      
      // --- SELEZIONE ASSET ---
      let nome_asset = "proiettile_asset";
      if (entita.modalita_inquinante) {
          nome_asset = "proiettile_inquinante_asset";
      }

      // Creazione Sprite
      let colpo = s.physics.add.sprite(entita.geometry.x, entita.geometry.y - Y_OFFSET_SPARO, nome_asset);
      
      colpo.body.allowGravity = false;
      
      // Direzione
      if (entita.geometry.flip_x) {
          colpo.setVelocityX(-velocita);
          colpo.setFlipX(true);
      } else {
          colpo.setVelocityX(velocita);
          colpo.setFlipX(false);
      }

      // Distruzione a tempo
      s.time.delayedCall(2000, () => {
          if (colpo.active) colpo.destroy();
      });

      // 1. COLLISIONE CON I MURI (Distruggi proiettile)
      if (typeof muri_livello !== 'undefined' && muri_livello) {
          s.physics.add.collider(colpo, muri_livello, function (b, m) {
              b.destroy();
          });
      }

      // 2. COLLISIONE CON I NEMICI (RAGNI)
      // La variabile 'gruppo_ragni' è globale in ragno.js
      if (typeof gruppo_ragni !== 'undefined' && gruppo_ragni) {
          s.physics.add.overlap(colpo, gruppo_ragni, function(b, r) {
              // b = bullet (proiettile), r = ragno
              if (b.active) b.destroy(); // Distruggi proiettile
              if (r.active) r.destroy(); // Distruggi ragno
              console.log("Nemico eliminato!");
          });
      }
  }
}