let img_blueprint;
let img_ingranaggio_1;
let img_ingranaggio_2;
let img_ingranaggio_3;
let img_cuore;

// Obiettivi finali per determinare il finale del gioco
const OBIETTIVO_BLUEPRINT = 6 
const OBIETTIVO_INGRANAGGI = 6

function preload_blueprint(s) {
    img_blueprint = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Blueprint_coll.png")
    
    img_ingranaggio_1 = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/ingranaggio_coll_1.png")
    img_ingranaggio_2 = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/ingranaggio_coll_2.png")
    img_ingranaggio_3 = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/ingranaggio_coll_3.png")
    
    img_cuore = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Cuore.png")
}

function init_collezionabili_state() {
    if (PP.game_state.get_variable("tot_blueprint") === undefined) {
        PP.game_state.set_variable("tot_blueprint", 0)
    }
    if (PP.game_state.get_variable("tot_ingranaggi") === undefined) {
        PP.game_state.set_variable("tot_ingranaggi", 0)
    }
    
    
    if (PP.game_state.get_variable("collezionabili_presi_checkpoint") === undefined) {
        PP.game_state.set_variable("collezionabili_presi_checkpoint", [])
    }
    if (PP.game_state.get_variable("collezionabili_presi_temp") === undefined) {
        PP.game_state.set_variable("collezionabili_presi_temp", [])
    }
}

// Funzione chiamata DAL CHECKPOINT quando si tocca la bandierina
// Sposta gli oggetti dalla lista "temp" alla lista "checkpoint"
function salva_collezionabili_al_checkpoint() {
    let temp = PP.game_state.get_variable("collezionabili_presi_temp") || []
    let perm = PP.game_state.get_variable("collezionabili_presi_checkpoint") || []
    
    // Unisco le liste
    let nuova_perm = perm.concat(temp)
    PP.game_state.set_variable("collezionabili_presi_checkpoint", nuova_perm)
    PP.game_state.set_variable("collezionabili_presi_temp", []) // Svuoto temp perché ora sono salvi
    
    // Salvo anche il numero totale raggiunto fino a qui
    let b = PP.game_state.get_variable("tot_blueprint")
    let i = PP.game_state.get_variable("tot_ingranaggi")
    PP.game_state.set_variable("tot_blueprint_checkpoint", b)
    PP.game_state.set_variable("tot_ingranaggi_checkpoint", i)
}

// Funzione chiamata DAL GAME OVER quando muori
// Resetta tutto allo stato dell'ultimo checkpoint
function resetta_collezionabili_al_respawn() {
    // Svuoto "temp": gli oggetti presi dopo l'ultimo save vanno persi e respawneranno
    PP.game_state.set_variable("collezionabili_presi_temp", [])
    
    // Ripristino i contatori numerici a quelli salvati
    let b_save = PP.game_state.get_variable("tot_blueprint_checkpoint") || 0
    let i_save = PP.game_state.get_variable("tot_ingranaggi_checkpoint") || 0
    
    PP.game_state.set_variable("tot_blueprint", b_save)
    PP.game_state.set_variable("tot_ingranaggi", i_save)
}

// Aggiunge un ID alla lista temporanea
function salva_collezionabile_preso(id) {
    if (!id) return
    let temp = PP.game_state.get_variable("collezionabili_presi_temp") || []
    // Evito duplicati
    if (!temp.includes(id)) {
        temp.push(id)
        PP.game_state.set_variable("collezionabili_presi_temp", temp)
    }
}

// Controlla se un oggetto deve essere spawnato o no
// Se l'ID è presente in temp O in checkpoint, vuol dire che l'ho già preso
function is_collezionabile_preso(id) {
    let temp = PP.game_state.get_variable("collezionabili_presi_temp") || []
    let perm = PP.game_state.get_variable("collezionabili_presi_checkpoint") || []
    return temp.includes(id) || perm.includes(id)
}

// LOGICA BLUEPRINT
function collision_blueprint(s, player, item) {
    // Aggiorno contatore
    let attuali = PP.game_state.get_variable("tot_blueprint") + 1
    PP.game_state.set_variable("tot_blueprint", attuali)
    
    // Salvo ID nella lista temp
    if (item.id_univoco) salva_collezionabile_preso(item.id_univoco)

    console.log("Blueprint Preso! Totale: " + attuali + "/" + OBIETTIVO_BLUEPRINT)
    
    // Distruggo l'oggetto visivo
    PP.assets.destroy(item)
}

function create_blueprint(s, lista_spawn, player) {
    init_collezionabili_state()
    if (!lista_spawn) return

    for (let i = 0; i < lista_spawn.length; i++) {
        let pos = lista_spawn[i]
        
        // Se l'ho già preso, salto questo ciclo (non lo creo)
        if (pos.id && is_collezionabile_preso(pos.id)) continue

        let item = PP.assets.image.add(s, img_blueprint, pos.x, pos.y, 0, 0)
        // Assegno ID all'oggetto fisico per usarlo nella collisione
        if (pos.id) item.id_univoco = pos.id

        PP.physics.add(s, item, PP.physics.type.STATIC)
        PP.physics.add_overlap_f(s, player, item, collision_blueprint)
    }
}

// LOGICA INGRANAGGI
function collision_ingranaggio(s, player, item) {
    let attuali = (PP.game_state.get_variable("tot_ingranaggi") || 0) + 1
    PP.game_state.set_variable("tot_ingranaggi", attuali)

    if (item.id_univoco) {
        salva_collezionabile_preso(item.id_univoco)
        console.log("Preso ingranaggio con ID: " + item.id_univoco)
    }

    PP.assets.destroy(item)
}

function create_ingranaggi(s, lista_spawn, player) {
    init_collezionabili_state()
    if (!lista_spawn) return

    for (let i = 0; i < lista_spawn.length; i++) {
        let pos = lista_spawn[i]

        if (pos.id && is_collezionabile_preso(pos.id)) continue

        // Scelta dinamica dell'immagine in base all'ID per variare la grafica
        let img_da_usare = img_ingranaggio_1 // Default

        // Se l'ID contiene "2" (es. ing_2), usa la variante 2
        if (pos.id.includes("2")) {
            img_da_usare = img_ingranaggio_2
        } 
        // Se l'ID contiene "3", usa la variante 3
        else if (pos.id.includes("3")) {
            img_da_usare = img_ingranaggio_3
        }

        let item = PP.assets.image.add(s, img_da_usare, pos.x, pos.y, 0, 0)
        if (pos.id) item.id_univoco = pos.id

        PP.physics.add(s, item, PP.physics.type.STATIC)
        PP.physics.add_overlap_f(s, player, item, collision_ingranaggio)
    }
}

// LOGICA CUORI
function collision_cuore(s, player, item) {
    let hp_attuale = PP.game_state.get_variable("HP_player") || 0
    
    // Cura solo se non ho già la vita piena
    if (hp_attuale < 10) {
        let nuova_vita = hp_attuale + 5
        if (nuova_vita > 10) nuova_vita = 10 // Cap a 10
        
        PP.game_state.set_variable("HP_player", nuova_vita)
        console.log("Cuore Preso! Vita: " + nuova_vita)
        
        // Salvo l'ID così se muoio e ho salvato, il cuore non torna (è consumabile unico)
        if (item.id_univoco) salva_collezionabile_preso(item.id_univoco)
        
        PP.assets.destroy(item)
    }
}

function create_cuore(s, lista_spawn, player) {
    init_collezionabili_state()
    if (!lista_spawn) return

    for (let i = 0; i < lista_spawn.length; i++) {
        let pos = lista_spawn[i]

        // Se già consumato, non spawnare
        if (pos.id && is_collezionabile_preso(pos.id)) continue

        let item = PP.assets.image.add(s, img_cuore, pos.x, pos.y, 0, 0)
        if (pos.id) item.id_univoco = pos.id

        PP.physics.add(s, item, PP.physics.type.STATIC)
        PP.physics.add_overlap_f(s, player, item, collision_cuore)
    }
}

// CONTROLLO VITTORIA FINALE
// Da chiamare alla fine del livello 2
function check_collezionabili_vittoria() {
    let tot_b = PP.game_state.get_variable("tot_blueprint") || 0
    let tot_i = PP.game_state.get_variable("tot_ingranaggi") || 0

    // Se ho tutto allora Good Ending
    if (tot_b >= OBIETTIVO_BLUEPRINT && tot_i >= OBIETTIVO_INGRANAGGI) {
        console.log("VITTORIA PERFETTA -> Good Ending")
        PP.scenes.start("good_ending")
    } else {
        // Se manca qualcosa allora Bad Ending
        console.log("MANCANO PEZZI -> Bad Ending")
        console.log("Blueprint: " + tot_b + ", Ingranaggi: " + tot_i)
        PP.scenes.start("bad_ending")
    }
}

// Esporto le funzioni di gestione salvataggio globalmente
window.salva_collezionabili_al_checkpoint = salva_collezionabili_al_checkpoint
window.resetta_collezionabili_al_respawn = resetta_collezionabili_al_respawn

function update_blueprint(s) {
}