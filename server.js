var debug = true;

var application_root = __dirname,
        express = require("express"),
        path = require("path"),
        mongoose = require('mongoose');

var basepath = '/api';

var app = express();
// database
mongoose.connect('mongodb://localhost/scenario');
// config
app.configure(function () {
        app.set('port', process.env.PORT || 3000);
        app.use(express.json());
        app.use(express.urlencoded());
        app.use(express.methodOverride());
        app.use(express.logger('dev'));
        app.use(app.router);
        app.use(express.static(path.join(application_root, "public")));
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// schemas
var Schema = mongoose.Schema;

var Scenario = new Schema({
        scenarioid: { type: String, required: true },
        password: String
});

var ScenarioProject = new Schema({
        projectid: { type: String, required: true },
        title: String,
        description: String,
        password: String,
        backgroundurl: String,
        canvassize: {x: Number, y: Number},
        modified: { type: Date, default: Date.now },
        phases: [ {phaseid: String, phasepos: Number} ]
});

var ScenarioPhase = new Schema({
        projectid: { type: String, required: true },
        palette: [ScenarioItem],
        randomizepalette: Boolean,
        palettestyle: String,
        paletteposition: String,
        additems: Boolean,
        paletteitemoffset: {x: Number, y: Number},
        oninit: String,
        onsubmit: String
});

var ScenarioItem = new Schema({
        projectid:  { type: String, required: true },
        scenarioid: { type: String, required: true },
        ispaletteitem: Boolean,
        frompaletteitem: String,
        text: String,
        textcentered: Boolean,
        imageurl: String,
        thumbnailurl: String,
        width: { type: Number, default: 200 },
        height: { type: Number, default: 200 },
        imagewidth: { type: Number, default: 200 },
        imageheight: { type: Number, default: 200 },
        posx: { type: Number, default: 0 },
        posy: { type: Number, default: 0 },
        posz: { type: Number, default: 0 },
        rot: { type: Number, default: 0 },
        modified: { type: Date, default: Date.now }
});

var ScenarioModel = mongoose.model('Scenario', Scenario);
var ScenarioProjectModel = mongoose.model('ScenarioProject', ScenarioProject);
var ScenarioPhaseModel = mongoose.model('ScenarioPhase', ScenarioPhase);
var ScenarioItemModel = mongoose.model('ScenarioItem', ScenarioItem);

// check for existence of the api
app.get(basepath, function (req, res) {
        res.send('Scenario API is running');
});

// list scenarioprojects
app.get(basepath + '/projects', function (req, res){
        log_call(req);
        return ScenarioProjectModel.find(function (err, scenarioprojects) {
                if (!err) {
                        //fix: do not return the passwords
                        return res.send(scenarioprojects);
                } else {
                        return console.log(err);
                }
        });
});

// create scenarioproject
app.post(basepath + '/projects', function (req, res){
        log_call(req);
        var scenarioproject = new ScenarioProjectModel({
                projectid: req.body.projectid,
                password: req.body.password,
        });
        scenarioproject.save(function (err) {
                if (!err) {
                        return console.log("created scenarioproject: " + req.body.projectid);
                } else {
                        return console.log(err);
                }
        });
        return res.send(scenarioproject);
});

// list scenarios by project id
app.get(basepath + '/projects/:projectid/scenarios', function (req, res){
        log_call(req);
       return ScenarioModel.find({'projectid' : req.params.projectid}, function (err, scenarios) {
                if (!err) {
                        return res.send(scenarios);
                } else {
                        return console.log(err);
                }
        });
});

// create scenario
app.post(basepath + '/projects/:projectid/scenarios', function (req, res){ //xxx
        log_call(req);
        var scenario = new ScenarioModel({
                projectid: req.body.projectid,
                password: req.body.password
        });
        scenario.save(function (err) {
                if (!err) {
                        return console.log("created: " + req.body.id);
                } else {
                        return console.log(err);
                }
        });
        return res.send(scenario);
});

// read scenario by :id
app.get(basepath + '/projects/:projectid/scenarios/:scenarioid', function (req, res){ //xxx
        log_call(req);
        return ScenarioModel.find({'scenarioid' : req.params.scenarioid}, function (err, scenario) {
                if (!err) {
                        //fix: return also scenario phases at the same time
                        return res.send(scenario);
                } else {
                        return console.log(err);
                }
        });
});

// list scenariophases by :projectid
app.get(basepath + '/projects/:projectid/phases', function (req, res){
        log_call(req);
        return ScenarioPhaseModel.find({'projectid' : req.params.projectid}, function (err, scenariophases) {
                if (!err) {
                        return res.send(scenariophases);
                } else {
                        return console.log(err);
                }
        });
});

// create scenariophase
app.post(basepath + '/projects/:projectid/phases', function (req, res){ //xxx
        log_call(req);
        var scenariophase = new ScenarioPhaseModel({
                projectid: req.body.projectid,
                password: req.body.password
        });
        scenariophase.save(function (err) {
                if (!err) {
                        return console.log("created: " + req.body.projectid);
                } else {
                        return console.log(err);
                }
        });
        return res.send(scenariophase);
});

// update scenario by id
app.put(basepath + '/projects/:projectid/scenarios/:scenarioid', function (req, res){ //xxx
        log_call(req);
        if (check_credentials(req.body.password, req.params.scenarioid)) {
                return ScenarioModel.find({'scenarioid' : req.params.scenarioid}, function (err, scenario) {
                        scenario.title = req.body.title !== undefined ? req.body.title : scenario.title;
                        scenario.description = req.body.description !== undefined ? req.body.description : scenario.description;
                        scenario.password = req.body.style !== undefined ? req.body.style : scenario.password;
                        scenario.modified = new Date();

                        return scenario.save(function (err) {
                                if (!err) {
                                        console.log("updated: " + req.params.scenarioid);
                                } else {
                                        console.log(err);
                                }
                                return res.send(scenario);
                        });
                });
        } else {
                res.status(401);
                return res.send({'error': 'false credentials'});
        }
});

// delete scenario by id
app.delete(basepath + '/projects/:projectid/scenarios/:scenarioid', function (req, res){ //xxx
        log_call(req);
        return res.send('not enabled');
/*
        return ProductModel.find({'id' : req.params.id}, function (err, product) {
//XXX: delete only if the correct password is used (should return error)
//              if (req.body.password == xxx)
                return product.remove(function (err) {
                        if (!err) {
                                console.log("removed");
                                return res.send('');
                        } else {
                                console.log(err);
                        }
                });
        });
*/
});

// list scenarioitems
app.get(basepath + '/projects/:projectid/scenarios/:scenarioid/items', function (req, res){ //xxx
        log_call(req);
        return ScenarioItemModel.find({'scenarioid' : req.params.scenarioid}, function (err, scenarioitems) {
                if (!err) {
                        return res.send(scenarioitems);
                } else {
                        return console.log(err);
                }
        });
});

// create scenarioitem
app.post(basepath + '/projects/:projectid/scenarios/:scenarioid/items', function (req, res){ //xxx
        log_call(req);
        return ScenarioModel.find({'scenarioid' : req.params.scenarioid}, function (err, scenario) {
                var scenarioitem = new ScenarioItemModel({
                        projectid: req.params.projectid,
                        scenarioid: req.params.scenarioid,
                        ispaletteitem: req.body.ispaletteitem,
                        frompaletteitem: req.body.frompaletteitem,
                        text: req.body.text,
                        textcentered: req.body.textcentered,
                        imageurl: req.body.imageurl,
                        thumbnailurl: req.body.thumbnailurl,
                        width: req.body.width,
                        height: req.body.height,
                        imagewidth: req.body.imagewidth,
                        imageheight: req.body.imageheight,
                        posx: req.body.posx,
                        posy: req.body.posy,
                        posz: req.body.posz,
                        rot: req.body.rot,
                });

                scenarioitem.save(function (err) {
                        if (!err) {
                                return console.log("created item to " + req.params.scenarioid);
                        } else {
                                return console.log(err);
                        }
                });
                return res.send(scenarioitem);
        });
});

// list paletteitems
app.get(basepath + '/projects/:projectid/scenarios/:scenarioid/paletteitems', function (req, res){ //xxx
        log_call(req);
        return ScenarioItemModel.find({'projectid' : req.params.projectid, 'ispaletteitem' : true}, function (err, scenarioitems) {
                if (!err) {
                        return res.send(scenarioitems);
                } else {
                        return console.log(err);
                }
        });
});


// read scenarioitem by :id
app.get(basepath + '/projects/:projectid/scenarios/:scenarioid/items/:itemid', function (req, res){ //xxx
        log_call(req);
        return ScenarioItemModel.findById(req.params.itemid, function (err, scenarioitem) {
                if (!err) {
                        return res.send(scenarioitem);
                } else {
                        return console.log(err);
                }
        });
});

// update scenarioitem by id
app.put(basepath + '/projects/:projectid/scenarios/:scenarioid/items/:itemid', function (req, res){
        log_call(req);
        return ScenarioModel.find({'scenarioid' : req.params.scenarioid}, function (err, scenario) {
                return ScenarioItemModel.findById(req.params.itemid, function (err, scenarioitem) {
                        scenarioitem.projectid = req.params.projectid;
                        if (req.body.text !== undefined && req.body.text.indexOf('<') !== -1 && req.body.text.indexOf('>') !== -1) {
                                scenarioitem.text = req.body.text;
                        }
                        scenarioitem.scenarioid = req.params.scenarioid,
                        scenarioitem.imageurl = req.body.imageurl !== undefined ? req.body.imageurl : scenarioitem.imageurl;
                        scenarioitem.thumbnailurl = req.body.thumbnailurl !== undefined ? req.body.thumbnailurl : scenarioitem.thumbnailurl,
                        scenarioitem.text = req.body.text !== undefined ? req.body.text : scenarioitem.text;
                        scenarioitem.width = req.body.width !== undefined ? req.body.width : scenarioitem.width;
                        scenarioitem.height = req.body.height !== undefined ? req.body.height : scenarioitem.height;
                        scenarioitem.imagewidth = req.body.imagewidth !== undefined ? req.body.imagewidth : scenarioitem.imagewidth;
                        scenarioitem.imageheight = req.body.imageheight !== undefined ? req.body.imageheight : scenarioitem.imageheight;
                        scenarioitem.posx = req.body.posx !== undefined ? req.body.posx : scenarioitem.posx;
                        scenarioitem.posy = req.body.posy !== undefined ? req.body.posy : scenarioitem.posy;
                        scenarioitem.posz = req.body.posz !== undefined ? req.body.posz : scenarioitem.posz;
                        scenarioitem.rot = req.body.rot !== undefined ? req.body.rot : scenarioitem.rot;
                        scenarioitem.modified = new Date();

                        return scenarioitem.save(function (err) {
                                if (!err) {
                                        console.log('updated: ' + req.params.itemid);
                                        return res.send(scenarioitem);
                                } else {
                                        return console.log('update error: ' + err);
                                }
                        });
                });
        });
});

// delete scenarioitem by id
app.delete(basepath + '/projects/:projectid/scenarios/:scenarioid/items/:itemid', function (req, res){
        log_call(req);
        return ScenarioModel.find({'scenarioid' : req.params.scenarioid}, function (err, scenario) {
                if (req.body.password == scenario[0].password) {
                        return ScenarioItemModel.findById(req.params.itemid, function (err, scenarioitem) {
                                return scenarioitem.remove(function (err) {
                                        if (!err) {
                                                console.log("removed");
                                                return res.send('');
                                        } else {
                                                return console.log(err);
                                        }
                                });
                        });
                } else {
                        res.status(401);
                        return res.send({'error': 'false credentials'});
                }
        });
});

// launch server
app.listen(app.get('port'), function(){
  console.log("API server listening on port " + app.get('port'));
});

function log_call(req, message) {
        if (debug) {
                message = (message === undefined) ? '' : ' ' + message;
                console.log('\x1b[90m' + req.method + ' ' + req.originalUrl + ' ' + JSON.stringify(req.body) + message);
        }
}
