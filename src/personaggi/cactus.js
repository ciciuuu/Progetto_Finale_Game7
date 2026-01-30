let img_cactus;
let gruppo_cactus;
let asset_proiettile_cactus;

function preload_cactus(s) {
    img_cactus = PP.assets.sprite.load_spritesheet(s, "assets/images/CACTUS/Animazioni Cactus.png", 32, 38);
    asset_proiettile_cactus = PP.assets.image.load(s, "assets/images/CACTUS/Proiettile.png");
}

function create_cactus(s, muri, spawn_list, player) {
    // [PHASER] = Collegamento per collisioni muri e pavimenti
    if (!gruppo_cactus || !gruppo_cactus.scene) {
        gruppo_cactus = s.physics.add.group();
    }
    
    // Se non ci sono nemici nella lista (spawn_list), non faccio nulla
    if (!spawn_list) return;

    // Ciclo for per creare tutti i cactus definiti nella lista del livello
    for (let i = 0; i < spawn_list.length; i++) {
        let dati = spawn_list[i];
        
        // Creo il singolo nemico passando posizione e raggio visivo
        let nemico = spawna_singolo_cactus(s, dati.x, dati.y, dati.raggio);
        
        // Assegno l'ID univoco (es. "cactus_1") per ricordarmi se è morto quando cambio livello
        if (dati.id) nemico.id_univoco = dati.id;

        // Aggiungo il corpo fisico del nemico al Gruppo Phaser creato sopra
        gruppo_cactus.add(nemico.ph_obj);

        // Gestione Danno al contatto col Player
        if (player && player.ph_obj) {
            // [PHASER] = Uso overlap nativo diretto tra i corpi fisici per massima affidabilità
            // PoliPhaser a volte ignora l'overlap se l'oggetto nemico è "Immovable"
            s.physics.add.overlap(player.ph_obj, nemico.ph_obj, function(player_native, cactus_native) {
                
                // Recupero il wrapper PoliPhaser che abbiamo collegato in spawna_singolo_cactus
                let wrapper = cactus_native.wrapper; 
                
                // Controllo se il cactus è vivo, attivo e ha la fisica abilitata
                if (wrapper && !wrapper.is_dead && cactus_native.active && cactus_native.body.enable) {
                    
                    PP.game_state.set_variable("causa_morte", "cactus_contatto");
                    
                    // Chiamo la funzione di danno passando l'oggetto player di PoliPhaser
                    if (typeof damage_player === "function") damage_player(s, player);
                }
            });
        }
    }

    // [PHASER] = Attivo la collisione tra tutto il gruppo dei cactus e i muri del livello (Godot).
    // In questo modo i cactus non cadono nel vuoto ma stanno sui blocchi.
    if (muri) {
        s.physics.add.collider(gruppo_cactus, muri);
    }
}

function spawna_singolo_cactus(s, x, y, raggio_custom) {
    let cactus = PP.assets.sprite.add(s, img_cactus, x, y, 0, 1);

    // Impostazioni parametri interni
    cactus.hp = 3;
    cactus.is_dead = false; // Flag per evitare che spari mentre sta morendo
    
    // "Salvo" l'oggetto PoliPhaser dentro quello nativo Phaser.
    // Mi servirà dopo, quando Phaser mi restituirà 'ph_obj' nelle collisioni, per risalire a questo oggetto 'cactus'.
    cactus.ph_obj.wrapper = cactus; 

    // Configurazione Fisica
    PP.physics.add(s, cactus, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(cactus, true); // Deve cadere se non ha terra sotto
    PP.physics.set_immovable(cactus, true);     // Se il player lo tocca, il cactus NON deve spostarsi
    PP.physics.set_velocity_x(cactus, 0);       // Nasce fermo
    
    // Ingrandisco un po' lo sprite
    cactus.geometry.scale_x = 1.3; 
    cactus.geometry.scale_y = 1.3;

    // Configurazione Animazioni
    PP.assets.sprite.animation_add(cactus, "idle", 0, 6, 6, -1);
    PP.assets.sprite.animation_add(cactus, "sparo", 7, 12, 10, 0);
    PP.assets.sprite.animation_add(cactus, "morte", 13, 18, 10, 0);
    PP.assets.sprite.animation_play(cactus, "idle");

    // [PHASER] = Creo il raggio d'azione del proiettile (un cerchio invisibile)
    // Uso Phaser perché PoliPhaser gestisce immagini/sprite, ma non ha funzioni per disegnare 
    // cerchi con proprietà fisiche invisibili
    let raggio_visione = raggio_custom || 200;
    let cerchio = s.add.circle(x, y, raggio_visione, 0xFF0000, 0.2);
    cerchio.setVisible(false); // Non si deve vedere in gioco
    
    // Abilito la fisica sul cerchio per poter usare "overlap" e sentire se il player entra
    s.physics.add.existing(cerchio);
    cerchio.body.setCircle(raggio_visione);
    cerchio.body.allowGravity = false; // Il cerchio deve fluttuare attorno al cactus
    cerchio.body.moves = false;
    
    // Collego il cerchio al cactus per poterlo muovere insieme a lui nell'update
    cactus.ph_obj.cerchio_radar = cerchio;
    cactus.ph_obj.setData("last_fired", 0); // Variabile interna per gestire il tempo tra gli spari
    
    return cactus;
}

function update_cactus(s, player, muri_livello) {
    // Se il gruppo non esiste, non c'è nulla da aggiornare
    if (!gruppo_cactus) return;
    
    // Ottengo la lista di tutti i cactus fisici dal gruppo Phaser
    let children = gruppo_cactus.getChildren();

    for (let i = 0; i < children.length; i++) {
        let cactus_nativo = children[i];

        // Se il cactus è morto o disattivato, pulisco il radar e passo al prossimo
        if (!cactus_nativo.active || !cactus_nativo.body.enable) {
            if (cactus_nativo.cerchio_radar) {
                cactus_nativo.cerchio_radar.destroy();
                cactus_nativo.cerchio_radar = null;
            }
            continue;
        }

        // [LOGICA RAGGIO D'AZIONE]
        // Mantengo il cerchio invisibile esattamente sopra il cactus
        // Se il cactus cade o si muove, il cerchio lo segue
        if (cactus_nativo.cerchio_radar) {
            cactus_nativo.cerchio_radar.x = cactus_nativo.x;
            cactus_nativo.cerchio_radar.y = cactus_nativo.y;
            
            // Aggiorno anche il corpo fisico del cerchio (Phaser richiede offset manuale a volte)
            if(cactus_nativo.cerchio_radar.body) {
                cactus_nativo.cerchio_radar.body.x = cactus_nativo.x - cactus_nativo.cerchio_radar.body.radius;
                cactus_nativo.cerchio_radar.body.y = cactus_nativo.y - cactus_nativo.cerchio_radar.body.radius;
            }
        }

        // Faccio girare lo sprite in base a dove si trova il player (Destra/Sinistra)
        if (player.ph_obj.x < cactus_nativo.x) cactus_nativo.flipX = false;
        else cactus_nativo.flipX = true;

        // [PHASER] = Controllo se il Player è entrato nel cerchio (Radar)
        // Uso overlap nativo perché sto confrontando un Body Circolare (Shape) con uno Sprite
        let player_nel_raggio = s.physics.overlap(player.ph_obj, cactus_nativo.cerchio_radar);
        
        let time_now = Date.now();
        let last_fired = cactus_nativo.getData("last_fired") || 0;

        // LOGICA DI SPARO:
        // 1. Il player è nel cerchio?
        // 2. È passato abbastanza tempo dall'ultimo sparo (1.5 secondi)?
        if (player_nel_raggio && time_now > last_fired + 1500) {
            
            // Resetto il timer di sparo
            cactus_nativo.setData("last_fired", time_now); 
            
            // Ho provato a simulare un Raycast
            // Per verificare che non ci sia un muro o un pavimento lancio una "Sonda" (proiettile invisibile)
            // Se colpisce il player, allora può sparare
            lancia_sonda_controllo(s, cactus_nativo.x, cactus_nativo.y, player.ph_obj.x, player.ph_obj.y, player, muri_livello, cactus_nativo);
        
        } else {
            // Se non sto sparando, torno all'animazione idle
            let anim_corrente = cactus_nativo.anims.currentAnim ? cactus_nativo.anims.currentAnim.key : "";
            if (anim_corrente !== "sparo" && cactus_nativo.anims.exists("idle")) {
                cactus_nativo.anims.play("idle", true);
            }
        }
    }
}

// Funzione "Sonda": Lancia un oggetto invisibile velocissimo per controllare la linea di tiro
function lancia_sonda_controllo(s, x, y, target_x, target_y, player, muri_livello, cactus_nativo) {
    let speed_sonda = 1500; // Velocità altissima, quasi istantanea
    let Y_OFFSET_SPARO = 36; // Altezza da cui parte il colpo (la "bocca" del cactus)

    // Creo la sonda usando l'immagine del proiettile
    let sonda = PP.assets.image.add(s, asset_proiettile_cactus, x, y - Y_OFFSET_SPARO, 0.5, 0.5);
    
    // La rendo invisibile (agisco sull'oggetto interno phaser)
    if(sonda.ph_obj) sonda.ph_obj.alpha = 0; 

    // Fisica della sonda
    PP.physics.add(s, sonda, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(sonda, false); // Va dritta senza cadere

    // Calcolo angolo matematico verso il collo del player (non i piedi)
    let target_neck_y = target_y - 30;
    // [PHASER] Uso la matematica di Phaser per l'angolo (funzione comoda non presente in PP base)
    let angle = Phaser.Math.Angle.Between(x, y - Y_OFFSET_SPARO, target_x, target_neck_y);
    
    let vx = Math.cos(angle) * speed_sonda;
    let vy = Math.sin(angle) * speed_sonda;
    
    PP.physics.set_velocity_x(sonda, vx);
    PP.physics.set_velocity_y(sonda, vy);

    // Timer di sicurezza: se la sonda non colpisce nulla (es. player salta via), si autodistrugge dopo 0.5s
    PP.timers.add_timer(s, 500, function () {
        if (sonda.ph_obj.active) PP.assets.destroy(sonda);
    }, false);

    // CASO 1: VEDO IL PLAYER! (Successo)
    PP.physics.add_overlap_f(s, sonda, player, function() {
        PP.assets.destroy(sonda); // Tolgo la sonda
        
        // Controllo se il cactus che l'ha lanciata è ancora vivo (potrebbe essere morto nel frattempo)
        if (cactus_nativo.active && cactus_nativo.anims) {
            
            // Faccio partire l'animazione grafica di sparo
            if (cactus_nativo.anims.exists("sparo")) cactus_nativo.anims.play("sparo", true);
            
            // Aspetto 300ms, così l'animazione ha il tempo di arrivare al frame dello sparo,
            // perché prima deve "caricare il colpo" e solo dopo creo il proiettile VERO
            PP.timers.add_timer(s, 300, function () {
                if (cactus_nativo.active && cactus_nativo.body.enable) {
                    spara_proiettile_cactus(s, cactus_nativo.x, cactus_nativo.y, player.ph_obj.x, player.ph_obj.y, player, muri_livello);
                }
            }, false);

            // Dopo lo sparo, torno tranquillo in idle dopo 0.7s
            PP.timers.add_timer(s, 700, function () {
                if (cactus_nativo.active && cactus_nativo.body.enable && cactus_nativo.anims.exists("idle")) {
                    cactus_nativo.anims.play("idle", true);
                }
            }, false);
        }
    });

    // CASO 2: VEDO UN MURO! (Fallimento)
    if (muri_livello) {
        // [PHASER] Uso collider nativo per il tilemap layer di Godot (muri)
        s.physics.add.collider(sonda.ph_obj, muri_livello, function() {
            // Ho colpito un muro: distruggi sonda e NON fare nient'altro. Non c'è linea di tiro.
            PP.assets.destroy(sonda);
        });
    }
}

function spara_proiettile_cactus(s, x, y, target_x, target_y, player, muri_livello) {
    let speed = 400; // Velocità normale visibile
    let Y_OFFSET_SPARO = 36;
    
    // Creo il proiettile visibile
    let bullet = PP.assets.image.add(s, asset_proiettile_cactus, x, y - Y_OFFSET_SPARO, 0.5, 0.5);

    PP.physics.add(s, bullet, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(bullet, false);
    
    // Calcoli per la direzione
    let target_neck_y = target_y - 36;
    let angle = Phaser.Math.Angle.Between(x, y - Y_OFFSET_SPARO, target_x, target_neck_y);
    bullet.ph_obj.rotation = angle; // Ruoto l'immagine per puntare verso il player
    
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    
    PP.physics.set_velocity_x(bullet, vx);
    PP.physics.set_velocity_y(bullet, vy);

    // Si distrugge da solo dopo 2 secondi se non colpisce nulla per pulire la memoria
    PP.timers.add_timer(s, 2000, function () {
        if (bullet.ph_obj.active) PP.assets.destroy(bullet);
    }, false);

    // COLPISCE IL PLAYER
    PP.physics.add_overlap_f(s, bullet, player, function (b, p) {
        PP.assets.destroy(bullet);
        // Imposto la causa morte e chiamo il danno
        if (typeof damage_player === "function") 
            PP.game_state.set_variable("causa_morte", "cactus_proiettile");
            damage_player(s, player);
    });

    // COLPISCE I MURI
    if (muri_livello) {
        // [PHASER] = Collisione con Tilemap Godot
        s.physics.add.collider(bullet.ph_obj, muri_livello, function () {
            PP.assets.destroy(bullet);
        });
    }
}

function damage_cactus(s, cactus_nativo, valore_danno) {
    // Recupero il wrapper PoliPhaser
    let wrapper = cactus_nativo.wrapper;
    if (!wrapper || wrapper.is_dead) return;

    let danno_effettivo = valore_danno !== undefined ? valore_danno : 1;
    wrapper.hp -= danno_effettivo;

    // [PHASER] = Gestione Tinta (Feedback Visivo)
    // Uso Phaser nativo perché PoliPhaser non ha una funzione rapida per 
    // "tinta rossa per 100ms e poi normale".
    cactus_nativo.setTint(0xff0000); // Rosso
    PP.timers.add_timer(s, 100, function() {
         if (cactus_nativo.active) cactus_nativo.clearTint(); // Normale
    }, false);

    // Controllo morte
    if (wrapper.hp <= 0) {
        morte_cactus(s, wrapper);
    }
}

function morte_cactus(s, cactus_wrapper) {
    if (cactus_wrapper.is_dead) return;
    cactus_wrapper.is_dead = true;
    let sprite_nativo = cactus_wrapper.ph_obj;

    // PERSISTENZA:
    // Salvo l'ID di questo cactus nella lista "nemici_uccisi" del Game State.
    // Al prossimo avvio del livello, controllerò questa lista per non farlo rinascere.
    if (cactus_wrapper.id_univoco) {
        let morti = PP.game_state.get_variable("nemici_uccisi") || [];
        if (!morti.includes(cactus_wrapper.id_univoco)) {
            morti.push(cactus_wrapper.id_univoco);
            PP.game_state.set_variable("nemici_uccisi", morti);
            console.log("Cactus " + cactus_wrapper.id_univoco + " registrato morto.");
        }
    }

    // Pulisco il radar per evitare errori
    if (sprite_nativo.cerchio_radar) sprite_nativo.cerchio_radar.destroy();
    
    // Disabilito il corpo fisico (così il player ci passa attraverso mentre muore)
    sprite_nativo.body.enable = false;

    // Animazione morte
    PP.assets.sprite.animation_play(cactus_wrapper, "morte");

    // Distruggo l'oggetto definitivamente dopo 1 secondo
    PP.timers.add_timer(s, 1000, function() {
         if (sprite_nativo.active) sprite_nativo.destroy();
    }, false);
}