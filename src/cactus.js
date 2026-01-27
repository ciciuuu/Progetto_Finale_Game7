let img_cactus;
let gruppo_cactus;
let asset_proiettile_cactus;

function preload_cactus(s) {
    img_cactus = PP.assets.sprite.load_spritesheet(s, "assets/images/CACTUS/Animazioni Cactus.png", 30, 37);
    asset_proiettile_cactus = PP.assets.image.load(s, "assets/images/CACTUS/Proiettile.png");
}

function create_cactus(s, muri, spawn_list) {
    // [NATIVO] Creazione gruppo necessaria per collisione con Muri Godot
    if (!gruppo_cactus || !gruppo_cactus.scene) {
        gruppo_cactus = s.physics.add.group();
    }
    if (!spawn_list) return;

    // NESSUNA LOGICA DI PERSISTENZA QUI -> I nemici rinascono sempre
    for (let i = 0; i < spawn_list.length; i++) {
        let dati = spawn_list[i];
        
        // Passiamo il raggio (dati.raggio)
        let nemico = spawna_singolo_cactus(s, dati.x, dati.y, dati.raggio);
        
        // Assegna ID all'oggetto wrapper per usarlo alla morte
        if (dati.id) nemico.id_univoco = dati.id;

        gruppo_cactus.add(nemico.ph_obj);
    }
    if (muri) {
        // [NATIVO] Collisione Gruppo-Gruppo
        s.physics.add.collider(gruppo_cactus, muri);
    }
}

function spawna_singolo_cactus(s, x, y, raggio_custom) {
    // [POLIPHASER] Creazione Sprite
    let cactus = PP.assets.sprite.add(s, img_cactus, x, y, 0, 1);

    cactus.hp = 5;
    cactus.ph_obj.wrapper = cactus;

    // [POLIPHASER] Fisica
    PP.physics.add(s, cactus, PP.physics.type.DYNAMIC);
    
    // [POLIPHASER] Impostazioni fisiche convertite
    PP.physics.set_allow_gravity(cactus, true);
    PP.physics.set_immovable(cactus, true);
    
    PP.physics.set_velocity_x(cactus, 0);
    cactus.geometry.scale_x = 1.3; cactus.geometry.scale_y = 1.3;

    PP.assets.sprite.animation_add(cactus, "idle", 0, 6, 6, -1);
    PP.assets.sprite.animation_add(cactus, "sparo", 7, 12, 10, 0);
    PP.assets.sprite.animation_add(cactus, "morte", 13, 18, 10, 0);
    PP.assets.sprite.animation_play(cactus, "idle");

    let raggio_visione = raggio_custom || 200;

    // [NATIVO] Cerchio Radar (Phaser puro perché PP.shapes.circle_add non esiste)
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

        // Aggiorna posizione radar
        if (cactus_nativo.cerchio_radar) {
            cactus_nativo.cerchio_radar.x = cactus_nativo.x;
            cactus_nativo.cerchio_radar.y = cactus_nativo.y;
            
            if(cactus_nativo.cerchio_radar.body) {
                cactus_nativo.cerchio_radar.body.x = cactus_nativo.x - cactus_nativo.cerchio_radar.body.radius;
                cactus_nativo.cerchio_radar.body.y = cactus_nativo.y - cactus_nativo.cerchio_radar.body.radius;
            }
        }

        if (player.ph_obj.x < cactus_nativo.x) cactus_nativo.flipX = false;
        else cactus_nativo.flipX = true;

        // [NATIVO] Collisione Fisica (Danno al contatto)
        if (s.physics.overlap(player.ph_obj, cactus_nativo)) {
            if (typeof damage_player === "function") damage_player(s, player);
        }

        // [NATIVO] Logica Radar
        let player_nel_raggio = s.physics.overlap(player.ph_obj, cactus_nativo.cerchio_radar);
        let time_now = Date.now();
        let last_fired = cactus_nativo.getData("last_fired") || 0;

        if (player_nel_raggio && time_now > last_fired + 1500) {
            
            // [WORKAROUND "MACCHINOSO" IN POLIPHASER]
            // Invece di usare Raycast matematico, lanciamo una "sonda" invisibile.
            // Se la sonda colpisce il player -> Spara davvero.
            // Se colpisce un muro -> Muore e non spara.
            
            cactus_nativo.setData("last_fired", time_now); // Reset cooldown
            
            // Lanciamo la sonda invisibile verso il player
            lancia_sonda_controllo(s, cactus_nativo.x, cactus_nativo.y, player.ph_obj.x, player.ph_obj.y, player, muri_livello, cactus_nativo);
        
        } else {
            // Gestione animazione Idle se non sta sparando
            let anim_corrente = cactus_nativo.anims.currentAnim ? cactus_nativo.anims.currentAnim.key : "";
            if (anim_corrente !== "sparo") {
                if (cactus_nativo.anims.exists("idle")) cactus_nativo.anims.play("idle", true);
            }
        }
    }
}

// Questa funzione lancia un oggetto INVISIBILE velocissimo per controllare la linea di tiro
function lancia_sonda_controllo(s, x, y, target_x, target_y, player, muri_livello, cactus_nativo) {
    let speed_sonda = 2000; // Molto veloce per essere quasi istantanea
    let Y_OFFSET_SPARO = 36;

    // [POLIPHASER] Creiamo la sonda usando lo sprite del proiettile ma invisibile
    let sonda = PP.assets.image.add(s, asset_proiettile_cactus, x, y - Y_OFFSET_SPARO, 0.5, 0.5);
    
    // Rendiamola invisibile agendo sull'oggetto interno (PP non ha setAlpha diretto wrapper)
    if(sonda.ph_obj) sonda.ph_obj.alpha = 0; 

    PP.physics.add(s, sonda, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(sonda, false);

    let target_neck_y = target_y - 30;
    let angle = Phaser.Math.Angle.Between(x, y - Y_OFFSET_SPARO, target_x, target_neck_y);
    
    let vx = Math.cos(angle) * speed_sonda;
    let vy = Math.sin(angle) * speed_sonda;
    
    PP.physics.set_velocity_x(sonda, vx);
    PP.physics.set_velocity_y(sonda, vy);

    // Timer di sicurezza per distruggere la sonda se non colpisce nulla
    PP.timers.add_timer(s, 500, function () {
        if (sonda.ph_obj.active) PP.assets.destroy(sonda);
    }, false);

    // 1. SE COLPISCE IL PLAYER -> VIA LIBERA!
    PP.physics.add_overlap_f(s, sonda, player, function() {
        PP.assets.destroy(sonda);
        
        // Eseguiamo lo sparo VERO
        if (cactus_nativo.active && cactus_nativo.anims) {
            if (cactus_nativo.anims.exists("sparo")) cactus_nativo.anims.play("sparo", true);
            
            // Ritardo per sincronizzare col frame dell'animazione
            PP.timers.add_timer(s, 300, function () {
                if (cactus_nativo.active && cactus_nativo.body.enable) {
                    spara_proiettile_cactus(s, cactus_nativo.x, cactus_nativo.y, player.ph_obj.x, player.ph_obj.y, player, muri_livello);
                }
            }, false);

            // Torna in idle dopo lo sparo
            PP.timers.add_timer(s, 700, function () {
                if (cactus_nativo.active && cactus_nativo.body.enable && cactus_nativo.anims.exists("idle")) {
                    cactus_nativo.anims.play("idle", true);
                }
            }, false);
        }
    });

    // 2. SE COLPISCE UN MURO -> BLOCCATO!
    if (muri_livello) {
        // [NATIVO] Collisione Sonda-Muri
        s.physics.add.collider(sonda.ph_obj, muri_livello, function() {
            // Ha colpito un muro: distruggi sonda, NON sparare.
            PP.assets.destroy(sonda);
        });
    }
}

function spara_proiettile_cactus(s, x, y, target_x, target_y, player, muri_livello) {
    let speed = 400;
    let Y_OFFSET_SPARO = 36;
    
    // [POLIPHASER] Creazione Proiettile VERO
    let bullet = PP.assets.image.add(s, asset_proiettile_cactus, x, y - Y_OFFSET_SPARO, 0.5, 0.5);

    PP.physics.add(s, bullet, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(bullet, false);
    
    let target_neck_y = target_y - 36;
    let angle = Phaser.Math.Angle.Between(x, y - Y_OFFSET_SPARO, target_x, target_neck_y);
    bullet.ph_obj.rotation = angle;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    
    PP.physics.set_velocity_x(bullet, vx);
    PP.physics.set_velocity_y(bullet, vy);

    PP.timers.add_timer(s, 2000, function () {
        if (bullet.ph_obj.active) PP.assets.destroy(bullet);
    }, false);

    // [POLIPHASER] Collisione Proiettile-Player
    PP.physics.add_overlap_f(s, bullet, player, function (b, p) {
        PP.assets.destroy(bullet);
        if (typeof damage_player === "function") damage_player(s, player);
    });

    // [NATIVO] Collisione Muri
    if (muri_livello) {
        s.physics.add.collider(bullet.ph_obj, muri_livello, function () {
            PP.assets.destroy(bullet);
        });
    }
}

function damage_cactus(s, cactus_nativo, valore_danno) {
    let wrapper = cactus_nativo.wrapper;
    if (!wrapper || wrapper.is_dead) return;

    let danno_effettivo = valore_danno !== undefined ? valore_danno : 1;
    wrapper.hp -= danno_effettivo;

    // [NATIVO] SetTint
    cactus_nativo.setTint(0xff0000);
    s.time.delayedCall(100, () => {
        if (cactus_nativo.active) cactus_nativo.clearTint();
    });

    if (wrapper.hp <= 0) {
        morte_cactus(s, wrapper);
    }
}

function morte_cactus(s, cactus_wrapper) {
    if (cactus_wrapper.is_dead) return;
    cactus_wrapper.is_dead = true;
    let sprite_nativo = cactus_wrapper.ph_obj;

    // [PERSISTENZA] Salva ID nella lista morti (per coerenza futura)
    if (cactus_wrapper.id_univoco) {
        let morti = PP.game_state.get_variable("nemici_uccisi") || [];
        if (!morti.includes(cactus_wrapper.id_univoco)) {
            morti.push(cactus_wrapper.id_univoco);
            PP.game_state.set_variable("nemici_uccisi", morti);
            console.log("Cactus " + cactus_wrapper.id_univoco + " registrato morto.");
        }
    }

    if (sprite_nativo.cerchio_radar) sprite_nativo.cerchio_radar.destroy();
    
    // [NATIVO]
    sprite_nativo.body.enable = false;

    PP.assets.sprite.animation_play(cactus_wrapper, "morte");

    s.time.delayedCall(1000, () => {
        if (sprite_nativo.active) sprite_nativo.destroy();
    });
}