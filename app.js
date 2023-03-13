const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

conventObjectArray = (myArray) => {
  return {
    stateId: myArray.state_id,
    stateName: myArray.state_name,
    population: myArray.population,
  };
};

conventObjectArrayDistrict = (myArray) => {
  return {
    districtId: myArray.district_id,
    districtName: myArray.district_name,
    stateId: myArray.state_id,
    cases: myArray.cases,
    cured: myArray.cured,
    active: myArray.active,
    deaths: myArray.deaths,
  };
};
//1
app.get("/states/", async (request, response) => {
  const getStatesDetails = `
    SELECT 
    *
    FROM 
    state;`;
  const stateList = await db.all(getStatesDetails);
  response.send(stateList.map((eachItem) => conventObjectArray(eachItem)));
});
//2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT 
    *
    FROM 
    state
    WHERE state_id = ${stateId};`;
  const stateList = await db.get(getStateQuery);
  response.send(conventObjectArray(stateList));
});
//3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  //const {districtId} = request.params;
  const getPostQuery = `
  INSERT INTO 
    district(
  district_name,
  state_id,
  cases,
  cured,
  active,
  deaths) 
  VALUES('${districtName}',
  ${stateId},
  ${cases},
  ${cured},
  ${active},
  ${deaths});`;
  const district = await db.run(getPostQuery);
  const array = district.lastID;
  response.send("District Successfully Added");
});
//4
app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const { districtId } = request.params;
  const getPostQuery = `
  UPDATE
    district
  SET 
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE district_id =${districtId};`;
  const district = await db.run(getPostQuery);
  response.send("District Details Updated");
});
//5
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const {
    districtName = "sudheer",
    stateId = 2,
    cases = 111,
    cured = 222,
    active = 333,
    deaths = 555,
  } = request.body;

  const getPostQuery = `
  SELECT 
  *
  FROM 
   district
  WHERE district_id =${districtId};`;
  const district = await db.get(getPostQuery);
  response.send(conventObjectArrayDistrict(district));
});
//6
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getPostQuery = `
  DELETE
  FROM 
   district
  WHERE district_id =${districtId};`;
  const district = await db.run(getPostQuery);
  response.send("District Removed");
});
//7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatsQuery = `
    SELECT
      SUM(case),
      SUM(cured),
      SUM(active),
      SUM(deaths)
    FROM
      district
    WHERE
      state_id=${stateId};`;
  const stats = await database.get(getStateStatsQuery);
  response.send({
    totalCases: stats["SUM(case)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});
//8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT 
    state_name
    FROM
    district NATURAL JOIN state
    WHERE district_id = ${districtId};`;
  const array = await db.get(getDistrictQuery);
  response.send({ stateName: array.state_name });
});

module.exports = app;
