export default function appSrc(express, bodyParser, createReadStream, crypto, http, MongoClient, writeFileSync, cors) {
    const app = express();

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS,DELETE');
        next();
    });
    app.use(express.json());
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(bodyParser.text());

    app.get('/login/', (req, res) => {
        res.send('itmo309692');
    });

    app.get('/code/', (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        createReadStream(import.meta.url.substring(7)).pipe(res);
    });

    app.get('/sha1/:input', (req, res) => {
        var shasum = crypto.createHash('sha1');
        shasum.update(req.params.input);
        res.send(shasum.digest('hex'));
    });

    app.get('/req/', (req, res) => {

        if (req.query.addr) {
            http.get(req.query.addr, (get) => {
                let data = '';

                get.on('data', (chunk) => {
                    data += chunk;
                });
                
                get.on('end', () => {
                    res.send(data);
                });
                
                }).on("error", (err) => {
                res.send(data);
                });
        } else {
            res.send('no addr found');
        }

    });

    app.post('/req/', (req, res) => {
        http.get(req.body.replace('addr=', ''), (get) => {
            let data = '';

            get.on('data', (chunk) => {
              data += chunk;
            });
          
            get.on('end', () => {
                res.send(data);
            });
          
          }).on("error", (err) => {
            res.send(data);
          });
    });

    app.post('/insert/', (req, res) => {
        const {login, password, URL} = req.body;
        const uri = URL;
        MongoClient.connect(uri, function(err, client) {
            if(err) throw err;
            try 
            {  
                client.db().collection('users').insertOne({ login: login, password: password }, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                    res.send("success");
                  });
            }
            catch (err)
            {
                res.send(err);
            }
        });
    });

    app.all('/render/', async(req, res) => {
        res.set(cors);
        const {addr} = req.query;
        const {random2, random3} = req.body;
        
        http.get(addr, (r, b = '') => {
            r
            .on('data', d=>b+=d)
            .on('end', () => {
                writeFileSync('views/index.pug', b);
                res.render('index', {login: 'itmo309692', random2, random3})
            })
        })
    });

    app.set('view engine','pug');

    app.all('*', (req, res) => {
        res.send('itmo309692');
    });

    return app;
}
