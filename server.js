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
        app.use(app.router);
        app.use(express.static(path.join(application_root, "public")));
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// schemas
var Schema = mongoose.Schema;

var Scenario = new Schema({
        id: { type: String, required: true },
        password: String
});

var ScenarioProject = new Schema({
        id: { type: String, required: true },
        title: String,
        description: String,
        password: String,
        backgroundurl: String,
        modified: { type: Date, default: Date.now },
        phases: [ {phaseid: String, phasepos: Number} ]
});

var ScenarioPhase = new Schema({
        projectid: { type: String, required: true },
        palette: [ScenarioItem],
        randomizepalette: Boolean,
        palettestyle: String,
        paletteposition: String,
        paletteitemoffset: {x: Number, y: Number},
        oninit: String,
        onsubmit: String
});

var ScenarioItem = new Schema({
        projectid:  { type: String, required: true },
        scenarioid: { type: String, required: true },
        ispaletteitem: Boolean,
        text: String,
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
app.get(basepath + '/scenarioprojects', function (req, res){
        return ScenarioProjectModel.find(function (err, scenarioprojects) {
                if (!err) {
                        return res.send(scenarioprojects);
                } else {
                        return console.log(err);
                }
        });
});

// create scenarioproject
app.post(basepath + '/scenarioprojects', function (req, res){
        console.log("POST: " + req.body);
        var scenarioproject = new ScenarioProjectModel({
                id: req.body.id,
                title: req.body.title,
                description: req.body.description,
                password: req.body.password,
        });
        scenarioproject.save(function (err) {
                if (!err) {
                        return console.log("created: " + req.body.id);
                } else {
                        return console.log(err);
                }
        });
        return res.send(scenarioproject);
});

// list scenarios
app.get(basepath + '/scenarios', function (req, res){
        return ScenarioModel.find(function (err, scenarios) {
                if (!err) {
                        return res.send(scenarios);
                } else {
                        return console.log(err);
                }
        });
});

// create scenario
app.post(basepath + '/scenarios', function (req, res){
        console.log("POST: " + req.body);
        var scenario = new ScenarioModel({
                id: req.body.id,
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

// login to a scenario by :id
app.post(basepath + '/scenarios/:id/login', function (req, res){
        return ScenarioModel.find({'id' : req.params.id}, function (err, scenario) {
                if (req.body.password == scenario[0].password) {
                        return res.send({'result': 'ok'});
                } else {
                        return res.send({'result': 'failure', 'message': 'wrong password'});
                }
        });
});

// read scenario by :id
app.get(basepath + '/scenarios/:id', function (req, res){
        return ScenarioModel.find({'id' : req.params.id}, function (err, scenario) {
                if (!err) {
                        return res.send(scenario);
                } else {
                        return console.log(err);
                }
        });
});

// update scenario by id
app.put(basepath + '/scenarios/:id', function (req, res){
        if (check_credentials(req.body.password, req.params.id)) {
                return ScenarioModel.find({'id' : req.params.id}, function (err, scenario) {
                        scenario.title = req.body.title !== undefined ? req.body.title : scenario.title;
                        scenario.description = req.body.description !== undefined ? req.body.description : scenario.description;
                        scenario.password = req.body.style !== undefined ? req.body.style : scenario.password;
                        scenario.modified = new Date();

                        return scenario.save(function (err) {
                                if (!err) {
                                        console.log("updated: " + req.params.id);
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
app.delete(basepath + '/scenarios/:id', function (req, res){
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
app.get(basepath + '/scenarios/:id/items', function (req, res){
        return ScenarioItemModel.find({'scenarioid' : req.params.id}, function (err, scenarioitems) {
                if (!err) {
                        return res.send(scenarioitems);
                } else {
                        return console.log(err);
                }
        });
});

// create scenarioitem
app.post(basepath + '/scenarios/:id/items', function (req, res){
        return ScenarioModel.find({'id' : req.params.id}, function (err, scenario) {
                if (req.body.password == scenario[0].password) {
                        var scenarioitem = new ScenarioItemModel({
                                scenarioid: req.params.id,
                                text: req.body.text,
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
                                        return console.log("created item to " + req.params.id);
                                } else {
                                        return console.log(err);
                                }
                        });
                        return res.send(scenarioitem);
                } else {
                        return res.send({'error': 'false credentials'});
                }
        });
});

// read scenarioitem by :id
app.get(basepath + '/scenarios/:id/items/:itemid', function (req, res){
        return ScenarioItemModel.findById(req.params.itemid, function (err, scenarioitem) {
                if (!err) {
                        return res.send(scenarioitem);
                } else {
                        return console.log(err);
                }
        });
});

// update scenarioitem by id
app.put(basepath + '/scenarios/:id/items/:itemid', function (req, res){
        return ScenarioModel.find({'id' : req.params.id}, function (err, scenario) {
                if (req.body.password == scenario[0].password) {
                        return ScenarioItemModel.findById(req.params.itemid, function (err, scenarioitem) {
                                scenarioitem.scenarioid = req.params.id;
                                if (req.body.text !== undefined && req.body.text.indexOf('<') !== -1 && req.body.text.indexOf('>') !== -1) {
                                        scenarioitem.text = req.body.text;
                                }
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
                                                console.log('update error: ' + err);
                                                return null;
                                        }
                                });
                        });
                } else {
                        return res.send({'error': 'false credentials'});
                }
        });
});

// delete scenarioitem by id
app.delete(basepath + '/scenarios/:id/items/:itemid', function (req, res){
        return ScenarioModel.find({'id' : req.params.id}, function (err, scenario) {
                if (req.body.password == scenario[0].password) {
                        return ScenarioItemModel.findById(req.params.itemid, function (err, scenarioitem) {
                                return scenarioitem.remove(function (err) {
                                        if (!err) {
                                                console.log("removed");
                                                return res.send('');
                                        } else {
                                                console.log(err);
                                                return null;
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


