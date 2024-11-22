const models = require("./server/models");

const scripts = {
    syncSchedules: () => {
        models['schedules'].findAll().then(async (rows) => {
            for (const row of rows) {
                const job = await models['jobs'].findByPk(row.job_id, {
                    attributes: ['owner_id']
                });

                if (!job) {
                    await row.destroy();
                } else {
                    await row.update({
                        hirer_id: job.owner_id
                    });
                }
            }

            process.exit();
        }).catch(err => console.error(err) || process.exit());
    }
};

let scriptCalled = process.argv[2];
scriptCalled && scripts[scriptCalled]();
