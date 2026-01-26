let img_blueprint;
let img_ingranaggio;

// Contatori Globali
let tot_blueprint_raccolti = 0;
let tot_ingranaggi_raccolti = 0;

// Obiettivi per il messaggio finale
const OBIETTIVO_BLUEPRINT = 4;
const OBIETTIVO_INGRANAGGI = 4;

function preload_blueprint(s) {
    img_blueprint = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Blueprint_coll.png");
    img_ingranaggio = PP.assets.image.load(s, "assets/images/COLLEZIONABILI/Ingranaggio.png");
}

// --- BLUEPRINT ---
function collision_blueprint(s, player, item) {
    tot_blueprint_raccolti++;
    console.log("Blueprint Preso! Totale: " + tot_blueprint_raccolti + "/" + OBIETTIVO_BLUEPRINT);
    PP.assets.destroy(item);
}

function create_blueprint(s, lista_spawn, player) {
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
    tot_ingranaggi_raccolti++;
    console.log("Ingranaggio Preso! Totale: " + tot_ingranaggi_raccolti + "/" + OBIETTIVO_INGRANAGGI);
    PP.assets.destroy(item);
}

function create_ingranaggi(s, lista_spawn, player) {
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
    if (tot_blueprint_raccolti >= OBIETTIVO_BLUEPRINT && tot_ingranaggi_raccolti >= OBIETTIVO_INGRANAGGI) {
        console.log("HAI PRESO TUTTI I COLLEZIONABILI! VITTORIA PERFETTA!");
    } else {
        console.log("HAI PERSO!! Ti mancano dei pezzi.");
        console.log("Blueprint: " + tot_blueprint_raccolti);
        console.log("Ingranaggi: " + tot_ingranaggi_raccolti);
    }
}

function update_blueprint(s) {
    // Vuoto
}