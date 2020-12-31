// PUSH TO HEROKU WITH THIS COMMAND: git subtree push --prefix /server heroku master

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

let gameKey;

// used to create unique game keys
const chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// =================================
// CHECK FOR OLD GAMES EVERY 24 HOURS
// =================================
// get path of directory holding game files
const gameFilesPath = path.join(__dirname, '/views/gameFiles');
setInterval(()=> {
    // check if any game files are more than 24 hours old, if yes, delete those files
    fs.readdir(gameFilesPath, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory' + err);
        }
        // check age of each file in the directory. if > 24hrs, delete it
        files.forEach((file) => {
            if(file.includes('gitignore')) {
                console.log('ignore the gitignore!');
            } else {
                let today = new Date();
                let birthTime = fs.statSync(gameFilesPath + '/' + file).birthtime;
                // console.log(birthTime.getTime());
                let timeDiff = today.getTime() - birthTime;
                // console.log(timeDiff);
                if(timeDiff > 86400000){
                    console.log('deleted game file' + file);
                    fs.unlink(gameFilesPath + '/' + file, (err) => {
                        if (err) {console.log(err);}
                    });
                } else {
                    console.log(file + ' is < 24hrs old')
                }
            }
        })
    })
}, 86400000)

// Routing

const app = express();

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname,'views'));

app.use(bodyParser.urlencoded({extended:false}));
app.use('/public', express.static("public"));

app.get('/', (req, res, next) => {
    // console.log('get /');
    res.render('intro');
})

// create a new game key
app.post('/game', (req, res, next) => {
    // console.log('post /game');


    // use node FS promises to complete the file creation before redirect
    fsPromises.readFile('./views/index.ejs')
        .then((buffer) => {
            //  generate new gamekey
            gameKey = `${chars[Math.round(Math.random() * 35)]}${chars[Math.round(Math.random() * 35)]}${chars[Math.round(Math.random() * 35)]}${chars[Math.round(Math.random() * 35)]}${chars[Math.round(Math.random() * 35)]}`;
            
            // gamesArr.push(gameKey);
            // console.log(gamesArr);

            const oldContent = buffer.toString();
            return fsPromises.appendFile(`./views/gameFiles/game_${gameKey}.ejs`, oldContent);
        })
        .then(() => {
            res.redirect('/game/' + gameKey);
        })
})

app.get('/game', (req, res, next) => {
    res.redirect('/');
})

// listen for get at the url generated in the previous middleware
app.post('/find-game', (req, res, next) => {
    res.redirect(`/game/${req.body.gameKey}`);
})

app.get('/game/:url', (req, res, next) => {
    
    // get the gamekey from the request
    let url = req.url.substr(6);

    fs.readdir(gameFilesPath, (err, files) => {
        if (err) {
            console.log(err);
        } 
        if (files.toString().includes(url)) {
            res.render(`./gameFiles/game_${url}`, {
                gameNum: url 
            });
        } else {
            res.redirect('/game-not-found');
        }
    })

    
})


app.use((req, res, next) => {
    res.render('game-not-found.ejs', {
        gameNum: req.url.substr(6)
    });
})

app.listen(process.env.PORT || 3000)