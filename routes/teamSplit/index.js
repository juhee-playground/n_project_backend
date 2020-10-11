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


// router.post("/listWithDate", function (req, res, next) {
//     console.log(req.body);
//     let date = req.body.schedule_date;
//     // where date_format(schedule.date, '%Y%m') = ${date}
//     connection.query("SELECT * from teamSplit", function (err, results, fields) {
//         if (err) next(err);
//         res.send(results);
//     });
// });

//Read selected TeamSplit
router.get("/getSplitTeamListWithSchedule/:id", function (req, res, next) {
    let schedule_id = req.params.id;
    let query = "SELECT teamSplit.id, teamSplit.team_split_index, teamSplit.schedule_id, teamSplit.member_id, teamSplit.team_number, \
                        member.name, member.uniform_number \
                        from teamSplit join member \
                        where teamSplit.schedule_id = ? and teamSplit.member_id = member.id;"
    connection.query(query, schedule_id, function (err, results, fields) {
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
        `DELETE FROM teamSplit WHERE id= ?`, req.body.teamSplit_id,
        function (err, results, fields) {
            if (err) next(err);
            res.send(results);
        }
    );
});

router.post("/bulkCreateOrUpdate", async function (req, res, next) {
    let teamSplit_list = req.body.team_split_data
    let team_split_index = req.body.team_split_index
    let schedule_Id = req.body.selected_schedule_id
    console.log(schedule_Id, team_split_index, teamSplit_list)

    try{
        connection.getConnection(async (err, transaction_conn) =>{
            try{
                if (err) {
                    con.release();
                    throw err;
                }
                await transaction_conn.beginTransaction(); // transaction 시작
            
                let query_result = null
                for (let i in teamSplit_list){
                    let member_info = teamSplit_list[i];
                    let member_id = member_info.id;
                    let team_number = member_info.teamNumber;
                    let [rows] = await transaction_conn.query(`insert into teamSplit set ? on duplicate key update 
                                                                 team_split_index = ?, schedule_id=?, team_number=?`, 
                                            [
                                               team_split_index, 
                                               schedule_Id, 
                                                team_number
                                            ])
                }
                await transaction_conn.commit()
                res.send(200, "Success");
            }catch (err){
                transaction_conn.rollback()
                throw err
            }finally{
                transaction_conn.release() // pool에 connection 반납
            }
        })
    } catch (err) {
        console.log(err)
        next(err)        
    }
});


module.exports = router;