define([], function() {
    return class ModelDiff {
        constructor(frameInit) {
            this.frameOld = {};
            this.frameNew = frameInit;
        }

        refresh(frameNew) {
            this.frameOld = this.frameNew;
            this.frameNew = frameNew;
        }

        // Get entity diff
        diff() {
            let res = {
                toAdd: [],
                toRemove: [],
                toUpdate: [],
            };
            Object.keys(this.frameNew).forEach((key) => {
                !this.frameOld[key] && res.toAdd.push(this.frameNew[key]);
                this.frameOld[key]  && res.toUpdate.push(this.frameNew[key]);
            });
            Object.keys(this.frameOld).forEach((key) => {
                !this.frameNew[key] && res.toRemove.push(this.frameOld[key]);
            });
            return res;
        }

        // Get entity diff
        valDiff(toUpdate) {
            let res = {};
            toUpdate.forEach((entity) => {
                res[entity.id] = {};
                Object.keys(entity).forEach((key) => {
                    res[entity.id][key] = this.frameNew[entity.id][key] - this.frameOld[entity.id][key];
                });
            });
            return res;
        }
    }
});
