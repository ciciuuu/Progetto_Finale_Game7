let img_enemy;
let img_enemy2;

let gruppo_ragni; 

let enemy;
let enemy2;
let enemy3; 

let vulnerable = true;

function preload_enemy(s) {
    img_enemy = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/Morte e camminata.png", 36, 36);
    img_enemy2 = PP.assets.sprite.load_spritesheet(s, "assets/images/RAGNO/attacco 59x59.png", 59, 59);
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

function spawna_ragno(s, x, y) {
    let nuovo_ragno = PP.assets.sprite.add(s, img_enemy, x, y, 0.5, 1);

    PP.assets.sprite.animation_add(nuovo_ragno, "camminata", 8, 11, 12, -1);
    PP.assets.sprite.animation_add(nuovo_ragno, "morte", 0, 7, 12, 0);

    PP.physics.add(s, nuovo_ragno, PP.physics.type.DYNAMIC);

    nuovo_ragno.geometry.scale_x = 1.3;
    nuovo_ragno.geometry.scale_y = 1.3;

    // IMPORTANTE: Togliamo l'attrito altrimenti si blocca a terra
    // Notare che usiamo .body.setDrag (perché accediamo al corpo fisico)
    if(nuovo_ragno.ph_obj.body) {
        nuovo_ragno.ph_obj.body.setDrag(0);
        nuovo_ragno.ph_obj.body.setFriction(0);
    }

    PP.assets.sprite.animation_play(nuovo_ragno, "camminata");

    return nuovo_ragno;
}

function create_enemy(s, muri, spawn_list) {
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

    if (muri) {
        s.physics.add.collider(gruppo_ragni, muri);
    }
}

function update_enemy(s) {
    if (!gruppo_ragni) return;

    let children = gruppo_ragni.getChildren();

    for (let i = 0; i < children.length; i++) {
        let singolo_ragno = children[i]; // Questo è lo SPRITE NATIVO di Phaser

        // Controlliamo che esista e che abbia un corpo fisico attivo
        if (singolo_ragno.active && singolo_ragno.body && singolo_ragno.body.enable) {
            muovi_singolo_ragno(singolo_ragno);
        }
    }
}

function muovi_singolo_ragno(ragno_nativo) {
    
    // 1. Controlliamo i dati salvati sullo sprite nativo
    if (!ragno_nativo.is_pattuglia) return;

    let limite_sx = Math.min(ragno_nativo.pattuglia_min, ragno_nativo.pattuglia_max);
    let limite_dx = Math.max(ragno_nativo.pattuglia_min, ragno_nativo.pattuglia_max);

    // 2. Logica Rimbalzo
    // Tocco il limite destro -> Vado a sinistra
    if (ragno_nativo.x >= limite_dx) {
        ragno_nativo.direzione_corrente = -1;
        ragno_nativo.flipX = false; // Sintassi nativa Phaser per girare l'immagine
    }
    // Tocco il limite sinistro -> Vado a destra
    else if (ragno_nativo.x <= limite_sx) {
        ragno_nativo.direzione_corrente = 1;
        ragno_nativo.flipX = true; 
    }

    // 3. APPLICAZIONE VELOCITÀ (CORREZIONE ERRORE)
    // Non usiamo .setVelocityX() direttamente sullo sprite, ma sul suo .body
    ragno_nativo.body.setVelocityX(100 * ragno_nativo.direzione_corrente);
}