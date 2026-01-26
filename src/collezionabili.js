// ok

let img_blueprint;
let img_ingranaggio;

// Obiettivi per il messaggio finale
const OBIETTIVO_BLUEPRINT = 4;
const OBIETTIVO_INGRANAGGI = 4;

function preload_blueprint(s) {
    img_blueprint = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Blueprint_coll.png");
    img_ingranaggio = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Ingranaggio.png");
}

function init_collezionabili_state() {
    // Inizializza i contatori nel Game State se non esistono
    if (PP.game_state.get_variable("tot_blueprint") === undefined) {
        PP.game_state.set_variable("tot_blueprint", 0);
    }
    if (PP.game_state.get_variable("tot_ingranaggi") === undefined) {
        PP.game_state.set_variable("tot_ingranaggi", 0);
    }
}

// --- BLUEPRINT ---
function collision_blueprint(s, player, item) {
    // Recupera, incrementa e salva
    let attuali = PP.game_state.get_variable("tot_blueprint") + 1;
    PP.game_state.set_variable("tot_blueprint", attuali);
    
    console.log("Blueprint Preso! Totale: " + attuali + "/" + OBIETTIVO_BLUEPRINT);
    
    // Distruzione PoliPhaser
    PP.assets.destroy(item);
}

function create_blueprint(s, lista_spawn, player) {
    init_collezionabili_state();
    if (!lista_spawn) return;

    for (let i = 0; i < lista_spawn.length; i++) {
        let pos = lista_spawn[i];
        let item = PP.assets.image.add(s, img_blueprint, pos.x, pos.y, 0.5, 0.5);
        
        // Fisica Statica con PoliPhaser
        PP.physics.add(s, item, PP.physics.type.STATIC);
        
        // Collisione con PoliPhaser
        PP.physics.add_overlap_f(s, player, item, collision_blueprint);
    }
}

// --- INGRANAGGI ---
function collision_ingranaggio(s, player, item) {
    let attuali = PP.game_state.get_variable("tot_ingranaggi") + 1;
    PP.game_state.set_variable("tot_ingranaggi", attuali);

    console.log("Ingranaggio Preso! Totale: " + attuali + "/" + OBIETTIVO_INGRANAGGI);
    PP.assets.destroy(item);
}

function create_ingranaggi(s, lista_spawn, player) {
    init_collezionabili_state();
    if (!lista_spawn) return;

    for (let i = 0; i < lista_spawn.length; i++) {
        let pos = lista_spawn[i];
        let item = PP.assets.image.add(s, img_ingranaggio, pos.x, pos.y, 0.5, 0.5);
        
        PP.physics.add(s, item, PP.physics.type.STATIC);
        PP.physics.add_overlap_f(s, player, item, collision_ingranaggio);
    }
}

// --- CONTROLLO FINALE ---
function check_collezionabili_vittoria() {
    let tot_b = PP.game_state.get_variable("tot_blueprint") || 0;
    let tot_i = PP.game_state.get_variable("tot_ingranaggi") || 0;

    if (tot_b >= OBIETTIVO_BLUEPRINT && tot_i >= OBIETTIVO_INGRANAGGI) {
        console.log("HAI PRESO TUTTI I COLLEZIONABILI! VITTORIA PERFETTA!");
        // Qui potresti chiamare: PP.scenes.start("vittoria_perfetta");
    } else {
        console.log("HAI PERSO!! Ti mancano dei pezzi.");
        console.log("Blueprint: " + tot_b);
        console.log("Ingranaggi: " + tot_i);
        // Qui potresti chiamare: PP.scenes.start("game_over_incompleto");
    }
}

function update_blueprint(s) {
    // Vuoto
}