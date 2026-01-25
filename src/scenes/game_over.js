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
    
    // IMPORTANTE: Questo comando centra le righe di testo una rispetto all'altra
    titolo.ph_obj.setAlign('center'); 

    // 3. Helper per creare bottoni
    let make_btn = (x, label) => {
        let b = PP.assets.image.add(s, img_go_btn, x, h / 1.3, 0.5, 0.5);
        b.geometry.scale_x = 3; 
        b.geometry.scale_y = 1.5;
        // Testo Bottone
        PP.shapes.text_styled_add(s, x, h / 1.3, label, 24, "Arial", "bold", "0xFFFFFF", null, 0.5, 0.5);
        return b;
    };

    go_btn_rigioca = make_btn(cx - 380, "RIGIOCA");
    go_btn_checkpoint = make_btn(cx, "CHECKPOINT");
    go_btn_menu = make_btn(cx + 380, "MENU");
}

function update_game_over(s) {
    // Helper click manuale
    let check_click = (btn_pp, action) => {
        if (!s.input.activePointer) return;
        let mx = s.input.activePointer.x;
        let my = s.input.activePointer.y;
        let down = s.input.activePointer.isDown;
        
        let b = btn_pp.ph_obj;
        // Collisione Mouse
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

    check_click(go_btn_rigioca, () => {
        PP.game_state.set_variable("HP_player", 10);
        PP.scenes.start("base");
    });

    // 2. BOTTONE CHECKPOINT: Riparte dall'ultimo livello salvato
    check_click(go_btn_checkpoint, () => {
        let lv_salvato = PP.game_state.get_variable("ultimo_livello") || "base";
        //PP.game_state.set_variable("HP_player", 10);
        PP.scenes.start(lv_salvato);
    });

    check_click(go_btn_menu, () => {
        PP.scenes.start("main_menu");
    });
}

function destroy_game_over(s) {}

PP.scenes.add("game_over", preload_game_over, create_game_over, update_game_over, destroy_game_over);