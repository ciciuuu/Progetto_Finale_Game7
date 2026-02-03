let asset_sfondo_menu;
let asset_titolo;
let asset_gioca;
let asset_storia;
let asset_crediti;

let sfondo_menu_obj;
let btn_titolo;
let btn_gioca;
let btn_storia;
let btn_crediti;

function preload(s) {
    asset_sfondo_menu = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/sfondo_menu.jpg");
    
    asset_titolo = PP.assets.image.load(s, "assets/images/TAVOLE/Pergamene/pergamena_titolo.png");
    asset_gioca = PP.assets.image.load(s, "assets/images/TAVOLE/Pergamene/pergamena_gioca.png");
    asset_storia = PP.assets.image.load(s, "assets/images/TAVOLE/Pergamene/pergamena_storia.png");
    asset_crediti = PP.assets.image.load(s, "assets/images/TAVOLE/Pergamene/pergamena_crediti.png");
}

function create(s) {
    sfondo_menu_obj = PP.assets.image.add(s, asset_sfondo_menu, 0, 0, 0, 0);

    let cx = PP.game.config.canvas_width / 2;
    let h = PP.game.config.canvas_height;

    // FUNZIONE: AVVIA NUOVA PARTITA
    // Resetta completamente tutte le variabili globali del gioco per iniziare puliti
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
        
        // Pulisco le liste (array vuoti)
        PP.game_state.set_variable("collezionabili_presi_checkpoint", []);
        PP.game_state.set_variable("collezionabili_presi_temp", []);
        PP.game_state.set_variable("nemici_uccisi", []);
        
        // Imposto lo spawn iniziale del Livello 1
        PP.game_state.set_variable("spawn_x", -20 * 32);
        PP.game_state.set_variable("spawn_y", -2 * 32);

        // Avvio la scena di gioco
        PP.scenes.start("base");
    };

    // CONFIGURAZIONE BOTTONE
    let setup_bottone = function(oggetto, scala_normale, scala_hover, azione_callback) {
        oggetto.geometry.scale_x = scala_normale;
        oggetto.geometry.scale_y = scala_normale;

        PP.interactive.mouse.add(oggetto, "pointerover", function(s) {
            // [PHASER] Cambio cursore
            s.input.manager.canvas.style.cursor = 'pointer';
            
            oggetto.geometry.scale_x = scala_hover;
            oggetto.geometry.scale_y = scala_hover;
            
            // [PHASER] Tinta grigia
            if(oggetto.ph_obj) oggetto.ph_obj.setTint(0xDBDBDB);
        });

        // Mouse esce: Reset completo
        PP.interactive.mouse.add(oggetto, "pointerout", function(s) {
            s.input.manager.canvas.style.cursor = 'default';
            
            oggetto.geometry.scale_x = scala_normale;
            oggetto.geometry.scale_y = scala_normale;
            
            // [PHASER] Rimuovo tinta
            if(oggetto.ph_obj) oggetto.ph_obj.clearTint(); 
        });

        // Mouse preme: Rimpicciolisci (Feedback tattile)
        PP.interactive.mouse.add(oggetto, "pointerdown", function(s) {
            oggetto.geometry.scale_x = scala_normale;
            oggetto.geometry.scale_y = scala_normale;
        });

        // Mouse rilascia (Click confermato): Esegui azione
        PP.interactive.mouse.add(oggetto, "pointerup", function(s) {
            if(oggetto.ph_obj) oggetto.ph_obj.clearTint();
            // Torno alla scala hover (perché il mouse è ancora sopra)
            oggetto.geometry.scale_x = scala_hover; 
            oggetto.geometry.scale_y = scala_hover;

            // Chiamo la funzione passata come parametro
            if (azione_callback) azione_callback();
        });
    };

    // Creazione Bottoni e assegnazione funzioni

    // 1. GIOCA
    btn_gioca = PP.assets.image.add(s, asset_gioca, 1060, 190, 0.5, 0.5);
    setup_bottone(btn_gioca, 0.4, 0.45, avvia_nuova_partita);

    // 2. STORIA
    btn_storia = PP.assets.image.add(s, asset_storia, 200, 240, 0.5, 0.5);
    setup_bottone(btn_storia, 0.4, 0.45, function() {
        PP.scenes.start("storia");
    });

    // 3. CREDITI
    btn_crediti = PP.assets.image.add(s, asset_crediti, 480, 490, 0.5, 0.5);
    setup_bottone(btn_crediti, 0.4, 0.45, function() {
        PP.scenes.start("credits");
    });
}

function update(s) {
}

function destroy(s) {
}

PP.scenes.add("main_menu", preload, create, update, destroy);