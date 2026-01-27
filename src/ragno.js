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
    // [POLIPHASER] Creazione Sprite
    let nuovo_ragno = PP.assets.sprite.add(s, img_enemy, x, y, 0.5, 1);

    // --- AGGIUNTA HP ---
    nuovo_ragno.hp = 5;
    // Facciamo un riferimento comodo per la logica nativa
    nuovo_ragno.ph_obj.wrapper = nuovo_ragno;

    PP.assets.sprite.animation_add(nuovo_ragno, "camminata", 8, 11, 12, -1);
    PP.assets.sprite.animation_add(nuovo_ragno, "morte", 0, 7, 12, 0);
    
    // [POLIPHASER] Fisica
    PP.physics.add(s, nuovo_ragno, PP.physics.type.DYNAMIC);
    
    nuovo_ragno.geometry.scale_x = 1.3;
    nuovo_ragno.geometry.scale_y = 1.3;
    
    // [NATIVO] Impostazioni fisiche specifiche non presenti in PP base
    if (nuovo_ragno.ph_obj.body) {
        nuovo_ragno.ph_obj.body.setDrag(0);
        nuovo_ragno.ph_obj.body.setFriction(0);
    }
    
    PP.assets.sprite.animation_play(nuovo_ragno, "camminata");

    return nuovo_ragno;
}

function create_enemy(s, muri, spawn_list, player) {
    // [NATIVO] Gruppo necessario per collisione con Muri Godot
    if (!gruppo_ragni || !gruppo_ragni.scene) {
        gruppo_ragni = s.physics.add.group();
    }

    // NESSUNA LOGICA DI PERSISTENZA QUI -> I nemici rinascono sempre
    if (spawn_list) {
        for (let i = 0; i < spawn_list.length; i++) {
            let dati = spawn_list[i];
            
            // Nessun controllo skip, li spawniamo tutti
            let nemico = spawna_ragno(s, dati.x, dati.y);
            
            // Assegna ID se presente (non usato per persistenza morte, ma per coerenza)
            if (dati.id) nemico.id_univoco = dati.id;
            
            if (dati.pattuglia) {
                imposta_pattuglia(nemico, dati.pattuglia[0], dati.pattuglia[1]);
            }
            gruppo_ragni.add(nemico.ph_obj);
        }
    }

    if (muri) {
        // [NATIVO] Collisione con i muri di Godot (Gruppo nativo)
        s.physics.add.collider(gruppo_ragni, muri);
    }

    // GESTIONE COLLISIONE COL PLAYER
    if (player && player.ph_obj) {
        // [NATIVO] Uso overlap nativo perché gruppo_ragni è nativo
        s.physics.add.overlap(player.ph_obj, gruppo_ragni, function (player_obj, enemy_obj) {
            // Se il ragno è attivo
            if (enemy_obj.active && enemy_obj.body.enable) {
                // CHIAMIAMO LA FUNZIONE CHE STA IN PLAYER.JS
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

    // Se non passiamo nulla, di default fa 1 danno (per sicurezza)
    let danno = valore_danno || 1;

    // Questa riga serve per evitare l'errore se per caso 
    // valore_danno non viene passato: imposta 1 di default.
    let danno_effettivo = valore_danno !== undefined ? valore_danno : 1;

    wrapper.hp -= danno;

    // Feedback visivo [NATIVO]
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
    let sprite = ragno_wrapper.ph_obj;

    // Disabilitiamo collisioni e movimento [NATIVO]
    sprite.body.enable = false;
    //sprite.setVelocity(0, 0);

    // Eseguiamo animazione morte
    PP.assets.sprite.animation_play(ragno_wrapper, "morte");

    // Distruggiamo lo sprite dopo l'animazione (durata circa 600ms)
    s.time.delayedCall(600, () => {
        sprite.destroy();
    });
}

function destroy_enemy(s) { }