// menu.js

// --- VARIABILI ASSETS ---
let asset_sfondo_menu;
let asset_titolo;
let asset_gioca;
let asset_storia;
let asset_crediti;

// --- OGGETTI PULSANTI ---
let sfondo_menu_obj;
let btn_titolo;
let btn_gioca;
let btn_storia;
let btn_crediti;

function preload(s) {
    // Caricamento Sfondo
    asset_sfondo_menu = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/sfondo_menu.jpg");
    
    // Caricamento Pergamene (Pulsanti)
    asset_titolo = PP.assets.image.load(s, "assets/images/TAVOLE/Pergamene/pergamena titolo.png");
    asset_gioca = PP.assets.image.load(s, "assets/images/TAVOLE/Pergamene/pergamena gioca.png");
    asset_storia = PP.assets.image.load(s, "assets/images/TAVOLE/Pergamene/pergamena storia.png");
    asset_crediti = PP.assets.image.load(s, "assets/images/TAVOLE/Pergamene/pergamena crediti.png");
}

function create(s) {
    // 1. SFONDO
    sfondo_menu_obj = PP.assets.image.add(s, asset_sfondo_menu, 0, 0, 0, 0);

    let cx = PP.game.config.canvas_width / 2;
    let h = PP.game.config.canvas_height;

    // --- FUNZIONE PER AVVIARE UNA NUOVA PARTITA (RESET) ---
    // Definita qui per essere usata sia dal click che dalla tastiera
    let avvia_nuova_partita = function() {
        // 1. Reset Checkpoint (FONDAMENTALE)
        PP.game_state.set_variable("checkpoint_attivo", false);
        PP.game_state.set_variable("ultimo_livello", null);
        PP.game_state.set_variable("cp_x", null);
        PP.game_state.set_variable("cp_y", null);

        // 2. Reset Player
        PP.game_state.set_variable("HP_player", 10);
        PP.game_state.set_variable("HP_checkpoint", 10);
        PP.game_state.set_variable("arma_sbloccata", false);
        PP.game_state.set_variable("arma_equipaggiata", 0);
        
        // 3. Reset Collezionabili
        PP.game_state.set_variable("tot_blueprint", 0);
        PP.game_state.set_variable("tot_ingranaggi", 0);
        PP.game_state.set_variable("tot_blueprint_checkpoint", 0);
        PP.game_state.set_variable("tot_ingranaggi_checkpoint", 0);
        PP.game_state.set_variable("collezionabili_presi_checkpoint", []);
        PP.game_state.set_variable("collezionabili_presi_temp", []);
        
        // 4. Reset Nemici e altro
        PP.game_state.set_variable("nemici_uccisi", []);
        
        // Reset Spawn iniziale livello 1 (per sicurezza)
        PP.game_state.set_variable("spawn_x", -20 * 32);
        PP.game_state.set_variable("spawn_y", -2 * 32);

        PP.scenes.start("base");
    };

    // --- FUNZIONE HELPER CONFIGURAZIONE BOTTONI ---
    let setup_bottone = function(oggetto, scala_normale, scala_hover, azione_callback) {
        // Imposta scala iniziale
        oggetto.geometry.scale_x = scala_normale;
        oggetto.geometry.scale_y = scala_normale;

        // EVENTO: Mouse sopra (Hover)
        PP.interactive.mouse.add(oggetto, "pointerover", function(s) {
            // Cambio cursore (HTML)
            s.input.manager.canvas.style.cursor = 'pointer';
            
            // Ingrandimento (PoliPhaser)
            oggetto.geometry.scale_x = scala_hover;
            oggetto.geometry.scale_y = scala_hover;
        });

        // EVENTO: Mouse esce (Out)
        PP.interactive.mouse.add(oggetto, "pointerout", function(s) {
            // Reset cursore
            s.input.manager.canvas.style.cursor = 'default';
            
            // Reset Scala
            oggetto.geometry.scale_x = scala_normale;
            oggetto.geometry.scale_y = scala_normale;
            
            // [NATIVO] Reset Tinta (Se esci senza cliccare)
            if(oggetto.ph_obj) oggetto.ph_obj.clearTint(); 
        });

        // EVENTO: Mouse preme (Down)
        PP.interactive.mouse.add(oggetto, "pointerdown", function(s) {
            // [NATIVO] Tinta scura
            if(oggetto.ph_obj) oggetto.ph_obj.setTint(0xAAAAAA); 
        });

        // EVENTO: Mouse rilascia (Up/Click)
        PP.interactive.mouse.add(oggetto, "pointerup", function(s) {
            // [NATIVO] Reset Tinta
            if(oggetto.ph_obj) oggetto.ph_obj.clearTint();
            
            // Esegue l'azione
            if (azione_callback) azione_callback();
        });
    };

// 2. TITOLO
    /* // Sintassi: (s, asset_titolo, X, Y, 0, 0) -> 0,0 è alto a sinistra
    btn_titolo = PP.assets.image.add(s, asset_titolo, 250, 40, 0.5, 0.5);
    btn_titolo.geometry.scale_x = 1.05;
    btn_titolo.geometry.scale_y = 1.05; */

    // 3. PULSANTE GIOCA
    btn_gioca = PP.assets.image.add(s, asset_gioca, 1060, 190, 0.5, 0.5);
    setup_bottone(btn_gioca, 1, 1.1, avvia_nuova_partita);

    // 4. PULSANTE STORIA
    btn_storia = PP.assets.image.add(s, asset_storia, 200, 240, 0.5, 0.5);
    setup_bottone(btn_storia, 1, 1.1, function() {
        PP.scenes.start("storia");
    });

    // 5. PULSANTE CREDITI
    btn_crediti = PP.assets.image.add(s, asset_crediti, 480, 490, 0.5, 0.5);
    setup_bottone(btn_crediti, 1, 1.1, function() {
        PP.scenes.start("credits");
    });
}

function update(s) {
    // Gestione Input Tastiera (Backup)
    
    // Tasto SPACE -> Nuova Partita
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
        // Esegue la stessa logica del bottone
        // (Nota: qui ho dovuto duplicare il codice perché 'avvia_nuova_partita' è locale in create.
        // Se vuoi evitarlo, definisci la funzione fuori o copia-incolla come richiesto).
        
        // 1. Reset Checkpoint
        PP.game_state.set_variable("checkpoint_attivo", false);
        PP.game_state.set_variable("ultimo_livello", null);
        PP.game_state.set_variable("cp_x", null);
        PP.game_state.set_variable("cp_y", null);

        // 2. Reset Player
        PP.game_state.set_variable("HP_player", 10);
        PP.game_state.set_variable("HP_checkpoint", 10);
        PP.game_state.set_variable("arma_sbloccata", false);
        PP.game_state.set_variable("arma_equipaggiata", 0);
        
        // 3. Reset Collezionabili
        PP.game_state.set_variable("tot_blueprint", 0);
        PP.game_state.set_variable("tot_ingranaggi", 0);
        PP.game_state.set_variable("tot_blueprint_checkpoint", 0);
        PP.game_state.set_variable("tot_ingranaggi_checkpoint", 0);
        PP.game_state.set_variable("collezionabili_presi_checkpoint", []);
        PP.game_state.set_variable("collezionabili_presi_temp", []);
        
        // 4. Reset Nemici e altro
        PP.game_state.set_variable("nemici_uccisi", []);
        
        // Reset Spawn
        PP.game_state.set_variable("spawn_x", -20 * 32);
        PP.game_state.set_variable("spawn_y", -2 * 32);

        PP.scenes.start("base");
    }
  
    // Tasto C -> Crediti
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.C)) {
        PP.scenes.start("credits");
    }

    // Tasto S -> Storia
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.S)) {
        PP.scenes.start("storia");
    }
}

function destroy(s) {
}

PP.scenes.add("main_menu", preload, create, update, destroy);