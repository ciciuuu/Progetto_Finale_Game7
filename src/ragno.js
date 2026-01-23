let img_enemy;
let img_enemy2;

let gruppo_ragni;

// Variabili globali mantenute
let enemy;
let enemy2;


let vulnerable = true;

function preload_enemy(s) {
    img_enemy = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/Morte e camminata.png", 36, 36);
    img_enemy2 = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/attacco 59x59.png", 59, 59);
}

// --- GESTIONE DANNO E VULNERABILITÀ ---

function set_vulnerable(s, val) {
    if (typeof val !== 'undefined') {
        vulnerable = val;
    } else {
        vulnerable = true;
    }

    // Togliamo il rosso dal player
    // Usiamo 's.player_locale' che abbiamo salvato in create_enemy
    if (s && s.player_locale && s.player_locale.ph_obj) {
        s.player_locale.ph_obj.clearTint();
    }
}

function take_damage(s) {
    if (vulnerable) {
        vulnerable = false;

        // 1. Togli vita
        let hp_attuali = PP.game_state.get_variable("HP_player");
        PP.game_state.set_variable("HP_player", hp_attuali - 1);

        console.log("Danno subito! HP rimanenti: " + (hp_attuali - 1));

        // 2. Feedback visivo (Rosso)
        if (s.player_locale && s.player_locale.ph_obj) {
            s.player_locale.ph_obj.setTint(0xFF0000);
        }

        // 3. Game Over
        if (PP.game_state.get_variable("HP_player") <= 0) {
            PP.scenes.start("game_over");
        }

        // 4. Invulnerabilità per 1 secondo
        PP.timers.add_timer(s, 1000, function () {
            // Passiamo 's' alla funzione corretta
            set_vulnerable(s, true);
        }, false);
    }
}

// --- SPAWN E MOVIMENTO ---

function imposta_pattuglia(ragno_wrapper, min_x, max_x) {
    let sprite = ragno_wrapper.ph_obj;
    sprite.pattuglia_min = min_x;
    sprite.pattuglia_max = max_x;
    sprite.direzione_corrente = 1;
    sprite.is_pattuglia = true;
}

function spawna_ragno(s, x, y) {
    let nuovo_ragno = PP.assets.sprite.add(s, img_enemy, x, y, 0.5, 1);

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
    return nuovo_ragno;
}

// --- FUNZIONE UNICA DI CREAZIONE ---
function create_enemy(s, muri, spawn_list, player) {

    if (!gruppo_ragni || !gruppo_ragni.scene) {
        gruppo_ragni = s.physics.add.group();
    }

    // 1. Spawna i ragni dalla lista
    if (spawn_list) {
        for (let i = 0; i < spawn_list.length; i++) {
            let dati = spawn_list[i];
            let nemico = spawna_ragno(s, dati.x, dati.y);

            if (dati.pattuglia) {
                imposta_pattuglia(nemico, dati.pattuglia[0], dati.pattuglia[1]);
            }
            gruppo_ragni.add(nemico.ph_obj);
        }
    }

    // 2. Collisioni con i muri
    if (muri) {
        s.physics.add.collider(gruppo_ragni, muri);
    }

    // 3. Collisione Danno col Player
    if (player && player.ph_obj) {
        // SALVIAMO IL PLAYER NELLA SCENA PER USARLO DOPO IN TAKE_DAMAGE
        s.player_locale = player;

        s.physics.add.overlap(player.ph_obj, gruppo_ragni, function (player_obj, enemy_obj) {
            // Se il ragno è vivo e attivo
            if (enemy_obj.active && enemy_obj.body.enable) {
                take_damage(s);
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

    if (PP.interactive.kb.is_key_down(s, PP.key_codes.K)) {
        take_damage(s);
    }
}

function muovi_singolo_ragno(ragno_nativo) {
    if (!ragno_nativo.is_pattuglia) return;

    let limite_sx = Math.min(ragno_nativo.pattuglia_min, ragno_nativo.pattuglia_max);
    let limite_dx = Math.max(ragno_nativo.pattuglia_min, ragno_nativo.pattuglia_max);


    // Se tocca un muro a destra, forziamo la direzione a Sinistra
    if (ragno_nativo.body.blocked.right) {
        ragno_nativo.direzione_corrente = -1;
        ragno_nativo.flipX = false;
    }
    // Se tocca un muro a sinistra, forziamo la direzione a Destra
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

function destroy_enemy(s) {

}