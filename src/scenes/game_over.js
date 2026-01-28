let img_go_btn;
let img_bg_gameover; // Nuova variabile per lo sfondo
let go_btn_rigioca, go_btn_menu, go_btn_checkpoint;
let go_mouse_lock = false;

function preload_game_over(s) {
    // Caricamento bottone
    img_go_btn = PP.assets.image.load(s, "assets/images/PLAYER/sparo 52x52.png");
    
    // Caricamento Sfondo Game Over
    // Nota: Ho aggiunto "assets/images/" all'inizio come per gli altri file. 
    // Se il percorso è diverso, modificalo qui.
    img_bg_gameover = PP.assets.image.load(s, "assets/images/TAVOLE/Tavole/Game over.jpg");
}

function create_game_over(s) {
    go_mouse_lock = false;
    let w = PP.game.config.canvas_width;
    let h = PP.game.config.canvas_height;
    let cx = w / 2;

    // 1. SFONDO IMMAGINE (Al posto del rettangolo nero)
    let bg = PP.assets.image.add(s, img_bg_gameover, cx, h / 2, 0.5, 0.5);
    
    // Adatta l'immagine allo schermo (opzionale, per sicurezza)
    bg.geometry.scale_x = w / bg.ph_obj.width;
    bg.geometry.scale_y = h / bg.ph_obj.height;


    // 2. TITOLO
    let titolo = PP.shapes.text_styled_add(s, cx, h / 4, "GAME OVER", 60, "Helvetica", "bold", "0xFFFFFF", null, 0.5, 0.5);


    // 3. CAUSA DELLA MORTE
    // Recuperiamo la variabile impostata prima di morire
    let causa_raw = PP.game_state.get_variable("causa_morte");
    let testo_causa = "";

    // Mappatura delle cause
    if (causa_raw === "suicidio") {
        testo_causa = "L'inquinamento ti si è ritorto contro.";
    } else if (causa_raw === "sabbie") {
        testo_causa = "Un po' troppo denso per nuotare?";
    } else if (causa_raw === "ragno") {
        testo_causa = "Spuntino per ragni.";
    } else if (causa_raw === "cactus_contatto") {
        testo_causa = "Agopuntura estrema.";
    } else if (causa_raw === "cactus_proiettile") {
        testo_causa = "Spina nel fianco.";
    } else {
        testo_causa = "L'INQUINAMENTO HA VINTO!"; // Default
    }

    // Mostra il testo della causa
    let sottotitolo = PP.shapes.text_styled_add(s, cx, h / 2.5, testo_causa, 40, "Helvetica", "bold", "0xFFFFFF", null, 0.5, 0.5);
    sottotitolo.ph_obj.setAlign('center');


    // Helper Bottoni
    let make_btn = (x, label) => {
        let b = PP.assets.image.add(s, img_go_btn, x, h / 1.2, 0.5, 0.5);
        b.geometry.scale_x = 3; 
        b.geometry.scale_y = 1.5;
        // Testo bottone
        let t = PP.shapes.text_styled_add(s, x, h / 1.2, label, 20, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5);
        t.ph_obj.setStroke('#000000', 3);
        return b;
    };

    // Bottone Nuova Partita (Sempre visibile) a sinistra
    go_btn_rigioca = make_btn(cx - 300, "RICOMINCIA DA CAPO");

    // Bottone Checkpoint (Visibile SOLO se c'è un checkpoint attivo)
    let cp_attivo = PP.game_state.get_variable("checkpoint_attivo");
    if (cp_attivo) {
        go_btn_checkpoint = make_btn(cx, "RIPROVA (CHECKPOINT)");
    } else {
        go_btn_checkpoint = null; // Non lo creiamo
    }

    // Bottone Menu (Sempre visibile) a destra
    go_btn_menu = make_btn(cx + 300, "MENÙ PRINCIPALE");
}

function update_game_over(s) {
    let check_click = (btn_pp, action) => {
        if (!btn_pp) return; // Se il bottone non esiste, esci
        if (!s.input.activePointer) return;
        
        let mx = s.input.activePointer.x;
        let my = s.input.activePointer.y;
        let down = s.input.activePointer.isDown;
        
        let b = btn_pp.ph_obj;
        // Semplice bounding box check per il click
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
        
        // Non forziamo spawn_x/y qui, lasciamo che lo faccia il livello Base
        
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

    // 1. NUOVA PARTITA
    check_click(go_btn_rigioca, () => {
        resetta_tutto_a_zero();
        PP.scenes.start("base");
    });

    // 2. ULTIMO CHECKPOINT
    check_click(go_btn_checkpoint, () => {
        let lv_salvato = PP.game_state.get_variable("ultimo_livello") || "base";
        
        // Resetta i collezionabili presi DOPO il checkpoint
        if (typeof window.resetta_collezionabili_al_respawn === "function") {
            window.resetta_collezionabili_al_respawn();
        }

        PP.scenes.start(lv_salvato);
    });

    // 3. MENU
    check_click(go_btn_menu, () => {
        resetta_tutto_a_zero();
        PP.scenes.start("main_menu");
    });
}

function destroy_game_over(s) {}

PP.scenes.add("game_over", preload_game_over, create_game_over, update_game_over, destroy_game_over);