const Globals = require("../services/globals");
const Objectives = require("./Objective");
class BotService {
    constructor(probe) {
        this.me = probe;
        this.objectives = [];
        this.doing = null;
    }


    process() {
        if (this.doing && this.doing.done) {
            this.doing = null;
        }
        this.trigger();
        for (let i = 0; i < this.objectives.length; i++) {
            let objective = this.objectives[i];
            if (!this.doing || objective.priority > this.doing.priority) {
                this.doing = objective;
                break;
            }
        }
        this.objectives = [];
        this.doing && this.doing.pursue();
        !this.doing && this.wonder();
    }

    // Activate or deactivate objectives
    trigger() {
        let obj = Objectives.AttackTrigger(this.me);
        obj && this.objectives.push(obj);
    }

    wonder() {
        if (Math.random() > 0.9) {
            let randX = Math.random() - 0.5;
            let randY = Math.random() - 0.5;
            this.me.move({x: randX, y: randY});
        }
    }



}

module.exports = BotService;