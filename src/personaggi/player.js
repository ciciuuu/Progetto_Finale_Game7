let player_speed = 300 // Velocità camminata normale
let player_speed2 = 600 // Velocità corsa (Debug/Cheat)
let jump_init_speed = 500 // Potenza del salto
let space_pressed = false // Per evitare il "salto continuo" tenendo premuto
let mid_jump = true // true = primo salto disponibile, false = secondo salto usato
let curr_anim = "stop" // Per non resettare l'animazione ogni frame
let j_pressed = false // Per il toggle della God Mode

// Variabili per la gestione del danno e morte
let player_vulnerable = true // Invulnerabilità temporanea dopo essere colpiti
let sipario_nero_obj = null // Rettangolo nero per l'effetto dissolvenza morte
let is_fading_death = false // Se true, stiamo facendo la dissolvenza verso Game Over

// Variabili per i livelli grafici (Layer)
let layer_effetti;
let layer_player;

// Variabile per l'asset grafico della nuvoletta
let img_nuvoletta;


function preload_player(s) {
    // Carico lo spritesheet per l'effetto visivo del doppio salto
    img_nuvoletta = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/Nuvoletta doppio salto.png", 39, 21)
}


function configure_player_animations(s, player) {
    
    // Creazione dei Layer per gestire la profondità (Z-Index)
    // Il player deve stare davanti allo sfondo ma dietro agli effetti (HUD/Dissolvenza)
    layer_player = PP.layers.create(s)
    PP.layers.set_z_index(layer_player, 10)
    PP.layers.add_to_layer(layer_player, player)

    layer_effetti = PP.layers.create(s)
    PP.layers.set_z_index(layer_effetti, 9999) // Altissimo per coprire tutto

    // --- ANIMAZIONI ---
    // Definisco tutte le possibili azioni del player leggendo i frame dallo spritesheet
    
    // Movimento base
    PP.assets.sprite.animation_add_list(player, "run", [0, 1, 2, 3, 4, 5, 6, 7, 8], 13, -1)
    PP.assets.sprite.animation_add_list(player, "idle", [10, 11, 12, 13, 14, 15], 8, -1)
    
    // Salto Singolo (Salita e Discesa)
    PP.assets.sprite.animation_add(player, "jump_up", 3, 4, 10, 0)
    PP.assets.sprite.animation_add(player, "jump_down", 6, 7, 10, 0)

    // Doppio Salto (Usa frame diversi per far capire che è il secondo scatto)
    PP.assets.sprite.animation_add_list(player, "double_jump_up", [2, 3, 4], 10, 0)
    PP.assets.sprite.animation_add_list(player, "double_jump_down", [6, 7], 10, 0)

    PP.assets.sprite.animation_add(player, "stop", 21, 21, 10, 0)
    
    // Dialogo
    PP.assets.sprite.animation_add_list(player, "parla", [25, 29, 30, 34, 35, 39], 8, -1)

    // Sparo Inquinante (Pistola Base) - A terra
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante", [41, 42, 43, 36, 37, 38], 8, -1)
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante_fermo", [61, 62, 63, 56, 57, 58], 8, -1)
    // Sparo Inquinante - In aria
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante_salto_su", [16, 17, 18], 8, 0)
    PP.assets.sprite.animation_add_list(player, "sparo_inquinante_salto_giu", [21, 22, 23], 8, 0)

    // Sparo Rinnovabile (Pistola Potenziata) - A terra
    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile", [51, 52, 53, 46, 47, 48], 11, -1)
    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile_fermo", [71, 72, 73, 66, 67, 68], 11, -1)
    // Sparo Rinnovabile - In aria
    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile_salto_su", [26, 27, 28], 11, 0)
    PP.assets.sprite.animation_add_list(player, "sparo_rinnovabile_salto_giu", [31, 32, 33], 11, 0)

    // Configurazione Hitbox (Rettangolo di collisione)
    // Riduco la larghezza perché lo sprite ha spazio vuoto ai lati
    PP.physics.set_collision_rectangle(player, 20, 44, 14, 8)
    player.facing_right = true // Parte guardando a destra

    // Inizializzazione variabili interne al player
    player.sparo_attivo = false
    player.coyote_counter = 0 // Per tolleranza salto al bordo delle piattaforme
    player.is_frozen = false // Per bloccarlo durante i dialoghi
    player.last_fired = 0
    player.modalita_inquinante = false 
    player.tasto_R_rilasciato = true   
    player.fire_rate = 400     
    player.anim_sparo_corrente = "sparo_rinnovabile"
    player.god_mode = false // Trucco per volare
    player.is_dead = false 
    player_vulnerable = true
    
    // [PHASER] = Accesso diretto per pulire tinta e alpha
    // Poliphaser non ha funzioni rapide per resettare questi stati visivi complessi
    if(player.ph_obj) {
        player.ph_obj.clearTint() 
        player.ph_obj.alpha = 1 
    }

    sipario_nero_obj = null
    is_fading_death = false
}

// Funzione per spawnare la nuvoletta sotto i piedi quando si fa il doppio salto
function spawn_nuvoletta(s, x, y) {
    let nuvola = PP.assets.sprite.add(s, img_nuvoletta, x, y, 0.5, 0.5)
    PP.layers.add_to_layer(layer_player, nuvola)
    
    // Animazione "poof" che sparisce
    PP.assets.sprite.animation_add_list(nuvola, "poof", [0, 1, 2, 3], 15, 0)
    PP.assets.sprite.animation_play(nuvola, "poof")

    // [PHASER] = Evento 'animationcomplete'
    // Serve per distruggere l'oggetto appena l'animazione finisce, per liberare memoria
    nuvola.ph_obj.on('animationcomplete', function() {
        PP.assets.destroy(nuvola)
    })
}

function damage_player(s, player) {
    // Se è invulnerabile, morto o in god mode, ignoro il danno
    if (!player_vulnerable || player.is_dead || player.god_mode) return

    player_vulnerable = false // Attivo invulnerabilità temporanea

    // Calcolo nuova vita e aggiorno lo stato globale
    let hp_attuali = PP.game_state.get_variable("HP_player")
    let hp_rimanenti = hp_attuali - 1
    PP.game_state.set_variable("HP_player", hp_rimanenti)

    console.log("Colpito! HP rimasti: " + hp_rimanenti)

    // Attivo l'effetto vignetta rossa sull'HUD (se presente)
    // [PHASER] = Uso i Tweens (animazioni fluide di valori)
    // Poliphaser non espone direttamente il sistema di Tweens
    if (typeof vignette_dannorosso !== 'undefined' && vignette_dannorosso) {
        vignette_dannorosso.ph_obj.alpha = 0 
        s.tweens.add({
            targets: vignette_dannorosso.ph_obj,
            alpha: 1,           
            duration: 150,      
            yoyo: true,         
            hold: 100,          
            ease: 'Power2'
        })
    }

    // Coloro il player di rosso
    // [PHASER] = setTint non presente in Poliphaser
    if (player.ph_obj) {
        player.ph_obj.setTint(0xff523b)
    }

    // Se la vita arriva a 0, muoio
    if (hp_rimanenti <= 0) {
        morte_player(s, player)
        return 
    }

    // Gestione Invulnerabilità (Lampeggio)
    let tempo_rosso = 200          
    let tempo_totale_inv = 1500    
    let velocita_blink = 150        

    // Timer 1: Rimuovo il rosso dopo poco
    PP.timers.add_timer(s, tempo_rosso, function () {
        if (player && player.ph_obj && !player.is_dead) {
            player.ph_obj.clearTint() // [PHASER]
        }
    }, false)

    // Ciclo per far lampeggiare il player (trasparenza Si/No)
    let tempo_disponibile_blink = tempo_totale_inv - tempo_rosso
    let numero_tick = Math.floor(tempo_disponibile_blink / velocita_blink)

    for(let i = 0; i < numero_tick; i++) {
        let momento_esatto = tempo_rosso + (i * velocita_blink)

        PP.timers.add_timer(s, momento_esatto, function () {
            if (player && player.ph_obj && !player.is_dead) {
                // [PHASER] Cambio alpha per effetto fantasma
                player.ph_obj.alpha = (player.ph_obj.alpha === 1) ? 0.2 : 1
            }
        }, false)
    }

    // Timer Finale: Torno normale e vulnerabile
    PP.timers.add_timer(s, tempo_totale_inv, function () {
        if (player && player.ph_obj) {
            player_vulnerable = true 
            player.ph_obj.alpha = 1  
            player.ph_obj.clearTint()
        }
    }, false)
}

function morte_player(s, player) {
    if (player.is_dead) return 
    player.is_dead = true

    if (player && player.ph_obj.active) {
        // [PHASER] Tint rosso e disattivazione fisica
        player.ph_obj.setTint(0xFF0000) 
        player.ph_obj.body.enable = false 
        
        PP.physics.set_velocity_x(player, 0)
        PP.physics.set_velocity_y(player, 0)
    }

    // Creo un rettangolo nero grande quanto tutto lo schermo per la dissolvenza
    sipario_nero_obj = PP.shapes.rectangle_add(s, 
        PP.game.config.canvas_width/2, 
        PP.game.config.canvas_height/2, 
        PP.game.config.canvas_width, 
        PP.game.config.canvas_height, 
        "0x000000", 
        0 // Inizia trasparente
    )
    
    if (layer_effetti) {
        PP.layers.add_to_layer(layer_effetti, sipario_nero_obj)
    }
    
    // [PHASER] Fisso il rettangolo alla camera così non si muove col mondo
    sipario_nero_obj.ph_obj.setScrollFactor(0)

    is_fading_death = true
}

function manage_player_update(s, player, muri_livello) {

    // Se sono morto, gestisco l'animazione di fade-out nero
    if (is_fading_death && sipario_nero_obj) {
        if (sipario_nero_obj.visibility.alpha < 1) {
            sipario_nero_obj.visibility.alpha += 0.02 
        } else {
            is_fading_death = false
            // Salvo dove sono morto per il checkpoint
            PP.game_state.set_variable("ultimo_livello", s.scene.key)
            PP.scenes.start("game_over")
            return
        }
    }

    // Se sto parlando col vecchietto, sono bloccato
    if (player.is_frozen) {
        PP.physics.set_velocity_x(player, 0)
        // [PHASER] Controllo quale animazione sta girando per non resettare 'idle'
        if (player.ph_obj.anims.currentAnim && 
            player.ph_obj.anims.currentAnim.key !== "idle" && 
            player.ph_obj.anims.currentAnim.key !== "parla") {
            PP.assets.sprite.animation_play(player, "idle")
        }
        return 
    }
    
    if (player.is_dead) return

    // --- GOD MODE (Volo libero) ---
    // Si attiva con J. Permette di volare attraverso i muri per testare.
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.J)) {
        if (j_pressed == false) {
            player.god_mode = !player.god_mode
            j_pressed = true
            if (player.god_mode) {
                PP.physics.set_allow_gravity(player, false) // Niente gravità
                PP.physics.set_velocity_y(player, 0)
                player.ph_obj.setTint(0xFFFF00) // Diventa giallo
            } else {
                PP.physics.set_allow_gravity(player, true) // Torna normale
                player.ph_obj.clearTint()
            }
        }
    } else {
        j_pressed = false
    }

    // Logica di movimento God Mode (WASD per muoversi in aria)
    if (player.god_mode) {
        let speed_fly = 1200
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
            PP.physics.set_velocity_x(player, speed_fly)
            player.geometry.flip_x = false
        } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
            PP.physics.set_velocity_x(player, -speed_fly)
            player.geometry.flip_x = true
        } else {
            PP.physics.set_velocity_x(player, 0)
        }

        if (PP.interactive.kb.is_key_down(s, PP.key_codes.W) || PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
            PP.physics.set_velocity_y(player, -speed_fly)
        } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
            PP.physics.set_velocity_y(player, speed_fly)
        } else {
            PP.physics.set_velocity_y(player, 0)
        }
        return // Esco perché il resto del codice è per la fisica normale
    }

    // --- MOVIMENTO STANDARD ---
    let next_anim = curr_anim

    // Controllo se l'HUD ha cambiato la modalità di sparo (tasto L)
    if (typeof hud_modalita_inquinante !== 'undefined') {
        if (player.modalita_inquinante !== hud_modalita_inquinante) {
            player.modalita_inquinante = hud_modalita_inquinante
            if (player.modalita_inquinante) {
                player.fire_rate = 750 
                player.anim_sparo_corrente = "sparo_inquinante"
            } else {
                player.fire_rate = 400 
                player.anim_sparo_corrente = "sparo_rinnovabile"
            }
        }
    }

    // Input Sparo
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.N)) {
        player.sparo_attivo = true
        // Richiamo la funzione esterna per creare i proiettili
        if(typeof gestisci_sparo === "function") gestisci_sparo(s, player, muri_livello)
    } else {
        player.sparo_attivo = false
    }

    let is_moving = false
    let target_velocity_x = 0

    // Movimento Destra
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.D)) {
        target_velocity_x = player_speed
        // Se mi sto girando, aggiorno l'hitbox (il rettangolo di collisione)
        // perché lo sprite non è simmetrico
        if (player.facing_right === false) {
            player.geometry.flip_x = false
            PP.physics.set_collision_rectangle(player, 20, 44, 14, 8)
            player.facing_right = true 
        }
        is_moving = true
    } 
    // Movimento Sinistra
    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.A)) {
        target_velocity_x = -player_speed
        if (player.facing_right === true) {
            player.geometry.flip_x = true
            PP.physics.set_collision_rectangle(player, 20, 44, 20, 8) // Offset diverso
            player.facing_right = false
        }
        is_moving = true
    }
    // Corsa Veloce (Cheat)
    else if (PP.interactive.kb.is_key_down(s, PP.key_codes.C)) {
        target_velocity_x = player_speed2
        if (player.facing_right === false) {
            player.geometry.flip_x = false
            PP.physics.set_collision_rectangle(player, 20, 44, 14, 8)
            player.facing_right = true
        }
        is_moving = true
    } else if (PP.interactive.kb.is_key_down(s, PP.key_codes.Z)) {
        target_velocity_x = -player_speed2
        if (player.facing_right === true) {
            player.geometry.flip_x = true
            PP.physics.set_collision_rectangle(player, 20, 44, 20, 8)
            player.facing_right = false
        }
        is_moving = true
    }

    // Se sparo mentre corro, rallento un po' per il rinculo/focus
    if (player.sparo_attivo && is_moving) {
        let direzione = player.geometry.flip_x ? -1 : 1
        target_velocity_x = 150 * direzione
    }

    PP.physics.set_velocity_x(player, target_velocity_x)

    // ==========================================
    // --- GESTIONE SALTO E DOPPIO SALTO ---
    // ==========================================
    
    // Controllo se i piedi toccano terra
    let is_on_solid_ground = player.ph_obj.body.blocked.down

    // 1. A TERRA
    if (is_on_solid_ground) {
        // Coyote time: mi da qualche frame di tempo per saltare anche se sono appena caduto dal bordo
        player.coyote_counter = 10 
        mid_jump = true // Ricarico il doppio salto
    } else {
        if (player.coyote_counter > 0) player.coyote_counter--
    }

    // 2. PRIMO SALTO (Da terra o coyote)
    if (player.coyote_counter > 0) {
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false) {
            space_pressed = true
            PP.physics.set_velocity_y(player, -jump_init_speed)
            player.coyote_counter = 0 // Consumo il coyote
        }
    }

    // 3. SECONDO SALTO (A mezz'aria)
    if (!is_on_solid_ground) {
        if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) && space_pressed == false && mid_jump == true) {
            
            // Spawn dell'effetto grafico (nuvola)
            spawn_nuvoletta(s, player.ph_obj.x, player.ph_obj.y)

            space_pressed = true
            PP.physics.set_velocity_y(player, -jump_init_speed)
            mid_jump = false // Consumo il doppio salto
        }
    }

    // Rilascio tasto per salto variabile (se lascio spazio, smetto di salire)
    if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE)) {
        if (space_pressed) {
            let current_vy = player.ph_obj.body.velocity.y 
            if (current_vy < -50) {
                PP.physics.set_velocity_y(player, current_vy * 0.5) // Freno la salita
            }
            space_pressed = false
        }
    }

    // --- SELETTORE ANIMAZIONI ---
    // Decide quale animazione mostrare in base allo stato
    
    let anim_sparo_corsa = player.anim_sparo_corrente 
    let anim_sparo_fermo = player.modalita_inquinante ? "sparo_inquinante_fermo" : "sparo_rinnovabile_fermo"
    let anim_sparo_salto_su = player.modalita_inquinante ? "sparo_inquinante_salto_su" : "sparo_rinnovabile_salto_su"
    let anim_sparo_salto_giu = player.modalita_inquinante ? "sparo_inquinante_salto_giu" : "sparo_rinnovabile_salto_giu"

    if (!is_on_solid_ground) {
        let v_y = player.ph_obj.body.velocity.y
        
        if (player.sparo_attivo) {
            next_anim = (v_y < 0) ? anim_sparo_salto_su : anim_sparo_salto_giu
        } else {
            // Se mid_jump è true, non ho ancora usato il doppio salto -> Salto Normale
            // Se è false, l'ho usato -> Animazione Doppio Salto (capriola)
            if (v_y < 0) {
                next_anim = mid_jump ? "jump_up" : "double_jump_up"
            } 
            else if (v_y > 0) {
                next_anim = mid_jump ? "jump_down" : "double_jump_down"
            }
        }
    } else {
        if (player.sparo_attivo) {
            next_anim = is_moving ? anim_sparo_corsa : anim_sparo_fermo
        } else {
            next_anim = is_moving ? "run" : "idle"
        }
    }

    // Cambio animazione solo se diversa dall'attuale (ottimizzazione)
    if (next_anim != curr_anim) {
        PP.assets.sprite.animation_play(player, next_anim)
        curr_anim = next_anim
    }
}