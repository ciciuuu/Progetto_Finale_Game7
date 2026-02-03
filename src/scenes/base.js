let img_player
let player
let layer_player
let muri_livello // Tilemap importata da Godot
let muro_invisibile_sinistra

let parallasse1; let parallasse2
let ts_background_1; let ts_background_2
let parallasse_nuvole;
let ts_nuvole;

let lista_trappole = [] // Sabbie mobili
let asset_tile_sotto;
let tile_riempimento;


let img_muro_destra;
let muro_destra_obj;
let trappola_attivata = false;
const X_ATTIVAZIONE_TRAPPOLA = 221 * 32; // Dove scatta la trappola

// Checkpoint
let checkpoint_obj;
let checkpoint_preso = false;
const X_CHECKPOINT = 51 * 32;
const Y_CHECKPOINT = 0 * 32;

// Elementi Tutorial e Ambiente
let layer_tutorial;
let img_wasd; let wasd;
let img_spazio; let spazio;
let img_doppio_salto; let doppio_salto;
let img_tasto_N; let tasto_N;
let img_EE; let EE;
let img_EE2; let EE2;

let img_casetta_inizio; let casetta_inizio;
let img_mura_città; let mura_città;
let img_arco_città; let arco_città;
let img_arco_città_davanti; let arco_città_davanti;

// Decorazioni
let img_cactus_destra; let cactus_destra;
let img_cactus_sotto; let cactus_sotto;
let img_cactus_pericolo; let cactus_pericolo;

// Zone Segrete
let img_zona_pietra;
let zona_pietra; let zona_inizio_sinistra; let zona_dopo_vecchietto;
let zona_fine_lvl1; let zona_caverna_finale_lvl1;

function preload(s) {
    zona_pietra = PP.assets.image.load(s, "assets/images/MAPPA/zone_segrete/ZS_pietra.png")
    zona_inizio_sinistra = PP.assets.image.load(s, "assets/images/MAPPA/zone_segrete/ZS_inizio_sinistra.png")
    zona_dopo_vecchietto = PP.assets.image.load(s, "assets/images/MAPPA/zone_segrete/ZS_dopo_vecchietto.png")
    zona_fine_lvl1 = PP.assets.image.load(s, "assets/images/MAPPA/zone_segrete/ZS_fine_lvl1.png")
    img_zona_pietra = PP.assets.image.load(s, "assets/images/MAPPA/zone_segrete/ZS_pietra.png")
    zona_caverna_finale_lvl1 = PP.assets.image.load(s, "assets/images/MAPPA/zone_segrete/ZS_caverna_finale_lvl1.png")

    img_EE = PP.assets.image.load(s, "assets/images/MAPPA/EE.png")
    img_EE2 = PP.assets.sprite.load_spritesheet(s, "assets/images/MAPPA/Torcia_EE.png", 32, 32)

    // Elementi Giganti di sfondo
    img_casetta_inizio = PP.assets.image.load(s, "assets/images/MAPPA/Elementi_grandi/Casetta_inizio.png")
    img_mura_città = PP.assets.image.load(s, "assets/images/MAPPA/Elementi_grandi/muro_città.png")
    img_arco_città = PP.assets.image.load(s, "assets/images/MAPPA/Elementi_grandi/arco_città.png")
    img_arco_città_davanti = PP.assets.image.load(s, "assets/images/MAPPA/Elementi_grandi/arco_città_davanti.png")

    // Tutorial Tasti
    img_wasd = PP.assets.image.load(s, "assets/images/MAPPA/Tutorial/wasd.png")
    img_spazio = PP.assets.image.load(s, "assets/images/MAPPA/Tutorial/Salto.png")
    img_tasto_N = PP.assets.image.load(s, "assets/images/MAPPA/Tutorial/colpo.png")
    img_doppio_salto = PP.assets.image.load(s, "assets/images/MAPPA/Tutorial/Doppio_salto.png")

    // Decorazioni Cactus
    img_cactus_destra = PP.assets.image.load(s, "assets/images/MAPPA/Decorazioni/cactus_destra.png")
    img_cactus_sotto = PP.assets.image.load(s, "assets/images/MAPPA/Decorazioni/cactus_sotto.png")
    img_cactus_pericolo = PP.assets.image.load(s, "assets/images/MAPPA/Decorazioni/cactus_pericolo.png")

    // Muro Trappola
    img_muro_destra = PP.assets.image.load(s, "assets/images/MAPPA/zone_segrete/ZS_fine1_destra.png")

    // Preload Moduli Esterni se presenti
    if (typeof preload_zone_segrete === "function") preload_zone_segrete(s)
    if (typeof preload_blueprint === "function") preload_blueprint(s)
    if (typeof preload_checkpoint === "function") preload_checkpoint(s)

    // Player e Sfondo
    img_player = PP.assets.sprite.load_spritesheet(s, "assets/images/PLAYER/Sparo_52x52.png", 52, 52)
    parallasse1 = PP.assets.image.load(s, "assets/images/parallax/parallasse_1.png")
    parallasse2 = PP.assets.image.load(s, "assets/images/parallax/parallasse_2.png")
    parallasse_nuvole = PP.assets.image.load(s, "assets/images/parallax/nuvole.png");

    asset_tile_sotto = PP.assets.image.load(s, "assets/images/SFONDO_CAVERNE/cave_pattern.png");


    // Preload mappa da Godot (file JSON tilemap)
    if (window.godot_preload) window.godot_preload(s)

    // Preload entità
    preload_hud(s)
    preload_proiettili(s)
    preload_vecchietto(s)
    preload_enemy(s)
    preload_cactus(s)
    preload_player(s)
}

function create(s) {

    // LAYERS
    let layer_sfondo = PP.layers.create(s)
    PP.layers.set_z_index(layer_sfondo, -10)

    let layer_mura = PP.layers.create(s)
    PP.layers.set_z_index(layer_mura, -5)

    layer_tutorial = PP.layers.create(s)
    PP.layers.set_z_index(layer_tutorial, 1)

    let layer_arco = PP.layers.create(s)
    PP.layers.set_z_index(layer_arco, 5)

    let layer_arco_davanti = PP.layers.create(s)
    PP.layers.set_z_index(layer_arco_davanti, 200) // Davanti al player

    // POSIZIONAMENTO ELEMENTI VISUALI

    // Tutorial
    wasd = PP.assets.image.add(s, img_wasd, -34 * 32, 0 * 32, 0, 1)
    PP.layers.add_to_layer(layer_tutorial, wasd)

    spazio = PP.assets.image.add(s, img_spazio, -28 * 32, 0 * 32, 0, 1)
    PP.layers.add_to_layer(layer_tutorial, spazio)

    doppio_salto = PP.assets.image.add(s, img_doppio_salto, -13 * 32, 0 * 32, 0, 1)
    PP.layers.add_to_layer(layer_tutorial, doppio_salto)

    tasto_N = PP.assets.image.add(s, img_tasto_N, 10 * 32 + 9, 30 * 32, 0, 1)
    PP.layers.add_to_layer(layer_tutorial, tasto_N)

    // Casetta Iniziale
    casetta_inizio = PP.assets.image.add(s, img_casetta_inizio, -45 * 32, 0 * 32, 0, 1)
    PP.layers.add_to_layer(layer_tutorial, casetta_inizio)

    // Mura Città
    mura_città = PP.assets.image.add(s, img_mura_città, 57 * 32, 0 * 32, 1, 1)
    PP.layers.add_to_layer(layer_mura, mura_città)

    // Arco (diviso in due per dare profondità: il player passa in mezzo)
    arco_città = PP.assets.image.add(s, img_arco_città, 57 * 32, 0 * 32, 0, 1)
    PP.layers.add_to_layer(layer_arco, arco_città)

    arco_città_davanti = PP.assets.image.add(s, img_arco_città_davanti, 63 * 32, 0 * 32, 0, 1)
    PP.layers.add_to_layer(layer_arco_davanti, arco_città_davanti)

    // EE
    EE = PP.assets.image.add(s, img_EE, 25 * 32, 10 * 32, 0, 1)
    PP.layers.add_to_layer(layer_tutorial, EE)

    EE2 = PP.assets.sprite.add(s, img_EE2, 24 * 32, 8 * 32, 0, 1)
    PP.layers.add_to_layer(layer_tutorial, EE2)
    
    PP.assets.sprite.animation_add_list(EE2, "brucia", [0, 1, 2, 3], 10, -1)
    PP.assets.sprite.animation_play(EE2, "brucia")

    // Cactus Decorativi
    cactus_destra = PP.assets.image.add(s, img_cactus_destra, 46 * 32, 0 * 32, 0, 1)
    PP.layers.add_to_layer(layer_tutorial, cactus_destra)

    cactus_pericolo = PP.assets.image.add(s, img_cactus_pericolo, 5 * 32, -1 * 32, 0, 1)
    PP.layers.add_to_layer(layer_tutorial, cactus_pericolo)


    // GESTIONE SPAWN E CHECKPOINT
    let final_spawn_x, final_spawn_y
    let checkpoint_attivo = PP.game_state.get_variable("checkpoint_attivo")

    if (checkpoint_attivo) {
        console.log("CARICAMENTO DA CHECKPOINT...")
        // Recupero coordinate salvate
        final_spawn_x = PP.game_state.get_variable("cp_x")
        final_spawn_y = PP.game_state.get_variable("cp_y")

        // Recupero vita salvata
        let hp_salvati = PP.game_state.get_variable("HP_checkpoint")
        PP.game_state.set_variable("HP_player", hp_salvati)

        checkpoint_preso = true
    } else {
        // NUOVA PARTITA
        // Resetto variabili di gioco
        PP.game_state.set_variable("HP_player", 10)
        PP.game_state.set_variable("arma_sbloccata", false)
        PP.game_state.set_variable("tot_blueprint", 0)
        PP.game_state.set_variable("tot_ingranaggi", 0)
        PP.game_state.set_variable("nemici_uccisi", [])
        PP.game_state.set_variable("collezionabili_presi", [])

        // Spawn iniziale nel villaggio
        final_spawn_x = -35 * 32
        final_spawn_y = -1 * 32
        checkpoint_preso = false
    }

    trappola_attivata = false

    // Gruppo proiettili per fisica
    if (!s.gruppo_proiettili) {
        s.gruppo_proiettili = s.physics.add.group()
    }

    // SFONDO PARALLASSE
    const PARALLAX_WIDTH = 15800
    const PARALLAX_HEIGHT = 3000

    ts_nuvole = PP.assets.tilesprite.add(s, parallasse_nuvole, 0, -90, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5);
    PP.layers.add_to_layer(layer_sfondo, ts_nuvole);
    ts_nuvole.geometry.scale_x = 0.5; ts_nuvole.geometry.scale_y = 0.5;

    ts_background_1 = PP.assets.tilesprite.add(s, parallasse1, 0, 500, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5)
    ts_background_1.geometry.scale_x = 0.6; ts_background_1.geometry.scale_y = 0.6
    PP.layers.add_to_layer(layer_sfondo, ts_background_1)

    ts_background_2 = PP.assets.tilesprite.add(s, parallasse2, 0, 550, PARALLAX_WIDTH, PARALLAX_HEIGHT, 0, 0.5)
    ts_background_2.geometry.scale_x = 0.6; ts_background_2.geometry.scale_y = 0.6
    PP.layers.add_to_layer(layer_sfondo, ts_background_2)




    // [PHASER] Imposto scroll factor a 0 perché lo muovo manualmente nell'update
    ts_background_1.tile_geometry.scroll_factor_x = 0
    ts_background_2.tile_geometry.scroll_factor_x = 0
    ts_nuvole.tile_geometry.scroll_factor_x = 0;



    // CARICAMENTO MAPPA GODOT
    if (window.godot_create && typeof LIV1 !== 'undefined') {
        muri_livello = window.godot_create(s, LIV1)
    } else {
        console.error("LIV1 non trovato.")
        muri_livello = null
    }

    // PLAYER
    player = PP.assets.sprite.add(s, img_player, final_spawn_x, final_spawn_y, 0.5, 1)
    PP.physics.add(s, player, PP.physics.type.DYNAMIC)

    // Configuro animazioni e fisica player
    configure_player_animations(s, player)

    // [PHASER] Tile Bias per evitare compenetrazioni veloci
    s.physics.world.TILE_BIAS = 32

    // Collisione Player-Muri
    if (muri_livello) {
        s.physics.add.collider(player.ph_obj, muri_livello)
    }

    // MURO INVISIBILE SINISTRA
    muro_invisibile_sinistra = PP.shapes.rectangle_add(s, -40 * 37 + 15, 0, 50, 5000, "0x000000", 0)
    PP.physics.add(s, muro_invisibile_sinistra, PP.physics.type.STATIC)
    s.physics.add.collider(player.ph_obj, muro_invisibile_sinistra.ph_obj)

    // BANDIERINA CHECKPOINT
    if (typeof crea_bandierina_checkpoint === "function") {
        checkpoint_obj = crea_bandierina_checkpoint(s, X_CHECKPOINT, Y_CHECKPOINT, checkpoint_preso)
    }

    // Camera segue il player
    PP.camera.start_follow(s, player, 0, 60)

    // Inizializzazione Entità
    create_hud(s)
    create_vecchietto(s)

    // TRAPPOLA MURI CADENTI
    muro_destra_obj = PP.assets.image.add(s, img_muro_destra, 218 * 32, -27 * 32, 0, 0)
    PP.physics.add(s, muro_destra_obj, PP.physics.type.DYNAMIC)
    PP.physics.set_allow_gravity(muro_destra_obj, false) // Aspetta il trigger per cadere
    PP.physics.set_immovable(muro_destra_obj, true) // Spacca il player se lo tocca
    PP.physics.add_collider(s, player, muro_destra_obj)


    // ZONE SEGRETE (Aree nascoste)
    let zone_liv1 = [
        /* {
            asset: zona_pietra,
            img_x: 79 * 32,
            img_y: -12 * 32,
            trigger_x: 79 * 32 - 32,
            trigger_y: -12 * 32 + 32,
            trigger_w: 32 * 8,
            trigger_h: 32 * 4
        }, */
        {
            asset: zona_inizio_sinistra,
            img_x: 448 - 64,
            img_y: 0,
            trigger_x: 449,
            trigger_y: 1 * 32,
            trigger_w: 32 * 15,
            trigger_h: 32 * 11
        },
        {
            asset: zona_dopo_vecchietto,
            img_x: 111 * 32,
            img_y: -2 * 32,
            trigger_x: 112 * 32,
            trigger_y: -2 * 32,
            trigger_w: 32 * 11,
            trigger_h: 32 * 4
        },
        {
            asset: zona_fine_lvl1,
            img_x: 219 * 32,
            img_y: -16 * 32,
            trigger_x: 219 * 32,
            trigger_y: -15 * 32,
            trigger_w: 32 * 5,
            trigger_h: 32 * 32
        },
        {
            asset: zona_caverna_finale_lvl1,
            img_x: 182 * 32,
            img_y: -6 * 32,
            trigger_x: 182 * 32,
            trigger_y: -4 * 32,
            trigger_w: 32 * 11,
            trigger_h: 32 * 6
        },
    ]

    if (typeof create_zone_segrete === "function") create_zone_segrete(s, player, zone_liv1)

    // NEMICI (Ragni)
    let ragni_liv1 = [
        { x: 15 * 32 + 18, y: 27 * 32, pattuglia: [15 * 32 + 18, 13 * 32 + 18], id: "ragno_1" },
        { x: 39 * 32 + 18, y: 19 * 32, pattuglia: [39 * 32 + 18, 32 * 32 + 18], id: "ragno_2" },
        { x: 107 * 32 + 18, y: -1 * 32, pattuglia: [107 * 32 + 18, 94 * 32 + 18], id: "ragno_3" },
        { x: 122 * 32 + 18, y: -4 * 32, pattuglia: [122 * 32 + 18, 111 * 32 + 18], id: "ragno_4" },
        { x: 208 * 32 + 18, y: -16 * 32, pattuglia: [208 * 32 + 18, 205 * 32 + 18], id: "ragno_5" },
        { x: 214 * 32 + 18, y: -17 * 32, pattuglia: [214 * 32 + 18, 209 * 32 + 18], id: "ragno_6" },
    ]
    create_enemy(s, muri_livello, ragni_liv1, player)

    // NEMICI (Cactus)
    let cactus_liv1 = [
        { x: 19 * 32, y: -1 * 32, id: "cactus_L3_1", raggio: 350 },
        { x: 99 * 32, y: -7 * 32, id: "cactus_L3_2", raggio: 400 },
        { x: 144 * 32, y: -2 * 32, id: "cactus_L3_3", raggio: 400 },
        { x: 167 * 32, y: -8 * 32, id: "cactus_L3_4", raggio: 400 },
        { x: 190 * 32, y: 1 * 32, id: "cactus_L3_5", raggio: 400 },
        { x: 189 * 32, y: -14 * 32, id: "cactus_L3_5", raggio: 400 },
    ]
    create_cactus(s, muri_livello, cactus_liv1, player);

    // COLLEZIONABILI
    let bp_liv1 = [
        { x: 58 * 32, y: -9 * 32, id: "bp_1" },
        { x: 114 * 32, y: 0 * 32, id: "bp_2" },
        { x: 189 * 32, y: 1 * 32, id: "bp_3" },
    ]
    if (typeof create_blueprint === "function") create_blueprint(s, bp_liv1, player)

    let ing_liv1 = [
        { x: 41 * 32, y: 19 * 32, id: "ing_1" },
        { x: 156 * 32, y: -13 * 32, id: "ing_2" },
        { x: 210 * 32, y: -18 * 32 + 8, id: "ing_3" },
    ]
    if (typeof create_ingranaggi === "function") create_ingranaggi(s, ing_liv1, player)

    // CUORI
    let cuori_liv1 = [
        { x: 102 * 32, y: -7 * 32, id: "cuore_1" }
    ]
    if (typeof create_cuore === "function") create_cuore(s, cuori_liv1, player)

    // TRAPPOLE SABBIE MOBILI
    // Creo rettangoli invisibili che uccidono al tocco
    lista_trappole = []
    aggiungi_trappola_manuale(s, 0, 32 * 1 + 16, 32 * 2, 32 * 5)
    aggiungi_trappola_manuale(s, 32 * 18, 32 * 31 + 16, 32 * 3, 32 * 8)
    aggiungi_trappola_manuale(s, 32 * 26, 32 * 27 + 16, 32 * 6, 32 * 12)
    aggiungi_trappola_manuale(s, 32 * 108, 32 * 1 + 16, 32 * 2, 160)
    aggiungi_trappola_manuale(s, 32 * 128, 32 * 1 + 16, 32 * 12, 32 * 5)
    aggiungi_trappola_manuale(s, 32 * 150, 32 * 1 + 16, 32 * 32, 32 * 8)
    aggiungi_trappola_manuale(s, 32 * 186, 32 * -10 + 16, 32 * 8, 32 * 2)
    aggiungi_trappola_manuale(s, 32 * 199, 32 * -12 + 16, 32 * 6, 32 * 15)

    // Attivo le collisioni per tutte le trappole
    for (let i = 0; i < lista_trappole.length; i++) {
        let tr = lista_trappole[i]
        PP.physics.add_overlap_f(s, player, tr, function () {
            PP.game_state.set_variable("causa_morte", "sabbie")
            morte_player(s, player, null)
        })
    }
    // Parametri TileSprite:
    // s, asset, x, y, larghezza, altezza, anchor_x, anchor_y

    // Calcoliamo una larghezza molto grande (es. 20.000) per coprire tutto il livello
    // e un'altezza generosa (es. 3.000) per riempire il fondo
    tile_riempimento = PP.assets.tilesprite.add(s, asset_tile_sotto, 0, 0, 2000, 3000, 0, 0);

    // Lo aggiungiamo al layer di sfondo (già presente nel tuo codice)
    PP.layers.add_to_layer(layer_sfondo, tile_riempimento);
}

// Funzione globale per attivare il checkpoint
function attiva_checkpoint(s) {
    if (checkpoint_preso) return

    if (typeof controlla_attivazione_checkpoint === "function" && checkpoint_obj) {
        if (controlla_attivazione_checkpoint(s, player, checkpoint_obj, X_CHECKPOINT, checkpoint_preso)) {
            checkpoint_preso = true
        }
    }
}
window.attiva_checkpoint = attiva_checkpoint

function update(s) {
    PP.camera.start_follow(s, player, 50, 60);
    s.cameras.main.setZoom(2)

    // Zoom 
    /* // Zoom Cheat da attivare nel caso ci serva alla presentazione
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(0.2)
    } else if (PP.interactive.kb.is_key_up(s, PP.key_codes.M)) {
        s.cameras.main.setZoom(2)
    } */

    // Effetto Parallasse (lo sfondo si muove più lentamente della camera)
    ts_background_1.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.2
    ts_background_2.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.4
    ts_background_1.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.1
    ts_background_2.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.2
    ts_nuvole.tile_geometry.x = PP.camera.get_scroll_x(s) * 0.5;
    ts_nuvole.tile_geometry.y = PP.camera.get_scroll_y(s) * -0.03;

    // Attivazione Trappola Muro
    if (!trappola_attivata && player.ph_obj.x >= X_ATTIVAZIONE_TRAPPOLA) {
        trappola_attivata = true
    }

    if (trappola_attivata) {
        let velocityY = 5 * 32 / 0.1 // Calcolo velocità caduta
        let targetY = -23 * 32

        // Se non è ancora arrivato giù, cade
        if (muro_destra_obj.ph_obj.y < targetY) {
            PP.physics.set_velocity_y(muro_destra_obj, velocityY)
        } else {
            // Arrivato: ferma tutto
            PP.physics.set_velocity_y(muro_destra_obj, 0)
            muro_destra_obj.ph_obj.y = targetY
        }
    }


    // EASTER EGG
    let EE_trovato = PP.game_state.get_variable("ee_trovato")

    if (!EE_trovato) {
        let target_x = 25 * 32
        let target_y = 10 * 32

        // Calcolo distanza player-EE
        let dx = player.geometry.x - target_x
        let dy = player.geometry.y - target_y
        let distanza = Math.sqrt(dx * dx + dy * dy)

        if (distanza < 50) {
            PP.game_state.set_variable("ee_trovato", true)

            // Creo layer UI temporaneo per mostrare il messaggio
            let layer_ee = PP.layers.create(s)
            PP.layers.set_z_index(layer_ee, 2000)

            // Sfondo nero
            let sfondo_ee = PP.shapes.rectangle_add(s, 640, 360, 800, 80, "0x000000", 0.3)
            sfondo_ee.tile_geometry.scroll_factor_x = 0
            sfondo_ee.tile_geometry.scroll_factor_y = 0
            PP.layers.add_to_layer(layer_ee, sfondo_ee)

            // Testo
            let testo_segreto = PP.shapes.text_styled_add(s, 640, 360, "In memoria degli studenti che hanno lavorato a questo progetto!", 20, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5)
            testo_segreto.tile_geometry.scroll_factor_x = 0
            testo_segreto.tile_geometry.scroll_factor_y = 0
            PP.layers.add_to_layer(layer_ee, testo_segreto)

            // Sparisce dopo 3 secondi
            PP.timers.add_timer(s, 3000, function () {
                PP.assets.destroy(testo_segreto)
                PP.assets.destroy(sfondo_ee)
            }, false)
        }
    }

    // CAMBIO LIVELLO
    // Se raggiungo la fine a destra, passo al Livello 2 (base_3)
    if (player.geometry.x >= 219 * 32 && player.geometry.y > 0) {
        let vita_al_passaggio = PP.game_state.get_variable("HP_player")
        PP.game_state.set_variable("HP_checkpoint", vita_al_passaggio)

        PP.scenes.start("base_3")

        // Imposto lo spawn per il nuovo livello
        PP.game_state.set_variable("spawn_x", -27 * 32)
        PP.game_state.set_variable("spawn_y", -11 * 32)
    }

    // Update Entità
    if (player) manage_player_update(s, player, muri_livello)
    if (typeof update_zone_segrete === "function") update_zone_segrete(s)
    update_vecchietto(s, player)
    update_enemy(s)
    update_cactus(s, player, muri_livello)
    update_blueprint(s)
    update_hud(s)

    // Controllo continuo checkpoint
    if (typeof controlla_attivazione_checkpoint === "function" && checkpoint_obj) {
        if (controlla_attivazione_checkpoint(s, player, checkpoint_obj, X_CHECKPOINT, checkpoint_preso)) {
            checkpoint_preso = true
        }
    }
}

function destroy(s) { destroy_enemy(s) }

function aggiungi_trappola_manuale(s, x, y, w, h) {
    let centerX = x + (w / 2)
    let centerY = y + (h / 2)
    let zona = PP.shapes.rectangle_add(s, centerX, centerY, w, h, "0xFF0000", 0)
    PP.physics.add(s, zona, PP.physics.type.STATIC)
    lista_trappole.push(zona)
}

function morte_player(s, player, trappola) {
    if (typeof window.morte_player === "function") { window.morte_player(s, player); return }
    if (player.is_dead) return
    player.is_dead = true
    if (player && player.ph_obj.active) {
        player.ph_obj.setTint(0xFF0000)
        player.ph_obj.body.enable = false
    }
    PP.scenes.start("game_over")
}

PP.scenes.add("base", preload, create, update, destroy)