const CIRCLE_RADIUS = 5;
const JOINT_LENGTH = 100;
const KINEMATIC_ITERATIONS = 200;

/**
 * Constrain the arm points according to the first point
 * */
function constrain_left(arms) {
    for (let i = 1; i < arms.length; ++i) {
        let dx = arms[i][0] - arms[i-1][0];
        let dy = arms[i][1] - arms[i-1][1];

        const len = Math.hypot(dx, dy);

        dx *= JOINT_LENGTH / len;
        dy *= JOINT_LENGTH / len;

        arms[i][0] = arms[i-1][0] + dx;
        arms[i][1] = arms[i-1][1] + dy;
    }
}

/**
 * Constrain the arm points according to the last point
 * */
function constrain_right(arms) {
    for (let i = arms.length - 2; i >= 0; --i) {
        let dx = arms[i][0] - arms[i+1][0];
        let dy = arms[i][1] - arms[i+1][1];

        const len = Math.hypot(dx, dy);

        dx *= JOINT_LENGTH / len;
        dy *= JOINT_LENGTH / len;

        arms[i][0] = arms[i+1][0] + dx;
        arms[i][1] = arms[i+1][1] + dy;
    }
}

/**
 * Letting the first point in arms be the anchor, 
 * try to reach for the goal
 */
function inverse_kinematics(arms, goal) {
    const [anchor_x, anchor_y] = arms[0];
    const [goal_x, goal_y] = goal;
    for (let it = 0; it < KINEMATIC_ITERATIONS; ++it) {
        arms[arms.length - 1] = [goal_x, goal_y];
        constrain_right(arms);
        arms[0] = [anchor_x, anchor_y];
        constrain_left(arms);
    }
}

function draw_circle(ctx, x, y) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();

    ctx.arc(x, y, CIRCLE_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
}

function draw_arms(ctx, arms) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "#fff";
    for (let i = 0; i < arms.length; ++i) {
        const [x, y] = arms[i];
        if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(arms[i-1][0], arms[i-1][1]);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        draw_circle(ctx, x, y);
    }
}

function spawn_arms(ctx, n) {
    let arms = []

    for (let i = 0; i < n; ++i) {
        arms.push([i, i]);
    }
    arms[0] = [ctx.canvas.width / 2, ctx.canvas.height / 2];
    constrain_left(arms);
    return arms;
}

function main() {
    const app = document.getElementById("app");
    const ctx = app.getContext("2d");

    const arms = spawn_arms(ctx, 4);

    document.addEventListener("mousemove", (evt) => {
        inverse_kinematics(arms, [evt.offsetX, evt.offsetY]);
        draw_arms(ctx, arms);
    });


    draw_arms(ctx, arms);
}

main();
