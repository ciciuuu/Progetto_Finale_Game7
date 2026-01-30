let asset_proiettile_normale;
let asset_proiettile_inquinante;

function preload_proiettili(s) {
    asset_proiettile_normale = PP.assets.image.load(s, "assets/images/PLAYER/Proiettile.png");
    asset_proiettile_inquinante = PP.assets.image.load(s, "assets/images/PLAYER/Proiettile_inquinante.png");
}

function gestisci_sparo(s, entita, muri_livello) {

    let time_now = Date.now();

    // Controllo il fire-rate
    if (time_now > entita.last_fired + entita.fire_rate) {
        entita.last_fired = time_now;
        
        let Y_OFFSET_SPARO = 34;
        let velocita = 600;

        // Scelgo l'immagine in base alla modalità
        let img_da_usare = asset_proiettile_normale;
        
        // LOGICA ARMA INQUINANTE
        if (entita.modalita_inquinante) {
            img_da_usare = asset_proiettile_inquinante;

            // Il player perde vita quando usa quest'arma
            let hp_attuali = PP.game_state.get_variable("HP_player");
            let nuovo_hp = hp_attuali - 1;
            PP.game_state.set_variable("HP_player", nuovo_hp);

            console.log("Sparo inquinante usato! HP rimanenti: " + nuovo_hp);

            // [PHASER] = Effetto Vignetta Viola
            // Uso i Tweens di Phaser perché PoliPhaser non ha un sistema per animare 
            // fluidamente i valori (come l'alpha da 0 a 1 e ritorno).
            if (typeof vignette_dannoviola !== 'undefined' && vignette_dannoviola.ph_obj) {
                s.tweens.killTweensOf(vignette_dannoviola.ph_obj); // Resetto animazioni vecchie
                vignette_dannoviola.ph_obj.alpha = 0; 
                s.tweens.add({
                    targets: vignette_dannoviola.ph_obj,
                    alpha: 1,
                    duration: 100,
                    yoyo: true, // Va e torna
                    hold: 50,
                    ease: 'Power2'
                });
            }

            // Feedback visivo sul player (Viola)
            if (entita.ph_obj) {
                // [PHASER] = SetTint è una proprietà nativa dello sprite che PP non ha
                entita.ph_obj.setTint(0x8e44ad); 
                
                // Uso il Timer per togliere il colore dopo 100ms
                PP.timers.add_timer(s, 100, function() {
                    // Controllo se il player è ancora vivo prima di pulire la tinta
                    if (!entita.is_dead) entita.ph_obj.clearTint();
                }, false); // false = non ripetere
            }

            // Se mi sono ucciso sparando, attivo il game over
            if (nuovo_hp <= 0 && typeof morte_player === "function") {
                PP.game_state.set_variable("causa_morte", "suicidio");
                morte_player(s, entita);
            }
        }

        // Creazione del proiettile
        let colpo = PP.assets.image.add(s, img_da_usare, entita.geometry.x, entita.geometry.y - Y_OFFSET_SPARO, 0.5, 0.5);

        // Salvo il danno dentro l'oggetto (5 se inquinante, 1 se normale)
        colpo.punti_danno = entita.modalita_inquinante ? 5 : 1;

        // Configurazione Fisica
        PP.physics.add(s, colpo, PP.physics.type.DYNAMIC);
        PP.physics.set_allow_gravity(colpo, false); // Il proiettile va dritto

        // Direzione del proiettile
        if (entita.geometry.flip_x) {
            // Se guardo a sinistra, velocità negativa e flippo l'immagine
            PP.physics.set_velocity_x(colpo, -velocita);
            colpo.geometry.flip_x = true;
        } else {
            // Se guardo a destra
            PP.physics.set_velocity_x(colpo, velocita);
            colpo.geometry.flip_x = false;
        }

        // Timer di autodistruzione
        // Se non colpisce nulla dopo 2 secondi, sparisce per non intasare la memoria
        PP.timers.add_timer(s, 2000, function () {
            if (colpo.ph_obj.active) {
                PP.assets.destroy(colpo);
            }
        }, false); // false = esegui una volta sola


        // --- GESTIONE COLLISIONI ---

        // 1. COLLISIONE CON I MURI
        // [PHASER] = Uso collider nativo perché 'muri_livello' è un Layer Tilemap complesso di Godot
        if (typeof muri_livello !== 'undefined' && muri_livello) {
            s.physics.add.collider(colpo.ph_obj, muri_livello, function (b, m) {
                PP.assets.destroy(colpo);
            });
        }

        // 2. COLLISIONE CON I RAGNI
        // [PHASER] = Uso overlap nativo perché 'gruppo_ragni' è un Gruppo Phaser
        // PoliPhaser gestisce meglio collisioni 1vs1, qui serve 1vsGruppo
        if (typeof gruppo_ragni !== 'undefined' && gruppo_ragni) {
            s.physics.add.overlap(colpo.ph_obj, gruppo_ragni, function (bullet_native, enemy_native) {
                if (!colpo.ph_obj.active) return;

                // Recupero il danno salvato nel colpo
                let danno_da_infliggere = colpo.punti_danno;

                PP.assets.destroy(colpo); // Distruggo il proiettile

                if (typeof damage_ragno === "function") {
                    damage_ragno(s, enemy_native, danno_da_infliggere);
                }
            });
        }

        // 3. COLLISIONE CON I CACTUS
        // [PHASER] = Stesso motivo dei ragni: collisione con Gruppo nativo
        if (typeof gruppo_cactus !== 'undefined' && gruppo_cactus) {
            s.physics.add.overlap(colpo.ph_obj, gruppo_cactus, function (bullet_native, enemy_native) {

                if (!colpo.ph_obj.active) return;

                PP.assets.destroy(colpo);

                // Definisco il danno (il cactus muore subito con l'arma inquinante che fa 5 danni)
                let danno_da_infliggere = entita.modalita_inquinante ? 5 : 1;

                if (typeof damage_cactus === "function") {
                    damage_cactus(s, enemy_native, danno_da_infliggere);
                }
            });
        }
    }
}