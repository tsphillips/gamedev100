/*
Copyright (c)2014 Thomas S. Phillips..
For non-commercial use only.

Thomas S. Phillips



Comments are interlaced throughout the code with references
to the accompanying modules and lessons.
*/

/////////////////////////////////////////////////////////////////
// Module 1: Game Core
/////////////////////////////////////////////////////////////////

///////////////////////////
// Lesson 1.3 The Core Game

function game_core() {
    update();  // check the rules
    draw();    // draw the game on the screen
    vfx();     // display visual effects
    sfx();     // play sound effects
} // game_core()

// Call the game core every 80ms (i.e., every 0.08 seconds)
setInterval(game_core, 80);

/////////////////////////////////////////////////////////////////
// Module 2: Game Design
/////////////////////////////////////////////////////////////////

// See the course for Module 2.

/////////////////////////////////////////////////////////////////
// Module 3: Game Data
/////////////////////////////////////////////////////////////////

////////////////////////////
// Lesson 3.1 Game Variables

// Utility Variables
var x, y, i;

// Game Mechanics
var level = 1;
var swaps_per_level = 18;
var score = 0;
var swaps_made = 0;
var fact_displayed = 1;
var grid_width = 6;
var grid_height = 7;
var number_of_tile_types = 20;
var tile_types_per_level = 6;

// Graphics Parameters
var tile_width = 75;
var tile_height = 75;
var grid_offset_x = 324;
var grid_offset_y = 36;

var fact_width = 242;
var fact_height = 279;
var fact_offset_x = 31;
var fact_offset_y = 279;

// Triggers
var trigger_click_sfx = false;
var trigger_clear_sfx = false;
var trigger_bonus_sfx = false;

//////////////////////////////
// Lesson 3.2 Input and Output

// Input
var mouse_x; // where is the mouse on the canvas
var mouse_y; // where is the mouse on the canvas
var tile_x; // which tile does the mouse point to
var tile_y; // which tile does the mouse point to

// Tile selection
var primary_select_x;
var primary_select_y;
var secondary_select_x;
var secondary_select_y;

// Output
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

////////////////////////
// Lesson 3.3 Game State

var mode = {
    STARTING: 0,
    RUNNING : 1,
    SELECT_ONE : 2,
    SELECT_TWO : 3,
    GAME_OVER : 4
};
// No scoring while game is starting.
var game_state = mode.STARTING;

////////////////////////
// Lesson 3.4 Game Board

var tiles = [];
for (var i=0; i<grid_width; i++) {
    tiles[i] = new Array(grid_height);
} // for i

var min_tile;
var max_tile;

function random_tile() {
    var tile;
    min_tile = ((level - 1) % number_of_tile_types) + 1;
    max_tile = min_tile + (tile_types_per_level - 1);
    tile = Math.floor(Math.random() * (max_tile - min_tile + 1)) + min_tile;
    if (tile > number_of_tile_types) {
        tile = tile - number_of_tile_types;
    } // if
    return tile;
} // random_tile()

function scramble_tiles() {
    for (x=0; x<grid_width; x++) {
        for (y=0; y<grid_height; y++) {
            tiles[x][y] = random_tile();
        } // for y
    }  // for x
} // scramble_tiles()
scramble_tiles();

///////////////////////
// Lesson 3.5 Debugging
var possible_swaps_h = 0;
var possible_swaps_v = 0;

/////////////////////////////////////////////////////////////////
// Module 4: Display
/////////////////////////////////////////////////////////////////

////////////////////////////
// Lesson 4.1 Loading Images

var background_img = new Image(800, 600);
background_img.src = 'media/background.png';

var framing_img = new Image(800, 600);
framing_img.src = 'media/framing.png';

var tile_img = [];
for (i = 0; i <= number_of_tile_types; i++) {
    tile_img[i] = new Image(tile_width, tile_height);
    tile_img[i].src = "media/tile" + i + ".png";
} // for i

var message_img = new Image(763,600);
message_img.src = 'media/tile0.png';

///////////////////////////////
// Lesson 4.2 Drawing in Layers

function draw() {
    draw_background();
    draw_framing();
    draw_tiles();
} // draw()

////////////////////////////////////
// Lesson 4.3 Background and Framing

// Background
function draw_background() {
    context.drawImage(background_img, 0, 0);
} // draw_background()

// Framing
function draw_framing() {
    context.drawImage(framing_img, 0, 0);
} // draw_frame()

//////////////////////////////////
// Lesson 4.4 Draw a Grid of Tiles

function draw_tiles() {
    for (x = 0; x < grid_width; x++) {
        for (y = 0; y < grid_height; y++) {
            context.drawImage(tile_img[tiles[x][y]],
                              grid_offset_x + (x * tile_width),
                              grid_offset_y + (y * tile_height));
        } // for y
    } // for x
} // draw_tiles()

// TODO - move to VFX
// 4.x Educational Fact
function draw_fact() {
    // noop
} // draw_fact()

// TODO - move to VFX
// 4.x Special Messages
function draw_message() {
    x = (canvas.width / 2) - (message_img.width / 2);
    y = (canvas.height / 2) - (message_img.height / 2);
    if (false) {
        context.drawImage(message_img, x, y);
    } // if
} // draw_message()

/////////////////////////////////////////////////////////////////
// Module 5: Input
/////////////////////////////////////////////////////////////////

//////////////////////////////////
// Lesson 5.1 Tracking Mouse Movement

canvas.onmousemove = function(event) {
    mouse_x = event.clientX - canvas.offsetLeft;
    mouse_y = event.clientY - canvas.offsetTop;
    tile_x = Math.floor((mouse_x - grid_offset_x) / tile_width);
    tile_y = Math.floor((mouse_y - grid_offset_y) / tile_height);
}; // onmousemove()

////////////////////////////
// Lesson 5.2 Clicking Tiles

canvas.onclick = function() {
    if (tile_x >= 0 && tile_x < grid_width &&
        tile_y >= 0 && tile_y < grid_height) {
        switch (game_state) {
            case mode.STARTING:
            case mode.RUNNING:
                primary_select_x = tile_x;
                primary_select_y = tile_y;
                game_state = mode.SELECT_ONE;
                break;
            case mode.SELECT_ONE:
                secondary_select_x = tile_x;
                secondary_select_y = tile_y;
                game_state = mode.SELECT_TWO;
                break;
            default:
                break;
        } // switch
    } // if
    
    if (game_state == mode.GAME_OVER) {
        score = 0;
        level = 1;
        swaps_made = 0;
        scramble_tiles();
        game_state = mode.STARTING;
    } // if
}; // onclick()
    
/////////////////////////////////////////////////////////////////
// Module 6: Rules of the Game
/////////////////////////////////////////////////////////////////

////////////////////////
// Lesson 6.1 Main Rules

function update() {
    replace_tiles();
    falling_tiles();
    clear_tiles();
    swap_tiles();
    count_possible_swaps();
} // update()

/////////////////////////////
// Lesson 6.2 Replacing Tiles

// Replace tiles at the top
function replace_tiles() {
    var created_tile = false;
    for (x = 0; x < grid_width; x++) {
        if (tiles[x][0] == 0) {
            tiles[x][0] = random_tile();
            created_tile = true;
        } // if
    } // for x
    if (created_tile == true) {
        check_new_level();
    } // if
} // replace_tiles()

// Check for next level
function check_new_level() {
    if (swaps_made > swaps_per_level) {
        level++;
        swaps_made = 0;
        scramble_tiles();
    } // if
} // check_new_level()

///////////////////////////
// Lesson 6.3 Falling Tiles

function falling_tiles() {
    for (y = 1; y < grid_height; y++) {
        for (x = 0; x < grid_width; x++) {
            if (tiles[x][y] == 0) {
                tiles[x][y] = tiles[x][y-1];
                tiles[x][y-1] = 0;
                trigger_click_sfx = true;
            } // if
        } // for x
    } // for y
} // falling_tiles()

//////////////////////////////
// Lesson 6.4 Clear 3-in-a-Row

function clear_tiles() {
    // Check for horizontal 3-in-a-row
    for (y = 0; y <  grid_height; y++) {
        for (x = 2; x < grid_width; x++) {
            if (tiles[x][y] == tiles[x-1][y] &&
                tiles[x][y] == tiles[x-2][y]) {
                // Found 3 in a row!
                // Clear any extra tiles in the row that match
                for (i = x + 1; i < grid_width; i++) {
                    if (tiles[i][y] == tiles[x][y]) {
                        tiles[i][y] = 0;
                        if (game_state == mode.RUNNING) {
                            score = score + 2000;
                            trigger_bonus_sfx = true;
                        } // if
                    } else {
                        // stop checking if it did not match
                        break;
                    } // if-else
                } // for i
                // Clear the 3 . . .
                tiles[x][y] = 0;
                tiles[x-1][y] = 0;
                tiles[x-2][y] = 0;
                if (game_state == mode.RUNNING) {
                    score = score + 500;
                    trigger_clear_sfx = true;
                } // if
            } // if match-3
        } // for x
    } // for y

    // Check for vertical 3-in-a-row
    for (x = 0; x <  grid_width; x++) {
        for (y = 2; y < grid_height; y++) {
            if (tiles[x][y] == tiles[x][y-1] &&
                tiles[x][y] == tiles[x][y-2]) {
                // Found 3 in a row!
                // Clear any extra tiles in the column that match
                for (i = y + 1; i < grid_height; i++) {
                    if (tiles[x][i] == tiles[x][y]) {
                        tiles[x][i] = 0;
                        if (game_state == mode.RUNNING) {
                            score = score + 2000;
                            trigger_bonus_sfx = true;
                        } // if
                    } else {
                        // stop checking if it did not match
                        break;
                    } // if-else
                } // for i
                // Clear the 3 . . .
                tiles[x][y] = 0;
                tiles[x][y-1] = 0;
                tiles[x][y-2] = 0;
                if (game_state == mode.RUNNING) {
                    score = score + 500;
                    trigger_clear_sfx = true;
                } // if
            } // if match-3
        } // for y
    } // for x

} // clear_tiles()

////////////////////////////
// Lesson 6.5 Swapping Tiles

function swap_tiles() {
    var match_found = false;
    if (game_state == mode.SELECT_TWO) {
        
        if (((Math.abs(primary_select_x - secondary_select_x) < 2) &&
             (primary_select_y == secondary_select_y)) ||
            ((Math.abs(primary_select_y - secondary_select_y) < 2) &&
             (primary_select_x == secondary_select_x))) {
                 
            var temp;
            temp = tiles[primary_select_x][primary_select_y];
            tiles[primary_select_x][primary_select_y] =
                tiles[secondary_select_x][secondary_select_y];
            tiles[secondary_select_x][secondary_select_y] = temp;
            
            // Check for horizontal 3-in-a-row        
            for (y = 0; y <  grid_height; y++) {
                for (x = 2; x < grid_width; x++) {
                    if (tiles[x][y] == tiles[x-1][y] &&
                        tiles[x][y] == tiles[x-2][y]) {
                        // Found 3 in a row!
                        match_found = true;
                        fact_displayed = tiles[x][y];
                    } // if match
                } // for y
            } // for x
            // Check for vertical 3-in-a-row
            for (x = 0; x <  grid_width; x++) {
                for (y = 2; y < grid_height; y++) {
                    if (tiles[x][y] == tiles[x][y-1] &&
                        tiles[x][y] == tiles[x][y-2]) {
                        // Found 3 in a row!
                        match_found = true;
                        fact_displayed = tiles[x][y];
                    } // if match
                } // for y
            } // for x

            if (match_found == false) {
                // Swap them back
                temp = tiles[primary_select_x][primary_select_y];
                tiles[primary_select_x][primary_select_y] =
                    tiles[secondary_select_x][secondary_select_y];
                tiles[secondary_select_x][secondary_select_y] = temp;
            } else {
                swaps_made++;
            } // if-else
        } // if
        game_state = mode.RUNNING; // clear selection
    } // if
} // swap_tiles()

////////////////////////
// Lesson 6.6 Game Over?

// Count the number of swaps that could be made
function count_possible_swaps() {
    possible_swaps_h = 0;
    possible_swaps_v = 0;
    
    // Hold a scantron score card over the grid, one tile at a time.
    
    // count possible horizontal swaps
    // Inline swaps
    for (y = 0; y < grid_height; y++) {
        for (x = 3; x < grid_width; x++) {
            if (tiles[x][y] == tiles[x-1][y] &&
                tiles[x][y] == tiles[x-3][y]) {
                    possible_swaps_h++;
                } // if X-XX
            if (tiles[x][y] == tiles[x-2][y] &&
                tiles[x][y] == tiles[x-3][y]) {
                    possible_swaps_h++;
                } // if XX-X
        } // for x
    } // for y
    // Out-of-line swaps
    for (y = 2; y < grid_height; y++) {
        for (x = 1; x < grid_width; x++) {
            // case 1
            if (tiles[x][y] == tiles[x][y-1] &&
                 tiles[x][y] == tiles[x-1][y-2]) {
                possible_swaps_h++;
            } // if
            // case 2
            if (tiles[x][y] == tiles[x-1][y-1] &&
                 tiles[x][y] == tiles[x][y-2]) {
                possible_swaps_h++;
            } // if
            // case 3
            if (tiles[x][y] == tiles[x-1][y-1] &&
                 tiles[x][y] == tiles[x-1][y-2]) {
                possible_swaps_h++;
            } // if
            // case 4
            if (tiles[x-1][y] == tiles[x][y-1] &&
                 tiles[x-1][y] == tiles[x-1][y-2]) {
                possible_swaps_h++;
            } // if
            // case 5
            if (tiles[x-1][y] == tiles[x-1][y-1] &&
                 tiles[x-1][y] == tiles[x][y-2]) {
                possible_swaps_h++;
            } // if
            // case 6
            if (tiles[x-1][y] == tiles[x][y-1] &&
                 tiles[x-1][y] == tiles[x][y-2]) {
                possible_swaps_h++;
            } // if
        } // for x
    } // for y

    // count possible vertical swaps
    // Inline swaps
    for (x = 0; x < grid_width; x++) {
        for (y = 3; y < grid_height; y++) {
            if (tiles[x][y] == tiles[x][y-1] &&
                tiles[x][y] == tiles[x][y-3]) {
                    possible_swaps_v++;
                } // if
            if (tiles[x][y] == tiles[x][y-2] &&
                tiles[x][y] == tiles[x][y-3]) {
                    possible_swaps_v++;
                } // if
        } // for y
    } // for x
    // Out-of-line swaps
    for (x = 2; x < grid_width; x++) {
        for (y = 1; y < grid_height; y++) {
            // case 1
            if (tiles[x][y] == tiles[x-1][y] &&
                 tiles[x][y] == tiles[x-2][y-1]) {
                possible_swaps_v++;
            } // if
            // case 2
            if (tiles[x][y] == tiles[x-1][y-1] &&
                 tiles[x][y] == tiles[x-2][y]) {
                possible_swaps_v++;
            } // if
            // case 3
            if (tiles[x][y] == tiles[x-1][y-1] &&
                 tiles[x][y] == tiles[x-2][y-1]) {
                possible_swaps_v++;
            } // if
            // case 4
            if (tiles[x][y-1] == tiles[x-1][y] &&
                 tiles[x][y-1] == tiles[x-2][y-1]) {
                possible_swaps_v++;
            } // if
            // case 5
            if (tiles[x][y-1] == tiles[x-1][y-1] &&
                 tiles[x][y-1] == tiles[x-2][y]) {
                possible_swaps_v++;
            } // if
            // case 6
            if (tiles[x][y-1] == tiles[x-1][y] &&
                 tiles[x][y-1] == tiles[x-2][y]) {
                possible_swaps_v++;
            } // if
        } // for x
    } // for y

    if (possible_swaps_h == 0 && possible_swaps_v == 0) {
        game_state = mode.GAME_OVER;
    } // if
} // count_possible_swaps()

/////////////////////////////////////////////////////////////////
// Module 7: Visual Special Effects
/////////////////////////////////////////////////////////////////

/////////////////////////////////
// Lesson 7.1 Loading and Looping

// Visual effects images
var highlite_img = new Image(75, 75);
highlite_img.src = "media/highlite.png";

var progress_img = new Image(1, 38);
progress_img.src = "media/progress.png";

var gameover_img = new Image(481, 322);
gameover_img.src = "media/gameover.png";

// Fact images
var fact_img = [];
for (i = 1; i <= number_of_tile_types; i++) {
    fact_img[i] = new Image(fact_width, fact_height);
    fact_img[i].src = "media/fact" + i + ".png";
} // for i


// Set font information
context.font="20px monospace";
context.fillStyle = "#fff";
context.textAlign = "end";

// Main visual effects loop
function vfx() {
    selection_fx();
    smooth_tile_drop_fx();
    draw_score();
    draw_fact();
    draw_game_over();
} // vfx()

//////////////////////////////
// Lesson 7.2 Selection Effect

function selection_fx() {
    if (game_state == mode.SELECT_ONE || game_state == mode.SELECT_TWO) {
            context.drawImage(highlite_img,
                              grid_offset_x + (primary_select_x * tile_width),
                              grid_offset_y + (primary_select_y * tile_height));
    } // if
    if (game_state == mode.SELECT_TWO) {
            context.drawImage(highlite_img,
                              grid_offset_x + (secondary_select_x * tile_width),
                              grid_offset_y + (secondary_select_y * tile_height));
    } // if
} // selection_fx()

///////////////////////////////////
// Lesson 7.3 Smooth Dropping Tiles

function smooth_tile_drop_fx() {
    for (y = 1; y < grid_height; y++) {
        for (x = 0; x < grid_width; x++) {
            if (tiles[x][y] == 0) {
                context.drawImage(tile_img[tiles[x][y-1]],
                                  grid_offset_x + (x * tile_width),
                                  grid_offset_y + ((y-1) * tile_height),
                                  tile_width,
                                  tile_height * 1.25
                                  );
            } // if
        } // for x
    } // for y
} // smooth_tile_drop_fx()

///////////////////////////////
// Lesson 7.4 What's the score?

function draw_score() {
    // Level Display:  40x135  -  85x135
    // Progress Bar:  96x110  -   273x110
    //                96x148  -   273x148
    // Score: 40x200 - 265x200
    context.fillText(level, 85, 135);
    context.fillText(score, 265, 215);
    var x_start = 96;
    var x_end = 273;
    var progress_width = Math.floor((swaps_made / (swaps_per_level+1)) * (x_end - x_start));
    context.drawImage(progress_img, 96, 110, progress_width, 38);
    /*
    context.beginPath();
    context.rect(96, 110, progress_width, 37);
    context.fill();
    */
} // draw_score()

////////////////////////////
// Lesson 7.5 Just the Facts

function draw_fact() {
    context.drawImage(fact_img[fact_displayed], fact_offset_x, fact_offset_y);
} // draw_fact()

function draw_game_over() {
    if (game_state == mode.GAME_OVER) {
        context.drawImage(gameover_img,
                          (canvas.width / 2) - (gameover_img.width / 2),
                          (canvas.height / 2) - (gameover_img.height / 2));
    } // if
} // draw_game_over()

function draw_debug() {
    var dx = 265;
    var dy = 295;
    context.fillText("  DEBUG", dx, dy);
    context.fillText("--------", dx, dy += 20);
    context.fillText("h_swaps: " + possible_swaps_h, dx, dy += 20);
    context.fillText("v_swaps: " + possible_swaps_v, dx, dy += 20);
    context.fillText("  swaps: " + swaps_made, dx, dy += 20);
    context.fillText("  score: " + score, dx, dy += 20);
    context.fillText("  level: " + level, dx, dy += 20);
} // draw_debug()

/////////////////////////////////////////////////////////////////
// Module 8: Sound Effects
/////////////////////////////////////////////////////////////////

////////////////////////////////////
// Lesson 8.1 Detect Supported Audio

var sfx_extension = "";
var test_sfx = new Audio();
if (test_sfx.canPlayType("audio/ogg")) {
    sfx_extension = "ogg";
} else if (test_sfx.canPlayType("audio/mpeg")) {
    sfx_extension = "mp3";
} // if-else

////////////////////////
// Lesson 8.2 Load Audio

var click_sfx = new Audio("media/click." + sfx_extension);
var clear_sfx = new Audio("media/clear." + sfx_extension);
var bonus_sfx = new Audio("media/bonus." + sfx_extension);

//////////////////////////////////
// Lesson 8.3 Play Triggered Audio

function sfx() {
    if (sfx_extension != "") {
        if (trigger_click_sfx == true) {
            click_sfx.play();
            trigger_click_sfx = false;
        } // if
        if (trigger_clear_sfx == true) {
            clear_sfx.play();
            trigger_clear_sfx = false;
        } // if
        if (trigger_bonus_sfx == true) {
            bonus_sfx.play();
            trigger_bonus_sfx = false;
        } // if
    } // if
} // sfx()

