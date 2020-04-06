const express = require("express");
const connection = require("../../custom_lib/db_connection");
var qs = require("querystring");

const router = express.Router();

router.get("/", function (req, res, next) {
    res.send("Hello teamSplit World");
});

// Create TeamSplit
router.post("/create", function (req, res, next) {
    var teamSplitData = req.body;

    console.log('Create TeamSplit', teamSplitData);
    connection.query("INSERT INTO teamSplit SET ?", teamSplitData, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

// Read TeamSplit
router.get("/list", function (req, res, next) {
    connection.query("SELECT * from teamSplit", function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//Read selected TeamSplit
router.get("/getinfo/:id", function (req, res, next) {
    let teamSplit_id = req.params.id;
    connection.query("SELECT * from teamSplit where id = ?", teamSplit_id, function (err, results, fields) {
        if (err) next(err);
        res.send(results);
    });
});

//  Update TeamSplit with id
router.put("/update", function (req, res, next) {
    let teamSplit_id = req.body.id;
    let teamSplit = req.body.teamSplit;

    console.log(req.body);
    if (!teamSplit_id || !teamSplit) {
        return res.status(400).send({
            err: teamSplit,
            message: "Please provide teamSplit and teamSplit_id"
        });
    }

    connection.query(
        "UPDATE teamSplit SET ? WHERE id = ?",
        [teamSplit, teamSplit_id],
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

// Delete TeamSplit
router.delete("/delete", function (req, res, next) {
    console.log('Delete TeamSplit', req.body);
    connection.query(
        `DELETE FROM teamSplit WHERE id= ${req.body.teamSplit_id}`,
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

router.post("/bulkCreateOrUpdate", async function (req, res, next) {
    let teamSplit_list = req.params.team_split_data
    let team_split_index = req.params.team_split_index
    let schedule_Id = req.params.selected_schedule_id
    
    try{
        await connection.beginTransaction();
        const queryPromises = []
        for (let i in teamSplit_list){
            let member_info = teamSplit_list[i];
            let member_id = member_info.id;
            let team_number = member_info.teamNumber;
            queryPromises.push(connection.query(`insert into teamSplit set ? on duplicate key update team_number=${team_number}`, 
                                    {
                                        "team_split_index": team_split_index, 
                                        "schedule_id": schedule_Id, 
                                        "member_id": member_id, 
                                        "team_number": team_number
                                    }))
        }
        await Promise.all(queryPromises)
        await connection.commit();
        res.send(200, "success");
    } catch (err) {
        console.log(err)
        connection.rollback()
        next(err)        
    } 

});


module.exports = router;