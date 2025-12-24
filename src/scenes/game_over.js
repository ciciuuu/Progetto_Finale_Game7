function preload_game_over(s) {

}

function create_game_over(s) {

    // Questa scena di game over contiene solamente
    // il testo centrato.

    PP.shapes.text_styled_add(s,
        PP.game.config.canvas_width / 2,
        PP.game.config.canvas_height / 2,
        "Game Over",
        100,
        "Helvetica",
        "normal",
        "0xFFFFFF",
        null,
        0.5,
        0.5);

}

function update_game_over(s) {
    if (PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE)) {
        PP.scenes.start("base");
    }
}

function destroy_game_over(s) {

}

PP.scenes.add("game_over", preload_game_over, create_game_over, update_game_over, destroy_game_over);