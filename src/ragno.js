let img_enemy;
let img_enemy2;

let gruppo_ragni;

let enemy;
let enemy2;
let enemy3;

let player;

let vulnerable = true;

function preload_enemy(s) {
    img_enemy = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/Morte e camminata.png", 36, 36);
    img_enemy2 = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/attacco 59x59.png", 59, 59);
}

function set_vulnerable() {
    vulnerable = true;
}

function imposta_pattuglia(ragno_wrapper, min_x, max_x) {
    // Salviamo i dati direttamente sullo sprite nativo (ph_obj), 
    // perché è LUI che viene salvato nel gruppo, non il wrapper PoliPhaser.
    let sprite = ragno_wrapper.ph_obj;

    sprite.pattuglia_min = min_x;
    sprite.pattuglia_max = max_x;
    sprite.direzione_corrente = 1;
    sprite.is_pattuglia = true;
}

// --- FUNZIONE PER TOGLIERE VITA AL PLAYER ---
function take_damage(s) {

    if (vulnerable) {
        vulnerable = false;
        PP.game_state.set_variable("HP_player", PP.game_state.get_variable("HP_player") - 1);
        if (PP.game_state.get_variable("HP_player") <= 0) {
            PP.scenes.start("game_over");
        }
        PP.timers.add_timer(s, 500, set_vulnerable, false);
    }
}

function imposta_pattuglia(ragno, min_x, max_x) {
    ragno.pattuglia_min = min_x;     // Salviamo il limite sinistro
    ragno.pattuglia_max = max_x;     // Salviamo il limite destro
    ragno.direzione_corrente = 1;    // 1 = destra, -1 = sinistra
    ragno.is_pattuglia = true;       // Attiviamo l'etichetta
}



// --- FUNZIONE DI SUPPORTO (HELPER) ---
function spawna_ragno(s, x, y) {
    let nuovo_ragno = PP.assets.sprite.add(s, img_enemy, x, y, 0.5, 1);

    PP.assets.sprite.animation_add(nuovo_ragno, "camminata", 8, 11, 12, -1);
    PP.assets.sprite.animation_add(nuovo_ragno, "morte", 0, 7, 12, 0);

    PP.physics.add(s, nuovo_ragno, PP.physics.type.DYNAMIC);

    nuovo_ragno.geometry.scale_x = 1.3;
    nuovo_ragno.geometry.scale_y = 1.3;

    // IMPORTANTE: Togliamo l'attrito altrimenti si blocca a terra
    // Notare che usiamo .body.setDrag (perché accediamo al corpo fisico)
    if (nuovo_ragno.ph_obj.body) {
        nuovo_ragno.ph_obj.body.setDrag(0);
        nuovo_ragno.ph_obj.body.setFriction(0);
    }

    PP.assets.sprite.animation_play(nuovo_ragno, "camminata");

    return nuovo_ragno;
}

/* function create_enemy(s, muri, spawn_list) {
    if (!gruppo_ragni || !gruppo_ragni.scene) {
        gruppo_ragni = s.physics.add.group();
    }

    if (!spawn_list) return;

    for (let i = 0; i < spawn_list.length; i++) {
        let dati = spawn_list[i];
        let nemico = spawna_ragno(s, dati.x, dati.y);

        // Impostiamo la pattuglia sul wrapper, che la salva sullo sprite nativo
        if (dati.pattuglia) {
            imposta_pattuglia(nemico, dati.pattuglia[0], dati.pattuglia[1]);
        }

        // Aggiungiamo lo sprite nativo al gruppo
        gruppo_ragni.add(nemico.ph_obj);
    } */




function create_enemy(s, muri, player_riferimento, spawn_list) { // Ho tolto 'enemy' dai parametri, usiamo le globali

        gruppo_ragni = s.physics.add.group();

        if (!gruppo_ragni || !gruppo_ragni.scene) {
        gruppo_ragni = s.physics.add.group();
    }

    if (!spawn_list) return;

    for (let i = 0; i < spawn_list.length; i++) {
        let dati = spawn_list[i];
        let nemico = spawna_ragno(s, dati.x, dati.y);

        // Impostiamo la pattuglia sul wrapper, che la salva sullo sprite nativo
        if (dati.pattuglia) {
            imposta_pattuglia(nemico, dati.pattuglia[0], dati.pattuglia[1]);
        }

        // Aggiungiamo lo sprite nativo al gruppo
        gruppo_ragni.add(nemico.ph_obj);
    }

        // NEMICO 1
        enemy = spawna_ragno(s, -8, 0); //punto spawn iniziale (s, posizione_x, posizione_y)
        imposta_pattuglia(enemy, -234, -15); // funzione (enemy, posizione_x sinistra, posizione_x destra)
        gruppo_ragni.add(enemy.ph_obj);

        // NEMICO 2
        enemy2 = spawna_ragno(s, 182, -64); //punto spawn iniziale (s, posizione_x, posizione_y)
        imposta_pattuglia(enemy2, 180, 70); // funzione (enemy, posizione_x sinistra, posizione_x destra)
        gruppo_ragni.add(enemy2.ph_obj);

        // NEMICO 3
        enemy3 = spawna_ragno(s, -30, 0); //punto spawn iniziale (s, posizione_x, posizione_y)
        imposta_pattuglia(enemy3, -200, -50); // funzione (enemy, posizione_x sinistra, posizione_x destra)
        gruppo_ragni.add(enemy3.ph_obj);





        // 4. Collisione tra TUTTI i ragni e i muri
        if (muri) {
            s.physics.add.collider(gruppo_ragni, muri);
        }

        // --- COLLISIONE CON IL PLAYER (VERSIONE SICURA) ---
        // Invece di 'enemy', usiamo 'gruppo_ragni'. 
        // Invece della variabile globale 'player', usiamo quella passata come parametro.
        if (player_riferimento && player_riferimento.ph_obj) {
            s.physics.add_overlap_f(gruppo_ragni, player_riferimento.ph_obj, function (enemy, player_obj) {
                take_damage(s);
            });
        }
    }
    // --- NUOVA LOGICA MOVIMENTO ---
    // Questa funzione prende un ragno e lo muove in base ai SUOI parametri personali
    function muovi_singolo_ragno(ragno) {
        // Se il ragno non esiste o non ha pattuglia impostata, esci
        // 1. Controllo base: l'oggetto esiste? Ha la pattuglia attivata?
        if (!ragno || !ragno.is_pattuglia) return;

        // 2. Controlliamo se il ragno ha ancora un corpo fisico (.ph_obj e .body).
        // Se è stato colpito e distrutto, queste proprietà spariscono.
        // Se mancano, ci fermiamo subito ("return") per evitare l'errore.
        if (!ragno.ph_obj || !ragno.ph_obj.body) return;


        // --- Da qui in poi è uguale a prima ---  
        let limite_sx = Math.min(ragno.pattuglia_min, ragno.pattuglia_max);
        let limite_dx = Math.max(ragno.pattuglia_min, ragno.pattuglia_max);

        // Tocco il limite destro -> Vado a sinistra
        if (ragno.geometry.x >= limite_dx) {
            ragno.direzione_corrente = -1;
            ragno.geometry.flip_x = false;
        }
        // Tocco il limite sinistro -> Vado a destra
        else if (ragno.geometry.x <= limite_sx) {
            ragno.direzione_corrente = 1;
            ragno.geometry.flip_x = true;
        }

        PP.physics.set_velocity_x(ragno, 100 * ragno.direzione_corrente);
    }

    function update_enemy(s) {

        muovi_singolo_ragno(enemy);
        muovi_singolo_ragno(enemy2);
        muovi_singolo_ragno(enemy3);

        if (PP.interactive.kb.is_key_down(s, PP.key_codes.K)) {
            console.log("Tasto K premuto: forzo take_damage");
            take_damage(s);
        }



        /*   if (!enemy) return;
      
      
          if (enemy.geometry.x >= -13) {
              enemy_direzione = -1;
              enemy.geometry.flip_x = false; // O true, dipende dal disegno
          }
          // Se supero il limite SINISTRO (-234) -> Vado a Destra (1)
          else if (enemy.geometry.x <= -234) {
              enemy_direzione = 1;
              enemy.geometry.flip_x = true; // O false
          }
      
          PP.physics.set_velocity_x(enemy, 100 * enemy_direzione); //---FONDAMENTALE, senza questo non funziona nulla
       */


        /* if (enemy.geometry.x >= -13) {
            // Ho toccato il muro a destra, devo andare a SINISTRA
            PP.physics.set_velocity_x(enemy, -100);
    
            // Non flippare (o flippa a seconda di come è disegnata la sprite)
            enemy.geometry.flip_x = false;
    
            PP.assets.sprite.animation_play(enemy, "camminata");
        }
        // 2. Controllo il Limite SINISTRO (Numero più piccolo, -234)
        else if (enemy.geometry.x <= -234) {
            // Ho toccato il muro a sinistra, devo andare a DESTRA
            PP.physics.set_velocity_x(enemy, 100);
    
            // Flippa la sprite (nota: usa 'enemy', non 'player')
            enemy.geometry.flip_x = true;
    
            PP.assets.sprite.animation_play(enemy, "camminata");
        } */


        /*   if(enemy.geometry.x >= 1000) {
              // Hit right boundary
              PP.physics.set_velocity_x(enemy, -100);
              PP.assets.sprite.animation_play(enemy, "walk_left");
          }
          else if (enemy.geometry.x <= 600) {
              // Hit left boundary
              PP.physics.set_velocity_x(enemy, 100);
              PP.assets.sprite.animation_play(enemy, "walk_right");
          }
       */





        /* function create_enemy(s, player) {
        enemy = PP.assets.sprite.add(s, img_enemy, 800, 500, 0.5, 1);
        PP.physics.add(s, enemy, PP.physics.type.DYNAMIC);
        PP.physics.add_collider(s, enemy);
    
        PP.physics.add_overlap_f(s, enemy, player, take_damage);
    
        // Velocità iniziale del nemico (verso dx)
        PP.physics.set_velocity_x(enemy, 100);
    
        // Aggiungo le animazioni walk dx/sx
        PP.assets.sprite.animation_add(enemy, "walk_left", 0, 3, 15, -1);
        PP.assets.sprite.animation_add(enemy, "walk_right", 0, 3, 15, -1);
    
        // Iniziamo andando a destra
        PP.assets.sprite.animation_play(enemy, "walk_right");
    
        // Qui imposto la scala del personaggio
        enemy.geometry.scale_x = 2;
        enemy.geometry.scale_y = 2;
    
    }
    
    function update_enemy(s) {
        if(enemy.geometry.x >= 1000) {
            // Hit right boundary
            PP.physics.set_velocity_x(enemy, -100);
            PP.assets.sprite.animation_play(enemy, "walk_left");
            enemy.geometry.flip_x = false;
        }
        else if (enemy.geometry.x <= 600) {
            // Hit left boundary
            PP.physics.set_velocity_x(enemy, 100);
            PP.assets.sprite.animation_play(enemy, "walk_right");
            enemy.geometry.flip_x = true;
        }
    } */



        /* // DEBUG: Premi 'L' per vedere la distanza in console
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.P)) {
    
            // 1. CONFIGURAZIONE: CAMBIA SOLO IL NOME QUI SOTTO
            let OGGETTO_TARGET = enemy; // <--- Sostituisci 'ingranaggio' con 'enemy1' o altro
    
    
            // 2. Otteniamo gli oggetti nativi
            let p_obj = player.ph_obj;
            let t_obj = OGGETTO_TARGET.ph_obj; // t_obj sta per Target Object
            let cam = s.cameras.main;
    
            // 3. Calcolo Posizione "Mondo" Intelligente
            // Se l'oggetto ha scrollFactor 0 (è un HUD fisso), dobbiamo sommare la camera.
            // Se l'oggetto è normale (si muove col livello), usiamo la sua coordinata diretta.
            let target_world_x = (t_obj.scrollFactorX === 0) ? cam.scrollX + t_obj.x : t_obj.x;
            let target_world_y = (t_obj.scrollFactorY === 0) ? cam.scrollY + t_obj.y : t_obj.y;
    
            // 4. Calcolo Distanza
            let dist_x = Math.abs(p_obj.x - target_world_x);
            let dist_y = Math.abs(p_obj.y - target_world_y);
    
            console.clear();
            console.log("--- DEBUG DISTANZA ---");
            console.log(`Player: x=${p_obj.x.toFixed(0)}, y=${p_obj.y.toFixed(0)}`);
            console.log(`Target (${OGGETTO_TARGET == ingranaggio ? "HUD" : "World"}): x=${target_world_x.toFixed(0)}, y=${target_world_y.toFixed(0)}`);
            console.log(`%cDISTANZA X: ${dist_x.toFixed(2)}`, "color: yellow; font-weight: bold;");
            console.log(`%cDISTANZA Y: ${dist_y.toFixed(2)}`, "color: yellow; font-weight: bold;");
        } */
    }
