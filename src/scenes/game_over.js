let img_go_btn;
let go_btn_rigioca, go_btn_menu, go_btn_checkpoint;
let go_mouse_lock = false;

function preload_game_over(s) {
    img_go_btn = PP.assets.image.load(s, "assets/images/PLAYER/sparo 52x52.png");
}

function create_game_over(s) {
    go_mouse_lock = false;
    let w = PP.game.config.canvas_width;
    let h = PP.game.config.canvas_height;
    let cx = w / 2;

    // 1. Sfondo Nero
    s.add.rectangle(cx, h / 2, w, h, 0x000000);

    // 2. Titolo
    let titolo = PP.shapes.text_styled_add(s, cx, h / 3, "L'INQUINAMENTO\nHA VINTO!", 50, "Helvetica", "bold", "0xFFFFFF", null, 0.5, 0.5);
    titolo.ph_obj.setAlign('center'); 

    // Helper Bottoni
    let make_btn = (x, label) => {
        let b = PP.assets.image.add(s, img_go_btn, x, h / 1.3, 0.5, 0.5);
        b.geometry.scale_x = 3; 
        b.geometry.scale_y = 1.5;
        PP.shapes.text_styled_add(s, x, h / 1.3, label, 24, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5);
        return b;
    };

    // Bottone Nuova Partita (Sempre visibile) a sinistra
    go_btn_rigioca = make_btn(cx - 380, "RICOMINCIA DA CAPO");

    // Bottone Checkpoint (Visibile SOLO se c'è un checkpoint attivo)
    let cp_attivo = PP.game_state.get_variable("checkpoint_attivo");
    if (cp_attivo) {
        go_btn_checkpoint = make_btn(cx, "RIPROVA DALL'ULTIMO CHECKPOINT");
    } else {
        go_btn_checkpoint = null; // Non lo creiamo
    }

    // Bottone Menu (Sempre visibile) a destra
    go_btn_menu = make_btn(cx + 380, "MENÙ");
}

function update_game_over(s) {
    let check_click = (btn_pp, action) => {
        if (!btn_pp) return; // Se il bottone non esiste, esci
        if (!s.input.activePointer) return;
        
        let mx = s.input.activePointer.x;
        let my = s.input.activePointer.y;
        let down = s.input.activePointer.isDown;
        
        let b = btn_pp.ph_obj;
        if (mx > b.x - (b.width * b.scaleX)/2 && mx < b.x + (b.width * b.scaleX)/2 && 
            my > b.y - (b.height * b.scaleY)/2 && my < b.y + (b.height * b.scaleY)/2) {
            
            b.setTint(0x888888); 
            if (down) {
                if (!go_mouse_lock) { go_mouse_lock = true; action(); }
            } else { go_mouse_lock = false; }
        } else {
            b.clearTint();
        }
    };

    // Funzione helper interna per resettare tutto a zero (PULIZIA PROFONDA)
    let resetta_tutto_a_zero = () => {
        PP.game_state.set_variable("checkpoint_attivo", false);
        
        // [FIX BUG] Resetta anche qual è l'ultimo livello salvato e le coordinate
        PP.game_state.set_variable("ultimo_livello", null);
        PP.game_state.set_variable("cp_x", null);
        PP.game_state.set_variable("cp_y", null);

        // Reset variabili di gioco
        PP.game_state.set_variable("HP_player", 10);
        PP.game_state.set_variable("HP_checkpoint", 10);
        PP.game_state.set_variable("spawn_x", 150);
        PP.game_state.set_variable("spawn_y", 620);
        
        // Reset variabili di progressione
        PP.game_state.set_variable("arma_sbloccata", false);
        PP.game_state.set_variable("arma_equipaggiata", 0);
        PP.game_state.set_variable("tot_blueprint", 0);
        PP.game_state.set_variable("tot_ingranaggi", 0);
        PP.game_state.set_variable("tot_blueprint_checkpoint", 0);
        PP.game_state.set_variable("tot_ingranaggi_checkpoint", 0);
        
        // Pulisce liste collezionabili e nemici
        PP.game_state.set_variable("collezionabili_presi_checkpoint", []);
        PP.game_state.set_variable("collezionabili_presi_temp", []);
        PP.game_state.set_variable("nemici_uccisi", []);

        // Forza HUD Inquinante (default)
        if (typeof hud_modalita_inquinante !== 'undefined') {
            hud_modalita_inquinante = true;
        }
    };

    // 1. NUOVA PARTITA: RESETTA TUTTO -> VA A BASE
    check_click(go_btn_rigioca, () => {
        resetta_tutto_a_zero();
        PP.scenes.start("base");
    });

    // 2. ULTIMO CHECKPOINT: TIENE PROGRESSI -> VA A LIVELLO SALVATO
    check_click(go_btn_checkpoint, () => {
        let lv_salvato = PP.game_state.get_variable("ultimo_livello") || "base";
        
        // Resetta i collezionabili presi DOPO il checkpoint (torna al valore salvato)
        if (typeof window.resetta_collezionabili_al_respawn === "function") {
            window.resetta_collezionabili_al_respawn();
        }

        PP.scenes.start(lv_salvato);
    });

    // 3. MENU: RESETTA TUTTO -> VA AL MENU
    check_click(go_btn_menu, () => {
        resetta_tutto_a_zero();
        PP.scenes.start("main_menu");
    });
}

function destroy_game_over(s) {}

PP.scenes.add("game_over", preload_game_over, create_game_over, update_game_over, destroy_game_over);