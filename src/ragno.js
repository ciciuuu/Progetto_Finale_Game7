let img_enemy;
let img_enemy2;

let gruppo_ragni; // GRUPPO GLOBALE PER I RAGNI (Così i proiettili li vedono)

let enemy;
let enemy2;
let enemy3;
let enemy4;
let enemy5;

let vulnerable = true;

function preload_enemy(s) {
    img_enemy = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/camminata_danno 36x36.png", 36, 36);
    img_enemy2 = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/attacco 59x59.png", 59, 59);
}

function set_vulnerable() {
    vulnerable = true;
}


function imposta_pattuglia(ragno, min_x, max_x) {
    ragno.pattuglia_min = min_x;     // Salviamo il limite sinistro
    ragno.pattuglia_max = max_x;     // Salviamo il limite destro
    ragno.direzione_corrente = 1;    // 1 = destra, -1 = sinistra
    ragno.is_pattuglia = true;       // Attiviamo l'etichetta
}



// --- FUNZIONE DI SUPPORTO (HELPER) ---
function spawna_ragno(s, x, y) {
    // 1. Crea lo sprite con PoliPhaser
    let nuovo_ragno = PP.assets.sprite.add(s, img_enemy, x, y, 0.5, 1);

    // 2. Aggiunge le animazioni
    PP.assets.sprite.animation_add_list(nuovo_ragno, "camminata", [0, 1, 2, 3], 12, -1);

    // 3. Attiva la fisica PoliPhaser
    PP.physics.add(s, nuovo_ragno, PP.physics.type.DYNAMIC);

    // 4. Imposta la scala
    nuovo_ragno.geometry.scale_x = 1.3;
    nuovo_ragno.geometry.scale_y = 1.3;

    // 5. Avvia animazione
    PP.assets.sprite.animation_play(nuovo_ragno, "camminata");

    return nuovo_ragno;
}

/* function take_damage(s, p1, p2) {
    if (vulnerable) {
        vulnerable = false;
        PP.game_state.set_variable("HP", PP.game_state.get_variable("HP") - 1);
        if (PP.game_state.get_variable("HP") <= 0) {
            PP.scenes.start("game_over");
        }
        PP.timers.add_timer(s, 500, set_vulnerable, false);
    }
} */


function create_enemy(s, muri) { // Ho tolto 'enemy' dai parametri, usiamo le globali

    gruppo_ragni = s.physics.add.group();

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



    /* //copia_incollare per creare un nuovo nemico:
    enemy = PP.assets.sprite.add(s, img_enemy, -8, 0, 0.5, 1);  // 1. dici dove devi spawnarlo - troviamo le coordinate col tasto P del player
    PP.assets.sprite.animation_add_list(enemy, "camminata", [0, 1, 2, 3], 12, -1); // 2. diciamo che animazione deve avere (anche se penso che possiamo comprimerlo in qualche modo)
    PP.physics.add(s, enemy, PP.physics.type.DYNAMIC); // 3. aggiunta di fisica
    
    enemy.geometry.scale_x = 1.3; // 4. aggiunta della scala
    enemy.geometry.scale_y = 1.3;

    gruppo_ragni.add(enemy.ph_obj); // 5. aggiungiamo il nemico al gruppo_ragni (per le collisioni)

    PP.assets.sprite.animation_play(enemy, "camminata"); // 6. avvii l'animazione */



    
    
    
    
    /* // 3. Creiamo il SECONDO NEMICO (coordinate tue: 5, 0)
    enemy2 = PP.assets.sprite.add(s, img_enemy, 5, 0, 0.5, 1);
    PP.physics.add(s, enemy2, PP.physics.type.DYNAMIC); // Assicuriamoci che abbia fisica dinamica

    enemy2.geometry.scale_x = 1.3;
    enemy2.geometry.scale_y = 1.3;

    gruppo_ragni.add(enemy2.ph_obj);

    //FINE ENEMY 2_____________________________________________________________________________________________________________________________


    // 3. Creiamo il TERZO NEMICO (coordinate tue: 1231, 467)
    enemy3 = PP.assets.sprite.add(s, img_enemy, 1231, 467, 0.5, 1);
    PP.physics.add(s, enemy3, PP.physics.type.DYNAMIC); // Assicuriamoci che abbia fisica dinamica

    enemy3.geometry.scale_x = 1.3;
    enemy3.geometry.scale_y = 1.3;

    // --- FIX FISICA ---
    // Azzeriamo l'attrito così non rallenta strusciando a terra
    enemy3.ph_obj.body.setDrag(0);
    enemy3.ph_obj.body.setFriction(0);
    enemy3.ph_obj.body.setBounce(0);

    PP.physics.set_velocity_x(enemy3, 30);
    // Lo aggiungiamo al gruppo
    gruppo_ragni.add(enemy3.ph_obj);

    //FINE ENEMY 3_____________________________________________________________________________________________________________________________

    // 3. Creiamo il QUARTO NEMICO (coordinate tue: 2052, -87)
    enemy4 = PP.assets.sprite.add(s, img_enemy, 2052, -87, 0.5, 1);
    PP.physics.add(s, enemy4, PP.physics.type.DYNAMIC); // Assicuriamoci che abbia fisica dinamica

    enemy4.geometry.scale_x = 1.3;
    enemy4.geometry.scale_y = 1.3;
    // Lo aggiungiamo al gruppo
    gruppo_ragni.add(enemy4.ph_obj);

    //FINE ENEMY 4_____________________________________________________________________________________________________________________________

    // 3. Creiamo il QUINTO NEMICO (coordinate tue: 3742, -141)
    enemy5 = PP.assets.sprite.add(s, img_enemy, 3742, -141, 0.5, 1);
    PP.physics.add(s, enemy5, PP.physics.type.DYNAMIC); // Assicuriamoci che abbia fisica dinamica

    enemy5.geometry.scale_x = 1.3;
    enemy5.geometry.scale_y = 1.3;
    // Lo aggiungiamo al gruppo
    gruppo_ragni.add(enemy5.ph_obj);

    //FINE ENEMY 5_____________________________________________________________________________________________________________________________ */

    /* PP.physics.add(s, enemy, PP.physics.type.DYNAMIC);
    
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
 */



/* function create_enemy(s, player) {
    enemy = PP.assets.sprite.add(s, img_enemy, 0, 0, 0.5, 1);
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


    enemy2 = PP.assets.sprite.add(s, img_enemy, 5, 0, 0.5, 1);



} */



function update_enemy(s) {

    muovi_singolo_ragno(enemy);
    muovi_singolo_ragno(enemy2);
    muovi_singolo_ragno(enemy3);





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










//______________________ IL CODICE QUA SOTTO FUNZIONA COMPLETAMENTE, SOLO CHE NON L'HO ANCORA CAPITO QUINDI LASCIO IL COMMENTO_________________________________________________________________________________________________
/* let img_enemy;
let img_enemy2;
let gruppo_ragni;

// Variabili globali per i singoli nemici
let enemy;
let enemy2;
let enemy3;
let enemy4;
let enemy5;

let vulnerable = true;

function preload_enemy(s) {
    img_enemy = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/camminata_danno 36x36.png", 36, 36);
    img_enemy2 = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/attacco 59x59.png", 59, 59);
}

function set_vulnerable() {
    vulnerable = true;
}

// --- FUNZIONE PER ASSEGNARE IL PERCORSO ---
function imposta_pattuglia(ragno, min_x, max_x) {
    ragno.pattuglia_min = min_x;     // Salviamo il limite sinistro
    ragno.pattuglia_max = max_x;     // Salviamo il limite destro
    ragno.direzione_corrente = 1;    // 1 = destra, -1 = sinistra
    ragno.is_pattuglia = true;       // Attiviamo l'etichetta
}

// --- FUNZIONE DI SUPPORTO CREAZIONE ---
function spawna_ragno(s, x, y) {
    let nuovo_ragno = PP.assets.sprite.add(s, img_enemy, x, y, 0.5, 1);
    PP.assets.sprite.animation_add_list(nuovo_ragno, "camminata", [0, 1, 2, 3], 12, -1);
    PP.physics.add(s, nuovo_ragno, PP.physics.type.DYNAMIC);
    nuovo_ragno.geometry.scale_x = 1.3;
    nuovo_ragno.geometry.scale_y = 1.3;
    PP.assets.sprite.animation_play(nuovo_ragno, "camminata");
    return nuovo_ragno;
}

// --- FUNZIONE DI SUPPORTO FISICA (per l'enemy 3) ---
function azzera_attrito(pp_sprite) {
    if (pp_sprite && pp_sprite.ph_obj && pp_sprite.ph_obj.body) {
        pp_sprite.ph_obj.body.setDrag(0);
        pp_sprite.ph_obj.body.setFriction(0);
        pp_sprite.ph_obj.body.setBounce(0);
    }
}


function create_enemy(s, muri) {
    
    gruppo_ragni = s.physics.add.group();

    // --- NEMICO 1 ---
    enemy = spawna_ragno(s, -8, 0); 
    imposta_pattuglia(enemy, -234, -15); 
    gruppo_ragni.add(enemy.ph_obj);

    // --- NEMICO 2 ---
    // CORREZIONE: Qui usiamo 'enemy2', non sovrascriviamo 'enemy'!
    enemy2 = spawna_ragno(s, 182, -64); 
    // CORREZIONE: Qui usiamo 'enemy2'
    imposta_pattuglia(enemy2, 180, 70); // Nota: ho messo 70 come max (anche se è minore di 180, il codice lo gestirà, ma solitamente min è il numero più basso)
    gruppo_ragni.add(enemy2.ph_obj);
    // ATTENZIONE: Solitamente min_x deve essere più piccolo di max_x. 
    // Se volevi andare da 70 a 180, scrivi: imposta_pattuglia(enemy2, 70, 180);


    // --- NEMICO 3 (Speciale veloce) ---
    enemy3 = spawna_ragno(s, 1231, 467);
    azzera_attrito(enemy3); 
    PP.physics.set_velocity_x(enemy3, 30);
    gruppo_ragni.add(enemy3.ph_obj);

    // --- NEMICO 4 ---
    enemy4 = spawna_ragno(s, 2052, -87);
    // Esempio pattuglia per il 4 (aggiungi se serve)
    // imposta_pattuglia(enemy4, 2000, 2100);
    gruppo_ragni.add(enemy4.ph_obj);

    // --- NEMICO 5 ---
    enemy5 = spawna_ragno(s, 3742, -141);
    gruppo_ragni.add(enemy5.ph_obj);


    // Collisioni
    if (muri) {
        s.physics.add.collider(gruppo_ragni, muri);
    }
}

// --- NUOVA LOGICA MOVIMENTO ---
// Questa funzione prende un ragno e lo muove in base ai SUOI parametri personali
function muovi_singolo_ragno(ragno) {
    // Se il ragno non esiste o non ha pattuglia impostata, esci
    if (!ragno || !ragno.is_pattuglia) return;

    // Nota: Ho invertito la logica min/max per sicurezza. 
    // Assumiamo che pattuglia_min sia il numero più piccolo (sinistra) e max il più grande (destra).
    // Se per caso li passi al contrario, Math.min/max li sistema.
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

    // Applico velocità fissa 100
    PP.physics.set_velocity_x(ragno, 100 * ragno.direzione_corrente);
}


function update_enemy(s) {
    // Ora invece di scrivere un blocco if enorme per 'enemy', 
    // chiamiamo la funzione per ogni ragno che deve pattugliare.
    
    muovi_singolo_ragno(enemy);
    muovi_singolo_ragno(enemy2);
    
    // Se enemy4 ed enemy5 avranno pattuglie, basta togliere il commento:
    // muovi_singolo_ragno(enemy4);
    // muovi_singolo_ragno(enemy5);
} */