let img_cactus;
let gruppo_cactus; 
let asset_proiettile_cactus; 

function preload_cactus(s) {
    img_cactus = PP.assets.sprite.load_spritesheet(s, "assets/images/CACTUS/Animazioni Cactus.png", 33, 40);
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
  cactus.geometry.scale_x = 1.3; cactus.geometry.scale_y = 1.3;

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

      if (player.ph_obj.x < cactus_nativo.x) cactus_nativo.flipX = false; 
      else cactus_nativo.flipX = true; 

      // 1. COLLISIONE FISICA (Danno al contatto)
      if (s.physics.overlap(player.ph_obj, cactus_nativo)) {
          // CHIAMATA A PLAYER.JS
          if (typeof damage_player === "function") damage_player(s, player);
      }

      // 2. Logica Radar
      let player_nel_raggio = s.physics.overlap(player.ph_obj, cactus_nativo.cerchio_radar);
      let time_now = Date.now();
      let last_fired = cactus_nativo.getData("last_fired") || 0;

      if (player_nel_raggio && time_now > last_fired + 2000) {
          cactus_nativo.setData("last_fired", time_now);
          if(cactus_nativo.anims.exists("sparo")) cactus_nativo.anims.play("sparo", true);

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
          let anim_corrente = cactus_nativo.anims.currentAnim ? cactus_nativo.anims.currentAnim.key : "";
          if (anim_corrente !== "sparo") {
               if(cactus_nativo.anims.exists("idle")) cactus_nativo.anims.play("idle", true);
          }
      }
  }
}

function spara_proiettile_cactus(s, x, y, target_x, target_y, player, muri_livello) {
  let speed = 400;
  let Y_OFFSET_SPARO = 36; 
  let bullet = PP.assets.image.add(s, asset_proiettile_cactus, x, y - Y_OFFSET_SPARO, 0.5, 0.5);

  PP.physics.add(s, bullet, PP.physics.type.DYNAMIC);
  bullet.ph_obj.body.allowGravity = false;
  let target_neck_y = target_y - 36;
  let angle = Phaser.Math.Angle.Between(x, y - Y_OFFSET_SPARO, target_x, target_neck_y);
  bullet.ph_obj.rotation = angle;
  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed;
  PP.physics.set_velocity_x(bullet, vx);
  PP.physics.set_velocity_y(bullet, vy);

  PP.timers.add_timer(s, 2000, function() {
      if (bullet.ph_obj.active) PP.assets.destroy(bullet);
  }, false);

  // 1. COLLISIONE PROIETTILE-PLAYER
  s.physics.add.overlap(bullet.ph_obj, player.ph_obj, function(b, p) {
      PP.assets.destroy(bullet);
      // CHIAMATA A PLAYER.JS
      if (typeof damage_player === "function") damage_player(s, player);
  });

  // 2. Collisione Muri
  if (muri_livello) {
      s.physics.add.collider(bullet.ph_obj, muri_livello, function() {
          PP.assets.destroy(bullet);
      });
  }
}