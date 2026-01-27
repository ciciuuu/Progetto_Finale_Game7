let img_blueprint;
let img_ingranaggio;

const OBIETTIVO_BLUEPRINT = 4;
const OBIETTIVO_INGRANAGGI = 4;

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
    // Lista ID presi
    if (PP.game_state.get_variable("collezionabili_presi") === undefined) {
        PP.game_state.set_variable("collezionabili_presi", []);
    }
}

// Helper per salvare ID
function salva_collezionabile_preso(id) {
    if (!id) return;
    let presi = PP.game_state.get_variable("collezionabili_presi") || [];
    if (!presi.includes(id)) {
        presi.push(id);
        PP.game_state.set_variable("collezionabili_presi", presi);
    }
}

// --- BLUEPRINT ---
function collision_blueprint(s, player, item) {
    let attuali = PP.game_state.get_variable("tot_blueprint") + 1;
    PP.game_state.set_variable("tot_blueprint", attuali);
    
    // [PERSISTENZA] Salva ID
    if (item.id_univoco) salva_collezionabile_preso(item.id_univoco);

    console.log("Blueprint Preso! Totale: " + attuali + "/" + OBIETTIVO_BLUEPRINT);
    PP.assets.destroy(item);
}

function create_blueprint(s, lista_spawn, player) {
    init_collezionabili_state();
    if (!lista_spawn) return;

    let presi = PP.game_state.get_variable("collezionabili_presi") || [];

    for (let i = 0; i < lista_spawn.length; i++) {
        let pos = lista_spawn[i];
        
        // [PERSISTENZA] Skip se già preso
        if (pos.id && presi.includes(pos.id)) continue;

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

    // [PERSISTENZA] Salva ID
    if (item.id_univoco) salva_collezionabile_preso(item.id_univoco);

    console.log("Ingranaggio Preso! Totale: " + attuali + "/" + OBIETTIVO_INGRANAGGI);
    PP.assets.destroy(item);
}

function create_ingranaggi(s, lista_spawn, player) {
    init_collezionabili_state();
    if (!lista_spawn) return;

    let presi = PP.game_state.get_variable("collezionabili_presi") || [];

    for (let i = 0; i < lista_spawn.length; i++) {
        let pos = lista_spawn[i];

        // [PERSISTENZA] Skip se già preso
        if (pos.id && presi.includes(pos.id)) continue;

        let item = PP.assets.image.add(s, img_ingranaggio, pos.x, pos.y, 0, 0);
        if (pos.id) item.id_univoco = pos.id;

        PP.physics.add(s, item, PP.physics.type.STATIC);
        PP.physics.add_overlap_f(s, player, item, collision_ingranaggio);
    }
}

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

function update_blueprint(s) {
}