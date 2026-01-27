let img_enemy;
let img_enemy2;
let gruppo_ragni;

function preload_enemy(s) {
    img_enemy = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/Morte e camminata.png", 36, 36);
    img_enemy2 = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/attacco 59x59.png", 59, 59);
}

function imposta_pattuglia(ragno_wrapper, min_x, max_x) {
    let sprite = ragno_wrapper.ph_obj;
    sprite.pattuglia_min = min_x;
    sprite.pattuglia_max = max_x;
    sprite.direzione_corrente = 1;
    sprite.is_pattuglia = true;
}

function spawna_ragno(s, x, y) {
    let nuovo_ragno = PP.assets.sprite.add(s, img_enemy, x, y, 0.5, 1);
    nuovo_ragno.hp = 3;
    nuovo_ragno.ph_obj.wrapper = nuovo_ragno;

    PP.assets.sprite.animation_add(nuovo_ragno, "camminata", 8, 11, 12, -1);
    PP.assets.sprite.animation_add(nuovo_ragno, "morte", 0, 7, 12, 0);
    PP.physics.add(s, nuovo_ragno, PP.physics.type.DYNAMIC);
    nuovo_ragno.geometry.scale_x = 1.3;
    nuovo_ragno.geometry.scale_y = 1.3;
    if (nuovo_ragno.ph_obj.body) {
        nuovo_ragno.ph_obj.body.setDrag(0);
        nuovo_ragno.ph_obj.body.setFriction(0);
    }
    PP.assets.sprite.animation_play(nuovo_ragno, "camminata");
    PP.physics.add(s, nuovo_ragno, PP.physics.type.DYNAMIC);

    return nuovo_ragno;
}

function create_enemy(s, muri, spawn_list, player) {
    if (!gruppo_ragni || !gruppo_ragni.scene) {
        gruppo_ragni = s.physics.add.group();
    }

    // [PERSISTENZA] Recupera lista morti
    let morti = PP.game_state.get_variable("nemici_uccisi") || [];

    if (spawn_list) {
        for (let i = 0; i < spawn_list.length; i++) {
            let dati = spawn_list[i];
            
            // [PERSISTENZA] Se ha un ID ed è nella lista morti, SALTA LO SPAWN
            if (dati.id && morti.includes(dati.id)) {
                console.log("Ragno " + dati.id + " già morto. Skip.");
                continue; 
            }

            let nemico = spawna_ragno(s, dati.x, dati.y);
            
            // Assegna ID all'oggetto
            if (dati.id) nemico.id_univoco = dati.id;

            if (dati.pattuglia) {
                imposta_pattuglia(nemico, dati.pattuglia[0], dati.pattuglia[1]);
            }
            gruppo_ragni.add(nemico.ph_obj);
        }
    }

    if (muri) {
        s.physics.add.collider(gruppo_ragni, muri);
    }

    if (player && player.ph_obj) {
        s.physics.add.overlap(player.ph_obj, gruppo_ragni, function (player_obj, enemy_obj) {
            if (enemy_obj.active && enemy_obj.body.enable) {
                if (typeof damage_player === "function") {
                    damage_player(s, player);
                }
            }
        });
    }
}

function update_enemy(s) {
    if (!gruppo_ragni) return;
    let children = gruppo_ragni.getChildren();
    for (let i = 0; i < children.length; i++) {
        let singolo_ragno = children[i];
        if (singolo_ragno.active && singolo_ragno.body && singolo_ragno.body.enable) {
            muovi_singolo_ragno(singolo_ragno);
        }
    }
}

function muovi_singolo_ragno(ragno_nativo) {
    if (!ragno_nativo.is_pattuglia) return;
    let limite_sx = Math.min(ragno_nativo.pattuglia_min, ragno_nativo.pattuglia_max);
    let limite_dx = Math.max(ragno_nativo.pattuglia_min, ragno_nativo.pattuglia_max);

    if (ragno_nativo.body.blocked.right) {
        ragno_nativo.direzione_corrente = -1;
        ragno_nativo.flipX = false;
    }
    else if (ragno_nativo.body.blocked.left) {
        ragno_nativo.direzione_corrente = 1;
        ragno_nativo.flipX = true;
    }
    else if (ragno_nativo.x >= limite_dx) {
        ragno_nativo.direzione_corrente = -1;
        ragno_nativo.flipX = false;
    }
    else if (ragno_nativo.x <= limite_sx) {
        ragno_nativo.direzione_corrente = 1;
        ragno_nativo.flipX = true;
    }
    ragno_nativo.body.setVelocityX(100 * ragno_nativo.direzione_corrente);
}

function damage_ragno(s, ragno_nativo, valore_danno) {
    let wrapper = ragno_nativo.wrapper;
    if (!wrapper || wrapper.is_dead) return;

    let danno = valore_danno || 1;
    wrapper.hp -= danno;

    ragno_nativo.setTint(0xff0000);
    s.time.delayedCall(100, () => {
        if (ragno_nativo.active) ragno_nativo.clearTint();
    });

    if (wrapper.hp <= 0) {
        morte_ragno(s, wrapper);
    }
}

function morte_ragno(s, ragno_wrapper) {
    ragno_wrapper.is_dead = true;
    
    // [PERSISTENZA] Salva ID nella lista morti
    if (ragno_wrapper.id_univoco) {
        let morti = PP.game_state.get_variable("nemici_uccisi") || [];
        if (!morti.includes(ragno_wrapper.id_univoco)) {
            morti.push(ragno_wrapper.id_univoco);
            PP.game_state.set_variable("nemici_uccisi", morti);
            console.log("Nemico " + ragno_wrapper.id_univoco + " registrato morto.");
        }
    }

    let sprite = ragno_wrapper.ph_obj;
    sprite.body.enable = false;
    PP.assets.sprite.animation_play(ragno_wrapper, "morte");

    s.time.delayedCall(600, () => {
        sprite.destroy();
    });
}

function destroy_enemy(s) { }