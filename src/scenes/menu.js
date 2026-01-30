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
    let avvia_nuova_partita = function() {
        PP.game_state.set_variable("checkpoint_attivo", false);
        PP.game_state.set_variable("ultimo_livello", null);
        PP.game_state.set_variable("cp_x", null);
        PP.game_state.set_variable("cp_y", null);

        PP.game_state.set_variable("HP_player", 10);
        PP.game_state.set_variable("HP_checkpoint", 10);
        PP.game_state.set_variable("arma_sbloccata", false);
        PP.game_state.set_variable("arma_equipaggiata", 0);
        
        PP.game_state.set_variable("tot_blueprint", 0);
        PP.game_state.set_variable("tot_ingranaggi", 0);
        PP.game_state.set_variable("tot_blueprint_checkpoint", 0);
        PP.game_state.set_variable("tot_ingranaggi_checkpoint", 0);
        PP.game_state.set_variable("collezionabili_presi_checkpoint", []);
        PP.game_state.set_variable("collezionabili_presi_temp", []);
        
        PP.game_state.set_variable("nemici_uccisi", []);
        
        PP.game_state.set_variable("spawn_x", -20 * 32);
        PP.game_state.set_variable("spawn_y", -2 * 32);

        PP.scenes.start("base");
    };

    // --- FUNZIONE HELPER CONFIGURAZIONE BOTTONI (MODIFICATA) ---
    let setup_bottone = function(oggetto, scala_normale, scala_hover, azione_callback) {
        // Imposta scala iniziale
        oggetto.geometry.scale_x = scala_normale;
        oggetto.geometry.scale_y = scala_normale;

        // EVENTO: Mouse sopra (Hover) -> Ingrandisce e Scurisce
        PP.interactive.mouse.add(oggetto, "pointerover", function(s) {
            s.input.manager.canvas.style.cursor = 'pointer';
            
            // Ingrandimento
            oggetto.geometry.scale_x = scala_hover;
            oggetto.geometry.scale_y = scala_hover;
            
            // Tinta Scura
            if(oggetto.ph_obj) oggetto.ph_obj.setTint(0xDBDBDB);
        });

        // EVENTO: Mouse esce (Out) -> Reset completo
        PP.interactive.mouse.add(oggetto, "pointerout", function(s) {
            s.input.manager.canvas.style.cursor = 'default';
            
            // Reset Scala
            oggetto.geometry.scale_x = scala_normale;
            oggetto.geometry.scale_y = scala_normale;
            
            // Reset Tinta
            if(oggetto.ph_obj) oggetto.ph_obj.clearTint(); 
        });

        // EVENTO: Mouse preme (Down) -> Torna piccolo (Effetto Pressione)
        PP.interactive.mouse.add(oggetto, "pointerdown", function(s) {
            // Torna alla scala originale (più piccolo)
            oggetto.geometry.scale_x = scala_normale;
            oggetto.geometry.scale_y = scala_normale;
        });

        // EVENTO: Mouse rilascia (Up/Click) -> Azione
        PP.interactive.mouse.add(oggetto, "pointerup", function(s) {
            // Reset visuale (opzionale, utile se l'azione non cambia scena subito)
            if(oggetto.ph_obj) oggetto.ph_obj.clearTint();
            oggetto.geometry.scale_x = scala_hover; 
            oggetto.geometry.scale_y = scala_hover;

            // Esegue l'azione
            if (azione_callback) azione_callback();
        });
    };

    // 2. TITOLO (Nessuna interazione, solo visuale)
    /* btn_titolo = PP.assets.image.add(s, asset_titolo, 250, 40, 0.5, 0.5);
    btn_titolo.geometry.scale_x = 1.05;
    btn_titolo.geometry.scale_y = 1.05; 
    */

    // 3. PULSANTE GIOCA
    btn_gioca = PP.assets.image.add(s, asset_gioca, 1060, 190, 0.5, 0.5);
    setup_bottone(btn_gioca, 0.4, 0.45, avvia_nuova_partita);

    // 4. PULSANTE STORIA
    btn_storia = PP.assets.image.add(s, asset_storia, 200, 240, 0.5, 0.5);
    setup_bottone(btn_storia, 0.4, 0.45, function() {
        PP.scenes.start("storia");
    });

    // 5. PULSANTE CREDITI
    btn_crediti = PP.assets.image.add(s, asset_crediti, 480, 490, 0.5, 0.5);
    setup_bottone(btn_crediti, 0.4, 0.45, function() {
        PP.scenes.start("credits");
    });
}

function update(s) {
    // Gestione Input Tastiera (Backup)
    
    /* // Tasto SPACE -> Nuova Partita
    if(PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
        
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
    } */
  
    
}

function destroy(s) {
}

PP.scenes.add("main_menu", preload, create, update, destroy);