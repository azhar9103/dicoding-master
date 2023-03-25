process.env.TZ = "Asia/Jakarta";
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const axios = require('axios');
var ejs = require('ejs-locals');
// const router = express.Router();



const io = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
});
const { db, knex } = require('./db_config.js');
const cors = require('cors');
app.use(express.static(__dirname));
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs',ejs);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: ['https://amadi.uma.ac.id', 'https://amadi.uma.ac.id']
}));
const messages = []

function tahun() {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let d = ("0" + date.getDate()).slice(-2);
    let m = ("0" + (date.getMonth() + 1)).slice(-2);
    let y = date.getFullYear();
    const jam = hours + ":" + minutes;
    const tanggal = y + "-" + m + "-" + d;
    return [jam, tanggal];
}

async function profileDosen(nidn) {
    const data = await axios.get('https://api.aoc.uma.ac.id/v1/lectures/' + nidn, {
        headers: {
            Authorization: 'wPfkDaWGQD8nRDnNt38f2598qeSdBzCV'
        }
    })
    return data ? data : null
}

async function tahunAktif() {
    try {
        const data = await axios.get('https://api.aoc.uma.ac.id/v1/years', {
            headers: {
                Authorization: 'wPfkDaWGQD8nRDnNt38f2598qeSdBzCV'
            }
        })
        return data ? data : null
    } catch (error) {
        
    }
    // const data = await axios.get('https://api.aoc.uma.ac.id/v1/years', {
    //     headers: {
    //         Authorization: 'wPfkDaWGQD8nRDnNt38f2598qeSdBzCV'
    //     }
    // })
    // return data ? data : null
}

app.get('/messages', (req, res) => {
    res.send(messages);
})

app.get('/index/:nidn/:prodi', async (req, res) => {
    var nidn    = req.params.nidn;
    var prodi   = req.params.prodi;
    const result = await Promise.all([profileDosen(nidn), tahunAktif()])
        .then(function (response) {
            const profile = response[0];
            const tahunAktif = response[1];

            const nama_dosen = profile.data.data.gelar_depan + '.' + profile.data.data.nama_dosen + '.' + profile.data.data.gelar_belakang;
            const tahun_id = tahunAktif.data.data.tahun_id;
            console.log(profile);
            res.render('chat/index', { nidn: nidn, prodi: prodi, tahun_id: tahun_id, nama_dosen: nama_dosen});

        })

    // console.log('hallo');

    // PROMISE ANY, TUNGGAL
    // let myPromise = new Promise(function (myResolve, myReject) {
    //     const tes = tahunAktif()
    //     myResolve(tes);
    //     myReject("File not Found");
    // });

    // myPromise.then(
    //     function (value) { 
    //         // console.log(value.data) 
    //         var tahun_id = value.data.data.tahun_id;
    //         res.render('chat/index', { nidn: nidn, prodi: prodi, tahun_id:tahun_id});
    //     },
    //     function (error) { 
    //         console.log(error); 
    //     }
    // );
})

app.post('/message', (req, res) => {
    messages.push(req.body);
    io.emit('message', req.body);
    res.sendStatus(200);
})

const connectedUsers = new Set();
io.on('connection', (socket) => {
    console.log('a user connected ' + socket.id);
    connectedUsers.add(socket.id);
    io.emit('connected-user', connectedUsers.size);

    socket.on('disconnected', () => {
        console.log("Disconnected Connected " + socket.id);
        connectedUsers.delete(socket.id);
        io.emit('connected-user', connectedUsers.size);
    });

    socket.on('join', function (room) {
        socket.join(room);
        console.log(room);
    });

    socket.on('message', (data) => {
        console.log("LOG - " + JSON.stringify(data));
        console.log("room - " + JSON.stringify(data.id_room));
        socket.broadcast.emit('message-receive', data);
        // io.to(data.room).emit('message-receive', data);
    });
});

const server = http.listen(3000, () => {
    const { port } = server.address();
    console.log(`Listening on port ${port}`);
});

app.post('/apichat/post-chat', async (req, res) =>  {
    try {
        const id_room   = req.body.id_room;
        const prodi     = id_room.substr(-5);
        const tahun_id  = id_room.substr(-10, 5);
        const nidn      = id_room.slice(0,-10);
        const nim       = req.body.nim;
        const nama      = req.body.nama;
        const pesan     = req.body.pesan;
        const idRoom   = nidn + tahun_id;

        let fungsiDate = tahun();
        const jam       = fungsiDate[0];
        const tanggal   = fungsiDate[1];

        // const result = await Promise.all([profileDosen(nidn), tahunAktif()])
        // .then(function (response) {
        //     const profile        = response[0];
        //     const tahunAktif     = response[1];

            // const sql = `INSERT INTO chat (id_user, nama,id_room,kode_prodi,tahun_id,pesan,role,jam,baca,tanggal) 
            // VALUES (`+ nim + `,` + nama + `, ` + idRoom + `, ` + prodi + `, ` + tahun_id + `,`+pesan+`, `+req.body.role+`, ` + jam + `, '0', `+ tanggal+`)`;
            //  db.query(sql, function (err, result) {
            //     if (err) throw err;
            //     console.log(req);
            //     console.log("1 record inserted");
            // });
        // });
        if (id_room){
            let data = await knex('chat').insert({
                'id_user': nim,
                'nama': nama,
                'id_room': idRoom,
                'kode_prodi': prodi,
                'tahun_id': tahun_id,
                'pesan': pesan,
                'role': req.body.role,
                'jam': jam,
                'baca': '0',
                'tanggal': tanggal
            })
            console.log(data);
        }else{
            console.log('gagal input data');
        }
        res.json({ status:200, data:result});
    } catch (error) {
        res.json({status:500,message:error});
    }


});

app.post('/save', async (req, res) => {
    try {
        const id_room   = req.body.id_room;
        const prodi     = id_room.substr(-5);
        const tahun_id  = id_room.substr(-10, 5);
        const nidn      = req.body.nidn;
        const romId     = nidn + tahun_id;
        let fungsiDate  = tahun();
        let jam         = fungsiDate[0];
        let tanggal     = fungsiDate[1];

        const result = await Promise.all([profileDosen(nidn)])
            .then(function (response) {
                const profile       = response[0];
                const nama_dosen = profile.data.data.gelar_depan + profile.data.data.nama_dosen + '.' + profile.data.data.gelar_belakang;

                return nama_dosen
            });

        if (result) {

                let data = await knex('chat').insert({
                    'id_user': nidn,
                    'nama': result,
                    'id_room': romId,
                    'kode_prodi': prodi,
                    'tahun_id': tahun_id,
                    'pesan': req.body.pesan,
                    'role': req.body.role,
                    'jam': jam,
                    'baca': '0',
                    'tanggal': tanggal
                })
            
            console.log(data);
        } else {
            console.log('gagal input data');
        }

        res.json({ status: 200, data: result });
    } catch (error) {
        console.log(error);
        res.json({ status: 500, message: error });
    }

});

app.get('/apichat/list-chat/:idRoom',async (req, res) => {
    const id_room = req.params.idRoom;
    const prodi = id_room.substr(-5);
    const room = id_room.slice(0,-5);

    const sql = `SELECT * FROM chat WHERE id_room='` + room + `' AND kode_prodi='` + prodi+`'`;
    await db.query(sql, function (err, rows, fields) {
        Promise.all(rows).then(function(values) {
            res.json({data:values});
            console.log(room);
        });
    });
}),

app.get('/list-chat-last/:room/:prodi', async (req, res) => {
    const sql = `SELECT * FROM chat WHERE id_room='` + req.params.room + `' AND kode_prodi='` + req.params.prodi + `' ORDER BY id DESC LIMIT 1`;
    await db.query(sql, function (err, rows, fields) {
        Promise.all(rows).then(function (values) {
            res.json({ data: values });
            console.log(values);
        });
    });
});

// app.post('/tes', (req, res) => {

    // return console.log(req);
    // return req;

    // res.send(req);
    // return ('heri dan keluargac');
    // let myPromise = new Promise(function (myResolve, myReject) {
    //     const tes = tahunAktif()
    //             myResolve(tes);
    //             myReject("File not Found");
    // });

    // myPromise.then(
    //     function (value) { console.log(value.data) },
    //     function (error) { console.log(error); }
    // );

    // db.query("SELECT * FROM chat", function (err, rows, fields) {
    //     res.json(rows);
    // });


    // let result = tahunAktif();
    // console.log(result);
    // const nidn = '2126128302';
    // Promise.any([tahunAktif()])
    //     .then(function (response) {
    //         // const profile = response[0];
    //         // const tahunAktif = response;

    //         // const tahun_id = tahunAktif.data.data.tahun_id;
    //         console.log(response);

    //     })
    //     .catch (function (error) {
    //     // handle error
    //     console.log(error);
    //     });

    // const promises = [tahunAktif()];

    // Promise.any(promises).then((value) => console.log(value));
// });


app.get('/tes', async (req, res) =>{
    const result = await Promise.all([profileDosen('0107058901'), tahunAktif()])
        .then(function (response) {
            const profile = response[0];
            const nama_dosen = profile.data.data.gelar_depan + profile.data.data.nama_dosen + '.' + profile.data.data.gelar_belakang;

            return nama_dosen
        });
    console.log(result);
    res.json(result);
});

// const knex = require('knex')({
//     client: 'mysql',
//     connection: {
//         host: '103.139.193.208',
//         port: 3306,
//         user: 'wadmin',
//         password: 'c-5HzlBIb6zx',
//         database: 'db_chat'
//     }
// });

app.get('/chat', async (req, res) => {
    try {
        const result = await Promise.all([profileDosen('0107058901'), tahunAktif()])
            .then(function (response) {
                const profile = response[0];
                const nama_dosen = profile.data.data.nama_dosen + '.' + profile.data.data.gelar_belakang;

                return nama_dosen
            });
        // let id = knex('chat').insert({
        //     "id_user": '1273',
        //     "nama": 'imama gilak cewek',
        //     "id_room": '121212',
        //     "kode_prodi": '86203',
        //     "tahun_id": '20221',
        //     "pesan": " nama'saya kamu cinta",
        //     "role": '0',
        //     "jam": '12:00',
        //     "baca": '0',
        //     "tanggal": '2023-02-02'
        // })
        // let id = await knex.select()
        //     .table('chat')

        // res.json({
        //     id: id[0]
        // })
        console.log(result);
    } catch (e) {
        console.log(e);
        next(e)
    }
})