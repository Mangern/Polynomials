const app = document.getElementById("app");
const ctx = app.getContext("2d");

const WIDTH = ctx.canvas.width;
const HEIGHT = ctx.canvas.height;
const POINT_RADIUS = 5;

var X_MIN = -5;
var X_MAX = 5;
var Y_MIN = -2;
var Y_MAX = 5;


let current_point = null;
let move_x = null;
let move_y = null;
let hover_last = false;

const points = [
    [ 0, 1],
    [ 1, -1],
    [-1, 2]
];

function clear_screen() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function arange(start, stop, step) {
    const ret = [];
    while (start < stop) {
        ret.push(start);
        start += step;
    }
    return ret;
}

function translate(x, y) {
    if (x instanceof Array) {
        y = x[1];
        x = x[0];
    }
    return [WIDTH * (x - X_MIN) / (X_MAX - X_MIN),
            HEIGHT  - HEIGHT * (y - Y_MIN) / (Y_MAX - Y_MIN)
    ];
}

function inverse_translate(x, y) {
    if (x instanceof Array) {
        y = x[1];
        x = x[0];
    }

    return [
        X_MIN + x * (X_MAX - X_MIN) / WIDTH,
        Y_MIN + (HEIGHT - y) * (Y_MAX - Y_MIN) / HEIGHT
    ];
}

function plot(func) {
    const STEP = 0.001;

    let x_vals = arange(X_MIN, X_MAX, STEP);
    let y_vals = x_vals.map(func);

    const screen_space = [];

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    for (let i = 0; i < x_vals.length; ++i) {
        const x = x_vals[i];
        const y = y_vals[i];
        const [s_x, s_y] = translate(x, y);

        if (i == 0)ctx.moveTo(s_x, s_y);
        else ctx.lineTo(s_x, s_y);

    }
    ctx.stroke();

    ctx.lineWidth = 0.2;

    // Origo
    const [o_x, o_y] = translate(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, o_y);
    ctx.lineTo(WIDTH, o_y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(o_x, 0);
    ctx.lineTo(o_x, HEIGHT);
    ctx.stroke();
}

function plot_points(points) {
    ctx.fillStyle = "#fff";
    for (const [x, y] of points.map(translate)) {
        let draw_radius = POINT_RADIUS;

        if (Math.hypot(x - move_x, y - move_y) <= POINT_RADIUS) {
            draw_radius += 2;
        }

        ctx.beginPath();
        ctx.arc(x, y, draw_radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function interpolate_polynomial(points) {
    const n = points.length;
    points = Array.from(points).sort();
    points = points.filter((pt, idx) => idx == 0 || pt[0] != points[idx-1][0]);
    const xs = points.map(pt => pt[0]);
    const ys = points.map(pt => pt[1]);

    const coeffs = [ys[0]];

    for (let i = 1; i < n; ++i) {
        for (let j = 1; j < n - i + 1; ++j) {
            ys[j-1] = (ys[j] - ys[j-1]) / (xs[i+j-1] - xs[j-1]);
        }
        coeffs.push(ys[0]);
    }

    console.log(coeffs);

    const f = (x) => {
        let res = 0;
        for (let i = 0; i < coeffs.length; ++i) {
            let term = coeffs[i];
            for (let j = 0; j < i; ++j) {
                term *= (x - xs[j]);
            }
            res += term;
        }
        return res;
    };
    return f;
}



function draw() {
    clear_screen();
    const func = interpolate_polynomial(points);

    plot(func);
    plot_points(points);
}

function add_point(x, y) {
    points.push([x, y]);
}

function remove_point(index) {
    points.splice(index, 1);
}

draw();


function place_current_point() {
    if (current_point === null)return;

    points[current_point] = inverse_translate(move_x, move_y);

    draw();
}

function get_hover_point(mouse_x, mouse_y) {
    for (let i = 0; i < points.length; ++i) {
        const [px, py] = translate(points[i][0], points[i][1]);
        if (Math.hypot(px - mouse_x, py - mouse_y) <= POINT_RADIUS) {
            return i;
        }
    }
    return null;
}

app.addEventListener("mousedown", (evt) => {
    if (current_point !== null)return;
    const x = evt.offsetX;
    const y = evt.offsetY;


    current_point = get_hover_point(x, y);
    if (current_point !== null) {
        move_x = x;
        move_y = y;
    }
});

app.addEventListener("mouseup", (evt) => {
    place_current_point();
    current_point = null;
});

app.addEventListener("mouseout", (evt) => {
    place_current_point();
    current_point = null;
});

app.addEventListener("mousemove", (evt) => {
    move_x = evt.offsetX;
    move_y = evt.offsetY;

    let i = get_hover_point(move_x, move_y);

    if (i !== null) {
        draw();
        hover_last = true;
    } else if (hover_last) {
        draw();
        hover_last = false;
    }

    place_current_point();
});

document.addEventListener("keypress", (evt) => {
    if (evt.key == "a") {
        add_point(0, 0);
        draw();
    }
    if (evt.key == "x") {
        const i = get_hover_point(move_x, move_y);

        if (i !== null) {
            remove_point(i);
            draw();
        }
    }
});

