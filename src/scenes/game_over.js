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

    // 2. Titolo Bianco e Centrato
    let titolo = PP.shapes.text_styled_add(s, cx, h / 3, "L'INQUINAMENTO\nHA VINTO!", 50, "Helvetica", "bold", "0xFFFFFF", null, 0.5, 0.5);
    titolo.ph_obj.setAlign('center'); 

    // 3. Helper per creare bottoni
    let make_btn = (x, label) => {
        let b = PP.assets.image.add(s, img_go_btn, x, h / 1.3, 0.5, 0.5);
        b.geometry.scale_x = 3; 
        b.geometry.scale_y = 1.5;
        PP.shapes.text_styled_add(s, x, h / 1.3, label, 24, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5);
        return b;
    };

    go_btn_rigioca = make_btn(cx - 380, "NUOVA PARTITA");
    go_btn_checkpoint = make_btn(cx, "ULTIMO CHECKPOINT");
    go_btn_menu = make_btn(cx + 380, "MENÙ");
}

function update_game_over(s) {
    let check_click = (btn_pp, action) => {
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

    // 1. NUOVA PARTITA: RESETTA TUTTO (Checkpoint compreso)
    check_click(go_btn_rigioca, () => {
        
        // Disattiva il checkpoint in memoria!
        PP.game_state.set_variable("checkpoint_attivo", false);
        
        // Reset variabili di gioco
        PP.game_state.set_variable("HP_player", 10);
        PP.game_state.set_variable("HP_checkpoint", 10);
        PP.game_state.set_variable("spawn_x", 150);
        PP.game_state.set_variable("spawn_y", 620);
        
        PP.game_state.set_variable("arma_sbloccata", false);
        PP.game_state.set_variable("tot_blueprint", 0);
        PP.game_state.set_variable("tot_ingranaggi", 0);
        
        // Pulisce le liste di oggetti presi/nemici uccisi
        PP.game_state.set_variable("nemici_uccisi", []);
        PP.game_state.set_variable("collezionabili_presi", []);

        // Forza HUD Inquinante
        if (typeof hud_modalita_inquinante !== 'undefined') {
            hud_modalita_inquinante = true;
        }

        PP.scenes.start("base");
    });

    // 2. ULTIMO CHECKPOINT: Carica i dati salvati
    check_click(go_btn_checkpoint, () => {
        // Se non c'è un livello salvato, va alla base
        let lv_salvato = PP.game_state.get_variable("ultimo_livello") || "base";
        
        // La logica di caricamento posizione è gestita dentro il create() del livello stesso
        // qui ci limitiamo a lanciare la scena.
        PP.scenes.start(lv_salvato);
    });

    check_click(go_btn_menu, () => {
        PP.scenes.start("main_menu");
    });
}

function destroy_game_over(s) {}

PP.scenes.add("game_over", preload_game_over, create_game_over, update_game_over, destroy_game_over);