let img_blueprint;
let img_ingranaggio;

// OBIETTIVO TOTALE: 3 per livello x 2 livelli = 6 Totali per tipo
const OBIETTIVO_BLUEPRINT = 6;
const OBIETTIVO_INGRANAGGI = 6;

function preload_blueprint(s) {
    img_blueprint = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Blueprint_coll.png");
    img_ingranaggio = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Ingranaggio.png");
}

function init_collezionabili_state() {
    if (PP.game_state.get_variable("tot_blueprint") === undefined) {
        PP.game_state.set_variable("tot_blueprint", 0);
    }
    if (PP.game_state.get_variable("tot_ingranaggi") === undefined) {
        PP.game_state.set_variable("tot_ingranaggi", 0);
    }
    // Lista ID presi "permanenti" (salvati al checkpoint)
    if (PP.game_state.get_variable("collezionabili_presi_checkpoint") === undefined) {
        PP.game_state.set_variable("collezionabili_presi_checkpoint", []);
    }
    // Lista ID presi "temporanei" (in questo run, prima di salvare)
    if (PP.game_state.get_variable("collezionabili_presi_temp") === undefined) {
        PP.game_state.set_variable("collezionabili_presi_temp", []);
    }
}

// Funzione chiamata quando tocchi un checkpoint per consolidare i progressi
function salva_collezionabili_al_checkpoint() {
    let temp = PP.game_state.get_variable("collezionabili_presi_temp") || [];
    let perm = PP.game_state.get_variable("collezionabili_presi_checkpoint") || [];
    
    // Uniamo le liste
    let nuova_perm = perm.concat(temp);
    PP.game_state.set_variable("collezionabili_presi_checkpoint", nuova_perm);
    PP.game_state.set_variable("collezionabili_presi_temp", []); // Svuota temp
    
    // Salviamo i conteggi numerici
    let b = PP.game_state.get_variable("tot_blueprint");
    let i = PP.game_state.get_variable("tot_ingranaggi");
    PP.game_state.set_variable("tot_blueprint_checkpoint", b);
    PP.game_state.set_variable("tot_ingranaggi_checkpoint", i);
}

// Funzione chiamata al respawn (morte) per resettare ai valori del checkpoint
function resetta_collezionabili_al_respawn() {
    // Svuota i temporanei (così quelli presi dopo il checkpoint ricompaiono)
    PP.game_state.set_variable("collezionabili_presi_temp", []);
    
    // Ripristina i contatori numerici
    let b_save = PP.game_state.get_variable("tot_blueprint_checkpoint") || 0;
    let i_save = PP.game_state.get_variable("tot_ingranaggi_checkpoint") || 0;
    
    PP.game_state.set_variable("tot_blueprint", b_save);
    PP.game_state.set_variable("tot_ingranaggi", i_save);
}

// Helper per salvare ID (Temporaneo fino al checkpoint)
function salva_collezionabile_preso(id) {
    if (!id) return;
    let temp = PP.game_state.get_variable("collezionabili_presi_temp") || [];
    if (!temp.includes(id)) {
        temp.push(id);
        PP.game_state.set_variable("collezionabili_presi_temp", temp);
    }
}

// Helper verifica se preso (controlla sia temp che checkpoint)
function is_collezionabile_preso(id) {
    let temp = PP.game_state.get_variable("collezionabili_presi_temp") || [];
    let perm = PP.game_state.get_variable("collezionabili_presi_checkpoint") || [];
    return temp.includes(id) || perm.includes(id);
}

// --- BLUEPRINT ---
function collision_blueprint(s, player, item) {
    let attuali = PP.game_state.get_variable("tot_blueprint") + 1;
    PP.game_state.set_variable("tot_blueprint", attuali);
    
    if (item.id_univoco) salva_collezionabile_preso(item.id_univoco);

    console.log("Blueprint Preso! Totale: " + attuali + "/" + OBIETTIVO_BLUEPRINT);
    PP.assets.destroy(item);
}

function create_blueprint(s, lista_spawn, player) {
    init_collezionabili_state();
    if (!lista_spawn) return;

    for (let i = 0; i < lista_spawn.length; i++) {
        let pos = lista_spawn[i];
        
        // Se già preso (temp o perm), non spawnare
        if (pos.id && is_collezionabile_preso(pos.id)) continue;

        let item = PP.assets.image.add(s, img_blueprint, pos.x, pos.y, 0, 0);
        if (pos.id) item.id_univoco = pos.id;

        PP.physics.add(s, item, PP.physics.type.STATIC);
        PP.physics.add_overlap_f(s, player, item, collision_blueprint);
    }
}

// --- INGRANAGGI ---
function collision_ingranaggio(s, player, item) {
    let attuali = PP.game_state.get_variable("tot_ingranaggi") + 1;
    PP.game_state.set_variable("tot_ingranaggi", attuali);

    if (item.id_univoco) salva_collezionabile_preso(item.id_univoco);

    console.log("Ingranaggio Preso! Totale: " + attuali + "/" + OBIETTIVO_INGRANAGGI);
    PP.assets.destroy(item);
}

function create_ingranaggi(s, lista_spawn, player) {
    init_collezionabili_state();
    if (!lista_spawn) return;

    for (let i = 0; i < lista_spawn.length; i++) {
        let pos = lista_spawn[i];

        if (pos.id && is_collezionabile_preso(pos.id)) continue;

        let item = PP.assets.image.add(s, img_ingranaggio, pos.x, pos.y, 0, 0);
        if (pos.id) item.id_univoco = pos.id;

        PP.physics.add(s, item, PP.physics.type.STATIC);
        PP.physics.add_overlap_f(s, player, item, collision_ingranaggio);
    }
}

// --- AGGIORNATO PER POLIPHASER (PP.scenes.start) ---
function check_collezionabili_vittoria() {
    let tot_b = PP.game_state.get_variable("tot_blueprint") || 0;
    let tot_i = PP.game_state.get_variable("tot_ingranaggi") || 0;

    if (tot_b >= OBIETTIVO_BLUEPRINT && tot_i >= OBIETTIVO_INGRANAGGI) {
        console.log("VITTORIA PERFETTA -> Good Ending");
        PP.scenes.start("good_ending");
    } else {
        console.log("MANCANO PEZZI -> Bad Ending");
        console.log("Blueprint: " + tot_b + ", Ingranaggi: " + tot_i);
        PP.scenes.start("bad_ending");
    }
}

// Espongo le funzioni per chiamarle da base.js / base_3.js
window.salva_collezionabili_al_checkpoint = salva_collezionabili_al_checkpoint;
window.resetta_collezionabili_al_respawn = resetta_collezionabili_al_respawn;

function update_blueprint(s) {
}