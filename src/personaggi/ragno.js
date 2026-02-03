let img_enemy;
let img_enemy2;
let gruppo_ragni;

function preload_enemy(s) {
    img_enemy = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/Morte_e_camminata.png", 36, 36)
    img_enemy2 = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/attacco_59x59.png", 59, 59)
}

function imposta_pattuglia(ragno_wrapper, min_x, max_x) {
    // Configuro il comportamento "vai avanti e indietro"
    // Salvo queste proprietà direttamente nell'oggetto fisico per usarle nell'update
    let sprite = ragno_wrapper.ph_obj;
    sprite.pattuglia_min = min_x
    sprite.pattuglia_max = max_x
    sprite.direzione_corrente = 1 // 1 = Destra, -1 = Sinistra
    sprite.is_pattuglia = true
}

function spawna_ragno(s, x, y) {
    let nuovo_ragno = PP.assets.sprite.add(s, img_enemy, x, y, 0.5, 1);

    // Vite ragno
    nuovo_ragno.hp = 5
    
    // Collego l'oggetto PoliPhaser a quello Phaser per ritrovarlo nelle collisioni
    nuovo_ragno.ph_obj.wrapper = nuovo_ragno

    // Configurazione animazioni
    PP.assets.sprite.animation_add(nuovo_ragno, "camminata", 8, 11, 12, -1)
    PP.assets.sprite.animation_add(nuovo_ragno, "morte", 0, 7, 12, 0)
    
    PP.physics.add(s, nuovo_ragno, PP.physics.type.DYNAMIC)
    
    // Zoom
    nuovo_ragno.geometry.scale_x = 1.7
    nuovo_ragno.geometry.scale_y = 1.7

    // Hitbox
    PP.physics.set_collision_rectangle(nuovo_ragno, 32, 21, 0, 15)
    
    // Parte subito camminando
    PP.assets.sprite.animation_play(nuovo_ragno, "camminata")

    return nuovo_ragno
}

function create_enemy(s, muri, spawn_list, player) {
    // [PHASER] = Uso un Gruppo Fisico nativo
    // Serve per gestire le collisioni di massa con i Muri di Godot
    if (!gruppo_ragni || !gruppo_ragni.scene) {
        gruppo_ragni = s.physics.add.group()
    }

    if (spawn_list) {
        for (let i = 0; i < spawn_list.length; i++) {
            let dati = spawn_list[i]
            
            // Creo il singolo nemico
            let nemico = spawna_ragno(s, dati.x, dati.y)
            
            // Assegno ID per eventuale persistenza futura
            if (dati.id) nemico.id_univoco = dati.id
            
            // Se nel livello ho definito una zona di pattuglia, la imposto
            if (dati.pattuglia) {
                imposta_pattuglia(nemico, dati.pattuglia[0], dati.pattuglia[1])
            }
            
            // Aggiungo il corpo fisico al gruppo Phaser
            gruppo_ragni.add(nemico.ph_obj)
        }
    }

    if (muri) {
        // [PHASER] = Collisione tra Gruppo Ragni e Muri Livello
        s.physics.add.collider(gruppo_ragni, muri)
    }

    // Gestione Danno al contatto col Player
    if (player && player.ph_obj) {
        // [PHASER] = Uso overlap nativo perché confronto un Gruppo (ragni) con uno Sprite (player)
        s.physics.add.overlap(player.ph_obj, gruppo_ragni, function (player_obj, enemy_obj) {
            // Se il ragno è vivo e attivo
            if (enemy_obj.active && enemy_obj.body.enable) {
                
                // Imposto la causa morte e chiamo la funzione di danno
                if (typeof damage_player === "function") {
                    PP.game_state.set_variable("causa_morte", "ragno")
                    damage_player(s, player)
                }
            }
        })
    }
}

function update_enemy(s) {
    if (!gruppo_ragni) return
    
    // Recupero la lista dei figli (i corpi fisici nativi) dal gruppo
    let children = gruppo_ragni.getChildren()
    
    for (let i = 0; i < children.length; i++) {
        let singolo_ragno = children[i]
        // Se il ragno è attivo, calcolo il movimento
        if (singolo_ragno.active && singolo_ragno.body && singolo_ragno.body.enable) {
            muovi_singolo_ragno(singolo_ragno)
        }
    }
}

function muovi_singolo_ragno(ragno_nativo) {
    // Se non è stato configurato per pattugliare, sta fermo
    if (!ragno_nativo.is_pattuglia) return

    // Calcolo limiti
    let limite_sx = Math.min(ragno_nativo.pattuglia_min, ragno_nativo.pattuglia_max)
    let limite_dx = Math.max(ragno_nativo.pattuglia_min, ragno_nativo.pattuglia_max)

    // Logica di inversione marcia:
    // 1. Se tocca un muro a destra -> Vai a sinistra
    if (ragno_nativo.body.blocked.right) {
        ragno_nativo.direzione_corrente = -1
        ragno_nativo.flipX = false
    }
    // 2. Se tocca un muro a sinistra -> Vai a destra
    else if (ragno_nativo.body.blocked.left) {
        ragno_nativo.direzione_corrente = 1
        ragno_nativo.flipX = true
    }
    // 3. Se supera il limite destro della pattuglia -> Torna indietro
    else if (ragno_nativo.x >= limite_dx) {
        ragno_nativo.direzione_corrente = -1
        ragno_nativo.flipX = false
    }
    // 4. Se supera il limite sinistro -> Torna indietro
    else if (ragno_nativo.x <= limite_sx) {
        ragno_nativo.direzione_corrente = 1
        ragno_nativo.flipX = true
    }
    
    // Applico velocità costante
    ragno_nativo.body.setVelocityX(100 * ragno_nativo.direzione_corrente)
}

function damage_ragno(s, ragno_nativo, valore_danno) {
    let wrapper = ragno_nativo.wrapper
    if (!wrapper || wrapper.is_dead) return

    let danno_effettivo = valore_danno !== undefined ? valore_danno : 1
    wrapper.hp -= danno_effettivo

    // [PHASER] = Feedback Visivo (Lampeggio Rosso)
    // Uso setTint nativo e un timer per rimuoverlo
    ragno_nativo.setTint(0xff0000)
    
    // Uso Timer di PoliPhaser
    PP.timers.add_timer(s, 100, function() {
        if (ragno_nativo.active) ragno_nativo.clearTint()
    }, false)

    if (wrapper.hp <= 0) {
        morte_ragno(s, wrapper)
    }
}

function morte_ragno(s, ragno_wrapper) {
    ragno_wrapper.is_dead = true
    let sprite = ragno_wrapper.ph_obj

    // Disabilito la fisica così non fa più danno e non si muove
    sprite.body.enable = false
    
    // Eseguiamo animazione morte
    PP.assets.sprite.animation_play(ragno_wrapper, "morte")

    // Distruggo lo sprite dopo l'animazione (600ms)
    PP.timers.add_timer(s, 600, function() {
        if(sprite.active) sprite.destroy() // [PHASER] destroy diretto su sprite nativo
    }, false)
}

function destroy_enemy(s) { }