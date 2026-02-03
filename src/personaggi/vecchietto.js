let img_vecchietto;
let vecchietto;
let sensore_dialogo;
let img_tasto_S;
let tasto_S;

let testo_schermo;
let sfondo_testo;

// Livelli di profondità)
let layer_bg_ui; // Sfondo nero semitrasparente
let layer_fg_ui; // Testo bianco in primo piano
let layer_game;  // Dove sta il vecchietto fisico

// Stati del dialogo
let dialogo_iniziato = false
let dialogo_finito = false
let tasto_rilasciato = true // Debounce per evitare click doppi involontari
let indice_frase = 0 // punto della conversazione in cui siamo
let tutorial_finale_attivo = false // Per mostrare il messaggio dopo aver preso l'arma

// Variabili per ottimizzare le animazioni ed evitare di riavviarle ad ogni frame
let animazione_corrente_vecchietto = ""
let animazione_corrente_tasto = ""

// Se true, il vecchietto non interagisce più (usato se ricarichi il livello con l'arma già presa)
let vecchietto_disabilitato = false


// CONFIGURAZIONE BOX E TESTO
// le metto qui per modificare facilmente lo sfondo del testo del dialogo
const BOX_WIDTH = 800;
const BOX_HEIGHT = 120;
const BOX_ALPHA = 0.3;
const BOX_COLOR = "0x000000";

const MAX_CHARS_DIALOGO = 60; // Limite caratteri per andare a capo


// FRASI
// Un array di oggetti che contiene chi parla (id) e cosa dice (testo)
let frasi_vecchietto = [
    { id: "GEM", testo: "GEM: Ciao giovane macchinista, cosa fai fuori dalle mura?" },
    { id: "EREN", testo: "EREN: Sto andando a cercare i meccanismi andati perduti nell’esplosione della Grande Fornace." },
    { id: "GEM", testo: "GEM: Ho capito, ho visto l’esplosione." },
    { id: "GEM", testo: "GEM: Allora ti potrebbero essere utili i miei progetti per rendere la Grande Fornace alimentata dalle risorse naturali, non dal petrolio." },
    { id: "GEM", testo: "GEM: Questi progetti sono nascosti nelle vicinanze." },
    { id: "GEM", testo: "GEM: Io non posso venire con te: sono troppo vecchio e i mostri del deserto mi hanno ferito alla gamba." },
    { id: "GEM", testo: "GEM: Ma posso darti questa quest’arma a carica solare." },
    { id: "GEM", testo: "GEM: Non sarà potente come la pistola a combustione che hai con te adesso, ma quantomeno non ti danneggia con la sua fiammata tossica." },
    { id: "GEM", testo: "GEM: Vai adesso, che il destino sia con te!" },
    // { id: "EREN", testo: "EREN: Ok grazie mille." }
];

// Funzione per mandare a capo il testo automaticamente
// Prende una stringa lunga e inserisce "\n" ogni tot caratteri senza spezzare le parole
function formatta_testo_dialogo(testo, max_chars) {
    let paragrafi = testo.split("\n")
    let risultato_finale = ""

    for (let k = 0; k < paragrafi.length; k++) {
        let parole = paragrafi[k].split(" ")
        let riga_corrente = ""

        for (let i = 0; i < parole.length; i++) {
            let parola = parole[i]
            if ((riga_corrente + parola).length > max_chars) {
                risultato_finale += riga_corrente + "\n"
                riga_corrente = ""
            }
            riga_corrente += parola + " "
        }
        risultato_finale += riga_corrente.trim()
        if (k < paragrafi.length - 1) risultato_finale += "\n"
    }
    return risultato_finale
}

function preload_vecchietto(s) {
    img_vecchietto = PP.assets.sprite.load_spritesheet(s, "assets/images/VECCHIETTO/Vecchietto.png", 28, 43)
    img_tasto_S = PP.assets.sprite.load_spritesheet(s, "assets/images/VECCHIETTO/Tasto_S.png", 22, 37)
}

function create_vecchietto(s) {
    // Controllo nel salvataggio globale se abbiamo già preso l'arma
    // Se sì, disabilito l'interazione per non ripetere il dialogo inutile
    let arma_gia_presa = PP.game_state.get_variable("arma_sbloccata")
    vecchietto_disabilitato = arma_gia_presa

    // Resetto gli stati per garantire che il dialogo parta dall'inizio se ricarico la scena
    dialogo_iniziato = false
    dialogo_finito = arma_gia_presa
    tutorial_finale_attivo = false

    // PROFONDITÀ
    layer_game = PP.layers.create(s)
    PP.layers.set_z_index(layer_game, 5) // Livello degli oggetti di gioco

    // Imposto Z molto alti per l'UI, così coprono anche elementi decorativi come l'arco davanti
    layer_bg_ui = PP.layers.create(s)
    PP.layers.set_z_index(layer_bg_ui, 1000)

    layer_fg_ui = PP.layers.create(s)
    PP.layers.set_z_index(layer_fg_ui, 1001)

    // 1. Creo lo sprite del vecchietto e lo rendo statico (non cade, non viene spinto)
    vecchietto = PP.assets.sprite.add(s, img_vecchietto, 70 * 32, 0 * 32, 0.5, 1)
    PP.physics.add(s, vecchietto, PP.physics.type.STATIC)
    PP.layers.add_to_layer(layer_game, vecchietto)

    PP.assets.sprite.animation_add_list(vecchietto, "idle", [0, 1, 2, 3], 6, -1)
    PP.assets.sprite.animation_add_list(vecchietto, "parla", [4, 5, 6, 7], 6, -1)

    PP.assets.sprite.animation_play(vecchietto, "idle")
    animazione_corrente_vecchietto = "idle"

    // 2. Se il vecchietto è attivo, creo un rettangolo invisibile attorno a lui
    if (!vecchietto_disabilitato) {
        sensore_dialogo = PP.shapes.rectangle_add(s, 70 * 32, 0 * 32, 250, 200, "0xFF0000", 0)
        PP.physics.add(s, sensore_dialogo, PP.physics.type.STATIC)

        // Rendo invisibile il sensore (alpha = 0)
        if (sensore_dialogo.visibility) sensore_dialogo.visibility.alpha = 0
    } else {
        sensore_dialogo = null
    }

    // 3. TASTO "S" = Icona che suggerisce al giocatore cosa premere
    if (!vecchietto_disabilitato) {
        tasto_S = PP.assets.sprite.add(s, img_tasto_S, 70 * 32 - 1, -40, 0.5, 1)
        PP.layers.add_to_layer(layer_game, tasto_S)

        PP.assets.sprite.animation_add_list(tasto_S, "puntini", [0, 1], 2, -1)
        PP.assets.sprite.animation_add_list(tasto_S, "tasto", [2, 3], 2, -1)

        PP.assets.sprite.animation_play(tasto_S, "puntini")
        animazione_corrente_tasto = "puntini"
    } else {
        tasto_S = null
    }

    // 4. Creo il rettangolo di sfondo al testo
    sfondo_testo = PP.shapes.rectangle_add(s, 640, 328, BOX_WIDTH, BOX_HEIGHT, BOX_COLOR, BOX_ALPHA)
    PP.layers.add_to_layer(layer_bg_ui, sfondo_testo)

    // Fisso l'elemento allo schermo (HUD)
    if (sfondo_testo.tile_geometry) {
        sfondo_testo.tile_geometry.scroll_factor_x = 0
        sfondo_testo.tile_geometry.scroll_factor_y = 0
    }
    // Nascondo inizialmente
    if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = true

    // Creo l'oggetto testo vuoto, lo riempiremo dinamicamente
    testo_schermo = PP.shapes.text_styled_add(s, 640, 328, "", 20, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5)

    // [PHASER] = Imposto l'interlinea (spazio tra le righe)
    // Questa funzione specifica di formattazione non è esposta in PoliPhaser
    testo_schermo.ph_obj.setLineSpacing(7)

    PP.layers.add_to_layer(layer_fg_ui, testo_schermo)

    // Fisso il testo allo schermo
    if (testo_schermo.tile_geometry) {
        testo_schermo.tile_geometry.scroll_factor_x = 0
        testo_schermo.tile_geometry.scroll_factor_y = 0
    }
    if (testo_schermo.visibility) testo_schermo.visibility.hidden = true
}

// Funzioni helper per cambiare animazione solo se necessario
function cambia_animazione_vecchietto(nuova_animazione) {
    if (animazione_corrente_vecchietto === nuova_animazione) return
    PP.assets.sprite.animation_play(vecchietto, nuova_animazione)
    animazione_corrente_vecchietto = nuova_animazione
}

function cambia_animazione_tasto(nuova_animazione) {
    if (!tasto_S) return
    if (animazione_corrente_tasto === nuova_animazione) return
    PP.assets.sprite.animation_play(tasto_S, nuova_animazione)
    animazione_corrente_tasto = nuova_animazione
}

function update_vecchietto(s, player) {
    // Se il vecchietto è disattivato o gli oggetti non esistono, esco subito
    if (vecchietto_disabilitato) return
    if (!player || !sensore_dialogo || !tasto_S || !vecchietto) return

    // 1: TUTTO FINITO 
    // Se abbiamo finito di parlare, nascondo l'UI e resetto il vecchietto in idle
    if (dialogo_finito && !tutorial_finale_attivo) {
        if (tasto_S.visibility) tasto_S.visibility.hidden = true
        if (testo_schermo.visibility) testo_schermo.visibility.hidden = true
        if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = true

        cambia_animazione_vecchietto("idle")
        // Sblocco il player se era rimasto freezato
        if (player.is_frozen) player.is_frozen = false
        return
    }

    // 2: DIALOGO IN CORSO
    if (dialogo_iniziato) {
        // Blocco il movimento del player
        player.is_frozen = true

        // Controllo chi sta parlando per animare il personaggio giusto
        if (indice_frase < frasi_vecchietto.length) {
            let interlocutore = frasi_vecchietto[indice_frase].id

            // [PHASER] Controllo l'animazione corrente del player per non resettarla continuamente
            if (interlocutore === "GEM") {
                cambia_animazione_vecchietto("parla")
                if (player.ph_obj.anims.currentAnim && player.ph_obj.anims.currentAnim.key !== "idle") {
                    PP.assets.sprite.animation_play(player, "idle")
                }
            } else if (interlocutore === "EREN") {
                cambia_animazione_vecchietto("idle")
                if (player.ph_obj.anims.currentAnim && player.ph_obj.anims.currentAnim.key !== "parla") {
                    PP.assets.sprite.animation_play(player, "parla")
                }
            }
        }

        // Nascondo l'icona del tasto S mentre si parla
        if (tasto_S.visibility) tasto_S.visibility.hidden = true

        // Gestione avanzamento dialogo (Tasti S, Spazio o Invio)
        let tasto_premuto = PP.interactive.kb.is_key_down(s, PP.key_codes.S) ||
            PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) ||
            PP.interactive.kb.is_key_down(s, PP.key_codes.ENTER)

        if (tasto_premuto) {
            if (tasto_rilasciato) {
                tasto_rilasciato = false // Blocco input finché non rilascio

                // Se ci sono ancora frasi, vado avanti
                if (indice_frase < frasi_vecchietto.length - 1) {
                    indice_frase++

                    // Mostro box e testo
                    if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = false
                    if (testo_schermo.visibility) testo_schermo.visibility.hidden = false

                    // Formatto e aggiorno il testo a schermo
                    let testo_formattato = formatta_testo_dialogo(frasi_vecchietto[indice_frase].testo, MAX_CHARS_DIALOGO)
                    PP.shapes.text_change(testo_schermo, testo_formattato)

                } else {
                    
                    
                    // FINE DELLA CONVERSAZIONE
                    dialogo_iniziato = false
                    dialogo_finito = true

                    // Sblocco il player
                    player.is_frozen = false
                    PP.assets.sprite.animation_play(player, "idle")
                    cambia_animazione_vecchietto("idle")

                    // Salvo lo stato (arma presa) e resetto la modalità sparo
                    PP.game_state.set_variable("arma_sbloccata", true)
                    if (typeof hud_modalita_inquinante !== 'undefined') {
                        hud_modalita_inquinante = false
                    }

                    // Salvo il checkpoint immediatamente
                    if (typeof window.attiva_checkpoint === "function") {
                        window.attiva_checkpoint(s)
                    }

                    // --- MESSAGGIO FINALE (Tutorial Arma) ---
                    tutorial_finale_attivo = true
                    if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = false
                    if (testo_schermo.visibility) testo_schermo.visibility.hidden = false

                    // [PHASER] Rimpicciolisco l'altezza del box nero perché il messaggio è breve
                    // PoliPhaser gestisce scale, ma per dimensioni precise in pixel uso Phaser
                    if (sfondo_testo.ph_obj) sfondo_testo.ph_obj.displayHeight = 60

                    let testo_tut = formatta_testo_dialogo("Utilizza il tasto L per cambiare arma", MAX_CHARS_DIALOGO)
                    PP.shapes.text_change(testo_schermo, testo_tut)

                    // Faccio sparire il messaggio dopo 2 secondi
                    PP.timers.add_timer(s, 2000, function () {
                        tutorial_finale_attivo = false
                        if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = true
                        if (testo_schermo.visibility) testo_schermo.visibility.hidden = true
                    }, false)

                }
            }
        } else {
            tasto_rilasciato = true // Posso premere di nuovo
        }
    }
    // 3: AVVICINAMENTO (Idle)
    else {
        if (tutorial_finale_attivo) return

        // [PHASER] Controllo se il rettangolo del player si sovrappone al sensore
        // Uso Phaser nativo perché restituisce un booleano immediato per l'update
        let dentro_zona = false
        if (player.ph_obj && sensore_dialogo.ph_obj) {
            dentro_zona = s.physics.overlap(player.ph_obj, sensore_dialogo.ph_obj)
        }

        if (dentro_zona) {
            // Player vicino: Mostro tasto "S" e attendo input
            if (tasto_S.visibility) tasto_S.visibility.hidden = false
            cambia_animazione_tasto("tasto")
            cambia_animazione_vecchietto("idle")

            if (PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
                if (tasto_rilasciato) {
                    // AVVIO DIALOGO
                    dialogo_iniziato = true
                    player.is_frozen = true
                    PP.physics.set_velocity_x(player, 0)

                    // Giro il player verso il vecchietto
                    if (player.ph_obj.x < vecchietto.ph_obj.x) {
                        player.geometry.flip_x = false
                        player.facing_right = true
                        PP.physics.set_collision_rectangle(player, 20, 44, 14, 8)
                    } else {
                        player.geometry.flip_x = true
                        player.facing_right = false
                        PP.physics.set_collision_rectangle(player, 20, 44, 20, 8)
                    }

                    // Preparo la UI
                    if (tasto_S.visibility) tasto_S.visibility.hidden = true
                    if (sfondo_testo.visibility) sfondo_testo.visibility.hidden = false
                    if (testo_schermo.visibility) testo_schermo.visibility.hidden = false

                    // [PHASER] Ripristino l'altezza originale del box
                    if (sfondo_testo.ph_obj) sfondo_testo.ph_obj.displayHeight = BOX_HEIGHT

                    // Mostro la prima frase
                    indice_frase = 0
                    let testo_init = formatta_testo_dialogo(frasi_vecchietto[0].testo, MAX_CHARS_DIALOGO)
                    PP.shapes.text_change(testo_schermo, testo_init)

                    tasto_rilasciato = false
                }
            } else {
                tasto_rilasciato = true
            }
        } else {
            // Player lontano: Mostro i puntini di sospensione se non disattivato
            if (tasto_S.visibility) tasto_S.visibility.hidden = false
            cambia_animazione_tasto("puntini")
            cambia_animazione_vecchietto("idle")
        }
    }
}