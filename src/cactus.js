let img_cactus;
let gruppo_cactus; 
// Variabile per il nuovo proiettile
let asset_proiettile_cactus; 

function preload_cactus(s) {
    img_cactus = PP.assets.sprite.load_spritesheet(s, "assets/images/CACTUS/Animazioni Cactus.png", 33, 40);
    // [NUOVO] Carichiamo il proiettile specifico del cactus
    asset_proiettile_cactus = PP.assets.image.load(s, "assets/images/CACTUS/Proiettile.png");
}

function create_cactus(s, muri, spawn_list) {
    if (!gruppo_cactus || !gruppo_cactus.scene) {
        gruppo_cactus = s.physics.add.group();
    }

    if (!spawn_list) return;

    for (let i = 0; i < spawn_list.length; i++) {
        let dati = spawn_list[i];
        let nemico = spawna_singolo_cactus(s, dati.x, dati.y);
        gruppo_cactus.add(nemico.ph_obj);
    }

    if (muri) {
        s.physics.add.collider(gruppo_cactus, muri);
    }
}

function spawna_singolo_cactus(s, x, y) {
  let cactus = PP.assets.sprite.add(s, img_cactus, x, y, 0.5, 1);
  
  PP.physics.add(s, cactus, PP.physics.type.DYNAMIC);
  cactus.ph_obj.body.allowGravity = true; 
  cactus.ph_obj.body.immovable = true;    
  cactus.ph_obj.body.moves = true; 
  PP.physics.set_velocity_x(cactus, 0);

  cactus.geometry.scale_x = 1.3;
  cactus.geometry.scale_y = 1.3;

  PP.assets.sprite.animation_add(cactus, "idle", 0, 6, 6, -1);
  PP.assets.sprite.animation_add(cactus, "sparo", 7, 12, 10, 0);
  PP.assets.sprite.animation_add(cactus, "morte", 13, 18, 10, 0);

  PP.assets.sprite.animation_play(cactus, "idle");

  let raggio_visione = 200; 
  let cerchio = s.add.circle(x, y, raggio_visione, 0xFF0000, 0.2);
  cerchio.setVisible(false); 

  s.physics.add.existing(cerchio);
  cerchio.body.setCircle(raggio_visione); 
  cerchio.body.allowGravity = false;      
  cerchio.body.moves = false;             
  
  cactus.ph_obj.cerchio_radar = cerchio;
  cactus.ph_obj.setData("last_fired", 0);
  
  return cactus;
}

function update_cactus(s, player, muri_livello) {
  if (!gruppo_cactus) return;

  let children = gruppo_cactus.getChildren();

  for (let i = 0; i < children.length; i++) {
      let cactus_nativo = children[i]; 
      
      if (!cactus_nativo.active || !cactus_nativo.body.enable) {
          if (cactus_nativo.cerchio_radar) {
              cactus_nativo.cerchio_radar.destroy();
              cactus_nativo.cerchio_radar = null;
          }
          continue;
      }

      if (cactus_nativo.cerchio_radar) {
          cactus_nativo.cerchio_radar.x = cactus_nativo.x;
          cactus_nativo.cerchio_radar.y = cactus_nativo.y;
      }

      if (player.ph_obj.x < cactus_nativo.x) {
          cactus_nativo.flipX = false; 
      } else {
          cactus_nativo.flipX = true; 
      }

      // 1. COLLISIONE FISICA CACTUS-PLAYER (DANNO AL CONTATTO)
      // Usiamo l'overlap di Phaser per controllare se il player tocca il corpo del cactus
      if (s.physics.overlap(player.ph_obj, cactus_nativo)) {
          take_damage(s);
      }

      // 2. Logica Radar
      let player_nel_raggio = s.physics.overlap(player.ph_obj, cactus_nativo.cerchio_radar);
      let time_now = Date.now();
      let last_fired = cactus_nativo.getData("last_fired") || 0;

      let anim_corrente = "";
      if (cactus_nativo.anims.currentAnim) {
          anim_corrente = cactus_nativo.anims.currentAnim.key;
      }

      if (player_nel_raggio && time_now > last_fired + 2000) {
          
          cactus_nativo.setData("last_fired", time_now);

          if(cactus_nativo.anims.exists("sparo")) {
              cactus_nativo.anims.play("sparo", true);
          }

          PP.timers.add_timer(s, 300, function() {
              if (cactus_nativo.active && cactus_nativo.body.enable) {
                  spara_proiettile_cactus(s, cactus_nativo.x, cactus_nativo.y, player.ph_obj.x, player.ph_obj.y, player, muri_livello);
              }
          }, false);

          PP.timers.add_timer(s, 700, function() {
              if (cactus_nativo.active && cactus_nativo.body.enable && cactus_nativo.anims.exists("idle")) {
                  cactus_nativo.anims.play("idle", true);
              }
          }, false);

      } 
      else {
          if (anim_corrente !== "sparo") {
               if(cactus_nativo.anims.exists("idle")) {
                  cactus_nativo.anims.play("idle", true);
               }
          }
      }
  }
}

function spara_proiettile_cactus(s, x, y, target_x, target_y, player, muri_livello) {
  let speed = 400;
  
  let Y_OFFSET_SPARO = 36; 

  // [MODIFICA] Usiamo il nuovo asset asset_proiettile_cactus
  let bullet = PP.assets.image.add(s, asset_proiettile_cactus, x, y - Y_OFFSET_SPARO, 0.5, 0.5);

  PP.physics.add(s, bullet, PP.physics.type.DYNAMIC);
  bullet.ph_obj.body.allowGravity = false;

  // --- TRIANGOLAZIONE MIRATA AL COLLO/BUSTO ---
  // Il player ha l'origine ai piedi. Per colpire il "collo", miriamo a Y - 36px
  let target_neck_y = target_y - 36;
  
  let angle = Phaser.Math.Angle.Between(x, y - Y_OFFSET_SPARO, target_x, target_neck_y);

  bullet.ph_obj.rotation = angle;

  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed;

  PP.physics.set_velocity_x(bullet, vx);
  PP.physics.set_velocity_y(bullet, vy);

  // --- TIMER DISTRUZIONE ---
  PP.timers.add_timer(s, 2000, function() {
      if (bullet.ph_obj.active) PP.assets.destroy(bullet);
  }, false);

  // --- COLLISIONI ---

  // 1. Proiettile VS Player (DANNO)
  s.physics.add.overlap(bullet.ph_obj, player.ph_obj, function(b, p) {
      PP.assets.destroy(bullet);
      // Chiamiamo la funzione di danno sistemata in ragno.js
      if (typeof take_damage === "function") {
          take_damage(s);
      }
  });

  // 2. Proiettile VS Muri
  if (muri_livello) {
      s.physics.add.collider(bullet.ph_obj, muri_livello, function() {
          PP.assets.destroy(bullet);
      });
  }

  // 3. Proiettile Cactus VS Proiettili Player
  // Nota: Questo funziona SOLO se i proiettili del player sono in un gruppo globale 
  // (es. s.gruppo_proiettili_player o simile). Se non hai un gruppo, non possiamo farlo facilmente.
  // Qui sotto c'è un esempio generico, se hai un gruppo globale, scommentalo e metti il nome giusto.
  
  
  if (s.gruppo_proiettili_player) {
      s.physics.add.overlap(bullet.ph_obj, s.gruppo_proiettili_player, function(bullet_cactus, bullet_player) {
          bullet_cactus.destroy();
          bullet_player.destroy();
          console.log("Scontro tra proiettili!");
      });
  }
  
}